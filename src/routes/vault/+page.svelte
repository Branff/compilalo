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
    ArrowRight,
    Copy,
    X,
    FileKey,
    Shield
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
      const calculated = autoCalculateCodiceFiscale({
        nome: target.nome,
        cognome: target.cognome,
        sesso: target.sesso === 'A' ? 'M' : target.sesso,
        dataNascita: target.dataNascita,
        luogoNascita: target.luogoNascita
      });
      if (calculated) {
        target.codiceFiscale = calculated;
      }
    }
  }

  function handleManualCfChange(target: UserProfile, val: string) {
    target.codiceFiscale = val.toUpperCase();
    if (target.codiceFiscale.length === 16) {
      const decoded = decodeCodiceFiscale(target.codiceFiscale);
      if (decoded.sesso) target.sesso = decoded.sesso;
    }
  }

  function handleComuneSearch(target: 'new' | 'edit', field: 'luogoNascita' | 'comuneResidenza', query: string) {
    if (query.trim().length >= 2) {
      const hits = findComune(query);
      if (hits.length > 0) {
        comuneSuggestions = { target, field, list: hits.slice(0, 5) };
        return;
      }
    }
    comuneSuggestions = null;
  }

  function selectComune(comune: ComuneItem) {
    if (!comuneSuggestions) return;
    const { target, field } = comuneSuggestions;
    const dest = target === 'new' ? newProfile : editingProfile;
    if (!dest) return;

    if (field === 'luogoNascita') {
      dest.luogoNascita = comune.nome;
      dest.provinciaNascita = comune.provincia;
      tryAutoCalculateCF(dest);
    } else {
      dest.comuneResidenza = comune.nome;
      dest.provinciaResidenza = comune.provincia;
      dest.capResidenza = comune.cap;
    }
    comuneSuggestions = null;
  }

  async function handleUnlock() {
    if (!passphraseInput.trim()) return;
    isUnlocking = true;
    unlockError = '';

    try {
      const success = await vault.unlock(passphraseInput.trim());
      if (success) {
        passphraseInput = '';
        if (vault.activeProfile) {
          editingProfile = { ...vault.activeProfile };
        }
        showToast('Cassaforte sbloccata con successo!');
      } else {
        unlockError = 'La frase segreta inserita non corrisponde. Riprova.';
      }
    } catch (err: any) {
      unlockError = err?.message || 'Errore durante la decifratura.';
    } finally {
      isUnlocking = false;
    }
  }

  function startCreateVault() {
    generatedMnemonicWords = generateMnemonic();
    isCreatingVault = true;
  }

  async function handleSaveNewVault() {
    if (!newProfile.nome || !newProfile.cognome) {
      showToast('Inserisci almeno Nome e Cognome.');
      return;
    }

    tryAutoCalculateCF(newProfile);

    try {
      await vault.createNewVault(newProfile, generatedMnemonicWords);
      isCreatingVault = false;
      editingProfile = { ...newProfile };
      showToast('Cassaforte cifrata creata e memorizzata in locale!');
    } catch (err) {
      console.error(err);
      showToast('Errore durante la creazione della cassaforte.');
    }
  }

  async function handleSaveActiveIdentityDirectly() {
    if (!newProfile.nome || !newProfile.cognome) {
      showToast('Inserisci almeno Nome e Cognome.');
      return;
    }

    tryAutoCalculateCF(newProfile);

    await vault.updateActiveIdentity({
      nome: newProfile.nome,
      cognome: newProfile.cognome,
      sesso: newProfile.sesso,
      dataNascita: newProfile.dataNascita,
      luogoNascita: newProfile.luogoNascita,
      provinciaNascita: newProfile.provinciaNascita,
      codiceFiscale: newProfile.codiceFiscale,
      comuneResidenza: newProfile.comuneResidenza,
      provinciaResidenza: newProfile.provinciaResidenza,
      capResidenza: newProfile.capResidenza,
      indirizzoResidenza: newProfile.indirizzoResidenza
    });

    showToast('Dati salvati in locale! Pronti per qualsiasi modulo.');
  }

  async function handleSaveProfileChanges() {
    if (!editingProfile) return;
    tryAutoCalculateCF(editingProfile);
    const idx = vault.profiles.findIndex(p => p.id === editingProfile?.id);
    if (idx >= 0) {
      vault.profiles[idx] = { ...editingProfile };
      await vault.saveUpdatedProfiles();
    }
    await vault.updateActiveIdentity(editingProfile);
    showToast('Profilo aggiornato con successo');
  }

  function addNewFamilyProfile() {
    const newId = `profile_${Date.now()}`;
    const p: UserProfile = {
      id: newId,
      label: 'Nuovo Familiare',
      isDefault: false,
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
      indirizzoResidenza: ''
    };
    vault.addProfile(p);
    editingProfile = { ...p };
    showToast('Nuovo profilo familiare creato!');
  }

  function openSignaturePad() {
    showSignatureModal = true;
    setTimeout(() => {
      if (canvasEl) {
        signaturePadInstance = new SignaturePad(canvasEl, {
          penColor: '#09090B',
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

  function copyMnemonicToClipboard() {
    navigator.clipboard.writeText(generatedMnemonicWords);
    showToast('12 parole copiate negli appunti!');
  }

  let cfCheck = $derived.by(() => {
    const cf = isCreatingVault ? newProfile.codiceFiscale : (editingProfile?.codiceFiscale || newProfile.codiceFiscale);
    if (!cf || cf.length < 16) return null;
    return validateCodiceFiscale(cf);
  });
</script>

<svelte:head>
  <title>La Mia Cassaforte Crittografica &mdash; Anagrafica Locale E2EE | COMPILALO</title>
  <meta name="description" content="Salva e gestisci i tuoi dati anagrafici e la tua firma in locale sul tuo dispositivo con crittografia AES-GCM-256 e chiave BIP-39 a 12 parole. Zero server, zero tracciamento." />
  <link rel="canonical" href="https://compilalo.it/vault" />
  <meta property="og:title" content="La Mia Cassaforte Crittografica | COMPILALO" />
  <meta property="og:description" content="Anagrafica locale protetta da crittografia a livello bancario sul tuo dispositivo. I tuoi dati non viaggiano mai su internet." />
  <meta property="og:url" content="https://compilalo.it/vault" />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-8 py-2">

  <!-- Toast Notifica ad alto craft (Emil Kowalski style: 180ms ease-out) -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#09090B] text-white px-4 py-2.5 rounded-lg shadow-xl border border-zinc-800 text-xs font-medium flex items-center space-x-2.5 craft-modal">
      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{notificationToast}</span>
    </div>
  {/if}
  
  <!-- Header Hardware-Grade Vault (Raycast / 1Password style) -->
  <div class="craft-card rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 text-[#2563EB] flex items-center justify-center">
            <KeyRound class="w-4 h-4" />
          </div>
          <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#09090B]">
            Cassaforte Crittografica Locale
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
          I tuoi dati rimangono memorizzati <strong class="text-[#09090B]">esclusivamente nel tuo browser</strong> con cifratura hardware <strong class="text-[#09090B]">AES-GCM-256</strong>. Nessun server, nessun cookie, zero telemetria.
        </p>
      </div>

      {#if vault.isUnlocked}
        <button
          onclick={() => { vault.lock(); editingProfile = null; showToast('Cassaforte chiusa'); }}
          class="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl flex items-center space-x-2 craft-transition craft-press self-start sm:self-auto shrink-0"
        >
          <Lock class="w-3.5 h-3.5 text-zinc-600" />
          <span>Blocca Cassaforte</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- STATO 1: VAULT NON BLOCCATO MA NON ANCORA CIFRATO O BLOCCATO -->
  {#if !vault.isUnlocked && !isCreatingVault}
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

      <!-- Sezione Sinistra: Sblocco o Configurazione Identità -->
      <div class="md:col-span-7 craft-card rounded-2xl p-6 sm:p-7 space-y-6 border border-zinc-200/90 shadow-sm">

        {#if vault.hasStoredVault}
          <!-- Esiste un Vault Cifrato salvato in LocalStorage: Sblocco -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2.5 text-[#09090B]">
              <Lock class="w-5 h-5 text-amber-600" />
              <h2 class="font-serif text-xl font-bold">Cassaforte Cifrata Rilevata</h2>
            </div>
            <p class="text-xs text-zinc-600 leading-relaxed">
              Inserisci la tua frase di sblocco segreta a 12 parole per decifrare i tuoi profili personali salvati.
            </p>

            <div class="space-y-3 pt-2">
              <label for="passphrase_input" class="block text-xs font-semibold text-zinc-900">
                Frase segreta (12 parole) o chiave crittografica
              </label>
              <textarea
                id="passphrase_input"
                bind:value={passphraseInput}
                rows={3}
                placeholder="es. mela stella luna oceano vento..."
                class="w-full text-xs font-mono p-3 bg-zinc-50 border border-zinc-300 rounded-xl craft-input leading-relaxed"
              ></textarea>

              {#if unlockError}
                <div class="text-xs text-red-600 flex items-center space-x-1.5 p-2 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle class="w-4 h-4 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              {/if}

              <button
                onclick={handleUnlock}
                disabled={isUnlocking || !passphraseInput}
                class="w-full py-3 bg-[#09090B] text-white rounded-xl text-xs font-bold hover:bg-[#2563EB] craft-transition craft-press disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
              >
                <Unlock class="w-4 h-4" />
                <span>{isUnlocking ? 'Decifratura in corso...' : 'Sblocca la Mia Cassaforte'}</span>
              </button>
            </div>
          </div>

        {:else}
          <!-- Nessun Vault Cifrato ancora: Mostra l'identità attiva (con auto-calcolo CF) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 class="font-serif text-xl font-bold text-[#09090B]">La Tua Anagrafica sul Dispositivo</h2>
                <p class="text-xs text-zinc-500 mt-0.5">
                  {#if vault.hasIdentityData}
                    Dati già pronti e sincronizzati con tutti i moduli del sito.
                  {:else}
                    Inserisci i tuoi dati qui per averli sempre pronti all'uso.
                  {/if}
                </p>
              </div>

              {#if vault.hasIdentityData}
                <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold">
                  ATTIVO
                </span>
              {/if}
            </div>

            <!-- Modulo rapido di modifica identità con Auto-CF -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label for="id_nome" class="block text-xs font-medium text-zinc-700 mb-1">Nome</label>
                <input
                  id="id_nome"
                  type="text"
                  bind:value={newProfile.nome}
                  oninput={() => tryAutoCalculateCF(newProfile)}
                  placeholder="Mario"
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                />
              </div>
              <div>
                <label for="id_cognome" class="block text-xs font-medium text-zinc-700 mb-1">Cognome</label>
                <input
                  id="id_cognome"
                  type="text"
                  bind:value={newProfile.cognome}
                  oninput={() => tryAutoCalculateCF(newProfile)}
                  placeholder="Rossi"
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                />
              </div>

              <div>
                <label for="id_sesso" class="block text-xs font-medium text-zinc-700 mb-1">Sesso</label>
                <select
                  id="id_sesso"
                  bind:value={newProfile.sesso}
                  onchange={() => tryAutoCalculateCF(newProfile)}
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                >
                  <option value="M">Maschile (M)</option>
                  <option value="F">Femminile (F)</option>
                  <option value="A">Altro / Non specificato</option>
                </select>
              </div>

              <div>
                <label for="id_dataNascita" class="block text-xs font-medium text-zinc-700 mb-1">Data di Nascita</label>
                <input
                  id="id_dataNascita"
                  type="date"
                  bind:value={newProfile.dataNascita}
                  onchange={() => tryAutoCalculateCF(newProfile)}
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                />
              </div>

              <div class="relative">
                <label for="id_luogoNascita" class="block text-xs font-medium text-zinc-700 mb-1">Comune di Nascita</label>
                <input
                  id="id_luogoNascita"
                  type="text"
                  bind:value={newProfile.luogoNascita}
                  oninput={(e) => {
                    handleComuneSearch('new', 'luogoNascita', (e.target as HTMLInputElement).value);
                    tryAutoCalculateCF(newProfile);
                  }}
                  placeholder="es. Roma o Milano"
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                />
                {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'luogoNascita'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
                    {#each comuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectComune(c)}
                        class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                      >
                        <span class="font-medium text-zinc-900">{c.nome}</span>
                        <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="relative">
                <label for="id_comune" class="block text-xs font-medium text-zinc-700 mb-1">Comune di Residenza</label>
                <input
                  id="id_comune"
                  type="text"
                  bind:value={newProfile.comuneResidenza}
                  oninput={(e) => handleComuneSearch('new', 'comuneResidenza', (e.target as HTMLInputElement).value)}
                  placeholder="es. Firenze o Torino"
                  class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input"
                />
                {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'comuneResidenza'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
                    {#each comuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectComune(c)}
                        class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                      >
                        <span class="font-medium text-zinc-900">{c.nome}</span>
                        <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="sm:col-span-2">
                <label for="id_indirizzo" class="block text-xs font-medium text-zinc-700 mb-1">Indirizzo (Via e Civico)</label>
                <input id="id_indirizzo" type="text" bind:value={newProfile.indirizzoResidenza} placeholder="Via Nazionale 1" class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 craft-input" />
              </div>

              <!-- SEZIONE CODICE FISCALE: INTELLIGENTE CON AUTO-CALCOLO E OVERRIDE -->
              <div class="sm:col-span-2 pt-3 border-t border-zinc-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-900 flex items-center space-x-1.5">
                    <Calculator class="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Codice Fiscale</span>
                    {#if !manualCfMode && newProfile.codiceFiscale}
                      <span class="ml-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        CALCOLATO
                      </span>
                    {/if}
                  </span>

                  <button
                    type="button"
                    onclick={() => manualCfMode = !manualCfMode}
                    class="text-[11px] text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    <Edit3 class="w-3 h-3" />
                    <span>{manualCfMode ? 'Torna al calcolo automatico' : 'Modifica a mano'}</span>
                  </button>
                </div>

                {#if manualCfMode}
                  <input
                    id="id_cf"
                    type="text"
                    value={newProfile.codiceFiscale}
                    oninput={(e) => handleManualCfChange(newProfile, (e.target as HTMLInputElement).value)}
                    placeholder="RSSMRA80A01H501U"
                    class="w-full text-xs border border-zinc-300 rounded-lg p-2.5 font-mono uppercase craft-input"
                  />
                  <p class="text-[11px] text-zinc-500">
                    Digita il codice fiscale a 16 caratteri. Verranno estratti sesso e data in automatico.
                  </p>
                {:else}
                  <div class="p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl flex items-center justify-between font-mono text-xs">
                    <span class={newProfile.codiceFiscale ? 'font-bold text-[#09090B] tracking-wider' : 'text-zinc-400 italic'}>
                      {newProfile.codiceFiscale || 'Verrà calcolato dopo aver compilato data e comune'}
                    </span>
                    {#if newProfile.codiceFiscale}
                      <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                    {/if}
                  </div>
                {/if}
              </div>

            </div>

            <div class="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200">
              <button
                onclick={handleSaveActiveIdentityDirectly}
                class="px-5 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white text-xs font-bold rounded-xl craft-transition craft-press shadow-sm"
              >
                Salva Dati nel Browser
              </button>

              <button
                onclick={startCreateVault}
                class="text-xs text-[#2563EB] hover:underline font-semibold flex items-center space-x-1"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>Proteggi con 12 parole segrete</span>
              </button>
            </div>
          </div>
        {/if}

      </div>

      <!-- Sezione Destra: Firma Autografa & Garanzie Zero-Knowledge -->
      <div class="md:col-span-5 space-y-6">

        <!-- Riquadro Firma Autografa Memorizzata -->
        <div class="craft-card rounded-2xl p-6 space-y-3.5 border border-zinc-200/90 shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <span class="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 flex items-center space-x-1.5">
              <PenTool class="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Firma Autografa</span>
            </span>
            {#if vault.savedSignature}
              <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">MEMORIZZATA</span>
            {/if}
          </div>

          <p class="text-xs text-zinc-600 leading-relaxed">
            Disegna la tua firma una volta sola. Verrà impressa in automatico in ogni documento o modello che compili.
          </p>

          {#if vault.savedSignature}
            <div class="border border-emerald-200 bg-emerald-50/70 rounded-xl p-3.5 space-y-2">
              <div class="bg-white p-2 rounded-lg border border-emerald-200">
                <img src={vault.savedSignature} alt="Firma memorizzata" class="h-12 object-contain mx-auto" />
              </div>
              <div class="flex items-center justify-between pt-1">
                <button
                  onclick={clearSignature}
                  class="text-xs text-red-600 hover:underline craft-transition"
                >
                  Elimina firma
                </button>
                <button
                  onclick={openSignaturePad}
                  class="text-xs text-[#2563EB] font-bold hover:underline craft-transition"
                >
                  Ridisegna
                </button>
              </div>
            </div>
          {:else}
            <button
              onclick={openSignaturePad}
              class="w-full py-4 border-2 border-dashed border-zinc-300 rounded-xl text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 flex items-center justify-center space-x-2 bg-zinc-50/50 hover:bg-zinc-50 craft-transition craft-press"
            >
              <PenTool class="w-4 h-4 text-[#2563EB]" />
              <span>Disegna la tua firma ora</span>
            </button>
          {/if}
        </div>

        <!-- Riquadro Sicurezza & Garanzie Anonimato -->
        <div class="rounded-2xl p-5 space-y-2.5 text-xs text-zinc-600 bg-zinc-100/70 border border-zinc-200/80">
          <div class="flex items-center space-x-2 text-zinc-900 font-bold">
            <ShieldCheck class="w-4 h-4 text-emerald-600" />
            <span>Garanzia Zero-Knowledge Radicale</span>
          </div>
          <p class="leading-relaxed">
            COMPILALO non possiede database cloud per conservare dati anagrafici. Se svuoti i dati del browser o navighi in modalità incognito, i file scompaiono senza lasciare traccia.
          </p>
        </div>

      </div>

    </div>

  <!-- STATO 2: CREAZIONE DI UN NUOVO VAULT CON LE 12 PAROLE (MNEMONIC CARD) -->
  {:else if isCreatingVault}
    <div class="craft-card rounded-2xl p-6 sm:p-8 space-y-6 border border-zinc-200/90 shadow-sm">
      
      <div class="border-b border-zinc-200 pb-5 space-y-2">
        <div class="flex items-center space-x-2 text-[#2563EB] text-xs font-mono uppercase tracking-wider font-semibold">
          <FileKey class="w-4 h-4" />
          <span>Generazione Chiave Crittografica BIP-39</span>
        </div>
        <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#09090B]">Conserva le tue 12 parole segrete</h2>
        <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl">
          Queste 12 parole rappresentano l'unica chiave crittografica esistente per decifrare i tuoi profili. Nessun server possiede una copia di backup.
        </p>

        <!-- Griglia 12 Parole Mnemonic -->
        <div class="mt-4 p-4 rounded-xl bg-zinc-950 text-white space-y-3 shadow-inner">
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {#each generatedMnemonicWords.split(' ') as word, idx}
              <div class="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center space-x-1.5">
                <span class="text-zinc-500 text-[10px]">{idx + 1}.</span>
                <span class="font-bold text-zinc-200">{word}</span>
              </div>
            {/each}
          </div>

          <div class="pt-2 flex justify-end">
            <button
              onclick={copyMnemonicToClipboard}
              class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 craft-transition craft-press"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>Copia Frase Negli Appunti</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Campi Anagrafici Iniziali -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label for="nv_nome" class="block text-xs font-medium text-zinc-800 mb-1">Nome *</label>
          <input
            id="nv_nome"
            type="text"
            bind:value={newProfile.nome}
            oninput={() => tryAutoCalculateCF(newProfile)}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          />
        </div>
        <div>
          <label for="nv_cognome" class="block text-xs font-medium text-zinc-800 mb-1">Cognome *</label>
          <input
            id="nv_cognome"
            type="text"
            bind:value={newProfile.cognome}
            oninput={() => tryAutoCalculateCF(newProfile)}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          />
        </div>
        <div>
          <label for="nv_sesso" class="block text-xs font-medium text-zinc-800 mb-1">Sesso *</label>
          <select
            id="nv_sesso"
            bind:value={newProfile.sesso}
            onchange={() => tryAutoCalculateCF(newProfile)}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          >
            <option value="M">Maschile (M)</option>
            <option value="F">Femminile (F)</option>
            <option value="A">Altro / Non specificato</option>
          </select>
        </div>

        <div>
          <label for="nv_dataNascita" class="block text-xs font-medium text-zinc-800 mb-1">Data di Nascita</label>
          <input
            id="nv_dataNascita"
            type="date"
            bind:value={newProfile.dataNascita}
            onchange={() => tryAutoCalculateCF(newProfile)}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          />
        </div>
        
        <div class="relative">
          <label for="nv_luogoNascita" class="block text-xs font-medium text-zinc-800 mb-1">Comune di Nascita</label>
          <input
            id="nv_luogoNascita"
            type="text"
            bind:value={newProfile.luogoNascita}
            oninput={(e) => {
              handleComuneSearch('new', 'luogoNascita', (e.target as HTMLInputElement).value);
              tryAutoCalculateCF(newProfile);
            }}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          />
          {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'luogoNascita'}
            <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
              {#each comuneSuggestions.list as c}
                <button
                  type="button"
                  onclick={() => selectComune(c)}
                  class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                >
                  <span class="font-medium text-zinc-900">{c.nome}</span>
                  <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- CODICE FISCALE AUTO-CALCULATED WITH OVERRIDE -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="nv_cf" class="block text-xs font-medium text-zinc-800">Codice Fiscale</label>
            <button
              type="button"
              onclick={() => manualCfMode = !manualCfMode}
              class="text-[10px] text-[#2563EB] hover:underline"
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
              class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5 font-mono uppercase"
            />
          {:else}
            <div class="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono font-bold text-zinc-900 flex items-center justify-between">
              <span>{newProfile.codiceFiscale || 'Auto-calcolato'}</span>
              {#if newProfile.codiceFiscale}
                <Check class="w-3.5 h-3.5 text-emerald-600" />
              {/if}
            </div>
          {/if}
        </div>

        <div class="sm:col-span-2">
          <label for="nv_indirizzo" class="block text-xs font-medium text-zinc-800 mb-1">Indirizzo di Residenza</label>
          <input id="nv_indirizzo" type="text" bind:value={newProfile.indirizzoResidenza} placeholder="Via Roma, 12" class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5" />
        </div>

        <div class="relative">
          <label for="nv_comuneResidenza" class="block text-xs font-medium text-zinc-800 mb-1">Comune di Residenza</label>
          <input
            id="nv_comuneResidenza"
            type="text"
            bind:value={newProfile.comuneResidenza}
            oninput={(e) => handleComuneSearch('new', 'comuneResidenza', (e.target as HTMLInputElement).value)}
            class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
          />
          {#if comuneSuggestions && comuneSuggestions.target === 'new' && comuneSuggestions.field === 'comuneResidenza'}
            <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
              {#each comuneSuggestions.list as c}
                <button
                  type="button"
                  onclick={() => selectComune(c)}
                  class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                >
                  <span class="font-medium text-zinc-900">{c.nome}</span>
                  <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      {#if cfCheck}
        <div class="text-xs font-mono {cfCheck.valid ? 'text-emerald-700' : 'text-red-600'}">
          {cfCheck.valid ? 'Codice fiscale formalmente valido' : cfCheck.error}
        </div>
      {/if}

      <div class="flex justify-end space-x-3 pt-5 border-t border-zinc-200">
        <button
          onclick={() => isCreatingVault = false}
          class="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-900 craft-transition"
        >
          Annulla
        </button>
        <button
          onclick={handleSaveNewVault}
          class="px-6 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white text-xs font-bold rounded-xl craft-transition craft-press shadow-sm"
        >
          Cifra e Salva Localmente
        </button>
      </div>

    </div>

  <!-- STATO 3: VAULT SBLOCCATO CON GESTIONE MULTI-PROFILO -->
  {:else if vault.isUnlocked}
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      
      <!-- Lista Profili (Io, Padre, Moglie, Figlio) -->
      <div class="md:col-span-4 craft-card rounded-2xl p-5 space-y-4 border border-zinc-200/90 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <span class="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900">Profili Salvati</span>
          <button
            onclick={addNewFamilyProfile}
            class="text-xs text-[#2563EB] hover:underline flex items-center space-x-1 craft-press font-semibold"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Nuovo</span>
          </button>
        </div>

        <div class="space-y-1.5">
          {#each vault.profiles as profile}
            <button
              onclick={() => { editingProfile = { ...profile }; vault.activeProfileId = profile.id; }}
              class="w-full text-left p-3 rounded-xl border text-xs craft-transition craft-press {editingProfile?.id === profile.id ? 'bg-blue-50/80 border-[#2563EB] text-[#2563EB] shadow-2xs font-bold' : 'bg-zinc-50/60 border-zinc-200 text-zinc-800 hover:bg-zinc-100'}"
            >
              <div>{profile.label}</div>
              <div class="text-[11px] text-zinc-500 font-normal">{profile.cognome} {profile.nome}</div>
            </button>
          {/each}
        </div>

        <!-- Strumenti di Backup e Portabilità -->
        <div class="pt-4 border-t border-zinc-200 space-y-2">
          <button
            onclick={() => { vault.exportBackup(); showToast('Backup .compilalo esportato!'); }}
            class="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 craft-transition craft-press"
          >
            <Download class="w-3.5 h-3.5 text-zinc-600" />
            <span>Esporta Backup (.compilalo)</span>
          </button>

          <button
            onclick={() => { if (confirm('Sei sicuro di voler distruggere la cassaforte da questo browser?')) { vault.destroyVault(); showToast('Cassaforte eliminata'); } }}
            class="w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 craft-transition craft-press"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Elimina Cassaforte Locale</span>
          </button>
        </div>
      </div>

      <!-- Dettaglio Profilo Selezionato -->
      {#if editingProfile}
        <div class="md:col-span-8 craft-card rounded-2xl p-6 sm:p-7 space-y-5 border border-zinc-200/90 shadow-sm">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 class="font-serif text-xl font-bold text-[#09090B]">{editingProfile.label}</h3>
              <p class="text-xs text-zinc-500 mt-0.5">I dati verranno cifrati con AES-GCM alla chiusura.</p>
            </div>

            <button
              onclick={handleSaveProfileChanges}
              class="px-5 py-2.5 bg-[#09090B] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 craft-transition craft-press shadow-sm"
            >
              <Save class="w-3.5 h-3.5" />
              <span>Salva Modifiche</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="ed_label" class="block text-xs font-medium text-zinc-800 mb-1">Etichetta Profilo</label>
              <input id="ed_label" type="text" bind:value={editingProfile.label} class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5" />
            </div>

            <div>
              <label for="ed_sesso" class="block text-xs font-medium text-zinc-800 mb-1">Sesso</label>
              <select
                id="ed_sesso"
                bind:value={editingProfile.sesso}
                onchange={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              >
                <option value="M">Maschile (M)</option>
                <option value="F">Femminile (F)</option>
                <option value="A">Altro / Non specificato</option>
              </select>
            </div>

            <div>
              <label for="ed_nome" class="block text-xs font-medium text-zinc-800 mb-1">Nome</label>
              <input
                id="ed_nome"
                type="text"
                bind:value={editingProfile.nome}
                oninput={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              />
            </div>
            <div>
              <label for="ed_cognome" class="block text-xs font-medium text-zinc-800 mb-1">Cognome</label>
              <input
                id="ed_cognome"
                type="text"
                bind:value={editingProfile.cognome}
                oninput={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label for="ed_dataNascita" class="block text-xs font-medium text-zinc-800 mb-1">Data di Nascita</label>
              <input
                id="ed_dataNascita"
                type="date"
                bind:value={editingProfile.dataNascita}
                onchange={() => editingProfile && tryAutoCalculateCF(editingProfile)}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              />
            </div>

            <div class="relative">
              <label for="ed_luogoNascita" class="block text-xs font-medium text-zinc-800 mb-1">Comune di Nascita</label>
              <input
                id="ed_luogoNascita"
                type="text"
                bind:value={editingProfile.luogoNascita}
                oninput={(e) => {
                  handleComuneSearch('edit', 'luogoNascita', (e.target as HTMLInputElement).value);
                  if (editingProfile) tryAutoCalculateCF(editingProfile);
                }}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              />
              {#if comuneSuggestions && comuneSuggestions.target === 'edit' && comuneSuggestions.field === 'luogoNascita'}
                <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
                  {#each comuneSuggestions.list as c}
                    <button
                      type="button"
                      onclick={() => selectComune(c)}
                      class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                    >
                      <span class="font-medium text-zinc-900">{c.nome}</span>
                      <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Auto-CF or Manual CF in Editing Profile -->
            <div class="sm:col-span-2 pt-3 border-t border-zinc-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-zinc-900 flex items-center space-x-1.5">
                  <Calculator class="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Codice Fiscale</span>
                  {#if !manualCfMode && editingProfile.codiceFiscale}
                    <span class="ml-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      CALCOLATO
                    </span>
                  {/if}
                </span>

                <button
                  type="button"
                  onclick={() => manualCfMode = !manualCfMode}
                  class="text-[11px] text-[#2563EB] hover:underline flex items-center space-x-1"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>{manualCfMode ? 'Torna al calcolo automatico' : 'Modifica a mano'}</span>
                </button>
              </div>

              {#if manualCfMode}
                <input
                  id="ed_cf"
                  type="text"
                  value={editingProfile.codiceFiscale}
                  oninput={(e) => editingProfile && handleManualCfChange(editingProfile, (e.target as HTMLInputElement).value)}
                  class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5 font-mono uppercase"
                />
              {:else}
                <div class="p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span class={editingProfile.codiceFiscale ? 'font-bold text-[#09090B] tracking-wider' : 'text-zinc-400 italic'}>
                    {editingProfile.codiceFiscale || 'Verrà calcolato appena compili data e comune di nascita'}
                  </span>
                  {#if editingProfile.codiceFiscale}
                    <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                  {/if}
                </div>
              {/if}
            </div>

            <div class="sm:col-span-2">
              <label for="ed_indirizzo" class="block text-xs font-medium text-zinc-800 mb-1">Indirizzo di Residenza</label>
              <input id="ed_indirizzo" type="text" bind:value={editingProfile.indirizzoResidenza} class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5" />
            </div>

            <div class="relative">
              <label for="ed_comuneResidenza" class="block text-xs font-medium text-zinc-800 mb-1">Comune di Residenza</label>
              <input
                id="ed_comuneResidenza"
                type="text"
                bind:value={editingProfile.comuneResidenza}
                oninput={(e) => handleComuneSearch('edit', 'comuneResidenza', (e.target as HTMLInputElement).value)}
                class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5"
              />
              {#if comuneSuggestions && comuneSuggestions.target === 'edit' && comuneSuggestions.field === 'comuneResidenza'}
                <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
                  {#each comuneSuggestions.list as c}
                    <button
                      type="button"
                      onclick={() => selectComune(c)}
                      class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 flex items-center justify-between border-b last:border-b-0 border-zinc-100"
                    >
                      <span class="font-medium text-zinc-900">{c.nome}</span>
                      <span class="text-[10px] font-mono text-zinc-500">({c.provincia})</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <div>
              <label for="ed_cap" class="block text-xs font-medium text-zinc-800 mb-1">CAP</label>
              <input id="ed_cap" type="text" bind:value={editingProfile.capResidenza} class="craft-input w-full text-xs border border-zinc-300 rounded-lg p-2.5 font-mono" />
            </div>
          </div>
        </div>
      {/if}

    </div>
  {/if}

</div>

<!-- Modal di Firma Autografa (Emil Kowalski craft-modal: 180ms ease-out) -->
{#if showSignatureModal}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 transition-opacity duration-150">
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4 craft-modal">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h3 class="font-serif text-xl font-bold text-[#09090B]">Disegna la tua Firma</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Traccia la firma con dito, penna o mouse</p>
        </div>
        <button
          onclick={() => showSignatureModal = false}
          class="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 craft-transition"
          aria-label="Chiudi finestra"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="border border-zinc-200 rounded-xl bg-zinc-50/70 p-1">
        <canvas
          bind:this={canvasEl}
          class="w-full h-44 touch-none cursor-crosshair rounded-lg bg-white"
        ></canvas>
      </div>

      <div class="flex justify-between items-center pt-2">
        <button
          type="button"
          onclick={clearSignature}
          class="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-lg hover:bg-zinc-50 craft-transition craft-press"
        >
          Cancella e rifai
        </button>

        <button
          type="button"
          onclick={saveSignature}
          class="px-5 py-2 text-xs font-semibold bg-[#09090B] text-white rounded-lg hover:bg-[#2563EB] craft-transition craft-press shadow-sm"
        >
          Salva Firma nel Browser
        </button>
      </div>
    </div>
  </div>
{/if}
