import {
  loadVaultLocally,
  saveVaultLocally,
  deleteVaultLocally,
  encryptVault,
  decryptVault,
  exportVaultFile
} from '$lib/crypto/vault';
import { get, set, del } from 'idb-keyval';
import type { UserProfile, VaultState } from '$lib/types';

const IDENTITY_KEY = 'compilalo_active_identity';
const SIGNATURE_KEY = 'compilalo_saved_signature';

class VaultStore {
  isUnlocked = $state(false);
  hasStoredVault = $state(false);
  profiles = $state<UserProfile[]>([]);
  activeProfileId = $state<string>('');
  lastPassphrase = $state<string>('');
  errorMessage = $state<string>('');

  // Identità attiva sincronizzata in tutto il sito (mai chiesta due volte)
  activeIdentity = $state<Partial<UserProfile>>({
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNascita: '',
    luogoNascita: '',
    provinciaNascita: '',
    comuneResidenza: '',
    provinciaResidenza: '',
    capResidenza: '',
    indirizzoResidenza: '',
    sesso: 'M'
  });

  // Firma autografa sincronizzata (mai ridisegnata due volte)
  savedSignature = $state<string | undefined>(undefined);

  get activeProfile(): UserProfile | null {
    if (!this.profiles.length) {
      if (this.activeIdentity.nome || this.activeIdentity.codiceFiscale) {
        return this.activeIdentity as UserProfile;
      }
      return null;
    }
    return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0] || null;
  }

  get hasIdentityData(): boolean {
    return !!(this.activeIdentity.nome || this.activeIdentity.cognome || this.activeIdentity.codiceFiscale);
  }

  async checkStoredVault(): Promise<boolean> {
    try {
      const stored = await loadVaultLocally();
      this.hasStoredVault = !!stored;

      // Carica l'identità attiva dalla memoria persistente locale
      const savedIdent = await get<Partial<UserProfile>>(IDENTITY_KEY);
      if (savedIdent) {
        this.activeIdentity = { ...this.activeIdentity, ...savedIdent };
      }

      // Carica la firma salvata
      const savedSig = await get<string>(SIGNATURE_KEY);
      if (savedSig) {
        this.savedSignature = savedSig;
      }

      return this.hasStoredVault;
    } catch {
      this.hasStoredVault = false;
      return false;
    }
  }

  /**
   * Aggiorna l'identità attiva in tempo reale in tutto il sito:
   * se l'utente compila un campo in qualsiasi pagina, è immediatamente sincronizzato ovunque.
   */
  async updateActiveIdentity(partial: Partial<UserProfile>): Promise<void> {
    this.activeIdentity = { ...this.activeIdentity, ...partial };
    await set(IDENTITY_KEY, $state.snapshot(this.activeIdentity));

    // Se il vault è sbloccato, aggiorna anche il profilo attivo nella cassaforte
    if (this.isUnlocked && this.profiles.length > 0) {
      const idx = this.profiles.findIndex(p => p.id === this.activeProfileId);
      if (idx >= 0) {
        this.profiles[idx] = { ...this.profiles[idx], ...partial };
        await this.saveUpdatedProfiles();
      }
    }
  }

  /**
   * Salva la firma autografa: valida per tutti i documenti futuri
   */
  async saveSignatureLocally(dataUrl: string): Promise<void> {
    this.savedSignature = dataUrl;
    await set(SIGNATURE_KEY, dataUrl);
  }

  /**
   * Rimuove la firma salvata
   */
  async clearSavedSignature(): Promise<void> {
    this.savedSignature = undefined;
    await del(SIGNATURE_KEY);
  }

  async unlock(passphrase: string): Promise<boolean> {
    this.errorMessage = '';
    const stored = await loadVaultLocally();
    if (!stored) {
      this.errorMessage = 'Nessun Vault trovato in memoria locale.';
      return false;
    }

    try {
      const decrypted = await decryptVault(stored, passphrase);
      this.profiles = decrypted;
      this.isUnlocked = true;
      this.lastPassphrase = passphrase;
      if (decrypted.length > 0) {
        const defaultProfile = decrypted.find(p => p.isDefault) || decrypted[0];
        this.activeProfileId = defaultProfile.id;
        this.activeIdentity = { ...defaultProfile };
        await set(IDENTITY_KEY, defaultProfile);
      }
      return true;
    } catch (e: any) {
      this.errorMessage = e.message || 'Chiave errata';
      return false;
    }
  }

  async createNewVault(initialProfile: UserProfile, passphrase: string): Promise<void> {
    this.profiles = [initialProfile];
    this.activeProfileId = initialProfile.id;
    this.lastPassphrase = passphrase;
    this.activeIdentity = { ...initialProfile };
    await set(IDENTITY_KEY, initialProfile);

    const encrypted = await encryptVault(this.profiles, passphrase);
    await saveVaultLocally(encrypted);
    this.hasStoredVault = true;
    this.isUnlocked = true;
  }

  async saveUpdatedProfiles(): Promise<void> {
    if (!this.isUnlocked || !this.lastPassphrase) {
      return;
    }
    const encrypted = await encryptVault(this.profiles, this.lastPassphrase);
    await saveVaultLocally(encrypted);
  }

  async addProfile(profile: UserProfile): Promise<void> {
    this.profiles = [...this.profiles, profile];
    await this.saveUpdatedProfiles();
  }

  lock(): void {
    this.isUnlocked = false;
    this.lastPassphrase = '';
    this.profiles = [];
    this.activeProfileId = '';
  }

  async destroyVault(): Promise<void> {
    await deleteVaultLocally();
    await del(IDENTITY_KEY);
    await del(SIGNATURE_KEY);
    this.lock();
    this.activeIdentity = {};
    this.savedSignature = undefined;
    this.hasStoredVault = false;
  }

  async exportBackup(): Promise<void> {
    const stored = await loadVaultLocally();
    if (stored) {
      exportVaultFile(stored);
    }
  }
}

export const vault = new VaultStore();
