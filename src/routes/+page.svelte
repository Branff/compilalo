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
    MapPin,
    Search,
    ShieldCheck,
    FileCode2,
    ChevronRight,
    ArrowUpRight,
    HardDrive,
    WifiOff
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

  // Modelli filtro & ricerca
  let homeSearchQuery = $state('');
  let homeSelectedCategory = $state('tutti');

  const homeCategories = [
    { id: 'tutti', label: 'Tutti i 32' },
    { id: 'autocertificazioni', label: 'Autocertificazioni' },
    { id: 'deleghe', label: 'Deleghe' },
    { id: 'disdette', label: 'Disdette' },
    { id: 'multe', label: 'Multe & Ricorsi' },
    { id: 'locazioni', label: 'Casa & Affitto' },
    { id: 'diffide', label: 'Diffide' }
  ];

  let filteredCatalog = $derived.by(() => {
    let list = TEMPLATES_CATALOG;
    if (homeSelectedCategory !== 'tutti') {
      list = list.filter(t => t.category === homeSelectedCategory);
    }
    if (homeSearchQuery.trim()) {
      const q = homeSearchQuery.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  });

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

  function selectQuickComune(comune: ComuneItem) {
    if (!quickComuneSuggestions) return;
    if (quickComuneSuggestions.field === 'nascita') {
      quickLuogoNascita = comune.nome;
      tryAutoCalculateQuickCf();
    } else {
      quickComune = comune.nome;
    }
    quickComuneSuggestions = null;
  }

  onMount(() => {
    (async () => {
      await vault.checkStoredVault();

      // Se l'utente ha già salvato la firma nel vault, caricala subito
      if (vault.savedSignature) {
        signatureDataUrl = vault.savedSignature;
      }

      // Pre-popola campi di registrazione rapida se presenti
      if (vault.hasIdentityData) {
        quickNome = vault.activeIdentity.nome || '';
        quickCognome = vault.activeIdentity.cognome || '';
        quickSesso = vault.activeIdentity.sesso || 'M';
        quickDataNascita = vault.activeIdentity.dataNascita || '';
        quickLuogoNascita = vault.activeIdentity.luogoNascita || '';
        quickCf = vault.activeIdentity.codiceFiscale || '';
        quickComune = vault.activeIdentity.comuneResidenza || '';
        quickIndirizzo = vault.activeIdentity.indirizzoResidenza || '';
      }
    })();

    // Keyboard shortcut handler: ⌘O or Ctrl+O per aprire il file picker
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputElement?.click();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  });

  async function handleFileSelected(file: File) {
    if (!file || file.type !== 'application/pdf') {
      showToast('Per favore seleziona un file valido in formato PDF.');
      return;
    }

    uploadedFileName = file.name;
    isAnalyzingFile = true;

    try {
      const buffer = await file.arrayBuffer();
      const analysis = await analyzeUploadedPdf(buffer);
      uploadedAnalysis = analysis;

      // Popola i campi del form con quelli pre-riempiti dall'analisi intelligente
      const initialValues: Record<string, any> = {};
      for (const field of analysis.detectedFields) {
        if (field.suggestedProfileKey && (vault.activeIdentity as any)[field.suggestedProfileKey]) {
          initialValues[field.name] = (vault.activeIdentity as any)[field.suggestedProfileKey];
        } else if (field.value !== undefined) {
          initialValues[field.name] = field.value;
        }
      }
      formValues = initialValues;

      if (analysis.detectedFields.length === 0) {
        showToast('Documento pronto per la firma e l\'aggiunta di dati!');
      } else {
        showToast(`Trovati ${analysis.detectedFields.length} campi! Dati abbinati in automatico.`);
      }
    } catch (err) {
      console.error(err);
      showToast('Non siamo riusciti a leggere questo PDF. Assicurati che non sia protetto da password.');
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
  <link rel="canonical" href="https://compilalo.it/" />
  <meta property="og:title" content="COMPILALO &mdash; Compilazione e Firma Documenti Online" />
  <meta property="og:description" content="Trascina qualsiasi modulo in PDF. Lo compiliamo e firmiamo in automatico senza salvare dati su nessun server." />
  <meta property="og:url" content="https://compilalo.it/" />
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
          "description": "Web app gratuita e anonima per compilare, firmare e scaricare documenti legali italiani e moduli PA direttamente nel browser."
        },
        {
          "@type": "HowTo",
          "name": "Come compilare e firmare un documento online su COMPILALO",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Carica il file PDF",
              "text": "Trascina il modulo PDF o seleziona uno dei 32 modelli gratuiti della Pubblica Amministrazione."
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Compila e verifica i campi",
              "text": "I tuoi dati salvati in locale compilano automaticamente il modulo; il codice fiscale viene calcolato matematicamente."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Firma e scarica il documento",
              "text": "Apponi la firma con il dito o il mouse e scarica il PDF finale generato istantaneamente nella memoria del browser."
            }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "I miei dati personali vengono inviati su un server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Assolutamente no. COMPILALO è una web app local-first: tutta l'elaborazione dei documenti e la cifratura avvengono esclusivamente nella memoria del tuo browser tramite WebCrypto API e pdf-lib."
              }
            },
            {
              "@type": "Question",
              "name": "Serve la carta di credito, SPID o una registrazione?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nessuna registrazione, nessuna carta, nessuno SPID. Il servizio è libero, gratuito e utilizzabile all'istante."
              }
            },
            {
              "@type": "Question",
              "name": "Come viene calcolato il Codice Fiscale?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Il Codice Fiscale viene calcolato in tempo reale da un algoritmo matematico a partire da nome, cognome, sesso, data e comune di nascita (con codice catastale Belfiore), senza mai richiederne l'inserimento manuale forzato."
              }
            }
          ]
        }
      ]
    }
  </script>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-16 py-4">

  <!-- Toast Notifica ad alto craft (Emil Kowalski style: 180ms ease-out) -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#09090B] text-white px-4 py-2.5 rounded-lg shadow-xl border border-zinc-800 text-xs font-medium flex items-center space-x-2.5 craft-modal">
      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{notificationToast}</span>
    </div>
  {/if}

  <!-- =========================================================================
       HERO: EDITORIALE, AUTOREVOLE E MODERNO (LINEAR / STRIPE STYLE)
       ========================================================================= -->
  <section class="text-center space-y-5 max-w-3xl mx-auto pt-2 sm:pt-6">
    
    <!-- Trust Pill -->
    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs font-mono text-zinc-700 shadow-2xs">
      <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
      <span>Nessun dato esce dal tuo dispositivo &bull; Zero Server &bull; &euro;0,00</span>
    </div>

    <!-- Main Heading -->
    <h1 class="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#09090B] leading-[1.08]">
      Compila e firma qualsiasi documento.<br />
      <span class="text-[#2563EB] italic font-normal">In dieci secondi.</span>
    </h1>

    <!-- Subtitle -->
    <p class="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
      Trascina qualsiasi modulo in PDF. Lo riempiamo con i dati salvati nella memoria del tuo browser, apponi la firma a mano libera e scarichi il foglio ufficiale pronto per l'invio.
    </p>

    <!-- Micro Value Metrics -->
    <div class="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-500">
      <div class="flex items-center space-x-1.5">
        <ShieldCheck class="w-4 h-4 text-emerald-600" />
        <span>100% Locale (Zero Cloud)</span>
      </div>
      <span>&bull;</span>
      <div class="flex items-center space-x-1.5">
        <CheckCircle2 class="w-4 h-4 text-emerald-600" />
        <span>Nessun Account</span>
      </div>
      <span>&bull;</span>
      <div class="flex items-center space-x-1.5">
        <PenTool class="w-4 h-4 text-blue-600" />
        <span>Firma Autografa Inclusa</span>
      </div>
    </div>

  </section>

  <!-- =========================================================================
       CUORE INTERATTIVO: DROPZONE ELEVATA & FLUIDA
       ========================================================================= -->
  <section class="craft-card rounded-2xl overflow-hidden border border-zinc-200/90 shadow-sm transition-all duration-150">
    
    {#if !uploadedAnalysis}
      <!-- STATO 1: TRASCINAMENTO FILE (RAYCAST/LINEAR CRAFT) -->
      <div
        class="p-8 sm:p-16 text-center cursor-pointer craft-transition group relative {isDragging ? 'bg-blue-50/60 border-2 border-dashed border-[#2563EB]' : 'hover:bg-zinc-50/70'}"
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
          <div class="space-y-4 py-8 craft-fade-in">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw class="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p class="font-serif text-2xl font-bold text-[#09090B]">Analisi del documento in corso...</p>
              <p class="text-xs text-zinc-500 mt-1 font-mono">Ispezione campi AcroForm e calcolo crittografico nella memoria del browser</p>
            </div>
          </div>
        {:else}
          <div class="space-y-5 py-2">
            
            <!-- Icon Hero -->
            <div class="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto shadow-2xs craft-transition group-hover:scale-105 group-hover:bg-[#09090B] group-hover:text-white">
              <UploadCloud class="w-8 h-8" />
            </div>

            <!-- Titoli di Rilascio -->
            <div class="space-y-1.5 max-w-md mx-auto">
              <p class="text-xl font-bold tracking-tight text-[#09090B]">
                Trascina qui il documento da compilare o firmare
              </p>
              <p class="text-xs text-zinc-500">
                Oppure fai clic per selezionare un file dal tuo computer o smartphone
              </p>
            </div>

            <!-- Bottoni di selezione e scorciatoia da tastiera -->
            <div class="pt-2 flex items-center justify-center space-x-3">
              <span class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#09090B] text-white text-xs font-semibold shadow-sm craft-transition group-hover:bg-[#2563EB] craft-press">
                <span>Scegli file PDF</span>
                <span class="craft-kbd bg-zinc-800 text-zinc-300 border-zinc-700">⌘O</span>
              </span>
            </div>

            <!-- Tag Formati Accettati -->
            <div class="pt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 font-mono">
              <span class="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200/60">Moduli PA (DPR 445)</span>
              <span class="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200/60">Contratti & Deleghe</span>
              <span class="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200/60">Disdette & Ricorsi</span>
              <span class="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200/60">PDF Interattivi AcroForm</span>
            </div>
          </div>
        {/if}
      </div>

    {:else}
      <!-- STATO 2: DOCUMENTO CARICATO & WORKSTATION ATTIVA -->
      <div class="p-6 sm:p-8 space-y-6 craft-fade-in">
        
        <!-- Header Documento Caricato -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
          <div class="flex items-center space-x-3.5">
            <div class="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/60 text-[#2563EB] flex items-center justify-center shrink-0">
              <FileCheck class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <p class="text-base font-bold text-[#09090B] truncate max-w-sm sm:max-w-md">{uploadedFileName}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Pronto
                </span>
              </div>
              <p class="text-xs text-zinc-500 font-mono mt-0.5">
                {uploadedAnalysis.pageCount} {uploadedAnalysis.pageCount === 1 ? 'pagina' : 'pagine'} &bull;
                {#if uploadedAnalysis.hasAcroForm}
                  <span class="text-emerald-700 font-medium">Campi modulo ufficiali rilevati</span>
                {:else}
                  <span>Documento standard per compilazione e firma</span>
                {/if}
              </p>
            </div>
          </div>

          <button
            onclick={resetUploader}
            class="text-xs font-medium text-zinc-500 hover:text-zinc-950 underline self-start sm:self-center craft-transition"
          >
            Carica un altro documento
          </button>
        </div>

        <!-- Banner Sincronizzazione Dati: se l'utente ha già i dati, confermiamo subito -->
        {#if vault.hasIdentityData}
          <div class="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div class="flex items-center space-x-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Compilazione automatica attiva per: <strong>{vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}</strong> ({vault.activeIdentity.codiceFiscale || ''})
              </span>
            </div>
            <a href="/vault" class="text-[11px] font-mono font-bold text-emerald-700 underline hover:text-emerald-900 craft-transition">
              Modifica Dati
            </a>
          </div>
        {:else}
          <!-- Chiede i dati una sola volta: salvati solo nel browser -->
          <div class="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div class="flex items-center space-x-2.5">
              <Lock class="w-4 h-4 text-amber-700 shrink-0" />
              <span>Inserisci i tuoi dati una sola volta: verranno ricordati per tutti i moduli futuri senza mai uscire dal browser.</span>
            </div>
            <button
              onclick={() => showQuickProfileForm = !showQuickProfileForm}
              class="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-medium text-xs hover:bg-amber-900 craft-transition craft-press shrink-0"
            >
              {showQuickProfileForm ? 'Chiudi' : 'Inserisci i tuoi dati ora'}
            </button>
          </div>
        {/if}

        <!-- Mini-form rapido configurazione identità con Auto-CF -->
        {#if showQuickProfileForm && !vault.hasIdentityData}
          <div class="p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 craft-modal">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold text-zinc-900 uppercase font-mono tracking-wider">Configurazione Rapida Profilo</p>
              <span class="text-[11px] font-mono text-zinc-500">I dati restano sul dispositivo</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome"
                bind:value={quickNome}
                oninput={tryAutoCalculateQuickCf}
                class="craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Cognome"
                bind:value={quickCognome}
                oninput={tryAutoCalculateQuickCf}
                class="craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
              />
              <select
                bind:value={quickSesso}
                onchange={tryAutoCalculateQuickCf}
                class="craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
              >
                <option value="M">Maschio (M)</option>
                <option value="F">Femmina (F)</option>
              </select>

              <input
                type="date"
                bind:value={quickDataNascita}
                onchange={tryAutoCalculateQuickCf}
                class="craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
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
                  class="w-full craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
                />
                {#if quickComuneSuggestions && quickComuneSuggestions.field === 'nascita'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-20 overflow-hidden">
                    {#each quickComuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectQuickComune(c)}
                        class="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0 flex justify-between"
                      >
                        <span class="font-medium">{c.nome}</span>
                        <span class="font-mono text-zinc-400">({c.provincia})</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Codice Fiscale Calcolato con manual override -->
              <div>
                {#if quickManualCf}
                  <input
                    type="text"
                    placeholder="Codice Fiscale"
                    value={quickCf}
                    oninput={(e) => handleQuickManualCfInput((e.target as HTMLInputElement).value)}
                    class="w-full craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-mono uppercase"
                  />
                {:else}
                  <div class="p-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-mono flex items-center justify-between">
                    <span class="font-bold text-[#09090B] truncate">{quickCf || 'CF Automatico'}</span>
                    <button
                      type="button"
                      onclick={() => quickManualCf = true}
                      class="text-[10px] text-[#2563EB] hover:underline shrink-0 ml-1"
                    >
                      A mano
                    </button>
                  </div>
                {/if}
              </div>

              <div class="relative sm:col-span-1">
                <input
                  type="text"
                  placeholder="Comune di residenza"
                  bind:value={quickComune}
                  oninput={(e) => searchQuickComune('residenza', (e.target as HTMLInputElement).value)}
                  class="w-full craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs"
                />
                {#if quickComuneSuggestions && quickComuneSuggestions.field === 'residenza'}
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-20 overflow-hidden">
                    {#each quickComuneSuggestions.list as c}
                      <button
                        type="button"
                        onclick={() => selectQuickComune(c)}
                        class="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0 flex justify-between"
                      >
                        <span class="font-medium">{c.nome}</span>
                        <span class="font-mono text-zinc-400">({c.provincia})</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <input
                type="text"
                placeholder="Indirizzo e Numero Civico"
                bind:value={quickIndirizzo}
                class="craft-input p-2.5 bg-white border border-zinc-300 rounded-lg text-xs sm:col-span-2"
              />
            </div>

            <div class="flex justify-end pt-1">
              <button
                onclick={saveQuickProfileToVault}
                class="px-4 py-2 bg-[#09090B] text-white text-xs font-semibold rounded-lg hover:bg-[#2563EB] craft-transition craft-press"
              >
                Salva e applica al modulo
              </button>
            </div>
          </div>
        {/if}

        <!-- Sezione Campi da Compilare -->
        <div class="space-y-4 pt-2">
          <div class="flex items-center justify-between border-b border-zinc-200/60 pb-2">
            <h3 class="font-serif text-lg font-bold text-[#09090B]">
              Campi Riconosciuti nel Documento
            </h3>
            <span class="text-xs font-mono text-zinc-500">{uploadedAnalysis.detectedFields.length} campi</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each uploadedAnalysis.detectedFields as field}
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label for="f_{field.name}" class="block text-xs font-medium text-zinc-800">
                    {field.label}
                  </label>
                  {#if formValues[field.name]}
                    <span class="text-[11px] text-emerald-600 font-mono flex items-center space-x-1">
                      <Check class="w-3 h-3" />
                      <span>Compilato</span>
                    </span>
                  {/if}
                </div>

                {#if field.type === 'checkbox'}
                  <label class="inline-flex items-center space-x-2 text-xs text-zinc-800 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg w-full cursor-pointer hover:bg-zinc-100 craft-transition">
                    <input
                      id="f_{field.name}"
                      type="checkbox"
                      bind:checked={formValues[field.name]}
                      class="rounded border-zinc-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>Seleziona se applicabile</span>
                  </label>
                {:else}
                  <input
                    id="f_{field.name}"
                    type="text"
                    value={formValues[field.name] || ''}
                    oninput={(e) => handleFieldValueChange(field.name, (e.target as HTMLInputElement).value)}
                    placeholder={`Inserisci ${field.label.toLowerCase()}...`}
                    class="w-full text-xs bg-white border border-zinc-300 rounded-lg p-2.5 text-[#09090B] craft-input"
                  />
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Sezione Firma Autografa -->
        <div class="pt-5 border-t border-zinc-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#09090B] font-mono uppercase tracking-wider">Firma da Apporre</span>
            {#if signatureDataUrl}
              <span class="text-[11px] font-mono text-emerald-600 font-semibold flex items-center space-x-1">
                <Check class="w-3 h-3" />
                <span>FIRMA PRONTA</span>
              </span>
            {/if}
          </div>

          {#if signatureDataUrl}
            <div class="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl">
              <div class="flex items-center space-x-4">
                <div class="bg-white p-2 border border-zinc-200 rounded-lg shadow-2xs">
                  <img src={signatureDataUrl} alt="Firma apposta" class="h-10 object-contain" />
                </div>
                <span class="text-xs text-zinc-600">Verrà impressa in calce al documento finale con inchiostro vettoriale</span>
              </div>
              <div class="flex items-center space-x-3 text-xs">
                <button
                  onclick={openSignaturePad}
                  class="font-medium text-[#2563EB] hover:underline craft-transition"
                >
                  Ridisegna
                </button>
                <span class="text-zinc-300">&bull;</span>
                <button
                  onclick={removeSignature}
                  class="text-red-600 hover:underline craft-transition"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          {:else}
            <button
              onclick={openSignaturePad}
              class="w-full py-4 border-2 border-dashed border-zinc-300 rounded-xl text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 flex items-center justify-center space-x-2 bg-zinc-50/50 hover:bg-zinc-50 craft-transition craft-press"
            >
              <PenTool class="w-4 h-4 text-[#2563EB]" />
              <span>Traccia la tua firma a mano libera (con dito o mouse)</span>
            </button>
          {/if}
        </div>

        <!-- Barra di Download e Azione Finale -->
        <div class="pt-5 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-zinc-500 font-mono">
            Documento generato al 100% nel tuo browser &bull; Zero dati inviati al server
          </p>

          <button
            onclick={handleDownloadCompletedPdf}
            disabled={isProcessingDownload}
            class="w-full sm:w-auto px-7 py-3.5 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2.5 craft-transition craft-press shadow-sm disabled:opacity-50"
          >
            {#if isProcessingDownload}
              <RefreshCw class="w-4 h-4 animate-spin" />
              <span>Elaborazione documento in corso...</span>
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
       SEZIONE: I 32 MODELLI UFFICIALI PUBBLICO DOMINIO
       ========================================================================= -->
  <section class="space-y-6 pt-4">
    
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-4">
      <div>
        <h2 class="font-serif text-3xl font-bold text-[#09090B]">
          Non hai un file PDF pronto? Scegli un modello.
        </h2>
        <p class="text-xs text-zinc-600 mt-1">
          32 modelli ufficiali della Pubblica Amministrazione e contratti comuni, pronti per essere compilati ed esportati in PDF e Word (.docx).
        </p>
      </div>

      <a
        href="/compila"
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-900 craft-transition craft-press self-start sm:self-auto shrink-0"
      >
        <span>Esplora tutti i 32 modelli</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </a>
    </div>

    <!-- Segmented Tabs Categoria -->
    <div class="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-medium">
      {#each homeCategories as cat}
        <button
          onclick={() => homeSelectedCategory = cat.id}
          class="px-3 py-1.5 rounded-lg whitespace-nowrap craft-transition craft-press {homeSelectedCategory === cat.id ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}"
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Griglia Cards dei Modelli (Linear/Craft Style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each filteredCatalog.slice(0, 8) as template}
        <a
          href="/compila?t={template.slug}"
          class="craft-card rounded-xl p-5 hover:border-zinc-900 craft-hover flex flex-col justify-between space-y-4 group"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {template.category}
              </span>
              {#if template.normativaRiferimento}
                <span class="text-[9px] font-mono text-zinc-400 truncate max-w-[120px]" title={template.normativaRiferimento}>
                  {template.normativaRiferimento}
                </span>
              {/if}
            </div>

            <h3 class="font-bold text-sm text-[#09090B] group-hover:text-[#2563EB] leading-snug craft-transition">
              {template.title}
            </h3>

            <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          </div>

          <div class="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-[#2563EB] craft-transition">
            <span>Compila subito</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 craft-transition" />
          </div>
        </a>
      {/each}
    </div>

  </section>

  <!-- =========================================================================
       CONFRONTO DI ARCHITETTURA: COME FUNZIONA LA ZERO-KNOWLEDGE PRIVACY
       ========================================================================= -->
  <section class="craft-card rounded-2xl p-8 sm:p-10 space-y-8 border border-zinc-200/90 shadow-sm">
    <div class="max-w-2xl">
      <h2 class="font-serif text-3xl font-bold text-[#09090B]">
        Perché i tuoi dati personali sono al sicuro al 100%
      </h2>
      <p class="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
        I normali siti web memorizzano documenti e codici fiscali sui loro database cloud. COMPILALO è progettato con un'architettura <strong>Zero-Knowledge</strong> che rende fisicamente impossibile la fuoriuscita dei tuoi dati.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
      
      <!-- Pilastro 1: Memoria Locale -->
      <div class="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
        <div class="w-8 h-8 rounded-lg bg-[#09090B] text-white flex items-center justify-center shadow-2xs">
          <HardDrive class="w-4 h-4" />
        </div>
        <h4 class="font-bold text-sm text-[#09090B]">Memoria Protetta Locale</h4>
        <p class="text-xs text-zinc-500 leading-relaxed">
          I tuoi dati anagrafici vengono salvati esclusivamente nella memoria protetta del tuo browser via IndexedDB e WebCrypto API.
        </p>
      </div>

      <!-- Pilastro 2: Crittografia AES-GCM-256 -->
      <div class="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
        <div class="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-2xs">
          <ShieldCheck class="w-4 h-4" />
        </div>
        <h4 class="font-bold text-sm text-[#09090B]">Crittografia AES-GCM-256</h4>
        <p class="text-xs text-zinc-500 leading-relaxed">
          Se attivi la Cassaforte, i dati vengono protetti da una passphrase di 12 parole. Neanche noi possiamo decifrare il payload.
        </p>
      </div>

      <!-- Pilastro 3: Zero Chiamate di Rete -->
      <div class="p-5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
          <WifiOff class="w-4 h-4" />
        </div>
        <h4 class="font-bold text-sm text-[#09090B]">Zero Chiamate di Rete</h4>
        <p class="text-xs text-zinc-500 leading-relaxed">
          Tutta la compilazione e la firma del PDF avvengono nella RAM locale. Se stacchi il Wi-Fi, il sito continua a funzionare perfettamente.
        </p>
      </div>

    </div>

    <!-- Verifica Tecnica con F12 -->
    <div class="p-4 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center space-x-2">
        <Sparkles class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Verifica tu stesso: premi <kbd class="px-1.5 py-0.5 rounded bg-zinc-800 text-white border border-zinc-700">F12</kbd> &rarr; Scheda Network: zero chiamate POST verso server esterni.</span>
      </div>
      <a href="/sicurezza" class="text-white underline hover:text-emerald-400 craft-transition shrink-0 font-sans font-medium text-xs">
        Leggi il Whitepaper Tecnico &rarr;
      </a>
    </div>

  </section>

</div>

<!-- Modal di Firma Autografa ad Alto Craft (Emil Kowalski craft-modal: 180ms ease-out) -->
{#if showSignatureModal}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 transition-opacity duration-150">
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4 craft-modal">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h3 class="font-serif text-xl font-bold text-[#09090B]">Disegna la tua Firma</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Traccia la firma con il dito, il mouse o una penna digitale</p>
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
          onclick={clearModalSignature}
          class="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-lg hover:bg-zinc-50 craft-transition craft-press"
        >
          Cancella e rifai
        </button>

        <button
          type="button"
          onclick={saveSignatureModal}
          class="px-5 py-2 text-xs font-semibold bg-[#09090B] text-white rounded-lg hover:bg-[#2563EB] craft-transition craft-press shadow-sm"
        >
          Usa questa firma sul documento
        </button>
      </div>
    </div>
  </div>
{/if}
