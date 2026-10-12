<script lang="ts">
  import { Shield, Lock, Cpu, Heart, CheckCircle2, ArrowRight, Quote } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Il Manifesto Civico di COMPILALO &mdash; Privacy Radicale e Democrazia Burocratica</title>
  <meta name="description" content="Il manifesto filosofico di COMPILALO: perché la burocrazia deve essere accessibile, gratuita e priva di sorveglianza digitale." />
  <link rel="canonical" href="https://compilalo.it/manifesto" />
  <meta property="og:title" content="Il Manifesto Civico di COMPILALO" />
  <meta property="og:description" content="La burocrazia appartiene ai cittadini, non ai server. Perché l'unico modo per proteggere i tuoi dati è non possederli affatto." />
  <meta property="og:url" content="https://compilalo.it/manifesto" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Il Manifesto Civico di COMPILALO",
      "description": "Principi fondativi di sovranità digitale, crittografia client-side e burocrazia gratuita per i cittadini.",
      "url": "https://compilalo.it/manifesto",
      "inLanguage": "it-IT"
    }
  </script>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-12 py-4">

  <!-- Header Istituzionale & Editoriale -->
  <header class="space-y-4 border-b border-zinc-200 pb-8">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#09090B] text-white text-xs font-mono uppercase tracking-wider">
      <span>Manifesto Fondativo &bull; Ottobre 2026</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] leading-[1.12]">
      La Burocrazia Appartiene ai Cittadini, Non ai Server.
    </h1>

    <p class="text-base sm:text-lg text-zinc-600 leading-relaxed font-serif italic">
      &ldquo;La privacy non &egrave; un segreto da nascondere. &Egrave; il potere di decidere selettivamente cosa rivelare al mondo.&rdquo; &mdash; Eric Hughes, 1993
    </p>
  </header>

  <!-- Corpo del Manifesto -->
  <article class="space-y-8 text-base text-zinc-800 leading-relaxed">
    
    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#09090B]">1. Il Paradosso della Digitalizzazione Italiana</h2>
      <p class="text-zinc-600 leading-relaxed">
        Negli ultimi quindici anni, la promessa della semplificazione digitale si &egrave; trasformata in una gabbia di complessit&agrave;. Per compilare una semplice autocertificazione di residenza o una delega per ritirare una raccomandata, un cittadino si trova davanti a due sole strade:
      </p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-600">
        <li>
          <strong>Portali commerciali predatori:</strong> siti che promettono moduli gratuiti ma richiedono l'iscrizione a pagamento, l'inserimento della carta di credito con abbonamenti ricorrenti ingannevoli da 39&euro; al mese, o la monetizzazione dei dati personali tramite database pubblicitari.
        </li>
        <li>
          <strong>Interfacce di stato bizantine:</strong> moduli PDF scansionati storti, campi non compilabili, software legacy e trafile burocratiche che costringono il cittadino a stampare, compilare a penna, scansionare e ricaricare fogli di carta.
        </li>
      </ul>
      <p class="text-zinc-600 leading-relaxed">
        COMPILALO nasce come atto di disobbedienza civile digitale: <strong>costo zero assoluto, zero registrazione, zero server di tracciamento.</strong>
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#09090B]">2. Il Principio della Privacy Radicale (Zero-Knowledge)</h2>
      <p class="text-zinc-600 leading-relaxed">
        Non crediamo nelle informative sulla privacy di quaranta pagine che dicono <em>&ldquo;ci prendiamo cura dei tuoi dati&rdquo;</em> mentre li archiviano su un database cloud vulnerabile o li profilano per scopi commerciali.
      </p>
      <div class="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-1">
        <p class="font-serif text-lg font-bold text-[#09090B]">
          L'unico modo per proteggere i dati di un cittadino &egrave; non possederli affatto.
        </p>
        <p class="text-xs text-zinc-500">
          Architettura deterministica a conoscenza zero ex Art. 25 GDPR (Privacy by Design).
        </p>
      </div>
      <p class="text-zinc-600 leading-relaxed">
        Su COMPILALO, i tuoi dati anagrafici, il tuo codice fiscale, la tua firma autografa e i tuoi contratti non viaggiano mai su un server. Tutta l'elaborazione del file PDF avviene all'interno del tuo dispositivo (nel tuo browser) tramite codice WebAssembly e WebCrypto. Quando chiudi la scheda del browser, non rimane un solo byte sui nostri sistemi, perch&eacute; i nostri sistemi semplicemente non raccolgono dati.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#09090B]">3. Local-First: Tu Possiedi i Tuoi Dati</h2>
      <p class="text-zinc-600 leading-relaxed">
        Ispirandoci al paradigma <em>Local-First Software</em>, la tua cassaforte risiede nella memoria protetta del tuo computer o del tuo smartphone. &Egrave; cifrata con standard crittografici bancari (AES-GCM a 256 bit) derivati da una passphrase di 12 parole.
      </p>
      <p class="text-zinc-600 leading-relaxed">
        Se domani COMPILALO dovesse sparire da internet, il codice salvato sulla tua Progressive Web App continuer&agrave; a funzionare offline, per sempre. Nessuna multinazionale pu&ograve; spegnere il tuo diritto a compilare i tuoi documenti.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#09090B]">4. Nessun AI Slop, Nessun Algoritmo Opaco</h2>
      <p class="text-zinc-600 leading-relaxed">
        Rifiutiamo l'intelligenza artificiale usata come mero trucco di marketing. Riconosciamo i campi dei moduli attraverso algoritmi deterministici matematici, parsing formale di coordinate AcroForm e dizionari catastali ufficiali.
      </p>
      <p class="text-zinc-600 leading-relaxed">
        L'AI deve rimanere uno strumento al servizio della precisione dell'utente, eseguito sul dispositivo o a zero-dati-personali, mai un pretesto per espropriare i cittadini della propria riservatezza.
      </p>
    </section>

    <section class="space-y-4">
      <h2 class="font-serif text-2xl font-bold text-[#09090B]">5. Il Patto con la Collettivit&agrave;</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div class="craft-card rounded-xl p-5 space-y-1.5 border border-zinc-200">
          <span class="font-mono text-xs font-bold text-emerald-700 uppercase">GRATIS PER SEMPRE</span>
          <p class="text-xs text-zinc-600">Nessuna versione premium, nessun paywall nascosto, nessun abbonamento.</p>
        </div>
        <div class="craft-card rounded-xl p-5 space-y-1.5 border border-zinc-200">
          <span class="font-mono text-xs font-bold text-[#2563EB] uppercase">ZERO COOKIE</span>
          <p class="text-xs text-zinc-600">Nessun banner cookie necessario: zero cookie di terze parti, zero pixel di tracciamento.</p>
        </div>
        <div class="craft-card rounded-xl p-5 space-y-1.5 border border-zinc-200">
          <span class="font-mono text-xs font-bold text-zinc-900 uppercase">PUBBLICO DOMINIO</span>
          <p class="text-xs text-zinc-600">Tutti i modelli seguono fedelmente la legge italiana e il DPR 445/2000 in pubblico dominio.</p>
        </div>
        <div class="craft-card rounded-xl p-5 space-y-1.5 border border-zinc-200">
          <span class="font-mono text-xs font-bold text-blue-700 uppercase">SOVRANIT&Agrave; DIGITALE</span>
          <p class="text-xs text-zinc-600">I tuoi dati rimangono sul tuo dispositivo. La crittografia appartiene a chi la usa.</p>
        </div>
      </div>
    </section>

  </article>

  <!-- CTA Finale -->
  <div class="craft-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-zinc-200/90 shadow-sm">
    <div>
      <h3 class="font-serif text-xl font-bold text-[#09090B]">Inizia a compilare senza compromessi</h3>
      <p class="text-xs text-zinc-600 mt-1">Scegli uno dei 32 modelli gratuiti o carica il tuo modulo PDF.</p>
    </div>

    <a
      href="/compila"
      class="px-5 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 craft-transition craft-press shrink-0 shadow-sm"
    >
      <span>Apri il Catalogo Modelli</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

</div>
