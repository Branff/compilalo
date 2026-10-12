<script lang="ts">
  import '../app.css';
  import { onMount, type Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { vault } from '$lib/stores/vault.svelte';
  import {
    ShieldCheck,
    FileText,
    KeyRound,
    Lock,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Sparkles,
    Shield,
    ExternalLink
  } from 'lucide-svelte';

  let { children }: { children?: Snippet } = $props();

  onMount(async () => {
    await vault.checkStoredVault();
  });

  let currentPath = $derived($page.url.pathname);
</script>

<div class="min-h-screen flex flex-col bg-[#FAFAF9] text-[#09090B] font-sans antialiased selection:bg-[#2563EB] selection:text-white">
  
  <!-- Header Istituzionale & Modern SaaS Bar (Linear/Stripe inspired) -->
  <header class="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-zinc-200/80 transition-colors duration-150">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand Identitario -->
      <div class="flex items-center space-x-6">
        <a href="/" class="flex items-center space-x-3 group craft-press">
          <div class="w-8 h-8 rounded-lg bg-[#09090B] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm craft-transition group-hover:bg-[#2563EB] group-hover:scale-105">
            C
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="font-serif text-2xl font-bold tracking-tight text-[#09090B]">COMPILALO</span>
            <span class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-100 border border-zinc-200/60">
              Civic SaaS
            </span>
          </div>
        </a>

        <!-- Live Status Pill (Local Memory / E2EE) -->
        <div class="hidden lg:flex items-center space-x-2 pl-4 border-l border-zinc-200 text-[11px] font-mono text-zinc-600">
          <span class="relative flex h-2 w-2">
            <span class="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>100% In Locale &middot; Zero Cloud</span>
        </div>
      </div>

      <!-- Navigazione Desktop & Pillole Segmentate -->
      <nav class="flex items-center space-x-1 sm:space-x-1.5 text-xs font-medium">
        <a
          href="/"
          class="px-3 py-1.5 rounded-lg craft-transition craft-press {currentPath === '/' ? 'bg-[#09090B] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'}"
        >
          Carica & Firma
        </a>

        <a
          href="/compila"
          class="px-3 py-1.5 rounded-lg craft-transition craft-press {currentPath.startsWith('/compila') ? 'bg-[#09090B] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'}"
        >
          32 Modelli
        </a>

        <a
          href="/blog"
          class="px-3 py-1.5 rounded-lg craft-transition craft-press {currentPath.startsWith('/blog') ? 'bg-[#09090B] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'}"
        >
          Guide & Normativa
        </a>

        <a
          href="/vault"
          class="px-3 py-1.5 rounded-lg craft-transition craft-press {currentPath.startsWith('/vault') ? 'bg-[#09090B] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'}"
        >
          Cassaforte
        </a>

        <!-- Indicatore di Sincronizzazione / Stato Utente -->
        <div class="hidden sm:flex items-center pl-3 border-l border-zinc-200 ml-1">
          {#if vault.hasIdentityData}
            <a
              href="/vault"
              class="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono hover:bg-emerald-100/80 craft-transition craft-press shadow-2xs"
              title="I tuoi dati sono pronti e memorizzati in locale. Clicca per visualizzare o modificare."
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              <span class="truncate max-w-[130px] font-sans font-medium">
                {vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}
              </span>
            </a>
          {:else if vault.hasStoredVault}
            <a
              href="/vault"
              class="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono hover:bg-amber-100 craft-transition craft-press"
            >
              <Lock class="w-3.5 h-3.5 text-amber-600" />
              <span>SBLOCCA</span>
            </a>
          {:else}
            <a
              href="/vault"
              class="flex items-center space-x-1 px-2 py-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-900 craft-transition"
              title="Salva i tuoi dati una sola volta in un caveau crittografato"
            >
              <KeyRound class="w-3 h-3 text-zinc-400" />
              <span>Crea Profilo</span>
            </a>
          {/if}
        </div>
      </nav>
    </div>
  </header>

  <!-- Contenuto Principale con Respiro Editoriale -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    {@render children?.()}
  </main>

  <!-- Footer Istituzionale & Trasparente (Stripe/Linear Craft) -->
  <footer class="border-t border-zinc-200/80 bg-white text-zinc-600 text-xs py-12 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Colonna 1: Identità & Missione -->
        <div class="md:col-span-1 space-y-3">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded bg-[#09090B] text-white flex items-center justify-center font-serif text-sm font-bold">
              C
            </div>
            <span class="font-serif text-lg font-bold text-[#09090B]">COMPILALO</span>
          </div>
          <p class="text-xs text-zinc-500 leading-relaxed">
            Il protocollo civico per compilare e firmare qualsiasi documento italiano direttamente nel browser, a costo zero e senza inviare un singolo dato al cloud.
          </p>
          <div class="pt-2 flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Local-First &bull; AES-GCM-256</span>
          </div>
        </div>

        <!-- Colonna 2: Modelli Popolari -->
        <div class="space-y-2">
          <p class="font-mono text-[11px] uppercase tracking-wider text-zinc-900 font-bold">Modelli Principali</p>
          <ul class="space-y-1.5 text-zinc-500">
            <li><a href="/compila?t=autocertificazione-residenza" class="hover:text-zinc-900 craft-transition">Autocertificazione Residenza</a></li>
            <li><a href="/compila?t=delega-ritiro-documenti" class="hover:text-zinc-900 craft-transition">Delega Ritiro Documenti</a></li>
            <li><a href="/compila?t=disdetta-telefonia-internet" class="hover:text-zinc-900 craft-transition">Disdetta Telefonia & Fibra</a></li>
            <li><a href="/compila?t=ricorso-multa-prefetto" class="hover:text-zinc-900 craft-transition">Ricorso Multa Prefetto</a></li>
            <li><a href="/compila?t=disdetta-locazione-grave-motivo" class="hover:text-zinc-900 craft-transition">Disdetta Locazione 6 Mesi</a></li>
          </ul>
        </div>

        <!-- Colonna 3: Trasparenza & Sicurezza -->
        <div class="space-y-2">
          <p class="font-mono text-[11px] uppercase tracking-wider text-zinc-900 font-bold">Architettura & Diritto</p>
          <ul class="space-y-1.5 text-zinc-500">
            <li><a href="/sicurezza" class="hover:text-zinc-900 craft-transition">Whitepaper Zero-Knowledge</a></li>
            <li><a href="/manifesto" class="hover:text-zinc-900 craft-transition">Manifesto Civico Digitale</a></li>
            <li><a href="/privacy" class="hover:text-zinc-900 craft-transition">Privacy Zero-Log (GDPR Art. 25)</a></li>
            <li><a href="/termini" class="hover:text-zinc-900 craft-transition">D.P.R. 445/2000 & Note Legali</a></li>
            <li><a href="/blog" class="hover:text-zinc-900 craft-transition">Guide Giuridiche per Cittadini</a></li>
          </ul>
        </div>

        <!-- Colonna 4: Garanzie Fondamentali -->
        <div class="space-y-2.5">
          <p class="font-mono text-[11px] uppercase tracking-wider text-zinc-900 font-bold">I Tre Vincoli Inviolabili</p>
          <div class="space-y-2 text-[11px] text-zinc-500">
            <div class="p-2 rounded bg-zinc-50 border border-zinc-200/60 space-y-0.5">
              <span class="font-bold text-zinc-900">&euro;0,00 Per Sempre</span>
              <p>Nessun abbonamento né costi occulti.</p>
            </div>
            <div class="p-2 rounded bg-zinc-50 border border-zinc-200/60 space-y-0.5">
              <span class="font-bold text-zinc-900">Zero Server / Zero Cookie</span>
              <p>Non tracciamo né memorizziamo chi sei.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Barra finale Copyright e Dati Tecnici -->
      <div class="pt-6 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <div>
          COMPILALO &copy; 2026 &mdash; Software Libero e Aperto per la Sovranit&agrave; del Cittadino.
        </div>
        <div class="flex items-center space-x-3">
          <span>HTML5 WASM</span>
          <span>&bull;</span>
          <span>WEBCRYPTO API</span>
          <span>&bull;</span>
          <span>WCAG 2.2 AA</span>
        </div>
      </div>

    </div>
  </footer>
</div>
