<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { TEMPLATES_CATALOG } from '$lib/templates/catalog';
  import { vault } from '$lib/stores/vault.svelte';
  import { validateCodiceFiscale, autoCalculateCodiceFiscale, decodeCodiceFiscale } from '$lib/data/codiceFiscale';
  import { findComune, type ComuneItem } from '$lib/data/comuni';
  import { generateDocumentPdf, downloadPdfFile } from '$lib/engine/pdf-engine';
  import { generateDocumentDocx, downloadDocxFile } from '$lib/engine/docx-engine';
  import { generateIcsCalendarEvent } from '$lib/engine/calendar-engine';
  import type { DocumentTemplate, DocumentField } from '$lib/types';
  import {
    Download,
    FileDown,
    Calendar,
    PenTool,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Sparkles,
    FileText,
    Lock,
    ChevronLeft,
    Check,
    Info,
    Search,
    Edit3,
    Calculator,
    MapPin,
    ArrowUpRight,
    X,
    ShieldCheck
  } from 'lucide-svelte';
  import SignaturePad from 'signature_pad';

  let selectedTemplate = $state<DocumentTemplate>(TEMPLATES_CATALOG[0]);
  let formValues = $state<Record<string, any>>({});
  let signaturePadInstance: SignaturePad | null = null;
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let showSignatureModal = $state(false);
  let signatureDataUrl = $state<string | undefined>(undefined);
  let isGeneratingPdf = $state(false);
  let isGeneratingDocx = $state(false);
  let notificationToast = $state<string | null>(null);
  let toastTimer: any = null;

  // Ricerca & Filtri per il catalogo esteso (30+ documenti)
  let catalogSearch = $state('');
  let selectedCategory = $state<string>('tutti');

  // Controllo Codice Fiscale: calcolo automatico vs inserimento manuale
  let manualCfOverride = $state<Record<string, boolean>>({});

  // Autocompletamento Comuni
  let comuneSuggestions = $state<{ fieldId: string; list: ComuneItem[] } | null>(null);

  const categories = [
    { id: 'tutti', label: 'Tutti i 32 Modelli' },
    { id: 'autocertificazioni', label: 'Autocertificazioni (DPR 445)' },
    { id: 'deleghe', label: 'Deleghe' },
    { id: 'disdette', label: 'Disdette & Utenze' },
    { id: 'multe', label: 'Multe & Ricorsi' },
    { id: 'locazioni', label: 'Casa & Affitto' },
    { id: 'diffide', label: 'Diffide & Reclami' }
  ];

  let filteredTemplates = $derived.by(() => {
    let list = TEMPLATES_CATALOG;
    if (selectedCategory !== 'tutti') {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function showToast(msg: string) {
    notificationToast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      notificationToast = null;
    }, 3200);
  }

  onMount(async () => {
    await vault.checkStoredVault();

    const templateParam = $page.url.searchParams.get('t') || $page.url.searchParams.get('id');
    if (templateParam) {
      const match = TEMPLATES_CATALOG.find(t => t.id === templateParam || t.slug === templateParam);
      if (match) selectedTemplate = match;
    }

    if (vault.savedSignature) {
      signatureDataUrl = vault.savedSignature;
    }

    if (vault.hasIdentityData) {
      applyActiveIdentityToForm();
    }
  });

  $effect(() => {
    const current = selectedTemplate;
    const initial: Record<string, any> = {};
    for (const field of current.fields) {
      initial[field.id] = field.defaultValue ?? '';
    }
    formValues = initial;

    if (vault.hasIdentityData) {
      applyActiveIdentityToForm();
    }

    if (vault.savedSignature && !signatureDataUrl) {
      signatureDataUrl = vault.savedSignature;
    }
  });

  function applyActiveIdentityToForm() {
    const ident = vault.activeProfile || vault.activeIdentity;
    if (!ident) return;
    const updated = { ...formValues };

    for (const field of selectedTemplate.fields) {
      if (field.canonicalKey && (ident as any)[field.canonicalKey] !== undefined) {
        updated[field.id] = (ident as any)[field.canonicalKey];
      }
    }
    formValues = updated;
    checkAndAutoCalculateCf();
  }

  function handleProfileSelect(e: Event) {
    const target = e.target as HTMLSelectElement;
    const profile = vault.profiles.find(p => p.id === target.value);
    if (profile) {
      vault.activeProfileId = profile.id;
      vault.updateActiveIdentity(profile);
      applyActiveIdentityToForm();
      showToast(`Profilo selezionato: ${profile.cognome} ${profile.nome}`);
    }
  }

  function checkAndAutoCalculateCf() {
    const nome = formValues.nome || formValues.dichiarante_nome || formValues.delegante_nome || formValues.mittente_nome || formValues.ricorrente_nome;
    const cognome = formValues.cognome || formValues.dichiarante_cognome || formValues.delegante_cognome || formValues.mittente_cognome || formValues.ricorrente_cognome;
    const dataNascita = formValues.dataNascita || formValues.dichiarante_dataNascita;
    const luogoNascita = formValues.luogoNascita || formValues.dichiarante_luogoNascita;
    const sesso = vault.activeIdentity.sesso || 'M';

    if (nome && cognome && dataNascita && luogoNascita) {
      const calculated = autoCalculateCodiceFiscale({
        nome,
        cognome,
        dataNascita,
        luogoNascita,
        sesso
      });

      if (calculated) {
        for (const field of selectedTemplate.fields) {
          if (field.canonicalKey === 'codiceFiscale' && !manualCfOverride[field.id]) {
            formValues[field.id] = calculated;
            vault.updateActiveIdentity({ codiceFiscale: calculated });
          }
        }
      }
    }
  }

  function handleFieldChange(field: DocumentField, val: any) {
    formValues[field.id] = val;

    if (field.canonicalKey === 'codiceFiscale' && typeof val === 'string' && val.trim().length === 16) {
      const decoded = decodeCodiceFiscale(val);
      if (decoded.sesso) {
        vault.updateActiveIdentity({ sesso: decoded.sesso });
      }
    }

    if (field.id.toLowerCase().includes('comune') || field.id.toLowerCase().includes('luogo')) {
      if (typeof val === 'string' && val.trim().length >= 2) {
        const matches = findComune(val);
        if (matches.length > 0) {
          comuneSuggestions = { fieldId: field.id, list: matches.slice(0, 5) };
        } else {
          comuneSuggestions = null;
        }
      } else {
        comuneSuggestions = null;
      }
    }

    if (field.canonicalKey) {
      vault.updateActiveIdentity({ [field.canonicalKey]: val });
    } else {
      const lower = field.id.toLowerCase();
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

    checkAndAutoCalculateCf();
  }

  function applyComuneSuggestion(item: ComuneItem, fieldId: string) {
    formValues[fieldId] = item.nome;
    if (fieldId === 'luogoNascita' || fieldId === 'dichiarante_luogoNascita') {
      if (formValues['provinciaNascita'] !== undefined) formValues['provinciaNascita'] = item.provincia;
      vault.updateActiveIdentity({ luogoNascita: item.nome, provinciaNascita: item.provincia });
    }
    if (fieldId === 'comuneResidenza' || fieldId === 'dichiarante_residenza') {
      if (formValues['provinciaResidenza'] !== undefined) formValues['provinciaResidenza'] = item.provincia;
      if (formValues['capResidenza'] !== undefined) formValues['capResidenza'] = item.cap;
      vault.updateActiveIdentity({ comuneResidenza: item.nome, provinciaResidenza: item.provincia, capResidenza: item.cap });
    }
    comuneSuggestions = null;
    checkAndAutoCalculateCf();
  }

  function toggleManualCf(fieldId: string) {
    manualCfOverride[fieldId] = !manualCfOverride[fieldId];
    if (!manualCfOverride[fieldId]) {
      checkAndAutoCalculateCf();
    }
  }

  function handleDelegatoSelect(e: Event) {
    const target = e.target as HTMLSelectElement;
    const profile = vault.profiles.find(p => p.id === target.value);
    if (profile) {
      formValues.delegato_nome = profile.nome;
      formValues.delegato_cognome = profile.cognome;
      formValues.delegato_cf = profile.codiceFiscale;
      if (profile.numeroDocumento) {
        formValues.delegato_documento = `${profile.tipoDocumento || 'Doc'} n. ${profile.numeroDocumento}`;
      }
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

  function saveSignature() {
    if (signaturePadInstance && !signaturePadInstance.isEmpty()) {
      const dataUrl = signaturePadInstance.toDataURL('image/png');
      signatureDataUrl = dataUrl;
      vault.saveSignatureLocally(dataUrl);
      showToast('Firma salvata e sincronizzata per tutti i documenti');
    }
    showSignatureModal = false;
  }

  function clearSignature() {
    if (signaturePadInstance) {
      signaturePadInstance.clear();
    }
    signatureDataUrl = undefined;
    vault.clearSavedSignature();
    showToast('Firma rimossa');
  }

  async function handleDownloadPdf() {
    isGeneratingPdf = true;
    try {
      const pdfBytes = await generateDocumentPdf(selectedTemplate, formValues, signatureDataUrl);
      const filename = `${selectedTemplate.slug}-${formValues.cognome || 'documento'}-${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadPdfFile(pdfBytes, filename);
      showToast('PDF ufficiale generato e scaricato!');
    } catch (err) {
      console.error(err);
      showToast('Errore durante la generazione del PDF.');
    } finally {
      isGeneratingPdf = false;
    }
  }

  async function handleDownloadDocx() {
    isGeneratingDocx = true;
    try {
      const docxBlob = await generateDocumentDocx(selectedTemplate, formValues);
      const filename = `${selectedTemplate.slug}-${formValues.cognome || 'documento'}-${new Date().toISOString().slice(0, 10)}.docx`;
      downloadDocxFile(docxBlob, filename);
      showToast('Documento Word (.docx) scaricato!');
    } catch (err) {
      console.error(err);
      showToast('Errore durante la creazione del file Word.');
    } finally {
      isGeneratingDocx = false;
    }
  }

  function handleCreateCalendarReminder() {
    let days = 30;
    if (selectedTemplate.id === 'ricorso-multa-prefetto') days = 60;
    const deadlineDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    generateIcsCalendarEvent({
      title: `Scadenza termine: ${selectedTemplate.title}`,
      description: `Promemoria per adempimento burocratico relativo a ${selectedTemplate.title}. Termine di legge: ${days} giorni.`,
      startDate: deadlineDate,
      daysDuration: 1
    });
    showToast('Promemoria scadenza (.ics) aggiunto!');
  }

  let cfValidation = $derived.by(() => {
    const cf = formValues.codiceFiscale || formValues.delegante_cf || formValues.mittente_cf || formValues.ricorrente_cf || formValues.dichiarante_cf;
    if (!cf || cf.length < 16) return null;
    return validateCodiceFiscale(cf);
  });
</script>

<svelte:head>
  <title>{selectedTemplate ? `${selectedTemplate.title} - Modello Fac-simile Gratuito | COMPILALO` : 'Catalogo 32 Modelli ed Autocertificazioni PA Gratuiti | COMPILALO'}</title>
  <meta name="description" content="{selectedTemplate ? `${selectedTemplate.title}: ${selectedTemplate.description}. Modello fac-simile conforme a ${selectedTemplate.normativaRiferimento || 'legge italiana'}. Compila e firma subito gratis in PDF e DOCX.` : '32 modelli pronti della Pubblica Amministrazione: autocertificazioni DPR 445/2000, deleghe, ricorsi multe, contratti locazione e disdette.'}" />
  <link rel="canonical" href="https://compilalo.it/compila" />
  <meta property="og:title" content="{selectedTemplate.title} - Modello Fac-simile Gratuito | COMPILALO" />
  <meta property="og:description" content="{selectedTemplate.description}" />
  <meta property="og:url" content="https://compilalo.it/compila?t={selectedTemplate.slug}" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "name": "Catalogo Modelli e Autocertificazioni Pubblica Amministrazione",
          "description": "32 modelli e fac-simile legali gratuiti conformi alla legge italiana (DPR 445/2000, Codice Civile, Codice della Strada).",
          "url": "https://compilalo.it/compila",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
              {#each TEMPLATES_CATALOG as tmpl, idx}
                {
                  "@type": "ListItem",
                  "position": {idx + 1},
                  "name": {JSON.stringify(tmpl.title)},
                  "description": {JSON.stringify(tmpl.description)},
                  "url": "https://compilalo.it/compila?t=" + {JSON.stringify(tmpl.slug)}
                }{idx < TEMPLATES_CATALOG.length - 1 ? ',' : ''}
              {/each}
            ]
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://compilalo.it"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Modelli Pronti",
              "item": "https://compilalo.it/compila"
            }
          ]
        }
      ]
    }
  </script>
</svelte:head>

<div class="space-y-6">

  <!-- Toast Notifica ad alto craft (Emil Kowalski style: 180ms ease-out) -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#09090B] text-white px-4 py-2.5 rounded-lg shadow-xl border border-zinc-800 text-xs font-medium flex items-center space-x-2.5 craft-modal">
      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{notificationToast}</span>
    </div>
  {/if}

  <!-- Header Navigazione Superiore & Ricerca Modelli -->
  <div class="craft-card rounded-2xl p-6 sm:p-7 space-y-5 border border-zinc-200/90 shadow-sm">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2 mb-1">
          <a href="/" class="inline-flex items-center space-x-1 text-xs text-zinc-500 hover:text-zinc-900 craft-transition">
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Carica Documento</span>
          </a>
          <span class="text-zinc-300">&bull;</span>
          <span class="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {selectedTemplate.category}
          </span>
        </div>

        <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#09090B]">
          {selectedTemplate.title}
        </h1>
        <p class="text-xs sm:text-sm text-zinc-600 mt-1">
          {selectedTemplate.description}
          {#if selectedTemplate.normativaRiferimento}
            &mdash; <span class="font-mono text-xs text-zinc-500 font-medium">{selectedTemplate.normativaRiferimento}</span>
          {/if}
        </p>
      </div>

      <!-- Barra di Ricerca Catalogo -->
      <div class="relative w-full md:w-80 shrink-0">
        <Search class="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cerca tra i 32 modelli..."
          bind:value={catalogSearch}
          class="w-full text-xs pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[#09090B] craft-input"
        />
      </div>
    </div>

    <!-- Segmented Tabs Filtri Categoria -->
    <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 border-t border-zinc-100 pt-3 text-xs font-medium scrollbar-none">
      {#each categories as cat}
        <button
          onclick={() => selectedCategory = cat.id}
          class="px-3 py-1.5 rounded-lg whitespace-nowrap craft-transition craft-press {selectedCategory === cat.id ? 'bg-[#09090B] text-white shadow-xs' : 'bg-zinc-50 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'}"
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Lista Orizzontale dei Modelli Filtrati (Pill Cards) -->
    <div class="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
      {#each filteredTemplates as template}
        <button
          onclick={() => selectedTemplate = template}
          class="shrink-0 px-3.5 py-2 rounded-xl border text-left craft-transition craft-press {selectedTemplate.id === template.id ? 'bg-blue-50/80 border-[#2563EB] text-[#2563EB] font-bold shadow-2xs' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'}"
        >
          <span class="block truncate max-w-[220px]">{template.title}</span>
        </button>
      {/each}
    </div>

  </div>

  <!-- Layout Asimmetrico (Variance = 4): Form a sinistra (5 cols), Foglio Documento a destra (7 cols) -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    
    <!-- COLONNA SINISTRA: Modulo Dati Operativo -->
    <div class="lg:col-span-5 craft-card rounded-2xl p-6 sm:p-7 space-y-6 border border-zinc-200/90 shadow-sm">
      
      <!-- Box Sincronizzazione Universale Identità -->
      {#if vault.hasIdentityData}
        <div class="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs text-emerald-950">
          <div class="flex items-center justify-between">
            <span class="font-medium flex items-center space-x-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dati inseriti automaticamente:</span>
            </span>
            <span class="text-[10px] font-mono text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100/60">
              MEMORIZZATO
            </span>
          </div>

          <div class="text-xs">
            <strong>{vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}</strong>
            {#if vault.activeIdentity.codiceFiscale}
              &bull; <span class="font-mono">{vault.activeIdentity.codiceFiscale}</span>
            {/if}
          </div>

          {#if vault.isUnlocked && vault.profiles.length > 1}
            <div class="pt-2 border-t border-emerald-200/60">
              <label for="comp_profile_select" class="block text-[11px] text-emerald-800 mb-1">
                Cambia profilo familiare:
              </label>
              <select
                id="comp_profile_select"
                onchange={handleProfileSelect}
                class="w-full text-xs bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-zinc-900 craft-input"
              >
                {#each vault.profiles as profile}
                  <option value={profile.id} selected={vault.activeProfileId === profile.id}>
                    {profile.label} &mdash; {profile.cognome} {profile.nome}
                  </option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
      {:else}
        <div class="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs text-zinc-600">
          <span class="flex items-center space-x-2">
            <Info class="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>I dati inseriti rimarranno memorizzati per i prossimi documenti.</span>
          </span>
          <a href="/vault" class="text-[#2563EB] font-bold hover:underline flex items-center space-x-1 shrink-0 ml-2">
            <Lock class="w-3 h-3" />
            <span>Cassaforte</span>
          </a>
        </div>
      {/if}

      <!-- Campi del Form con Funzioni Intelligenti -->
      <form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
        {#each selectedTemplate.fields as field}
          <div class="relative space-y-1">
            <div class="flex items-center justify-between">
              <label for="field_{field.id}" class="block text-xs font-semibold text-zinc-900">
                {field.label} {#if field.required}<span class="text-red-600">*</span>{/if}
              </label>

              <!-- Bottone 'Preferisco inserirlo a mano' per Codice Fiscale -->
              {#if field.canonicalKey === 'codiceFiscale'}
                <button
                  type="button"
                  onclick={() => toggleManualCf(field.id)}
                  class="text-[11px] text-[#2563EB] hover:underline flex items-center space-x-1 craft-transition"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>{manualCfOverride[field.id] ? 'Calcola in automatico' : 'Modifica a mano'}</span>
                </button>
              {/if}
            </div>

            <!-- Box di Calcolo Automatico del Codice Fiscale -->
            {#if field.canonicalKey === 'codiceFiscale' && !manualCfOverride[field.id]}
              <div class="p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <Calculator class="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div>
                    <span class="text-[10px] text-zinc-400 uppercase font-mono block">Calcolato dall'algoritmo</span>
                    <span class="font-mono text-xs font-bold text-[#09090B] tracking-wider">
                      {formValues[field.id] || 'In attesa di dati anagrafici...'}
                    </span>
                  </div>
                </div>

                {#if formValues[field.id]}
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                    VALIDO
                  </span>
                {/if}
              </div>

            {:else if field.type === 'select'}
              <select
                id="field_{field.id}"
                bind:value={formValues[field.id]}
                onchange={(e) => handleFieldChange(field, (e.target as HTMLSelectElement).value)}
                class="w-full text-xs bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 craft-input"
              >
                <option value="">Seleziona un'opzione...</option>
                {#each field.options || [] as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>

            {:else if field.type === 'textarea'}
              <textarea
                id="field_{field.id}"
                rows={3}
                bind:value={formValues[field.id]}
                oninput={(e) => handleFieldChange(field, (e.target as HTMLTextAreaElement).value)}
                placeholder={field.description || ''}
                class="w-full text-xs bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 craft-input"
              ></textarea>

            {:else}
              <input
                id="field_{field.id}"
                type={field.type}
                value={formValues[field.id] || ''}
                oninput={(e) => handleFieldChange(field, (e.target as HTMLInputElement).value)}
                class="w-full text-xs bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 craft-input {field.canonicalKey === 'codiceFiscale' ? 'font-mono uppercase tracking-wider' : ''}"
              />
            {/if}

            <!-- Autocompletamento Intelligente Comuni Italiani -->
            {#if comuneSuggestions && comuneSuggestions.fieldId === field.id}
              <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden craft-modal">
                {#each comuneSuggestions.list as comune}
                  <button
                    type="button"
                    onclick={() => applyComuneSuggestion(comune, field.id)}
                    class="w-full text-left px-3.5 py-2 text-xs hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0 flex items-center justify-between craft-transition"
                  >
                    <span class="font-medium text-zinc-900">{comune.nome} ({comune.provincia})</span>
                    <span class="text-[11px] font-mono text-zinc-500">CAP {comune.cap}</span>
                  </button>
                {/each}
              </div>
            {/if}

            <!-- Validazione inline codice fiscale -->
            {#if (field.canonicalKey === 'codiceFiscale') && manualCfOverride[field.id] && cfValidation}
              <div class="mt-1 flex items-center space-x-1.5 text-xs font-mono {cfValidation.valid ? 'text-emerald-700' : 'text-red-600'}">
                {#if cfValidation.valid}
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Codice fiscale formalmente valido</span>
                {:else}
                  <AlertCircle class="w-3.5 h-3.5" />
                  <span>{cfValidation.error}</span>
                {/if}
              </div>
            {/if}
          </div>
        {/each}

        <!-- Selettore Delegato dedicato per i moduli di delega -->
        {#if selectedTemplate.id.startsWith('delega') && vault.isUnlocked && vault.profiles.length > 1}
          <div class="pt-3 border-t border-zinc-200">
            <label for="sel_delegato_comp" class="block text-xs font-semibold text-zinc-900 mb-1">
              Imposta Persona Delegata dal Vault:
            </label>
            <select
              id="sel_delegato_comp"
              onchange={handleDelegatoSelect}
              class="w-full text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 craft-input"
            >
              <option value="">Scegli persona delegata...</option>
              {#each vault.profiles as profile}
                <option value={profile.id}>{profile.label} ({profile.cognome} {profile.nome})</option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Sezione Firma Autografa Canvas -->
        <div class="pt-5 border-t border-zinc-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900">Firma Autografa</span>
            {#if signatureDataUrl}
              <button
                type="button"
                onclick={clearSignature}
                class="text-xs text-red-600 hover:underline craft-transition"
              >
                Rimuovi
              </button>
            {/if}
          </div>

          {#if signatureDataUrl}
            <div class="border border-emerald-200 bg-emerald-50/70 rounded-xl p-3 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="bg-white p-1 rounded border border-emerald-200">
                  <img src={signatureDataUrl} alt="Firma acquisita" class="h-9 object-contain" />
                </div>
                <span class="text-xs text-emerald-900 font-medium">Pronta per il foglio</span>
              </div>
              <button
                type="button"
                onclick={openSignaturePad}
                class="text-xs text-[#2563EB] font-semibold hover:underline craft-transition"
              >
                Ridisegna
              </button>
            </div>
          {:else}
            <button
              type="button"
              onclick={openSignaturePad}
              class="w-full py-3 px-3 border-2 border-dashed border-zinc-300 rounded-xl text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 flex items-center justify-center space-x-2 craft-transition craft-press bg-zinc-50/50"
            >
              <PenTool class="w-4 h-4 text-[#2563EB]" />
              <span>Traccia la firma con dito o mouse</span>
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- COLONNA DESTRA: Foglio di Stampa Ufficiale Live (A4 Sheet Simulator) -->
    <div class="lg:col-span-7 space-y-4">
      
      <!-- Toolbar Azioni e Multi-Export -->
      <div class="craft-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-zinc-200/90 shadow-sm">
        <div class="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-500">
          <FileText class="w-4 h-4 text-[#2563EB]" />
          <span>Esportazione Documento</span>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Scarica Word DOCX -->
          <button
            onclick={handleDownloadDocx}
            disabled={isGeneratingDocx}
            class="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-medium flex items-center space-x-1.5 craft-transition craft-press disabled:opacity-50"
            title="Scarica documento in formato Word modificabile"
          >
            <FileDown class="w-3.5 h-3.5 text-zinc-600" />
            <span>Word (.docx)</span>
          </button>

          <!-- Promemoria Scadenza Calendario (.ics) -->
          <button
            onclick={handleCreateCalendarReminder}
            class="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-medium flex items-center space-x-1.5 craft-transition craft-press"
            title="Aggiungi promemoria scadenza legale su Apple/Google Calendar"
          >
            <Calendar class="w-3.5 h-3.5 text-zinc-600" />
            <span>Promemoria (.ics)</span>
          </button>

          <!-- Scarica PDF Ufficiale -->
          <button
            onclick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            class="px-5 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-lg text-xs font-bold tracking-wide flex items-center space-x-2 craft-transition craft-press shadow-sm disabled:opacity-50"
          >
            {#if isGeneratingPdf}
              <RefreshCw class="w-3.5 h-3.5 animate-spin" />
              <span>Generazione PDF...</span>
            {:else}
              <Download class="w-3.5 h-3.5" />
              <span>Scarica PDF Ufficiale</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Il Foglio Fisico (Carta d'Archivio A4 con Texture e Tipografia Editoriale) -->
      <div class="sheet-paper rounded-2xl p-8 sm:p-14 min-h-[660px] flex flex-col justify-between font-serif relative overflow-hidden bg-white">
        
        <!-- Sigillo / Timbro Trasparente di Sottofondo -->
        <div class="absolute right-8 top-8 opacity-10 pointer-events-none stamp-seal p-3 font-mono text-center text-xs">
          COMPILALO<br />CIVIC PROTOCOL
        </div>

        <div class="space-y-6">
          <!-- Intestazione Foglio -->
          <div class="border-b border-zinc-200 pb-5">
            <p class="text-[11px] font-sans text-zinc-500 uppercase tracking-widest font-medium">
              REPUBBLICA ITALIANA
            </p>
            <h3 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#09090B] mt-1">
              {selectedTemplate.title}
            </h3>
            {#if selectedTemplate.normativaRiferimento}
              <p class="text-xs text-zinc-600 font-mono mt-1">
                {selectedTemplate.normativaRiferimento}
              </p>
            {/if}
          </div>

          <!-- Testo del Documento Compilato in Tempo Reale -->
          <div class="text-sm leading-relaxed text-[#09090B] whitespace-pre-line font-sans font-normal">
            {selectedTemplate.previewText ? selectedTemplate.previewText(formValues) : ''}
          </div>
        </div>

        <!-- Sezione Firma sul Foglio -->
        <div class="pt-8 border-t border-zinc-200 flex justify-between items-end">
          <div class="text-xs font-mono text-zinc-500">
            Data di compilazione: {formValues.dataCompilazione || new Date().toISOString().slice(0, 10)}
          </div>

          <div class="text-right">
            <p class="text-xs font-sans text-zinc-600 mb-2 font-medium">Firma del dichiarante:</p>
            {#if signatureDataUrl}
              <img src={signatureDataUrl} alt="Firma" class="h-12 object-contain ml-auto" />
            {:else}
              <div class="w-48 border-b border-dashed border-zinc-400 h-8"></div>
            {/if}
          </div>
        </div>

      </div>

    </div>

  </div>
</div>

<!-- Modal di Acquisizione Firma a Mano Libera (Emil Kowalski craft-modal: 180ms ease-out) -->
{#if showSignatureModal}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 transition-opacity duration-150">
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4 craft-modal">
      <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h3 class="font-serif text-xl font-bold text-[#09090B]">Disegna la tua Firma</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Traccia la firma con il dito, una penna o il mouse</p>
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
          Salva e Applica al Modulo
        </button>
      </div>
    </div>
  </div>
{/if}
