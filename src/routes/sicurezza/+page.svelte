<script lang="ts">
  import { ShieldCheck, Lock, KeyRound, Cpu, CheckCircle2, FileCode, Terminal } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Architettura di Sicurezza & Crittografia Zero-Knowledge | COMPILALO</title>
  <meta name="description" content="Whitepaper tecnico sull'architettura crittografica di COMPILALO: WebCrypto API, cifratura AES-GCM-256, PBKDF2 a 600.000 iterazioni e memoria client-side." />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-12 py-6">

  <!-- Header Whitepaper Tecnico -->
  <header class="space-y-4 border-b border-[#E4E4E7] pb-8">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-mono">
      <ShieldCheck class="w-3.5 h-3.5" />
      <span>Whitepaper Tecnico &middot; Protocollo Crittografico v1.0</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
      Architettura di Sicurezza Zero-Knowledge & Elaborazione Locale
    </h1>

    <p class="text-sm sm:text-base text-[#52525B] leading-relaxed">
      Questo documento descrive formalmente le garanzie matematiche e l'infrastruttura software alla base di COMPILALO. Dimostriamo perché è tecnicamente impossibile per i gestori del servizio o per attaccanti di rete accedere ai tuoi dati personali.
    </p>
  </header>

  <!-- Sezioni Tecniche Dettagliate -->
  <div class="space-y-10 text-sm text-[#27272A] leading-relaxed">
    
    <!-- 1. Schema del Modello di Minaccia -->
    <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-4">
      <h2 class="font-serif text-xl font-bold text-[#18181B] flex items-center space-x-2">
        <Lock class="w-5 h-5 text-[#1D4ED8]" />
        <span>1. Threat Model (Modello di Minaccia)</span>
      </h2>
      <p>
        COMPILALO assume un modello di minaccia <strong>Untrusted Server / Untrusted Network</strong>:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div class="p-4 bg-[#F9F9F8] rounded-lg border border-[#E4E4E7] space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#DC2626]">MINACCIA 1: Man-In-The-Middle (MITM)</span>
          <p class="text-xs text-[#52525B]">Intercettazione del traffico di rete tra utente e web app.</p>
          <p class="text-xs text-[#059669] font-medium">Difesa: Nessun dato anagrafico o file PDF viene mai trasmesso su rete.</p>
        </div>
        <div class="p-4 bg-[#F9F9F8] rounded-lg border border-[#E4E4E7] space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#DC2626]">MINACCIA 2: Data Breach sul Server</span>
          <p class="text-xs text-[#52525B]">Compromissione totale dell'infrastruttura di hosting.</p>
          <p class="text-xs text-[#059669] font-medium">Difesa: Il server non ospita alcun database, bucket o log anagrafico.</p>
        </div>
      </div>
    </section>

    <!-- 2. Primitive Crittografiche Implementate -->
    <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-4">
      <h2 class="font-serif text-xl font-bold text-[#18181B] flex items-center space-x-2">
        <KeyRound class="w-5 h-5 text-[#1D4ED8]" />
        <span>2. Primitive Crittografiche (WebCrypto API)</span>
      </h2>
      <p>
        Tutte le operazioni crittografiche sono implementate tramite le primitive native hardware del browser (W3C Web Cryptography API), escludendo librerie JavaScript legacy ad alto rischio di side-channel attack:
      </p>

      <div class="space-y-3 font-mono text-xs pt-2">
        <div class="p-3 bg-[#F9F9F8] rounded border border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-[#18181B]">Cifratura Simmetrica:</span>
          <span class="text-[#1D4ED8]">AES-GCM (Galois/Counter Mode) con chiave a 256 bit</span>
        </div>
        <div class="p-3 bg-[#F9F9F8] rounded border border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-[#18181B]">Key Derivation Function (KDF):</span>
          <span class="text-[#1D4ED8]">PBKDF2 con HMAC-SHA-256 e 600.000 iterazioni</span>
        </div>
        <div class="p-3 bg-[#F9F9F8] rounded border border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-[#18181B]">Vettore di Inizializzazione (IV):</span>
          <span class="text-[#1D4ED8]">12 byte crittograficamente casuali (crypto.getRandomValues)</span>
        </div>
        <div class="p-3 bg-[#F9F9F8] rounded border border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span class="font-bold text-[#18181B]">Generazione Mnemonic Seed:</span>
          <span class="text-[#1D4ED8]">12 parole BIP-39 standard (128 bit di entropia CSPRNG)</span>
        </div>
      </div>
    </section>

    <!-- 3. Ciclo di Vita del Documento PDF -->
    <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-4">
      <h2 class="font-serif text-xl font-bold text-[#18181B] flex items-center space-x-2">
        <Cpu class="w-5 h-5 text-[#1D4ED8]" />
        <span>3. Motore di Rendering PDF Client-Side</span>
      </h2>
      <p>
        I documenti PDF scaricati da COMPILALO sono generati tramite compilazione di stream binari direttamente nella memoria RAM del client:
      </p>
      <ol class="list-decimal pl-5 space-y-2 text-[#52525B]">
        <li>
          <strong>Iniezione AcroForm / Canvas:</strong> La libreria <code>pdf-lib</code> riceve il buffer binario del documento vuoto e inietta direttamente i glifi tipografici e le coordinate vettoriali.
        </li>
        <li>
          <strong>Firma Autografa Vettoriale:</strong> Il tratto grafico acquisito tramite <code>signature_pad</code> con campionamento Bézier viene serializzato in immagine ad alta definizione PNG senza perdita e fuso come XObject all'interno del PDF.
        </li>
        <li>
          <strong>Download Immediato via Blob URL:</strong> Il buffer finale viene convertito in un <code>blob:</code> URL locale e scaricato dal browser tramite l'attributo <code>download</code>. Nessun file transita né temporaneamente né permanentemente su server esterni.
        </li>
      </ol>
    </section>

    <!-- 4. Verifica Indipendente del Codice -->
    <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-4">
      <h2 class="font-serif text-xl font-bold text-[#18181B] flex items-center space-x-2">
        <Terminal class="w-5 h-5 text-[#1D4ED8]" />
        <span>4. Come Verificare la Sicurezza con i Tuoi Occhi</span>
      </h2>
      <p>
        Non fidarti delle nostre parole: verifica tu stesso con gli strumenti per sviluppatori del tuo browser (F12):
      </p>
      <div class="p-4 bg-[#18181B] text-white rounded-lg font-mono text-xs space-y-2">
        <p class="text-[#10B981]"># Apri Chrome DevTools o Firefox Console (F12) -> Scheda "Network"</p>
        <p>1. Carica un documento o compila l'autocertificazione.</p>
        <p>2. Disegna la tua firma e clicca "Scarica Documento".</p>
        <p class="text-[#FBBF24]">3. Risultato: Nessuna chiamata POST/PUT HTTP con i tuoi dati. Zero richieste inviate ad API esterne.</p>
      </div>
    </section>

  </div>

  <div class="border-t border-[#E4E4E7] pt-6 flex justify-between items-center text-xs text-[#71717A]">
    <span>Licenza Open Source MIT / Public Domain</span>
    <a href="/privacy" class="text-[#1D4ED8] hover:underline font-medium">Leggi l'Informativa Privacy GDPR &rarr;</a>
  </div>

</div>
