import { get, set, del } from 'idb-keyval';
import type { UserProfile, VaultState } from '$lib/types';

const VAULT_STORAGE_KEY = 'compilalo_vault_state';
const PBKDF2_ITERATIONS = 100000;

// Lista di parole per mnemonic seed anonimo in italiano
const MNEMONIC_WORDS = [
  'albero', 'barca', 'casa', 'dado', 'erba', 'faro', 'gatto', 'isola', 'luna', 'mare',
  'nave', 'ombra', 'pane', 'quadro', 'rosa', 'sole', 'terra', 'vento', 'zero', 'arco',
  'bosco', 'cielo', 'duna', 'fiume', 'grano', 'lampo', 'monte', 'notte', 'onda', 'pietra',
  'quercia', 'rupe', 'stella', 'torre', 'ulivo', 'valle', 'volpe', 'zenit', 'amico', 'campo'
];

/**
 * Genera una frase di recupero a 12 parole casuali
 */
export function generateMnemonic(): string {
  const words: string[] = [];
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 12; i++) {
    words.push(MNEMONIC_WORDS[randomBytes[i] % MNEMONIC_WORDS.length]);
  }
  return words.join(' ');
}

// Helper per convertire ArrayBuffer in stringa Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper per convertire stringa Base64 in Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Deriva una chiave simmetrica AES-GCM a 256 bit da una passphrase testuale usando PBKDF2
 */
async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase.trim()),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra un array di profili utente e restituisce lo stato del Vault
 */
export async function encryptVault(profiles: UserProfile[], passphrase: string): Promise<VaultState> {
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const aesKey = await deriveAesKey(passphrase, salt);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(profiles));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource
    },
    aesKey,
    plaintext
  );

  return {
    version: 1,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    encryptedPayload: bufferToBase64(ciphertext),
    updatedAt: Date.now()
  };
}

/**
 * Decifra lo stato del Vault e restituisce l'anagrafica in chiaro
 */
export async function decryptVault(vault: VaultState, passphrase: string): Promise<UserProfile[]> {
  const salt = base64ToBuffer(vault.salt);
  const iv = base64ToBuffer(vault.iv);
  const ciphertext = base64ToBuffer(vault.encryptedPayload);

  const aesKey = await deriveAesKey(passphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      aesKey,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as UserProfile[];
  } catch (error) {
    throw new Error('Passphrase o chiave di recupero errata. Impossibile decifrare il Vault.');
  }
}

/**
 * Salva localmente il Vault cifrato in IndexedDB (Zero Cloud)
 */
export async function saveVaultLocally(vault: VaultState): Promise<void> {
  await set(VAULT_STORAGE_KEY, vault);
}

/**
 * Carica il Vault cifrato da IndexedDB
 */
export async function loadVaultLocally(): Promise<VaultState | null> {
  const data = await get<VaultState>(VAULT_STORAGE_KEY);
  return data || null;
}

/**
 * Cancella il Vault locale (distruzione sicura)
 */
export async function deleteVaultLocally(): Promise<void> {
  await del(VAULT_STORAGE_KEY);
}

/**
 * Esporta il vault cifrato come file JSON scaricabile
 */
export function exportVaultFile(vault: VaultState): void {
  const blob = new Blob([JSON.stringify(vault, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compilalo-vault-backup-${new Date().toISOString().slice(0, 10)}.compilalo`;
  a.click();
  URL.revokeObjectURL(url);
}
