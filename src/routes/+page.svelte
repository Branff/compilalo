<script lang="ts">
  import { onMount } from 'svelte';
  import { analyzeUploadedPdf, fillAndSignUploadedPdf, type UploadedPdfAnalysis } from '$lib/engine/uploaded-pdf-engine';
  import { downloadPdfFile } from '$lib/engine/pdf-engine';
  import { vault } from '$lib/stores/vault.svelte';
  import { TEMPLATES_CATALOG } from '$lib/templates/catalog';
  import { validateCodiceFiscale, autoCalculateCodiceFiscale, decodeCodiceFiscale } from '$lib/data/codiceFiscale';
  import { findComune, type ComuneItem } from '$lib/data/comuni';
  import {
    UploadCloud,
    FileText,
    CheckCircle2,
    PenTool,
    Download,
    Sparkles,
    Shield,
    Lock,
    KeyRound,
    ArrowRight,
    RefreshCw,
    X,
    FileCheck,
    Check,
    AlertCircle,
    User,
    Calculator,
    Edit3,
    MapPin
  } from 'lucide-svelte';
  import SignaturePad from 'signature_pad';

  let fileInputElement = $state<HTMLInputElement | null>(null);
  let isDragging = $state(false);
  let isAnalyzingFile = $state(false);
  let uploadedAnalysis = $state<UploadedPdfAnalysis | null>(null);
  let uploadedFileName = $state<string>('');
  let formValues = $state<Record<string, any>>({});
  let isProcessingDownload = $state(false);

  // Firma
  let showSignatureModal = $state(false);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let signaturePadInstance: SignaturePad | null = null;
  let signatureDataUrl = $state<string | undefined>(undefined);

  // Form compatto per chi non ha ancora inserito alcun dato
  let showQuickProfileForm = $state(false);
  let quickNome = $state('');
  let quickCognome = $state('');
  let quickSesso = $state<'M' | 'F' | 'A'>('M');
  let quickDataNascita = $state('');
  let quickLuogoNascita = $state('');
  let quickCf = $state('');
  let quickComune = $state('');
  let quickIndirizzo = $state('');
  let quickManualCf = $state(false);
  let quickComuneSuggestions = $state<{ field: 'nascita' | 'residenza'; list: ComuneItem[] } | null>(null);

  let notificationToast = $state<string | null>(null);
  let toastTimer: any = null;

  function showToast(msg: string) {
    notificationToast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      notificationToast = null;
    }, 3200);
  }

  function tryAutoCalculateQuickCf() {
    if (quickManualCf) return;
    if (quickNome && quickCognome && quickDataNascita && quickLuogoNascita) {
      const res = autoCalculateCodiceFiscale({
        nome: quickNome,
        cognome: quickCognome,
        sesso: quickSesso === 'A' ? 'M' : quickSesso,
        dataNascita: quickDataNascita,
        luogoNascita: quickLuogoNascita
      });
      if (res) {
        quickCf = res;
      }
    }
  }

  function handleQuickManualCfInput(val: string) {
    quickCf = val.toUpperCase();
    if (quickCf.length === 16) {
      const dec = decodeCodiceFiscale(quickCf);
      if (dec.sesso) quickSesso = dec.sesso;
    }
  }

  function searchQuickComune(field: 'nascita' | 'residenza', query: string) {
    if (query.trim().length >= 2) {
      const hits = findComune(query);
      if (hits.length > 0) {
        quickComuneSuggestions = { field, list: hits.slice(0, 5) };
        return;
      }
    }
    quickComuneSuggestions = null;
  }

  function selectQuickComune(item: ComuneItem) {
    if (!quickComuneSuggestions) return;
    if (quickComuneSuggestions.field === 'nascita') {
      quickLuogoNascita = item.nome;
      tryAutoCalculateQuickCf();
    } else {
      quickComune = item.nome;
    }
    quickComuneSuggestions = null;
  }

  onMount(async () => {
    await vault.checkStoredVault();
    // Se è presente una firma precedentemente salvata, riutilizzala automaticamente
    if (vault.savedSignature) {
      signatureDataUrl = vault.savedSignature;
    }
  });

  async function handleFileSelected(file: File) {
    if (!file) return;
    uploadedFileName = file.name;
    isAnalyzingFile = true;

    try {
      const buffer = await file.arrayBuffer();
      const analysis = await analyzeUploadedPdf(buffer);
      uploadedAnalysis = analysis;

      // Inizializza i valori dei campi attingendo all'identità universale
      const initial: Record<string, any> = {};
      const ident = vault.activeIdentity;

      for (const field of analysis.detectedFields) {
        if (field.suggestedProfileKey && (ident as any)[field.suggestedProfileKey]) {
          initial[field.name] = (ident as any)[field.suggestedProfileKey];
        } else {
          initial[field.name] = field.value || '';
        }
      }
      formValues = initial;

      // Se abbiamo già una firma salvata, la colleghiamo subito
      if (vault.savedSignature) {
        signatureDataUrl = vault.savedSignature;
      }
    } catch (err) {
      console.error(err);
      showToast('Non siamo riusciti a leggere questo PDF. Assicurati che sia un file valido.');
    } finally {
      isAnalyzingFile = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  function handleFieldValueChange(name: string, val: any) {
    formValues[name] = val;
    // Sincronizza automaticamente i campi principali con l'identità attiva (mai chiesti due volte!)
    const lower = name.toLowerCase();
    const update: any = {};
    if (lower.includes('nome') && !lower.includes('cognome')) update.nome = val;
    if (lower.includes('cognome')) update.cognome = val;
    if (lower.includes('cf') || lower.includes('fiscale')) update.codiceFiscale = val;
    if (lower.includes('comune')) update.comuneResidenza = val;
    if (lower.includes('indirizzo') || lower.includes('via')) update.indirizzoResidenza = val;
    if (Object.keys(update).length > 0) {
      vault.updateActiveIdentity(update);
    }
  }

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

  function saveSignatureModal() {
    if (signaturePadInstance && !signaturePadInstance.isEmpty()) {
      const dataUrl = signaturePadInstance.toDataURL('image/png');
      signatureDataUrl = dataUrl;
      // Salva la firma nella memoria locale per i prossimi documenti
      vault.saveSignatureLocally(dataUrl);
      showToast('Firma salvata e sincronizzata per tutti i documenti!');
    }
    showSignatureModal = false;
  }

  function clearModalSignature() {
    if (signaturePadInstance) {
      signaturePadInstance.clear();
    }
  }

  function removeSignature() {
    signatureDataUrl = undefined;
    vault.clearSavedSignature();
    showToast('Firma rimossa');
  }

  async function handleDownloadCompletedPdf() {
    if (!uploadedAnalysis) return;
    isProcessingDownload = true;

    try {
      const finalPdf = await fillAndSignUploadedPdf({
        pdfBytes: uploadedAnalysis.pdfBytes,
        fieldValues: formValues,
        hasAcroForm: uploadedAnalysis.hasAcroForm,
        signatureDataUrl
      });
      downloadPdfFile(finalPdf, `compilato-${uploadedFileName}`);
      showToast('Documento compilato e scaricato con successo!');
    } catch (err) {
      console.error(err);
      showToast('Si è verificato un problema durante la creazione del documento.');
    } finally {
      isProcessingDownload = false;
    }
  }

  async function saveQuickProfileToVault() {
    if (!quickNome || !quickCognome) {
      showToast('Inserisci almeno Nome e Cognome.');
      return;
    }
    tryAutoCalculateQuickCf();
    // Salva l'identità universale: valida per questo documento e per tutti i successivi
    await vault.updateActiveIdentity({
      nome: quickNome,
      cognome: quickCognome,
      codiceFiscale: quickCf,
      dataNascita: quickDataNascita,
      luogoNascita: quickLuogoNascita,
      comuneResidenza: quickComune,
      indirizzoResidenza: quickIndirizzo,
      sesso: quickSesso
    });

    // Aggiorna subito i valori del documento attivo
    for (const [key, val] of Object.entries(formValues)) {
      if (key.includes('nome') && !key.includes('cognome')) formValues[key] = quickNome;
      if (key.includes('cognome')) formValues[key] = quickCognome;
      if (key.includes('cf') || key.includes('fiscale')) formValues[key] = quickCf;
      if (key.includes('comune')) formValues[key] = quickComune;
      if (key.includes('indirizzo')) formValues[key] = quickIndirizzo;
    }
    showQuickProfileForm = false;
    showToast('Dati salvati e applicati al modulo!');
  }

  function resetUploader() {
    uploadedAnalysis = null;
    uploadedFileName = '';
    formValues = {};
  }
</script>

<svelte:head>
  <title>COMPILALO &mdash; Compila e Firma Documenti Online Gratis, Anonimo e Local-First</title>
  <meta name="description" content="Compila e firma gratuitamente qualsiasi documento, autocertificazione DPR 445/2000, delega o ricorso multa. 100% anonimo, zero registrazione, elaborazione locale nel browser." />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "COMPILALO",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "EUR"
          },
          "description": "PWA italiana gratuita e anonima per compilazione ed apposizione firma su documenti PDF e modelli legali della Pubblica Amministrazione."
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "I miei dati personali o il documento caricato finiscono su un server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. COMPILALO funziona con architettura local-first Zero-Knowledge. Tutta la lettura, compilazione e firma grafica avvengono all'interno della memoria RAM del tuo browser via WebCrypto e pdf-lib."
              }
            },
            {
              "@type": "Question",
              "name": "Serve la carta di credito, SPID o una registrazione?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nessuna registrazione, nessuna carta, nessuno SPID. Il servizio è libero, gratuito e utilizzabile all'istante."
              }
            }
          ]
        }
      ]
    }
  </script>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-14 py-4">

  <!-- Toast Notifica ad alto craft (Emil Kowalski style: 180ms ease-out) -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#27272A] text-xs font-medium flex items-center space-x-2 craft-modal">
      <Check class="w-4 h-4 text-[#10B981]" />
      <span>{notificationToast}</span>
    </div>
  {/if}

  <!-- =========================================================================
       HERO SEMPLICE E UMANO
       ========================================================================= -->
  <section class="text-center space-y-3 max-w-2xl mx-auto">
    
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46]">
      <Sparkles class="w-3.5 h-3.5 text-[#059669]" />
      <span>100% Gratuito &middot; Nessun Account &middot; I tuoi dati non escono dal tuo dispositivo</span>
    </div>

    <h1 class="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#18181B] leading-tight">
      Carica il tuo documento.<br />
      <span class="text-[#1D4ED8] italic font-normal">Lo compiliamo e firmiamo in automatico.</span>
    </h1>

    <p class="text-sm sm:text-base text-[#52525B] leading-relaxed">
      Trascina qualsiasi modulo in PDF. Riconosciamo i campi da riempire usando i dati salvati sul tuo dispositivo, ci metti la firma col dito e scarichi il foglio pronto in 10 secondi.
    </p>

  </section>

  <!-- =========================================================================
       IL CUORE: L'AREA DI RILASCIO FILE (DRAG & DROP) O COMPILAZIONE
       ========================================================================= -->
  <section class="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden craft-transition">
    
    {#if !uploadedAnalysis}
      <!-- STATO 1: TRASCINAMENTO FILE -->
      <div
        class="p-8 sm:p-14 text-center cursor-pointer craft-transition {isDragging ? 'bg-[#EFF6FF] border-2 border-dashed border-[#1D4ED8]' : 'hover:bg-[#F9F9F8]'}"
        ondragover={(e) => { e.preventDefault(); isDragging = true; }}
        ondragleave={() => isDragging = false}
        ondrop={onDrop}
        onclick={() => fileInputElement?.click()}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter') fileInputElement?.click(); }}
      >
        <input
          bind:this={fileInputElement}
          type="file"
          accept=".pdf,application/pdf"
          class="hidden"
          onchange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
              handleFileSelected(target.files[0]);
            }
          }}
        />

        {#if isAnalyzingFile}
          <div class="space-y-4 py-8">
            <RefreshCw class="w-10 h-10 text-[#1D4ED8] animate-spin mx-auto" />
            <div>
              <p class="font-serif text-xl font-bold text-[#18181B]">Stiamo leggendo il tuo documento...</p>
              <p class="text-xs text-[#71717A] mt-1">Riconosciamo i campi da compilare nella memoria del tuo browser.</p>
            </div>
          </div>
        {:else}
          <div class="space-y-4 py-4">
            <div class="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto shadow-sm craft-transition group-hover:scale-105">
              <UploadCloud class="w-8 h-8" />
            </div>

            <div class="space-y-1">
              <p class="text-lg font-bold text-[#18181B]">
                Trascina qui il modulo che devi compilare o firmare
              </p>
              <p class="text-xs text-[#52525B]">
                Oppure <span class="text-[#1D4ED8] font-semibold underline">clicca qui per sceglierlo dal tuo computer o telefono</span>
              </p>
            </div>

            <div class="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#71717A] font-mono">
              <span class="flex items-center space-x-1">
                <Check class="w-3.5 h-3.5 text-[#059669]" />
                <span>Moduli PDF della Pubblica Amministrazione</span>
              </span>
              <span>&middot;</span>
              <span class="flex items-center space-x-1">
                <Check class="w-3.5 h-3.5 text-[#059669]" />
                <span>Contratti & Deleghe</span>
              </span>
              <span>&middot;</span>
              <span class="flex items-center space-x-1">
                <Check class="w-3.5 h-3.5 text-[#059669]" />
                <span>Firma con il dito</span>
              </span>
            </div>
          </div>
        {/if}
      </div>

    {:else}
      <!-- STATO 2: DOCUMENTO CARICATO & ANALIZZATO! -->
      <div class="p-6 sm:p-8 space-y-6">
        
        <!-- Intestazione file caricato -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E4E7] pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <FileCheck class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-[#18181B] truncate max-w-sm sm:max-w-md">{uploadedFileName}</p>
              <p class="text-xs text-[#71717A]">
                {uploadedAnalysis.pageCount} {uploadedAnalysis.pageCount === 1 ? 'pagina' : 'pagine'} &middot; 
                {#if uploadedAnalysis.hasAcroForm}
                  <span class="text-[#059669] font-medium">Modulo compilabile riconosciuto automaticamente</span>
                {:else}
                  <span>Documento standard pronto per l'inserimento dati</span>
                {/if}
              </p>
            </div>
          </div>

          <button
            onclick={resetUploader}
            class="text-xs text-[#71717A] hover:text-[#18181B] underline self-start sm:self-center craft-transition"
          >
            Carica un altro documento
          </button>
        </div>

        <!-- Banner Intelligente: SE L'UTENTE HA GIÀ I DATI, LO CONFERMIAMO SENZA CHIEDERLI DI NUOVO -->
        {#if vault.hasIdentityData}
          <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg flex items-center justify-between text-xs text-[#065F46]">
            <div class="flex items-center space-x-2">
              <CheckCircle2 class="w-4 h-4 text-[#059669]" />
              <span>
                Dati compilati automaticamente per: <strong>{vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}</strong> ({vault.activeIdentity.codiceFiscale || ''})
              </span>
            </div>
            <span class="text-[11px] font-mono font-bold text-[#059669]">SINCRONIZZATO</span>
          </div>
        {:else}
          <!-- Chiede i dati una sola volta: non verranno mai più chiesti in tutto il sito! -->
          <div class="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#92400E]">
            <div class="flex items-center space-x-2">
              <Lock class="w-4 h-4 shrink-0" />
              <span>Inserisci i tuoi dati una sola volta: non te li chiederemo mai più per nessun documento.</span>
            </div>
            <button
              onclick={() => showQuickProfileForm = !showQuickProfileForm}
              class="font-bold underline text-left sm:text-right craft-transition"
            >
              {showQuickProfileForm ? 'Chiudi' : 'Inserisci dati ora'}
            </button>
          </div>
        {/if}

        <!-- Mini-form di configurazione rapida (solo se non ancora inseriti) con Auto-CF -->
        {#if showQuickProfileForm && !vault.hasIdentityData}
          <div class="p-4 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg space-y-3 craft-transition">
            <p class="text-xs font-bold text-[#18181B]">I tuoi dati rimarranno memorizzati solo nel tuo browser</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome"
                bind:value={quickNome}
                oninput={tryAutoCalculateQuickCf}
                class="text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
              />
              <input
                type="text"
                placeholder="Cognome"
                bind:value={quickCognome}
                oninput={tryAutoCalculateQuickCf}
                class="text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
              />
              <select
                bind:value={quickSesso}
                onchange={tryAutoCalculateQuickCf}
                class="text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
              >
                <option value="M">Maschio</option>
                <option value="F">Femmina</option>
              </select>

              <input
                type="date"
                bind:value={quickDataNascita}
                onchange={tryAutoCalculateQuickCf}
                class="text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
              />

              <div class="relative">
                <input
                  type="text"
                  placeholder="Comune di Nascita"
                  bind:value={quickLuogoNascita}
                  oninput={(e) => {
                    searchQuickComune('nascita', (e.target as HTMLInputElement).value);
                    tryAutoCalculateQuickCf();
                  }}
                  class="w-full text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
                />
                {#if quickComuneSuggestions && quickComuneSuggestions.field === 'nascita'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded shadow-lg z-20">
                    {#each quickComuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectQuickComune(c)}
                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F9F9F8] border-b last:border-b-0"
                      >
                        {c.nome} ({c.provincia})
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Codice Fiscale Calcolato con manual override -->
              <div class="space-y-1">
                {#if quickManualCf}
                  <input
                    type="text"
                    placeholder="Codice Fiscale"
                    value={quickCf}
                    oninput={(e) => handleQuickManualCfInput((e.target as HTMLInputElement).value)}
                    class="w-full text-xs p-2 bg-white border border-[#E4E4E7] rounded font-mono uppercase craft-input"
                  />
                {:else}
                  <div class="p-2 bg-white border border-[#E4E4E7] rounded text-xs font-mono font-bold text-[#18181B] flex items-center justify-between">
                    <span class="truncate">{quickCf || 'CF calcolato in automatico'}</span>
                    <button
                      type="button"
                      onclick={() => quickManualCf = true}
                      class="text-[10px] text-[#1D4ED8] hover:underline"
                    >
                      A mano
                    </button>
                  </div>
                {/if}
              </div>

              <div class="relative">
                <input
                  type="text"
                  placeholder="Comune di residenza"
                  bind:value={quickComune}
                  oninput={(e) => searchQuickComune('residenza', (e.target as HTMLInputElement).value)}
                  class="w-full text-xs p-2 bg-white border border-[#E4E4E7] rounded craft-input"
                />
                {#if quickComuneSuggestions && quickComuneSuggestions.field === 'residenza'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded shadow-lg z-20">
                    {#each quickComuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectQuickComune(c)}
                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F9F9F8] border-b last:border-b-0"
                      >
                        {c.nome} ({c.provincia})
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <input
                type="text"
                placeholder="Indirizzo (Via e Civico)"
                bind:value={quickIndirizzo}
                class="text-xs p-2 bg-white border border-[#E4E4E7] rounded sm:col-span-2 craft-input"
              />
            </div>
            <button
              onclick={saveQuickProfileToVault}
              class="px-4 py-2 bg-[#18181B] text-white text-xs font-semibold rounded hover:bg-[#1D4ED8] craft-transition craft-press"
            >
              Salva e compila questo documento
            </button>
          </div>
        {/if}

        <!-- Campi da compilare / verificare -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-serif text-lg font-bold text-[#18181B]">
              Campi da compilare nel documento:
            </h3>
            <span class="text-xs font-mono text-[#71717A]">{uploadedAnalysis.detectedFields.length} campi</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each uploadedAnalysis.detectedFields as field}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="f_{field.name}" class="block text-xs font-medium text-[#18181B]">
                    {field.label}
                  </label>
                  {#if formValues[field.name]}
                    <span class="text-[11px] text-[#059669] font-mono flex items-center space-x-1">
                      <Check class="w-3 h-3" />
                      <span>Inserito</span>
                    </span>
                  {/if}
                </div>

                {#if field.type === 'checkbox'}
                  <label class="inline-flex items-center space-x-2 text-xs text-[#18181B]">
                    <input
                      id="f_{field.name}"
                      type="checkbox"
                      bind:checked={formValues[field.name]}
                      class="rounded border-[#E4E4E7] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                    />
                    <span>Spunta questa opzione se richiesta</span>
                  </label>
                {:else}
                  <input
                    id="f_{field.name}"
                    type="text"
                    value={formValues[field.name] || ''}
                    oninput={(e) => handleFieldValueChange(field.name, (e.target as HTMLInputElement).value)}
                    placeholder={`Inserisci ${field.label.toLowerCase()}...`}
                    class="w-full text-xs bg-white border border-[#E4E4E7] rounded p-2.5 text-[#18181B] craft-input"
                  />
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Sezione Firma del Documento (Con riutilizzo automatico) -->
        <div class="pt-4 border-t border-[#E4E4E7] space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#18181B]">Firma da apporre sul documento:</span>
            {#if signatureDataUrl}
              <span class="text-[11px] font-mono text-[#059669] font-semibold flex items-center space-x-1">
                <Check class="w-3 h-3" />
                <span>FIRMA MEMORIZZATA PRONTA</span>
              </span>
            {/if}
          </div>

          {#if signatureDataUrl}
            <div class="flex items-center justify-between p-3 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg">
              <div class="flex items-center space-x-3">
                <img src={signatureDataUrl} alt="Firma apposta" class="h-10 object-contain" />
                <span class="text-xs text-[#52525B]">Verrà stampata automaticamente in fondo al documento</span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  onclick={openSignaturePad}
                  class="text-xs text-[#1D4ED8] hover:underline font-medium craft-transition"
                >
                  Cambia
                </button>
                <span class="text-[#E4E4E7]">&middot;</span>
                <button
                  onclick={removeSignature}
                  class="text-xs text-[#DC2626] hover:underline craft-transition"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          {:else}
            <button
              onclick={openSignaturePad}
              class="w-full py-3 border border-dashed border-[#71717A] rounded-lg text-xs font-medium text-[#52525B] hover:border-[#18181B] hover:text-[#18181B] flex items-center justify-center space-x-2 bg-[#F9F9F8] craft-transition craft-press"
            >
              <PenTool class="w-4 h-4 text-[#1D4ED8]" />
              <span>Disegna la tua firma una sola volta (col dito o mouse)</span>
            </button>
          {/if}
        </div>

        <!-- TASTO DI DOWNLOAD FINALE -->
        <div class="pt-4 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-[#71717A]">
            Il documento viene creato nel tuo browser. Nessun dato lascia il tuo dispositivo.
          </p>

          <button
            onclick={handleDownloadCompletedPdf}
            disabled={isProcessingDownload}
            class="w-full sm:w-auto px-6 py-3.5 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 craft-transition craft-press shadow-sm disabled:opacity-50"
          >
            {#if isProcessingDownload}
              <RefreshCw class="w-4 h-4 animate-spin" />
              <span>Creazione del documento in corso...</span>
            {:else}
              <Download class="w-4 h-4" />
              <span>Scarica Documento Compilato e Firmato</span>
            {/if}
          </button>
        </div>

      </div>
    {/if}

  </section>

  <!-- =========================================================================
       SEZIONE: MODELLI PRECOMPILATI PER CHI NON HA GIÀ UN FILE
       ========================================================================= -->
  <section class="space-y-6">
    <div class="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
      <div>
        <h2 class="font-serif text-2xl font-bold text-[#18181B]">
          Non hai un file PDF da caricare?
        </h2>
        <p class="text-xs text-[#52525B] mt-0.5">
          Scegli uno dei modelli legali gratuiti già formattati e pronti da firmare:
        </p>
      </div>

      <a href="/compila" class="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center space-x-1 craft-transition">
        <span>Tutti i 32 modelli</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each TEMPLATES_CATALOG.slice(0, 4) as template}
        <a
          href="/compila?t={template.slug}"
          class="p-4 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#18181B] craft-transition shadow-sm flex flex-col justify-between space-y-3 group"
        >
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
              {template.category}
            </span>
            <h3 class="font-bold text-sm text-[#18181B] group-hover:text-[#1D4ED8] mt-2 leading-snug craft-transition">
              {template.title}
            </h3>
            <p class="text-xs text-[#71717A] mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>

          <span class="text-xs font-bold text-[#18181B] group-hover:text-[#1D4ED8] flex items-center space-x-1 pt-2 border-t border-[#E4E4E7] craft-transition">
            <span>Compila subito</span>
            <ArrowRight class="w-3 h-3" />
          </span>
        </a>
      {/each}
    </div>
  </section>

  <!-- =========================================================================
       COME FUNZIONA LA CASSAFORTE
       ========================================================================= -->
  <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-6">
    <div class="max-w-xl">
      <span class="text-xs font-mono uppercase tracking-wider text-[#059669] font-bold">COME FUNZIONA</span>
      <h2 class="font-serif text-2xl font-bold text-[#18181B] mt-1">
        Perché i tuoi dati sono al 100% al sicuro
      </h2>
      <p class="text-xs text-[#52525B] mt-1 leading-relaxed">
        I normali siti salvano nome, cognome e documenti sui loro server. COMPILALO funziona in modo completamente opposto:
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
      <div class="space-y-2 p-4 bg-[#F9F9F8] rounded-lg border border-[#E4E4E7]">
        <div class="w-8 h-8 rounded bg-[#18181B] text-white flex items-center justify-center font-bold text-xs">
          1
        </div>
        <h4 class="font-bold text-sm text-[#18181B]">Scrivi i dati una volta sola</h4>
        <p class="text-xs text-[#52525B] leading-relaxed">
          Inserisci una volta sola i tuoi dati. Rimangono memorizzati solo nella memoria del tuo telefono o computer per tutti i moduli futuri.
        </p>
      </div>

      <div class="space-y-2 p-4 bg-[#F9F9F8] rounded-lg border border-[#E4E4E7]">
        <div class="w-8 h-8 rounded bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-xs">
          2
        </div>
        <h4 class="font-bold text-sm text-[#18181B]">La cassaforte si chiude</h4>
        <p class="text-xs text-[#52525B] leading-relaxed">
          I tuoi dati vengono trasformati in codice illeggibile tramite crittografia di livello bancario. Solo tu hai le 12 parole per leggerli.
        </p>
      </div>

      <div class="space-y-2 p-4 bg-[#F9F9F8] rounded-lg border border-[#E4E4E7]">
        <div class="w-8 h-8 rounded bg-[#059669] text-white flex items-center justify-center font-bold text-xs">
          3
        </div>
        <h4 class="font-bold text-sm text-[#18181B]">Noi non vediamo nulla</h4>
        <p class="text-xs text-[#52525B] leading-relaxed">
          Nessun file viene inviato su internet. Tutta la compilazione e la firma avvengono all'interno del tuo dispositivo in tempo reale.
        </p>
      </div>
    </div>
  </section>

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
        Traccia la tua firma con il dito, mouse o penna. Verrà impressa sul modulo e salvata nel tuo browser.
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
          onclick={clearModalSignature}
          class="px-3 py-1.5 text-xs text-[#71717A] hover:text-[#18181B] border border-[#E4E4E7] rounded craft-transition craft-press"
        >
          Cancella
        </button>

        <button
          type="button"
          onclick={saveSignatureModal}
          class="px-4 py-1.5 text-xs font-semibold bg-[#18181B] text-white rounded hover:bg-[#1D4ED8] craft-transition craft-press"
        >
          Usa questa firma
        </button>
      </div>
    </div>
  </div>
{/if}
