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
    MapPin
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
    { id: 'tutti', label: 'Tutti i Modelli' },
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

  // Funzione intelligente 1 & 1.1: Calcolo automatico CF e autocompletamento
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

    // Se l'utente inserisce a mano un Codice Fiscale, effettua reverse decoding intelligente (1.1)
    if (field.canonicalKey === 'codiceFiscale' && typeof val === 'string' && val.trim().length === 16) {
      const decoded = decodeCodiceFiscale(val);
      if (decoded.sesso) {
        vault.updateActiveIdentity({ sesso: decoded.sesso });
      }
    }

    // Se l'utente digita un comune, suggerisci autocompletamento
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

    // Sincronizzazione universale identità
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

    // Ricalcola il codice fiscale se i campi anagrafici sono cambiati
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

<div class="space-y-6">

  <!-- Toast Notifica ad alto craft -->
  {#if notificationToast}
    <div class="fixed top-20 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#27272A] text-xs font-medium flex items-center space-x-2 craft-modal">
      <Check class="w-4 h-4 text-[#10B981]" />
      <span>{notificationToast}</span>
    </div>
  {/if}

  <!-- Navigazione Ritorno -->
  <div class="flex items-center justify-between">
    <a href="/" class="inline-flex items-center space-x-1.5 text-xs font-medium text-[#52525B] hover:text-[#18181B] craft-transition craft-press">
      <ChevronLeft class="w-4 h-4" />
      <span>Torna a Carica Documento</span>
    </a>

    <div class="flex items-center space-x-2">
      <span class="text-xs font-mono uppercase tracking-wider text-[#71717A]">
        CATEGORIA: <strong class="text-[#18181B]">{selectedTemplate.category}</strong>
      </span>
    </div>
  </div>

  <!-- Catalogo Moduli Esteso: Ricerca & Categorie -->
  <div class="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-4 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="font-serif text-2xl font-bold tracking-tight text-[#18181B]">
          {selectedTemplate.title}
        </h1>
        <p class="text-xs text-[#52525B] mt-0.5">
          {selectedTemplate.description}
        </p>
      </div>

      <!-- Barra di Ricerca Catalogo -->
      <div class="relative w-full md:w-72">
        <Search class="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cerca tra 30+ moduli..."
          bind:value={catalogSearch}
          class="w-full text-xs pl-9 pr-3 py-2 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg text-[#18181B] craft-input"
        />
      </div>
    </div>

    <!-- Filtri Categoria -->
    <div class="flex flex-wrap gap-1.5 pt-2 border-t border-[#E4E4E7]">
      {#each categories as cat}
        <button
          onclick={() => selectedCategory = cat.id}
          class="px-2.5 py-1 text-xs font-medium rounded-full border craft-transition craft-press {selectedCategory === cat.id ? 'bg-[#18181B] text-white border-[#18181B]' : 'bg-[#F9F9F8] text-[#52525B] border-[#E4E4E7] hover:border-[#71717A]'}"
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Lista Orizzontale dei Modelli Filtrati -->
    <div class="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
      {#each filteredTemplates as template}
        <button
          onclick={() => selectedTemplate = template}
          class="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border craft-transition craft-press text-left {selectedTemplate.id === template.id ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold' : 'bg-[#F9F9F8] border-[#E4E4E7] text-[#18181B] hover:border-[#71717A]'}"
        >
          {template.title}
        </button>
      {/each}
    </div>
  </div>

  <!-- Layout Asimmetrico (Variance = 4): Form al 45% a sinistra, Foglio Documento al 55% a destra -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    
    <!-- COLONNA SINISTRA: Modulo Dati Operativo (45% -> 5 cols) -->
    <div class="lg:col-span-5 bg-white border border-[#E4E4E7] rounded-xl p-6 space-y-6 shadow-sm">
      
      <!-- STATO INTELLIGENTE: Sincronizzazione Universale -->
      {#if vault.hasIdentityData}
        <div class="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-[#065F46] flex items-center space-x-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-[#059669]" />
              <span>Dati inseriti automaticamente:</span>
            </span>
            <span class="text-[11px] font-mono text-[#059669] font-bold">SINCRONIZZATO</span>
          </div>

          <div class="text-xs text-[#065F46]">
            <strong>{vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}</strong>
            {#if vault.activeIdentity.codiceFiscale}
              &middot; <span class="font-mono">{vault.activeIdentity.codiceFiscale}</span>
            {/if}
          </div>

          {#if vault.isUnlocked && vault.profiles.length > 1}
            <div class="pt-1.5 border-t border-[#A7F3D0]/60">
              <label for="comp_profile_select" class="block text-[11px] text-[#065F46] mb-1">
                Cambia familiare:
              </label>
              <select
                id="comp_profile_select"
                onchange={handleProfileSelect}
                class="w-full text-xs bg-white border border-[#A7F3D0] rounded px-2 py-1 text-[#18181B] craft-input"
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
        <div class="p-3 bg-[#F9F9F8] border border-[#E4E4E7] rounded-md flex items-center justify-between text-xs text-[#52525B]">
          <span class="flex items-center space-x-1.5">
            <Info class="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>I dati inseriti qui si salvano automaticamente nel browser.</span>
          </span>
          <a href="/vault" class="text-[#1D4ED8] font-medium hover:underline flex items-center space-x-1 craft-press">
            <Lock class="w-3 h-3" />
            <span>Cassaforte</span>
          </a>
        </div>
      {/if}

      <!-- Campi del Form con Funzioni Intelligenti -->
      <form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
        {#each selectedTemplate.fields as field}
          <div class="relative">
            <div class="flex items-center justify-between mb-1">
              <label for="field_{field.id}" class="block text-xs font-medium text-[#18181B]">
                {field.label} {#if field.required}<span class="text-[#DC2626]">*</span>{/if}
              </label>

              <!-- Bottone 'Preferisco inserirlo a mano' per Codice Fiscale (Punto 1) -->
              {#if field.canonicalKey === 'codiceFiscale'}
                <button
                  type="button"
                  onclick={() => toggleManualCf(field.id)}
                  class="text-[11px] text-[#1D4ED8] hover:underline flex items-center space-x-1 craft-transition"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>{manualCfOverride[field.id] ? 'Calcola in automatico' : 'Preferisco inserirlo a mano'}</span>
                </button>
              {/if}
            </div>

            <!-- Box di Calcolo Automatico del Codice Fiscale -->
            {#if field.canonicalKey === 'codiceFiscale' && !manualCfOverride[field.id]}
              <div class="p-2.5 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Calculator class="w-4 h-4 text-[#1D4ED8]" />
                  <div>
                    <span class="text-[10px] text-[#71717A] uppercase font-mono block">Calcolato dal sistema</span>
                    <span class="font-mono text-xs font-bold text-[#18181B] tracking-wider">
                      {formValues[field.id] || 'In attesa di dati anagrafici...'}
                    </span>
                  </div>
                </div>

                {#if formValues[field.id]}
                  <span class="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-mono">
                    VALIDO
                  </span>
                {/if}
              </div>

            {:else if field.type === 'select'}
              <select
                id="field_{field.id}"
                bind:value={formValues[field.id]}
                onchange={(e) => handleFieldChange(field, (e.target as HTMLSelectElement).value)}
                class="w-full text-xs bg-white border border-[#E4E4E7] rounded-lg px-3 py-2 text-[#18181B] craft-input"
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
                class="w-full text-xs bg-white border border-[#E4E4E7] rounded-lg px-3 py-2 text-[#18181B] craft-input"
              ></textarea>

            {:else}
              <input
                id="field_{field.id}"
                type={field.type}
                value={formValues[field.id] || ''}
                oninput={(e) => handleFieldChange(field, (e.target as HTMLInputElement).value)}
                class="w-full text-xs bg-white border border-[#E4E4E7] rounded-lg px-3 py-2 text-[#18181B] craft-input {field.canonicalKey === 'codiceFiscale' ? 'font-mono uppercase tracking-wider' : ''}"
              />
            {/if}

            <!-- Autocompletamento Intelligente Comuni Italiani (Punto 1.1) -->
            {#if comuneSuggestions && comuneSuggestions.fieldId === field.id}
              <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E4E4E7] rounded-lg shadow-lg z-20 py-1 craft-modal">
                {#each comuneSuggestions.list as comune}
                  <button
                    type="button"
                    onclick={() => applyComuneSuggestion(comune, field.id)}
                    class="w-full text-left px-3 py-1.5 text-xs hover:bg-[#EFF6FF] hover:text-[#1D4ED8] flex items-center justify-between craft-transition"
                  >
                    <span class="font-medium">{comune.nome} ({comune.provincia})</span>
                    <span class="text-[11px] font-mono text-[#71717A]">CAP {comune.cap}</span>
                  </button>
                {/each}
              </div>
            {/if}

            <!-- Validazione inline codice fiscale -->
            {#if (field.canonicalKey === 'codiceFiscale') && manualCfOverride[field.id] && cfValidation}
              <div class="mt-1 flex items-center space-x-1.5 text-xs font-mono {cfValidation.valid ? 'text-[#059669]' : 'text-[#DC2626]'}">
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
          <div class="pt-2 border-t border-[#E4E4E7]">
            <label for="sel_delegato_comp" class="block text-xs font-medium text-[#18181B] mb-1">
              Imposta Delegato rapido dal Vault:
            </label>
            <select
              id="sel_delegato_comp"
              onchange={handleDelegatoSelect}
              class="w-full text-xs bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg px-2.5 py-1.5 text-[#18181B] craft-input"
            >
              <option value="">Scegli persona delegata...</option>
              {#each vault.profiles as profile}
                <option value={profile.id}>{profile.label} ({profile.cognome} {profile.nome})</option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Firma Autografa Canvas -->
        <div class="pt-4 border-t border-[#E4E4E7]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-[#18181B]">Firma Autografa Digitale:</span>
            {#if signatureDataUrl}
              <button
                type="button"
                onclick={clearSignature}
                class="text-xs text-[#DC2626] hover:underline craft-transition"
              >
                Rimuovi firma
              </button>
            {/if}
          </div>

          {#if signatureDataUrl}
            <div class="border border-dashed border-[#10B981] bg-[#ECFDF5] rounded-lg p-2.5 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <img src={signatureDataUrl} alt="Firma acquisita" class="h-9 object-contain" />
                <span class="text-xs text-[#065F46] font-medium">Pronta per il documento</span>
              </div>
              <button
                type="button"
                onclick={openSignaturePad}
                class="text-xs text-[#1D4ED8] font-semibold hover:underline px-2 py-1 craft-transition"
              >
                Ridisegna
              </button>
            </div>
          {:else}
            <button
              type="button"
              onclick={openSignaturePad}
              class="w-full py-2.5 px-3 border border-dashed border-[#71717A] rounded-lg text-xs font-medium text-[#52525B] hover:border-[#18181B] hover:text-[#18181B] flex items-center justify-center space-x-2 craft-transition craft-press bg-[#F9F9F8]"
            >
              <PenTool class="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Disegna la tua firma a mano libera (una sola volta)</span>
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- COLONNA DESTRA: Foglio di Stampa Ufficiale Live (55% -> 7 cols) -->
    <div class="lg:col-span-7 space-y-4">
      
      <!-- Barra di Controllo Multi-Download -->
      <div class="bg-white border border-[#E4E4E7] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center space-x-2">
          <FileText class="w-4 h-4 text-[#1D4ED8]" />
          <span class="text-xs font-mono uppercase tracking-wider text-[#52525B]">
            Esporta Documento
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Scarica Word DOCX -->
          <button
            onclick={handleDownloadDocx}
            disabled={isGeneratingDocx}
            class="px-3 py-2 bg-[#F2F1ED] hover:bg-[#E4E4E7] text-[#18181B] rounded-lg text-xs font-medium flex items-center space-x-1.5 craft-transition craft-press disabled:opacity-50"
            title="Scarica documento in formato Word modificabile"
          >
            <FileDown class="w-3.5 h-3.5 text-[#52525B]" />
            <span>Word (.docx)</span>
          </button>

          <!-- Promemoria Scadenza Calendario (.ics) -->
          <button
            onclick={handleCreateCalendarReminder}
            class="px-3 py-2 bg-[#F2F1ED] hover:bg-[#E4E4E7] text-[#18181B] rounded-lg text-xs font-medium flex items-center space-x-1.5 craft-transition craft-press"
            title="Aggiungi promemoria scadenza legale su Apple/Google Calendar"
          >
            <Calendar class="w-3.5 h-3.5 text-[#52525B]" />
            <span>Promemoria (.ics)</span>
          </button>

          <!-- Scarica PDF Ufficiale -->
          <button
            onclick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            class="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shadow-sm disabled:opacity-50"
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

      <!-- Il Foglio Fisico (Carta d'Archivio con Texture e Tipografia Editoriale) -->
      <div class="bg-white border border-[#E4E4E7] rounded-xl shadow-sm p-8 sm:p-12 min-h-[640px] flex flex-col justify-between font-serif relative overflow-hidden">
        
        <!-- Sigillo / Timbro Trasparente di Sottofondo -->
        <div class="absolute right-6 top-6 opacity-10 pointer-events-none stamp-seal p-3 font-mono text-center text-xs">
          COMPILALO<br />CIVIC PROTOCOL
        </div>

        <div class="space-y-6">
          <!-- Intestazione Foglio -->
          <div class="border-b border-[#E4E4E7] pb-4">
            <p class="text-[11px] font-sans text-[#71717A] uppercase tracking-widest">
              REPUBBLICA ITALIANA
            </p>
            <h3 class="text-2xl font-bold tracking-tight text-[#18181B] mt-1">
              {selectedTemplate.title}
            </h3>
            {#if selectedTemplate.normativaRiferimento}
              <p class="text-xs text-[#52525B] font-mono mt-0.5">
                {selectedTemplate.normativaRiferimento}
              </p>
            {/if}
          </div>

          <!-- Corpo del Documento con Testo Reale -->
          <div class="text-sm leading-relaxed text-[#18181B] whitespace-pre-line font-sans font-normal">
            {selectedTemplate.previewText ? selectedTemplate.previewText(formValues) : ''}
          </div>
        </div>

        <!-- Sezione Firma sul Foglio -->
        <div class="pt-8 border-t border-[#E4E4E7] flex justify-between items-end">
          <div class="text-xs font-mono text-[#71717A]">
            Data di generazione: {formValues.dataCompilazione || new Date().toISOString().slice(0, 10)}
          </div>

          <div class="text-right">
            <p class="text-xs font-sans text-[#52525B] mb-2">Firma del dichiarante:</p>
            {#if signatureDataUrl}
              <img src={signatureDataUrl} alt="Firma" class="h-12 object-contain ml-auto" />
            {:else}
              <div class="w-48 border-b border-dashed border-[#18181B] h-8"></div>
            {/if}
          </div>
        </div>

      </div>

    </div>

  </div>
</div>

<!-- Modal di Acquisizione Firma a Mano Libera -->
{#if showSignatureModal}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-150">
    <div class="bg-white rounded-xl border border-[#E4E4E7] shadow-xl max-w-lg w-full p-6 space-y-4 craft-modal">
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
        Traccia la tua firma con il dito, penna o mouse. Verrà memorizzata localmente e impressa nei tuoi documenti senza passare da alcun server.
      </p>

      <div class="border border-[#E4E4E7] rounded-lg bg-[#F9F9F8]">
        <canvas
          bind:this={canvasEl}
          class="w-full h-44 touch-none cursor-crosshair"
        ></canvas>
      </div>

      <div class="flex justify-between items-center pt-2">
        <button
          type="button"
          onclick={clearSignature}
          class="px-3 py-1.5 text-xs text-[#71717A] hover:text-[#18181B] border border-[#E4E4E7] rounded-lg craft-transition craft-press"
        >
          Cancella
        </button>

        <button
          type="button"
          onclick={saveSignature}
          class="px-4 py-1.5 text-xs font-semibold bg-[#18181B] text-white rounded-lg hover:bg-[#1D4ED8] craft-transition craft-press"
        >
          Salva e Applica al Modulo
        </button>
      </div>
    </div>
  </div>
{/if}
