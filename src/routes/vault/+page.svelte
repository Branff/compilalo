<script lang="ts">
  import { onMount } from 'svelte';
  import { vault } from '$lib/stores/vault.svelte';
  import { generateMnemonic } from '$lib/crypto/vault';
  import { validateCodiceFiscale, autoCalculateCodiceFiscale, decodeCodiceFiscale } from '$lib/data/codiceFiscale';
  import { findComune, type ComuneItem } from '$lib/data/comuni';
  import type { UserProfile } from '$lib/types';
  import {
    Lock,
    Unlock,
    KeyRound,
    Plus,
    Download,
    Trash2,
    Save,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    User,
    Sparkles,
    PenTool,
    Check,
    ShieldCheck,
    Calculator,
    Edit3,
    MapPin,
    ArrowRight
  } from 'lucide-svelte';
  import SignaturePad from 'signature_pad';

  let passphraseInput = $state('');
  let isUnlocking = $state(false);
  let unlockError = $state('');

  // Form per la creazione di un nuovo vault protetto da passphrase
  let isCreatingVault = $state(false);
  let generatedMnemonicWords = $state('');
  let newProfile = $state<UserProfile>({
    id: 'user_main',
    label: 'Io (Principale)',
    isDefault: true,
    nome: '',
    cognome: '',
    sesso: 'M',
    dataNascita: '',
    luogoNascita: '',
    provinciaNascita: '',
    codiceFiscale: '',
    comuneResidenza: '',
    provinciaResidenza: '',
    capResidenza: '',
    indirizzoResidenza: '',
    tipoDocumento: 'carta_identita',
    numeroDocumento: ''
  });

  // Profilo selezionato per la modifica nel vault sbloccato
  let editingProfile = $state<UserProfile | null>(null);

  // Modalità manuale override CF
  let manualCfMode = $state(false);

  // Autocomplete Comuni
  let comuneSuggestions = $state<{ target: 'new' | 'edit'; field: 'luogoNascita' | 'comuneResidenza'; list: ComuneItem[] } | null>(null);

  // Gestione firma autografa
  let showSignatureModal = $state(false);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let signaturePadInstance: SignaturePad | null = null;

  // Notifiche Toast ad alto craft
  let notificationToast = $state<string | null>(null);
  let toastTimer: any = null;

  function showToast(msg: string) {
    notificationToast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      notificationToast = null;
    }, 3200);
  }

  onMount(async () => {
    await vault.checkStoredVault();

    // Se il vault è sbloccato, carica il profilo attivo
    if (vault.isUnlocked && vault.activeProfile) {
      editingProfile = { ...vault.activeProfile };
    } else if (vault.hasIdentityData) {
      populateNewProfileFromActiveIdentity();
    }
  });

  function populateNewProfileFromActiveIdentity() {
    newProfile = {
      ...newProfile,
      nome: vault.activeIdentity.nome || '',
      cognome: vault.activeIdentity.cognome || '',
      codiceFiscale: vault.activeIdentity.codiceFiscale || '',
      dataNascita: vault.activeIdentity.dataNascita || '',
      luogoNascita: vault.activeIdentity.luogoNascita || '',
      provinciaNascita: vault.activeIdentity.provinciaNascita || '',
      comuneResidenza: vault.activeIdentity.comuneResidenza || '',
      provinciaResidenza: vault.activeIdentity.provinciaResidenza || '',
      capResidenza: vault.activeIdentity.capResidenza || '',
      indirizzoResidenza: vault.activeIdentity.indirizzoResidenza || '',
      sesso: vault.activeIdentity.sesso || 'M'
    };
  }

  function tryAutoCalculateCF(target: UserProfile) {
    if (manualCfMode) return;
    if (target.nome && target.cognome && target.dataNascita && target.luogoNascita) {
      const res = autoCalculateCodiceFiscale({
        nome: target.nome,
        cognome: target.cognome,
        sesso: (target.sesso || 'M') as 'M' | 'F',
        dataNascita: target.dataNascita,
        luogoNascita: target.luogoNascita
      });
      if (res) {
        target.codiceFiscale = res;
      }
    }
  }

  function handleManualCfChange(target: UserProfile, value: string) {
    target.codiceFiscale = value.toUpperCase();
    if (target.codiceFiscale.length === 16) {
      const decoded = decodeCodiceFiscale(target.codiceFiscale);
      if (decoded.sesso) {
        target.sesso = decoded.sesso;
        showToast('Sesso estratto dal Codice Fiscale!');
      }
    }
  }

  function handleComuneSearch(target: 'new' | 'edit', field: 'luogoNascita' | 'comuneResidenza', query: string) {
    if (query.trim().length >= 2) {
      const results = findComune(query);
      if (results.length > 0) {
        comuneSuggestions = { target, field, list: results.slice(0, 5) };
        return;
      }
    }
    comuneSuggestions = null;
  }

  function selectComune(item: ComuneItem) {
    if (!comuneSuggestions) return;
    const prof = comuneSuggestions.target === 'new' ? newProfile : editingProfile;
    if (!prof) return;

    if (comuneSuggestions.field === 'luogoNascita') {
      prof.luogoNascita = item.nome;
      prof.provinciaNascita = item.provincia;
      tryAutoCalculateCF(prof);
    } else if (comuneSuggestions.field === 'comuneResidenza') {
      prof.comuneResidenza = item.nome;
      prof.provinciaResidenza = item.provincia;
      prof.capResidenza = item.cap;
    }
    comuneSuggestions = null;
  }

  async function handleUnlock() {
    isUnlocking = true;
    unlockError = '';
    const success = await vault.unlock(passphraseInput);
    if (success) {
      editingProfile = vault.activeProfile ? { ...vault.activeProfile } : null;
      passphraseInput = '';
      showToast('Cassaforte sbloccata con successo!');
    } else {
      unlockError = vault.errorMessage || 'Frase o chiave non corretta.';
    }
    isUnlocking = false;
  }

  function startCreateVault() {
    generatedMnemonicWords = generateMnemonic();
    passphraseInput = generatedMnemonicWords;
    populateNewProfileFromActiveIdentity();
    isCreatingVault = true;
  }

  async function handleSaveNewVault() {
    if (!newProfile.nome || !newProfile.cognome) {
      showToast('Inserisci almeno Nome e Cognome.');
      return;
    }
    tryAutoCalculateCF(newProfile);
    await vault.createNewVault(newProfile, passphraseInput);
    editingProfile = { ...newProfile };
    isCreatingVault = false;
    showToast('Cassaforte cifrata creata con successo in memoria locale!');
  }

  async function handleSaveProfileChanges() {
    if (!editingProfile) return;
    tryAutoCalculateCF(editingProfile);
    const index = vault.profiles.findIndex(p => p.id === editingProfile?.id);
    if (index >= 0) {
      vault.profiles[index] = { ...editingProfile };
      await vault.saveUpdatedProfiles();
      await vault.updateActiveIdentity(editingProfile);
      showToast('Profilo aggiornato e ricifrato localmente!');
    }
  }

  async function handleSaveActiveIdentityDirectly() {
    tryAutoCalculateCF(newProfile);
    await vault.updateActiveIdentity({
      nome: newProfile.nome,
      cognome: newProfile.cognome,
      codiceFiscale: newProfile.codiceFiscale,
      dataNascita: newProfile.dataNascita,
      luogoNascita: newProfile.luogoNascita,
      comuneResidenza: newProfile.comuneResidenza,
      indirizzoResidenza: newProfile.indirizzoResidenza,
      capResidenza: newProfile.capResidenza,
      sesso: newProfile.sesso
    });
    showToast('Dati personali aggiornati nel browser!');
  }

  function addNewFamilyProfile() {
    const id = `profile_${Date.now()}`;
    const fresh: UserProfile = {
      id,
      label: 'Nuovo Familiare (es. Figlio / Coniuge)',
      isDefault: false,
      nome: '',
      cognome: editingProfile?.cognome || '',
      sesso: 'M',
      dataNascita: '',
      luogoNascita: '',
      provinciaNascita: '',
      codiceFiscale: '',
      comuneResidenza: editingProfile?.comuneResidenza || '',
      provinciaResidenza: editingProfile?.provinciaResidenza || '',
      capResidenza: editingProfile?.capResidenza || '',
      indirizzoResidenza: editingProfile?.indirizzoResidenza || ''
    };
    vault.profiles = [...vault.profiles, fresh];
    editingProfile = fresh;
    vault.activeProfileId = id;
    showToast('Nuovo familiare aggiunto. Compila i dettagli.');
  }

  // Gestione firma
  function openSignaturePad() {
    showSignatureModal = true;
    setTimeout(() => {
      if (canvasEl) {
        signaturePadInstance = new SignaturePad(canvasEl, {
          penColor: '#0F172A',
          backgroundColor: 'rgba(255, 255, 255, 0)'
        });
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvasEl.width = canvasEl.offsetWidth * ratio;
        canvasEl.height = canvasEl.offsetHeight * ratio;
        canvasEl.getContext('2d')?.scale(ratio, ratio);
        signaturePadInstance.clear();
      }
    }, 120);
  }

  function saveSignature() {
    if (signaturePadInstance && !signaturePadInstance.isEmpty()) {
      const dataUrl = signaturePadInstance.toDataURL('image/png');
      vault.saveSignatureLocally(dataUrl);
      showToast('Firma salvata e sincronizzata per tutti i documenti!');
    }
    showSignatureModal = false;
  }

  function clearSignature() {
    if (signaturePadInstance) {
      signaturePadInstance.clear();
    }
    vault.clearSavedSignature();
    showToast('Firma rimossa');
  }

  let cfCheck = $derived.by(() => {
    const cf = isCreatingVault ? newProfile.codiceFiscale : (editingProfile?.codiceFiscale || newProfile.codiceFiscale);
    if (!cf || cf.length < 16) return null;
    return validateCodiceFiscale(cf);
  });
