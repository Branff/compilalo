<script lang="ts">
  import '../app.css';
  import { onMount, type Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { vault } from '$lib/stores/vault.svelte';
  import { Lock, ShieldCheck, FileText, UserCheck, KeyRound, Cpu, CheckCircle2 } from 'lucide-svelte';

  let { children }: { children?: Snippet } = $props();

  onMount(async () => {
    await vault.checkStoredVault();
  });

  let currentPath = $derived($page.url.pathname);
</script>

<div class="min-h-screen flex flex-col bg-[#F9F9F8] text-[#18181B] font-sans antialiased">
  <!-- Header Istituzionale & Notarile Contemporaneo -->
  <header class="border-b border-[#E4E4E7] bg-white sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand Identitario -->
      <div class="flex items-center space-x-4">
        <a href="/" class="flex items-center space-x-3 group craft-press">
          <div class="w-8 h-8 rounded bg-[#18181B] text-white flex items-center justify-center font-serif text-lg font-bold craft-transition group-hover:bg-[#1D4ED8]">
            C
          </div>
          <div>
            <span class="font-serif text-2xl font-bold tracking-tight text-[#18181B]">COMPILALO</span>
            <span class="hidden sm:inline-block ml-2 text-xs font-mono uppercase tracking-wider text-[#71717A] border-l border-[#E4E4E7] pl-2">
              Civic Protocol
            </span>
          </div>
        </a>
      </div>

      <!-- Navigazione Principale Unificata -->
      <nav class="flex items-center space-x-1 sm:space-x-2 text-xs font-medium">
        <a
          href="/"
          class="px-3 py-1.5 rounded-md craft-transition craft-press {currentPath === '/' ? 'bg-[#18181B] text-white' : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F2F1ED]'}"
        >
          Carica Documento
        </a>

        <a
          href="/compila"
          class="px-3 py-1.5 rounded-md craft-transition craft-press {currentPath.startsWith('/compila') ? 'bg-[#18181B] text-white' : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F2F1ED]'}"
        >
          Modelli Pronti
        </a>

        <a
          href="/blog"
          class="px-3 py-1.5 rounded-md craft-transition craft-press {currentPath.startsWith('/blog') ? 'bg-[#18181B] text-white' : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F2F1ED]'}"
        >
          Blog & Guide
        </a>

        <a
          href="/vault"
          class="px-3 py-1.5 rounded-md craft-transition craft-press {currentPath.startsWith('/vault') ? 'bg-[#18181B] text-white' : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F2F1ED]'}"
        >
          La Mia Cassaforte
        </a>

        <!-- Indicatore di Sincronizzazione Dati: se l'utente ha inserito i dati, lo confermiamo qui -->
        <div class="hidden md:flex items-center pl-3 border-l border-[#E4E4E7] ml-2">
          {#if vault.hasIdentityData}
            <a
              href="/vault"
              class="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-mono hover:bg-[#D1FAE5] craft-transition craft-press"
              title="I tuoi dati sono pronti e sincronizzati su tutto il sito. Clicca per visualizzare o modificare."
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-[#059669]" />
              <span class="truncate max-w-[150px]">
                Dati pronti: {vault.activeIdentity.nome || ''} {vault.activeIdentity.cognome || ''}
              </span>
            </a>
          {:else if vault.hasStoredVault}
            <a
              href="/vault"
              class="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-mono hover:bg-[#FDE68A] craft-transition craft-press"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>SBLOCCA CASSAFORTE</span>
            </a>
          {:else}
            <span class="text-xs font-mono text-[#71717A] px-2 py-0.5">
              DATI LOCALI &middot; ZERO SERVER
            </span>
          {/if}
        </div>
      </nav>
    </div>
  </header>

  <!-- Corpo Pagina -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {@render children?.()}
  </main>

  <!-- Footer Unificato Istituzionale -->
  <footer class="border-t border-[#E4E4E7] bg-white text-xs text-[#71717A] py-8 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1 text-center md:text-left">
          <p class="font-medium text-[#18181B]">
            COMPILALO &mdash; Il protocollo civico per la compilazione e firma documenti nel browser.
          </p>
          <p>
            Tutti i documenti e i dati personali vengono elaborati <strong>esclusivamente nella memoria del tuo dispositivo</strong>. Zero cookie, zero server, zero registrazione.
          </p>
        </div>
        <div class="flex items-center space-x-4 font-mono text-[11px]">
          <span>&euro;0,00 GRATIS</span>
          <span>&middot;</span>
          <span>SENZA COOKIE</span>
          <span>&middot;</span>
          <span>OFFLINE-FIRST</span>
        </div>
      </div>

      <!-- Link Informativi e Legali -->
      <div class="border-t border-[#F2F1ED] pt-3 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[11px]">
        <a href="/manifesto" class="hover:text-[#18181B] hover:underline craft-transition">Manifesto Civico</a>
        <a href="/sicurezza" class="hover:text-[#18181B] hover:underline craft-transition">Whitepaper Sicurezza & Crittografia</a>
        <a href="/blog" class="hover:text-[#18181B] hover:underline craft-transition">Blog Civico & Guide</a>
        <a href="/privacy" class="hover:text-[#18181B] hover:underline craft-transition">Privacy Zero-Log (GDPR Art. 25)</a>
        <a href="/termini" class="hover:text-[#18181B] hover:underline craft-transition">Termini & Avvertenze DPR 445</a>
      </div>
    </div>
  </footer>
</div>
