<script lang="ts">
  import { onMount } from 'svelte';
  import { checkChromeBuiltinAi, analyzeDocumentStructure } from '$lib/ai/local-scanner';
  import { vault } from '$lib/stores/vault.svelte';
  import { generateDocumentPdf, downloadPdfFile } from '$lib/engine/pdf-engine';
  import type { DocumentField, DocumentTemplate } from '$lib/types';
  import { Cpu, Sparkles, FileSearch, Download, CheckCircle2, Check, PenTool } from 'lucide-svelte';

  let rawText = $state(`AL COMUNE DI MILANO
Richiesta di autorizzazione per occupazione suolo pubblico temporanea.
Il sottoscritto Mario Rossi, nato a Milano il 15/05/1980, residente in Via Dante 10, codice fiscale RSSMRA80E15F205X, richiede il permesso di occupazione.`);

  let aiStatus = $state<{ available: boolean; reason?: string }>({ available: false });
  let isAnalyzing = $state(false);
  let detectedFields = $state<DocumentField[]>([]);
  let customFormValues = $state<Record<string, any>>({});
  let isReady = $state(false);
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
    aiStatus = await checkChromeBuiltinAi();
    await vault.checkStoredVault();
  });

  async function handleAnalyze() {
    isAnalyzing = true;
    detectedFields = await analyzeDocumentStructure(rawText);
    
    // Inizializza i valori e precompila dall'identità attiva universale
    const initial: Record<string, any> = {};
    const ident = vault.activeProfile || vault.activeIdentity;

    for (const f of detectedFields) {
      if (ident && f.canonicalKey && (ident as any)[f.canonicalKey]) {
        initial[f.id] = (ident as any)[f.canonicalKey];
      } else {
        initial[f.id] = '';
      }
    }
    customFormValues = initial;
    isReady = true;
    isAnalyzing = false;
    showToast(`Analisi completata: ${detectedFields.length} campi rilevati`);
  }

  function handleFieldValueChange(field: DocumentField, val: any) {
    customFormValues[field.id] = val;
    if (field.canonicalKey) {
      vault.updateActiveIdentity({ [field.canonicalKey]: val });
    }
  }

  async function handleDownloadCustomPdf() {
    const dynamicTemplate: DocumentTemplate = {
      id: 'custom_scanned_doc',
      slug: 'documento-analizzato',
      title: 'Istanza Compilata Automaticamente',
      category: 'diffide',
      description: 'Documento generato dall’analisi strutturale locale',
      fileType: 'pdf_builtin',
      fields: detectedFields,
      previewText: (v) => {
        let result = rawText;
        for (const [key, val] of Object.entries(v)) {
          result += `\n[${key.toUpperCase()}]: ${val}`;
        }
        return result;
      }
    };

    const pdfBytes = await generateDocumentPdf(dynamicTemplate, customFormValues, vault.savedSignature);
    downloadPdfFile(pdfBytes, 'documento-compilato-locale.pdf');
    showToast('PDF compilato e scaricato con successo!');
  }
</script>

<div class="max-w-4xl mx-auto space-y-8">

  <!-- Toast Notifica ad alto craft -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#27272A] text-xs font-medium flex items-center space-x-2 craft-modal">
      <Check class="w-4 h-4 text-[#10B981]" />
      <span>{notificationToast}</span>
    </div>
  {/if}

  <div class="bg-white border border-[#E4E4E7] rounded-lg p-6">
    <div class="flex items-center space-x-2">
      <Cpu class="w-5 h-5 text-[#1D4ED8]" />
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#18181B]">
        Analizzatore Documentale Locale (Zero Server)
      </h1>
    </div>
    <p class="text-xs text-[#52525B] mt-1">
      Incolla il testo di qualsiasi modulo o richiesta. Il sistema individua i campi necessari e li unisce con i tuoi dati senza mai chiederli due volte.
    </p>

    <!-- Badge Stato AI Hardware del Browser -->
    <div class="mt-3 flex items-center space-x-2 text-xs font-mono">
      <span class="text-[#71717A]">Motore AI Rilevato:</span>
      {#if aiStatus.available}
        <span class="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center space-x-1">
          <Sparkles class="w-3 h-3 text-[#059669]" />
          <span>Chrome Built-in AI (Gemini Nano on-device) Attivo</span>
        </span>
      {:else}
        <span class="px-2 py-0.5 rounded bg-[#F2F1ED] text-[#52525B] border border-[#E4E4E7]">
          Parser Deterministico / Euristico Locale (Zero Dati su Cloud)
        </span>
      {/if}
    </div>
  </div>

  <div class="bg-white border border-[#E4E4E7] rounded-lg p-6 space-y-4">
    <div>
      <label for="rawText" class="block text-xs font-medium text-[#18181B] mb-1">
        Testo del Modulo o Documento da Analizzare:
      </label>
      <textarea
        id="rawText"
        rows={6}
        bind:value={rawText}
        class="w-full text-xs font-mono bg-[#F9F9F8] border border-[#E4E4E7] rounded p-3 text-[#18181B] craft-input"
      ></textarea>
    </div>

    <button
      onclick={handleAnalyze}
      disabled={isAnalyzing || !rawText}
      class="px-5 py-2.5 bg-[#18181B] text-white rounded text-xs font-semibold hover:bg-[#1D4ED8] craft-transition craft-press disabled:opacity-50 flex items-center space-x-2"
    >
      <FileSearch class="w-4 h-4" />
      <span>{isAnalyzing ? 'Analisi in corso...' : 'Analizza Campi Richiesti'}</span>
    </button>
  </div>

  {#if isReady && detectedFields.length > 0}
    <div class="bg-white border border-[#E4E4E7] rounded-lg p-6 space-y-6">
      <div class="border-b border-[#E4E4E7] pb-3 flex items-center justify-between">
        <div>
          <h2 class="font-serif text-lg font-bold text-[#18181B]">
            Campi Rilevati dal Documento ({detectedFields.length})
          </h2>
          <p class="text-xs text-[#71717A]">
            {#if vault.hasIdentityData}
              Dati inseriti automaticamente dal tuo dispositivo ({vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}).
            {:else}
              I valori inseriti qui verranno salvati sul tuo dispositivo per i documenti successivi.
            {/if}
          </p>
        </div>

        <button
          onclick={handleDownloadCustomPdf}
          class="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shadow-sm"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Scarica PDF Generato</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each detectedFields as field}
          <div>
            <label for="sc_{field.id}" class="block text-xs font-medium text-[#18181B] mb-1">{field.label}</label>
            <input
              id="sc_{field.id}"
              type={field.type}
              value={customFormValues[field.id] || ''}
              oninput={(e) => handleFieldValueChange(field, (e.target as HTMLInputElement).value)}
              class="w-full text-xs border border-[#E4E4E7] rounded p-2 text-[#18181B] craft-input"
            />
          </div>
        {/each}
      </div>

      <!-- Firma collegata -->
      {#if vault.savedSignature}
        <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <CheckCircle2 class="w-4 h-4 text-[#059669]" />
            <span class="text-xs text-[#065F46] font-medium">Firma autografa pronta e inclusa nel PDF</span>
          </div>
          <img src={vault.savedSignature} alt="Firma" class="h-8 object-contain" />
        </div>
      {/if}
    </div>
  {/if}
</div>