</script>

<div class="max-w-4xl mx-auto space-y-8">

  <!-- Toast Notifica ad alto craft -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#27272A] text-xs font-medium flex items-center space-x-2 craft-modal">
      <Check class="w-4 h-4 text-[#10B981]" />
      <span>{notificationToast}</span>
    </div>
  {/if}
  
  <!-- Intestazione Vault -->
  <div class="bg-white border border-[#E4E4E7] rounded-lg p-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <KeyRound class="w-5 h-5 text-[#1D4ED8]" />
          <h1 class="font-serif text-2xl font-bold tracking-tight text-[#18181B]">
            La Mia Cassaforte Anonima
          </h1>
        </div>
        <p class="text-xs text-[#52525B] mt-1">
          I tuoi dati rimangono memorizzati <strong class="text-[#18181B]">esclusivamente nel tuo browser</strong> con crittografia <strong class="text-[#18181B]">AES-GCM-256</strong>. Nessun cookie, nessun tracciamento, nessun server esterno.
        </p>
      </div>

      {#if vault.isUnlocked}
        <button
          onclick={() => { vault.lock(); editingProfile = null; showToast('Cassaforte chiusa'); }}
          class="px-3.5 py-2 text-xs font-medium text-[#71717A] hover:text-[#18181B] border border-[#E4E4E7] rounded flex items-center space-x-1.5 craft-transition craft-press self-start sm:self-auto"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>Blocca Cassaforte</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- STATO 1: VAULT NON BLOCCATO MA NON ANCORA CIFRATO O BLOCCATO -->
  {#if !vault.isUnlocked && !isCreatingVault}
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

      <!-- Sezione Sinistra: Sblocco o Configurazione Identità -->
      <div class="md:col-span-7 bg-white border border-[#E4E4E7] rounded-lg p-6 space-y-6">

        {#if vault.hasStoredVault}
          <!-- Esiste un Vault Cifrato salvato in LocalStorage: Sblocco -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2 text-[#18181B]">
              <Lock class="w-5 h-5 text-[#D97706]" />
              <h2 class="font-serif text-lg font-bold">Cassaforte Cifrata Rilevata</h2>
            </div>
            <p class="text-xs text-[#52525B]">
              Inserisci la tua frase di sblocco (12 parole) o la chiave crittografica per decifrare i tuoi profili salvati.
            </p>

            <div class="space-y-3 pt-2">
              <label for="passphrase_input" class="block text-xs font-medium text-[#18181B]">
                Frase segreta di recupero o chiave
              </label>
              <textarea
                id="passphrase_input"
                bind:value={passphraseInput}
                rows={3}
                placeholder="es. mela stella luna oceano vento..."
                class="w-full text-xs font-mono p-3 border border-[#E4E4E7] rounded craft-input"
              ></textarea>

              {#if unlockError}
                <div class="text-xs text-[#DC2626] flex items-center space-x-1">
                  <AlertCircle class="w-4 h-4 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              {/if}

              <button
                onclick={handleUnlock}
                disabled={isUnlocking || !passphraseInput}
                class="w-full py-2.5 bg-[#18181B] text-white rounded text-xs font-semibold hover:bg-[#1D4ED8] craft-transition craft-press disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Unlock class="w-4 h-4" />
                <span>{isUnlocking ? 'Decifratura in corso...' : 'Sblocca Cassaforte'}</span>
              </button>
            </div>
          </div>

        {:else}
          <!-- Nessun Vault Cifrato ancora: Mostra l'identità attiva (con auto-calcolo CF) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div>
                <h2 class="font-serif text-lg font-bold text-[#18181B]">La Tua Anagrafica sul Dispositivo</h2>
                <p class="text-xs text-[#71717A]">
                  {#if vault.hasIdentityData}
                    Dati già pronti e sincronizzati con i moduli caricati.
                  {:else}
                    Inserisci i tuoi dati qui per averli sempre pronti in ogni documento.
                  {/if}
                </p>
              </div>

              {#if vault.hasIdentityData}
                <span class="px-2.5 py-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded text-[11px] font-mono font-bold">
                  ATTIVO
                </span>
              {/if}
            </div>

            <!-- Modulo rapido di modifica identità con Auto-CF -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label for="id_nome" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Nome</label>
                <input
                  id="id_nome"
                  type="text"
                  bind:value={newProfile.nome}
                  oninput={() => tryAutoCalculateCF(newProfile)}
                  placeholder="Mario"
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                />
              </div>
              <div>
                <label for="id_cognome" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Cognome</label>
                <input
                  id="id_cognome"
                  type="text"
                  bind:value={newProfile.cognome}
                  oninput={() => tryAutoCalculateCF(newProfile)}
                  placeholder="Rossi"
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                />
              </div>

              <div>
                <label for="id_sesso" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Sesso</label>
                <select
                  id="id_sesso"
                  bind:value={newProfile.sesso}
                  onchange={() => tryAutoCalculateCF(newProfile)}
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                >
                  <option value="M">Maschile (M)</option>
                  <option value="F">Femminile (F)</option>
                  <option value="A">Altro / Non specificato</option>
                </select>
              </div>

              <div>
                <label for="id_dataNascita" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Data di Nascita</label>
                <input
                  id="id_dataNascita"
                  type="date"
                  bind:value={newProfile.dataNascita}
                  onchange={() => tryAutoCalculateCF(newProfile)}
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                />
              </div>

              <div class="relative">
                <label for="id_luogoNascita" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Comune di Nascita</label>
                <input
                  id="id_luogoNascita"
                  type="text"
                  bind:value={newProfile.luogoNascita}
                  oninput={(e) => {
                    handleComuneSearch('new', 'luogoNascita', (e.target as HTMLInputElement).value);
                    tryAutoCalculateCF(newProfile);
                  }}
                  placeholder="es. Roma o Milano"
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                />
                {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'luogoNascita'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
                    {#each comuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectComune(c)}
                        class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                      >
                        <span class="font-medium text-[#18181B]">{c.nome}</span>
                        <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="relative">
                <label for="id_comune" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Comune di Residenza</label>
                <input
                  id="id_comune"
                  type="text"
                  bind:value={newProfile.comuneResidenza}
                  oninput={(e) => handleComuneSearch('new', 'comuneResidenza', (e.target as HTMLInputElement).value)}
                  placeholder="es. Firenze o Torino"
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
                />
                {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'comuneResidenza'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
                    {#each comuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectComune(c)}
                        class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                      >
                        <span class="font-medium text-[#18181B]">{c.nome}</span>
                        <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="sm:col-span-2">
                <label for="id_indirizzo" class="block text-[11px] font-medium text-[#52525B] mb-0.5">Indirizzo (Via e Civico)</label>
                <input id="id_indirizzo" type="text" bind:value={newProfile.indirizzoResidenza} placeholder="Via Nazionale 1" class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input" />
              </div>

              <!-- SEZIONE CODICE FISCALE: INTELLIGENTE CON AUTO-CALCOLO E OVERRIDE -->
              <div class="sm:col-span-2 pt-2 border-t border-[#E4E4E7] space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#18181B] flex items-center space-x-1.5">
                    <Calculator class="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Codice Fiscale</span>
                    {#if !manualCfMode && newProfile.codiceFiscale}
                      <span class="ml-1 text-[10px] font-mono font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                        CALCOLATO AUTOMATICAMENTE
                      </span>
                    {/if}
                  </span>

                  <button
                    type="button"
                    onclick={() => manualCfMode = !manualCfMode}
                    class="text-[11px] text-[#1D4ED8] hover:underline flex items-center space-x-1"
                  >
                    <Edit3 class="w-3 h-3" />
                    <span>{manualCfMode ? 'Torna al calcolo automatico' : 'Preferisco inserirlo a mano'}</span>
                  </button>
                </div>

                {#if manualCfMode}
                  <input
                    id="id_cf"
                    type="text"
                    value={newProfile.codiceFiscale}
                    oninput={(e) => handleManualCfChange(newProfile, (e.target as HTMLInputElement).value)}
                    placeholder="RSSMRA80A01H501U"
                    class="w-full text-xs border border-[#E4E4E7] rounded p-2 font-mono uppercase craft-input"
                  />
                  <p class="text-[11px] text-[#71717A]">
                    Incolla o digita il codice fiscale a 16 caratteri. Estrarremo sesso e data se vuoti.
                  </p>
                {:else}
                  <div class="p-2.5 bg-[#F9F9F8] border border-[#E4E4E7] rounded flex items-center justify-between font-mono text-xs">
                    <span class={newProfile.codiceFiscale ? 'font-bold text-[#18181B] tracking-wider' : 'text-[#71717A] italic'}>
                      {newProfile.codiceFiscale || 'Verrà calcolato appena compili data e comune di nascita'}
                    </span>
                    {#if newProfile.codiceFiscale}
                      <CheckCircle2 class="w-4 h-4 text-[#059669]" />
                    {/if}
                  </div>
                {/if}
              </div>

            </div>

            <div class="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7]">
              <button
                onclick={handleSaveActiveIdentityDirectly}
                class="px-4 py-2 bg-[#18181B] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded craft-transition craft-press"
              >
                Salva Dati nel Browser
              </button>

              <button
                onclick={startCreateVault}
                class="text-xs text-[#1D4ED8] hover:underline font-medium flex items-center space-x-1"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>Proteggi con 12 parole segrete</span>
              </button>
            </div>
          </div>
        {/if}

      </div>

      <!-- Sezione Destra: Firma Autografa & Portabilità -->
      <div class="md:col-span-5 space-y-6">

        <!-- Riquadro Firma Autografa Memorizzata -->
        <div class="bg-white border border-[#E4E4E7] rounded-lg p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-[#E4E4E7] pb-2">
            <span class="text-xs font-bold text-[#18181B] uppercase tracking-wider flex items-center space-x-1.5">
              <PenTool class="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Firma Autografa</span>
            </span>
            {#if vault.savedSignature}
              <span class="text-[11px] font-mono text-[#059669] font-semibold">MEMORIZZATA</span>
            {/if}
          </div>

          <p class="text-xs text-[#52525B]">
            Disegna la tua firma una sola volta. Verrà apposta automaticamente in qualsiasi documento o modulo che compili.
          </p>

          {#if vault.savedSignature}
            <div class="border border-dashed border-[#10B981] bg-[#ECFDF5] rounded-lg p-3 space-y-2">
              <img src={vault.savedSignature} alt="Firma memorizzata" class="h-12 object-contain mx-auto" />
              <div class="flex items-center justify-between pt-1 border-t border-[#A7F3D0]">
                <button
                  onclick={clearSignature}
                  class="text-[11px] text-[#DC2626] hover:underline craft-transition"
                >
                  Elimina firma
                </button>
                <button
                  onclick={openSignaturePad}
                  class="text-[11px] text-[#1D4ED8] font-bold hover:underline craft-transition"
                >
                  Ridisegna
                </button>
              </div>
            </div>
          {:else}
            <button
              onclick={openSignaturePad}
              class="w-full py-3 border border-dashed border-[#71717A] rounded-lg text-xs font-medium text-[#52525B] hover:border-[#18181B] hover:text-[#18181B] flex items-center justify-center space-x-2 bg-[#F9F9F8] craft-transition craft-press"
            >
              <PenTool class="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Disegna la tua firma ora</span>
            </button>
          {/if}
        </div>

        <!-- Riquadro Sicurezza & Garanzie Anonimato -->
        <div class="bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg p-4 space-y-2 text-xs text-[#52525B]">
          <div class="flex items-center space-x-1.5 text-[#18181B] font-semibold">
            <ShieldCheck class="w-4 h-4 text-[#059669]" />
            <span>Garanzia Zero-Knowledge</span>
          </div>
          <p>
            COMPILALO non ha server che memorizzano anagrafiche. Se cancelli la cronologia o usi la modalità incognito, i dati svaniscono senza lasciare tracce.
          </p>
        </div>

      </div>

    </div>

  <!-- STATO 2: CREAZIONE DI UN NUOVO VAULT CON LE 12 PAROLE -->
  {:else if isCreatingVault}
    <div class="bg-white border border-[#E4E4E7] rounded-lg p-6 space-y-6">
      
      <div class="border-b border-[#E4E4E7] pb-4">
        <h2 class="font-serif text-xl font-bold text-[#18181B]">Configura la tua Cassaforte Cifrata</h2>
        <p class="text-xs text-[#52525B] mt-1">
          Conserva con cura queste 12 parole. Sono l'unica chiave esistente al mondo in grado di decifrare la tua cassaforte:
        </p>

        <!-- Chiave Mnemonic Generata -->
        <div class="mt-3 p-3 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg font-mono text-xs text-[#1D4ED8] select-all break-words leading-relaxed">
          {generatedMnemonicWords}
        </div>
      </div>

      <!-- Campi Anagrafici Iniziali -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label for="nv_nome" class="block text-xs font-medium text-[#18181B] mb-1">Nome *</label>
          <input
            id="nv_nome"
            type="text"
            bind:value={newProfile.nome}
            oninput={() => tryAutoCalculateCF(newProfile)}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          />
        </div>
        <div>
          <label for="nv_cognome" class="block text-xs font-medium text-[#18181B] mb-1">Cognome *</label>
          <input
            id="nv_cognome"
            type="text"
            bind:value={newProfile.cognome}
            oninput={() => tryAutoCalculateCF(newProfile)}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          />
        </div>
        <div>
          <label for="nv_sesso" class="block text-xs font-medium text-[#18181B] mb-1">Sesso *</label>
          <select
            id="nv_sesso"
            bind:value={newProfile.sesso}
            onchange={() => tryAutoCalculateCF(newProfile)}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          >
            <option value="M">Maschile (M)</option>
            <option value="F">Femminile (F)</option>
            <option value="A">Altro / Non specificato</option>
          </select>
        </div>

        <div>
          <label for="nv_dataNascita" class="block text-xs font-medium text-[#18181B] mb-1">Data di Nascita</label>
          <input
            id="nv_dataNascita"
            type="date"
            bind:value={newProfile.dataNascita}
            onchange={() => tryAutoCalculateCF(newProfile)}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          />
        </div>
        
        <div class="relative">
          <label for="nv_luogoNascita" class="block text-xs font-medium text-[#18181B] mb-1">Comune di Nascita</label>
          <input
            id="nv_luogoNascita"
            type="text"
            bind:value={newProfile.luogoNascita}
            oninput={(e) => {
              handleComuneSearch('new', 'luogoNascita', (e.target as HTMLInputElement).value);
              tryAutoCalculateCF(newProfile);
            }}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          />
          {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'luogoNascita'}
            <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
              {#each comuneSuggestions.list as c}
                <button
                  type="button"
                  onclick={() => selectComune(c)}
                  class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                >
                  <span class="font-medium text-[#18181B]">{c.nome}</span>
                  <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- CODICE FISCALE AUTO-CALCULATED WITH OVERRIDE -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="nv_cf" class="block text-xs font-medium text-[#18181B]">Codice Fiscale</label>
            <button
              type="button"
              onclick={() => manualCfMode = !manualCfMode}
              class="text-[10px] text-[#1D4ED8] hover:underline"
            >
              {manualCfMode ? 'Auto' : 'A mano'}
            </button>
          </div>
          {#if manualCfMode}
            <input
              id="nv_cf"
              type="text"
              value={newProfile.codiceFiscale}
              oninput={(e) => handleManualCfChange(newProfile, (e.target as HTMLInputElement).value)}
              class="w-full text-xs border border-[#E4E4E7] rounded p-2 font-mono uppercase craft-input"
            />
          {:else}
            <div class="p-2 bg-[#F9F9F8] border border-[#E4E4E7] rounded text-xs font-mono font-bold text-[#18181B] flex items-center justify-between">
              <span>{newProfile.codiceFiscale || 'Auto-calcolato'}</span>
              {#if newProfile.codiceFiscale}
                <Check class="w-3.5 h-3.5 text-[#059669]" />
              {/if}
            </div>
          {/if}
        </div>

        <div class="sm:col-span-2">
          <label for="nv_indirizzo" class="block text-xs font-medium text-[#18181B] mb-1">Indirizzo di Residenza</label>
          <input id="nv_indirizzo" type="text" bind:value={newProfile.indirizzoResidenza} placeholder="Via Roma, 12" class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input" />
        </div>

        <div class="relative">
          <label for="nv_comuneResidenza" class="block text-xs font-medium text-[#18181B] mb-1">Comune di Residenza</label>
          <input
            id="nv_comuneResidenza"
            type="text"
            bind:value={newProfile.comuneResidenza}
            oninput={(e) => handleComuneSearch('new', 'comuneResidenza', (e.target as HTMLInputElement).value)}
            class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
          />
          {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'comuneResidenza'}
            <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
              {#each comuneSuggestions.list as c}
                <button
                  type="button"
                  onclick={() => selectComune(c)}
                  class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                >
                  <span class="font-medium text-[#18181B]">{c.nome}</span>
                  <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      {#if cfCheck}
        <div class="text-xs font-mono {cfCheck.valid ? 'text-[#059669]' : 'text-[#DC2626]'}">
          {cfCheck.valid ? 'Codice fiscale formalmente valido' : cfCheck.error}
        </div>
      {/if}

      <div class="flex justify-end space-x-3 pt-4 border-t border-[#E4E4E7]">
        <button
          onclick={() => isCreatingVault = false}
          class="px-4 py-2 text-xs text-[#71717A] hover:text-[#18181B] craft-transition"
        >
          Annulla
        </button>
        <button
          onclick={handleSaveNewVault}
          class="px-5 py-2 bg-[#18181B] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded craft-transition craft-press"
        >
          Cifra e Salva Localmente
        </button>
      </div>

    </div>

  <!-- STATO 3: VAULT SBLOCCATO CON GESTIONE MULTI-PROFILO -->
  {:else if vault.isUnlocked}
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      
      <!-- Lista Profili (Io, Padre, Moglie, Figlio) -->
      <div class="md:col-span-4 bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#E4E4E7]">
          <span class="text-xs font-bold text-[#18181B] uppercase tracking-wider">Profili Salvati</span>
          <button
            onclick={addNewFamilyProfile}
            class="text-xs text-[#1D4ED8] hover:underline flex items-center space-x-1 craft-press font-semibold"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Aggiungi</span>
          </button>
        </div>

        <div class="space-y-1.5">
          {#each vault.profiles as profile}
            <button
              onclick={() => { editingProfile = { ...profile }; vault.activeProfileId = profile.id; }}
              class="w-full text-left p-2.5 rounded-lg border text-xs craft-transition craft-press {editingProfile?.id === profile.id ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]' : 'bg-[#F9F9F8] border-[#E4E4E7] text-[#18181B]'}"
            >
              <div class="font-semibold">{profile.label}</div>
              <div class="text-[11px] text-[#71717A]">{profile.cognome} {profile.nome}</div>
            </button>
          {/each}
        </div>

        <!-- Strumenti di Backup e Portabilità -->
        <div class="pt-4 border-t border-[#E4E4E7] space-y-2">
          <button
            onclick={() => { vault.exportBackup(); showToast('Backup .compilalo esportato!'); }}
            class="w-full py-1.5 px-2 bg-[#F2F1ED] hover:bg-[#E4E4E7] text-[#18181B] rounded text-xs flex items-center justify-center space-x-1.5 craft-transition craft-press"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Esporta Backup (.compilalo)</span>
          </button>

          <button
            onclick={() => { if (confirm('Sei sicuro di voler distruggere la cassaforte da questo browser?')) { vault.destroyVault(); showToast('Cassaforte eliminata'); } }}
            class="w-full py-1.5 px-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded text-xs flex items-center justify-center space-x-1.5 craft-transition craft-press"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Elimina Cassaforte Locale</span>
          </button>
        </div>
      </div>

      <!-- Dettaglio Profilo Selezionato -->
      {#if editingProfile}
        <div class="md:col-span-8 bg-white border border-[#E4E4E7] rounded-lg p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
            <div>
              <h3 class="font-serif text-lg font-bold text-[#18181B]">{editingProfile.label}</h3>
              <p class="text-xs text-[#71717A]">Modifica i dati pronti per l'auto-compilazione.</p>
            </div>

            <button
              onclick={handleSaveProfileChanges}
              class="px-4 py-2 bg-[#18181B] hover:bg-[#059669] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press"
            >
              <Save class="w-3.5 h-3.5" />
              <span>Salva Modifiche</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="ed_label" class="block text-xs font-medium text-[#18181B] mb-1">Etichetta Profilo</label>
              <input id="ed_label" type="text" bind:value={editingProfile.label} class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input" />
            </div>

            <div>
              <label for="ed_sesso" class="block text-xs font-medium text-[#18181B] mb-1">Sesso</label>
              <select
                id="ed_sesso"
                bind:value={editingProfile.sesso}
                onchange={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              >
                <option value="M">Maschile (M)</option>
                <option value="F">Femminile (F)</option>
                <option value="A">Altro / Non specificato</option>
              </select>
            </div>

            <div>
              <label for="ed_nome" class="block text-xs font-medium text-[#18181B] mb-1">Nome</label>
              <input
                id="ed_nome"
                type="text"
                bind:value={editingProfile.nome}
                oninput={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              />
            </div>
            <div>
              <label for="ed_cognome" class="block text-xs font-medium text-[#18181B] mb-1">Cognome</label>
              <input
                id="ed_cognome"
                type="text"
                bind:value={editingProfile.cognome}
                oninput={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              />
            </div>

            <div>
              <label for="ed_dataNascita" class="block text-xs font-medium text-[#18181B] mb-1">Data di Nascita</label>
              <input
                id="ed_dataNascita"
                type="date"
                bind:value={editingProfile.dataNascita}
                onchange={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              />
            </div>

            <div class="relative">
              <label for="ed_luogoNascita" class="block text-xs font-medium text-[#18181B] mb-1">Comune di Nascita</label>
              <input
                id="ed_luogoNascita"
                type="text"
                bind:value={editingProfile.luogoNascita}
                oninput={(e) => {
                  handleComuneSearch('edit', 'luogoNascita', (e.target as HTMLInputElement).value);
                  if (editingProfile) tryAutoCalculateCF(editingProfile);
                }}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              />
              {#if comuneSuggestions && comuneSuggestions.target === 'edit' && comuneSuggestions.field === 'luogoNascita'}
                <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
                  {#each comuneSuggestions.list as c}
                    <button
                      type="button"
                      onclick={() => selectComune(c)}
                      class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                    >
                      <span class="font-medium text-[#18181B]">{c.nome}</span>
                      <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Auto-CF or Manual CF in Editing Profile -->
            <div class="sm:col-span-2 pt-2 border-t border-[#E4E4E7] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#18181B] flex items-center space-x-1.5">
                  <Calculator class="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>Codice Fiscale</span>
                  {#if !manualCfMode && editingProfile.codiceFiscale}
                    <span class="ml-1 text-[10px] font-mono text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                      CALCOLATO
                    </span>
                  {/if}
                </span>

                <button
                  type="button"
                  onclick={() => manualCfMode = !manualCfMode}
                  class="text-[11px] text-[#1D4ED8] hover:underline flex items-center space-x-1"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>{manualCfMode ? 'Torna al calcolo automatico' : 'Preferisco inserirlo a mano'}</span>
                </button>
              </div>

              {#if manualCfMode}
                <input
                  id="ed_cf"
                  type="text"
                  value={editingProfile.codiceFiscale}
                  oninput={(e) => editingProfile && handleManualCfChange(editingProfile, (e.target as HTMLInputElement).value)}
                  class="w-full text-xs border border-[#E4E4E7] rounded p-2 font-mono uppercase craft-input"
                />
              {:else}
                <div class="p-2.5 bg-[#F9F9F8] border border-[#E4E4E7] rounded flex items-center justify-between font-mono text-xs">
                  <span class={editingProfile.codiceFiscale ? 'font-bold text-[#18181B] tracking-wider' : 'text-[#71717A] italic'}>
                    {editingProfile.codiceFiscale || 'Verrà calcolato appena compili data e comune di nascita'}
                  </span>
                  {#if editingProfile.codiceFiscale}
                    <CheckCircle2 class="w-4 h-4 text-[#059669]" />
                  {/if}
                </div>
              {/if}
            </div>

            <div class="sm:col-span-2">
              <label for="ed_indirizzo" class="block text-xs font-medium text-[#18181B] mb-1">Indirizzo di Residenza</label>
              <input id="ed_indirizzo" type="text" bind:value={editingProfile.indirizzoResidenza} class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input" />
            </div>

            <div class="relative">
              <label for="ed_comuneResidenza" class="block text-xs font-medium text-[#18181B] mb-1">Comune di Residenza</label>
              <input
                id="ed_comuneResidenza"
                type="text"
                bind:value={editingProfile.comuneResidenza}
                oninput={(e) => handleComuneSearch('edit', 'comuneResidenza', (e.target as HTMLInputElement).value)}
                class="w-full text-xs border border-[#E4E4E7] rounded p-2 craft-input"
              />
              {#if comuneSuggestions && comuneSuggestions.target === 'edit' && comuneSuggestions.field === 'comuneResidenza'}
                <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 overflow-hidden">
                  {#each comuneSuggestions.list as c}
                    <button
                      type="button"
                      onclick={() => selectComune(c)}
                      class="w-full text-left px-3 py-2 text-xs hover:bg-[#F9F9F8] flex items-center justify-between border-b last:border-b-0 border-[#F2F1ED]"
                    >
                      <span class="font-medium text-[#18181B]">{c.nome}</span>
                      <span class="text-[10px] font-mono text-[#71717A]">{c.provincia} &middot; {c.cap}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <div>
              <label for="ed_cap" class="block text-xs font-medium text-[#18181B] mb-1">CAP</label>
              <input id="ed_cap" type="text" bind:value={editingProfile.capResidenza} class="w-full text-xs border border-[#E4E4E7] rounded p-2 font-mono craft-input" />
            </div>
          </div>
        </div>
      {/if}

    </div>
  {/if}

</div>

<!-- Modal di Firma Autografa (Emil Kowalski craft-modal: 180ms ease-out) -->
{#if showSignatureModal}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-150">
    <div class="bg-white rounded-lg border border-[#E4E4E7] shadow-xl max-w-lg w-full p-6 space-y-4 craft-modal">
      <div class="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
        <h3 class="font-serif text-lg font-bold text-[#18181B]">Disegna la tua Firma</h3>
        <button
          onclick={() => showSignatureModal = false}
          class="text-xs font-mono text-[#71717A] hover:text-[#18181B] craft-transition"
        >
          Annulla
        </button>
      </div>

      <p class="text-xs text-[#52525B]">
        Traccia la tua firma con il dito, mouse o penna. Rimane memorizzata esclusivamente in questo browser.
      </p>

      <div class="border border-[#E4E4E7] rounded bg-[#F9F9F8]">
        <canvas
          bind:this={canvasEl}
          class="w-full h-44 touch-none cursor-crosshair"
        ></canvas>
      </div>

      <div class="flex justify-between items-center pt-2">
        <button
          type="button"
          onclick={clearSignature}
          class="px-3 py-1.5 text-xs text-[#71717A] hover:text-[#18181B] border border-[#E4E4E7] rounded craft-transition craft-press"
        >
          Cancella
        </button>

        <button
          type="button"
          onclick={saveSignature}
          class="px-4 py-1.5 text-xs font-semibold bg-[#18181B] text-white rounded hover:bg-[#1D4ED8] craft-transition craft-press"
        >
          Salva Firma
        </button>
      </div>
    </div>
  </div>
{/if}
