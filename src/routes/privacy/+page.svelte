<script lang="ts">
  import { Shield, Check, Lock, AlertCircle } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Informativa sulla Privacy (Zero-Log & GDPR Art. 25) | COMPILALO</title>
  <meta name="description" content="Informativa sulla Privacy di COMPILALO: zero dati personali raccolti, zero cookie, zero server. Massima conformità all'Articolo 25 del GDPR (Privacy by Design)." />
</svelte:head>

<div class="max-w-3xl mx-auto space-y-10 py-6">

  <!-- Header Istituzionale -->
  <header class="space-y-3 border-b border-[#E4E4E7] pb-6">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-mono">
      <Check class="w-3.5 h-3.5" />
      <span>Conformità GDPR Art. 25 &middot; Privacy by Design e by Default</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
      Informativa sul Trattamento dei Dati Personali
    </h1>

    <p class="text-xs text-[#71717A]">
      Ultimo aggiornamento: Ottobre 2026 &middot; Versione 1.0 (Zero-Log Edition)
    </p>
  </header>

  <!-- Contenuto Legale Semplice, Diretto e Vincolante -->
  <article class="space-y-8 text-sm text-[#27272A] leading-relaxed">
    
    <div class="p-4 bg-[#F9F9F8] border border-[#E4E4E7] rounded-lg text-xs space-y-2">
      <div class="font-bold text-[#18181B] uppercase tracking-wider text-[11px]">Riassunto in 10 Secondi:</div>
      <p>
        COMPILALO <strong>non raccoglie, non memorizza, non trasmette e non analizza alcun dato personale</strong>. Non chiediamo la tua email, non abbiamo server con database, non usiamo cookie di profilazione o tracciamento, e non monetizziamo in alcun modo la tua navigazione. I tuoi dati restano esclusivamente sul tuo dispositivo.
      </p>
    </div>

    <section class="space-y-3">
      <h2 class="font-serif text-lg font-bold text-[#18181B]">1. Titolare del Trattamento</h2>
      <p>
        Ai sensi del Regolamento UE 2016/679 (GDPR), poiché COMPILALO non effettua alcun trattamento di dati personali su server propri o terzi, <strong>l'utente è l'unico ed esclusivo titolare e custode dei propri dati personali</strong> elaborati all'interno del proprio browser web.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-lg font-bold text-[#18181B]">2. Tipologia di Dati Elaborati</h2>
      <p>
        Durante l'utilizzo della piattaforma, l'utente può inserire:
      </p>
      <ul class="list-disc pl-5 space-y-1 text-[#52525B]">
        <li>Dati anagrafici (Nome, Cognome, Sesso, Data e Luogo di Nascita, Codice Fiscale).</li>
        <li>Dati di residenza, contatti e recapiti.</li>
        <li>Tracciati grafici della firma autografa.</li>
        <li>Documenti PDF caricati per la compilazione.</li>
      </ul>
      <p>
        <strong>Luogo dell'elaborazione:</strong> Tutti questi dati rimangono confinati nella memoria volatile (RAM) o nella memoria protetta del browser (LocalStorage / IndexedDB del dispositivo). Nessun pacchetto di rete contenente questi dati lascia il dispositivo dell'utente.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-lg font-bold text-[#18181B]">3. Politica sui Cookie e Strumenti di Tracciamento</h2>
      <p>
        In conformità alle <em>Linee guida cookie e altri strumenti di tracciamento</em> del Garante per la Protezione dei Dati Personali (10 giugno 2021) e alla Direttiva ePrivacy:
      </p>
      <ul class="list-disc pl-5 space-y-1 text-[#52525B]">
        <li><strong>Cookie di Profilazione:</strong> ASSENTI.</li>
        <li><strong>Cookie di Terze Parti:</strong> ASSENTI.</li>
        <li><strong>Pixel di tracciamento (Meta, Google Ads, TikTok, ecc.):</strong> ASSENTI.</li>
        <li><strong>Banner Cookie:</strong> Non presente né necessario ai sensi di legge, poiché non viene installato alcun identificatore non tecnico.</li>
      </ul>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-lg font-bold text-[#18181B]">4. Base Giuridica del Trattamento (Art. 6 GDPR)</h2>
      <p>
        Poiché l'elaborazione avviene interamente in locale ad opera dello stesso interessato per l'esecuzione di una richiesta esplicita (la compilazione del proprio modulo), non sussiste alcun trasferimento di dati verso terzi.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-lg font-bold text-[#18181B]">5. Come Eliminare i Dati Memorizzati</h2>
      <p>
        L'utente mantiene in ogni istante il pieno controllo e può cancellare tutti i dati personali salvati con un solo click:
      </p>
      <ol class="list-decimal pl-5 space-y-1 text-[#52525B]">
        <li>Accedendo alla sezione <strong>"La Mia Cassaforte"</strong> e cliccando su <em>"Elimina Cassaforte Locale"</em>.</li>
        <li>Oppure cancellando i cookie e la cache del browser per il sito compilalo.it.</li>
      </ol>
    </section>

  </article>

  <div class="border-t border-[#E4E4E7] pt-6 flex justify-between items-center text-xs text-[#71717A]">
    <a href="/termini" class="text-[#1D4ED8] hover:underline font-medium">&larr; Condizioni d'Uso e Avvertenza Legale</a>
    <a href="/sicurezza" class="text-[#1D4ED8] hover:underline font-medium">Whitepaper di Sicurezza &rarr;</a>
  </div>

</div>
