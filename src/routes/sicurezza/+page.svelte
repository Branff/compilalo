<script lang="ts">
  import { ShieldCheck, Lock, KeyRound, Cpu, CheckCircle2, FileCode, Terminal } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Architettura di Sicurezza & Crittografia Zero-Knowledge | COMPILALO</title>
  <meta name="description" content="Whitepaper tecnico sull'architettura crittografica di COMPILALO: WebCrypto API, cifratura AES-GCM-256, PBKDF2 a 600.000 iterazioni e memoria client-side." />
  <link rel="canonical" href="https://compilalo.it/sicurezza" />
  <meta property="og:title" content="Whitepaper Sicurezza & Crittografia Zero-Knowledge | COMPILALO" />
  <meta property="og:description" content="Dimostrazione matematica e tecnica dell'architettura client-side di COMPILALO. Zero chiamate di rete con i tuoi dati personali." />
  <meta property="og:url" content="https://compilalo.it/sicurezza" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "Architettura di Sicurezza Zero-Knowledge & Elaborazione Locale",
      "description": "Specifiche tecniche di cifratura AES-GCM-256, derivazione chiave PBKDF2 e rendering PDF client-side.",
      "url": "https://compilalo.it/sicurezza",
      "inLanguage": "it-IT",
      "author": {
        "@type": "Organization",
        "name": "COMPILALO Security Research"
      }
    }
  </script>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-12 py-4">

  <!-- Header Whitepaper Tecnico -->
  <header class="space-y-4 border-b border-zinc-200 pb-8">
    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono">
      <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
      <span>Whitepaper Tecnico &bull; Protocollo Crittografico v1.0</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] leading-[1.12]">
      Architettura di Sicurezza Zero-Knowledge & Elaborazione Locale
    </h1>

    <p class="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-3xl">
      Questo documento descrive formalmente le garanzie matematiche e l'infrastruttura software alla base di COMPILALO. Dimostriamo perch&eacute; &egrave; tecnicamente impossibile per i gestori del servizio o per attaccanti di rete accedere ai tuoi dati personali.
    </p>
  </header>

  <!-- Sezioni Tecniche Dettagliate -->
  <div class="space-y-8 text-sm text-zinc-700 leading-relaxed">
    
    <!-- 1. Schema del Modello di Minaccia -->
    <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-4 border border-zinc-200/90 shadow-sm">
      <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#09090B] flex items-center space-x-2.5">
        <Lock class="w-5 h-5 text-[#2563EB]" />
        <span>1. Threat Model (Modello di Minaccia)</span>
      </h2>
      <p class="text-zinc-600">
        COMPILALO assume un modello di minaccia <strong>Untrusted Server / Untrusted Network</strong>:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div class="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
          <span class="font-mono text-xs font-bold text-red-600">MINACCIA 1: Man-In-The-Middle (MITM)</span>
          <p class="text-xs text-zinc-600">Intercettazione del traffico di rete tra utente e web app.</p>
          <p class="text-xs text-emerald-700 font-semibold">Difesa: Nessun dato anagrafico o file PDF viene mai trasmesso su rete.</p>
        </div>
        <div class="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
          <span class="font-mono text-xs font-bold text-red-600">MINACCIA 2: Data Breach sul Server</span>
          <p class="text-xs text-zinc-600">Compromissione totale dell'infrastruttura di hosting.</p>
          <p class="text-xs text-emerald-700 font-semibold">Difesa: Il server non ospita alcun database, bucket o log anagrafico.</p>
        </div>
      </div>
    </section>

    <!-- 2. Primitive Crittografiche Implementate -->
    <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-4 border border-zinc-200/90 shadow-sm">
      <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#09090B] flex items-center space-x-2.5">
        <KeyRound class="w-5 h-5 text-[#2563EB]" />
        <span>2. Primitive Crittografiche (WebCrypto API)</span>
      </h2>
      <p class="text-zinc-600">
        Tutte le operazioni crittografiche sono implementate tramite le primitive native hardware del browser (W3C Web Cryptography API), escludendo librerie JavaScript legacy ad alto rischio di side-channel attack:
      </p>

      <div class="space-y-2.5 font-mono text-xs pt-1">
        <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-zinc-900">Cifratura Simmetrica:</span>
          <span class="text-[#2563EB]">AES-GCM (Galois/Counter Mode) con chiave a 256 bit</span>
        </div>
        <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-zinc-900">Key Derivation Function (KDF):</span>
          <span class="text-[#2563EB]">PBKDF2 con HMAC-SHA-256 e 600.000 iterazioni</span>
        </div>
        <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-zinc-900">Vettore di Inizializzazione (IV):</span>
          <span class="text-[#2563EB]">12 byte crittograficamente casuali (crypto.getRandomValues)</span>
        </div>
        <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-zinc-900">Generazione Mnemonic Seed:</span>
          <span class="text-[#2563EB]">12 parole BIP-39 standard (128 bit di entropia CSPRNG)</span>
        </div>
      </div>
    </section>

    <!-- 3. Ciclo di Vita del Documento PDF -->
    <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-4 border border-zinc-200/90 shadow-sm">
      <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#09090B] flex items-center space-x-2.5">
        <Cpu class="w-5 h-5 text-[#2563EB]" />
        <span>3. Motore di Rendering PDF Client-Side</span>
      </h2>
      <p class="text-zinc-600">
        I documenti PDF scaricati da COMPILALO sono generati tramite compilazione di stream binari direttamente nella memoria RAM del client:
      </p>
      <ol class="list-decimal pl-5 space-y-2 text-zinc-600">
        <li>
          <strong>Iniezione AcroForm / Canvas:</strong> La libreria <code>pdf-lib</code> riceve il buffer binario del documento vuoto e inietta direttamente i glifi tipografici e le coordinate vettoriali.
        </li>
        <li>
          <strong>Firma Autografa Vettoriale:</strong> Il tratto grafico acquisito tramite <code>signature_pad</code> con campionamento B&eacute;zier viene serializzato in immagine PNG ad alta definizione e fuso come XObject all'interno del PDF.
        </li>
        <li>
          <strong>Download Immediato via Blob URL:</strong> Il buffer finale viene convertito in un <code>blob:</code> URL locale e scaricato dal browser tramite l'attributo <code>download</code>. Nessun file transita n&eacute; temporaneamente n&eacute; permanentemente su server esterni.
        </li>
      </ol>
    </section>

    <!-- 4. Verifica Indipendente del Codice -->
    <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-4 border border-zinc-200/90 shadow-sm">
      <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#09090B] flex items-center space-x-2.5">
        <Terminal class="w-5 h-5 text-[#2563EB]" />
        <span>4. Come Verificare la Sicurezza con i Tuoi Occhi</span>
      </h2>
      <p class="text-zinc-600">
        Non fidarti delle nostre parole: verifica tu stesso con gli strumenti per sviluppatori del tuo browser (F12):
      </p>
      <div class="p-5 bg-zinc-950 text-zinc-300 rounded-xl font-mono text-xs space-y-2 border border-zinc-800 shadow-inner">
        <p class="text-emerald-400"># Apri Chrome DevTools o Firefox Console (F12) -&gt; Scheda "Network"</p>
        <p>1. Carica un documento o compila l'autocertificazione.</p>
        <p>2. Disegna la tua firma e clicca "Scarica Documento".</p>
        <p class="text-amber-400">3. Risultato: Nessuna chiamata POST/PUT HTTP con i tuoi dati. Zero richieste inviate ad API esterne.</p>
      </div>
    </section>

  </div>

  <div class="border-t border-zinc-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500 font-mono">
    <span>Licenza Open Source &bull; Public Domain &bull; Zero Server</span>
    <a href="/privacy" class="text-[#2563EB] hover:underline font-semibold font-sans">Leggi l'Informativa Privacy GDPR &rarr;</a>
  </div>

</div>
