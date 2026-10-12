<script lang="ts">
  import { Shield, Lock, Cpu, Heart, CheckCircle2, ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Il Manifesto Civico di COMPILALO &mdash; Privacy Radicale e Democrazia Burocratica</title>
  <meta name="description" content="Il manifesto filosofico di COMPILALO: perché la burocrazia deve essere accessibile, gratuita e priva di sorveglianza digitale." />
</svelte:head>

<div class="max-w-3xl mx-auto space-y-12 py-6">

  <!-- Header Istituzionale & Editoriale -->
  <header class="space-y-4 border-b border-[#E4E4E7] pb-8">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-mono uppercase tracking-wider">
      <span>Manifesto Fondativo &middot; Anno 2026</span>
    </div>

    <h1 class="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#18181B] leading-tight">
      La Burocrazia Appartiene ai Cittadini, Non ai Server.
    </h1>

    <p class="text-base sm:text-lg text-[#52525B] leading-relaxed font-serif italic">
      "La privacy non è un segreto da nascondere. È il potere di decidere selettivamente cosa rivelare al mondo." &mdash; Eric Hughes, 1993
    </p>
  </header>

  <!-- Corpo del Manifesto -->
  <article class="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-[#27272A] leading-relaxed">
    
    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#18181B]">1. Il Paradosso della Digitalizzazione Italiana</h2>
      <p>
        Negli ultimi quindici anni, la promessa della semplificazione digitale si è trasformata in una gabbia di complessità. Per compilare una semplice autocertificazione di residenza o una delega per ritirare una raccomandata, un cittadino si trova davanti a due sole strade:
      </p>
      <ul class="list-disc pl-5 space-y-2 text-[#52525B]">
        <li>
          <strong>Portali commerciali predatori:</strong> siti che promettono moduli gratuiti ma richiedono l'iscrizione a pagamento, l'inserimento della carta di credito con abbonamenti ricorrenti ingannevoli da 39€ al mese, o la monetizzazione dei dati personali tramite database pubblicitari.
        </li>
        <li>
          <strong>Interfacce di stato bizantine:</strong> moduli PDF scansionati storti, campi non compilabili, software legacy e trafile burocratiche che costringono il cittadino a stampare, compilare a penna, scansionare e ricaricare fogli di carta.
        </li>
      </ul>
      <p>
        COMPILALO nasce come atto di disobbedienza civile digitale: <strong>costo zero assoluto, zero registrazione, zero server di tracciamento.</strong>
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#18181B]">2. Il Principio della Privacy Radicale (Zero-Knowledge)</h2>
      <p>
        Non crediamo nelle informative sulla privacy di quaranta pagine che dicono <em>"ci prendiamo cura dei tuoi dati"</em> mentre li archiviano su un database cloud vulnerabile o li profilano per scopi commerciali.
      </p>
      <p class="font-medium text-[#18181B] bg-[#F9F9F8] p-4 rounded-lg border-l-4 border-[#1D4ED8]">
        L'unico modo per proteggere i dati di un cittadino è non possederli affatto.
      </p>
      <p>
        Su COMPILALO, i tuoi dati anagrafici, il tuo codice fiscale, la tua firma autografa e i tuoi contratti non viaggiano mai su un server. Tutta l'elaborazione del file PDF avviene all'interno del tuo dispositivo (nel tuo browser) tramite codice WebAssembly e WebCrypto. Quando chiudi la scheda del browser, non rimane un solo byte sui nostri sistemi, perché i nostri sistemi semplicemente non raccolgono dati.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#18181B]">3. Local-First: Tu Possiedi i Tuoi Dati</h2>
      <p>
        Ispirandoci al paradigma <em>Local-First Software</em>, la tua "cassaforte" risiede nella memoria protetta del tuo computer o del tuo smartphone. È cifrata con standard crittografici bancari (AES-GCM a 256 bit) derivati da una passphrase di 12 parole.
      </p>
      <p>
        Se domani COMPILALO dovesse sparire da internet, il codice salvato sulla tua Progressive Web App continuerà a funzionare offline, per sempre. Nessuna multinazionale può spegnere il tuo diritto a compilare i tuoi documenti.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#18181B]">4. Nessun AI Slop, Nessun Algoritmo Opaco</h2>
      <p>
        Rifiutiamo l'intelligenza artificiale usata come mero trucco di marketing. Riconosciamo i campi dei moduli attraverso algoritmi deterministici matematici, parsing formale di coordinate AcroForm e dizionari catastali ufficiali.
      </p>
      <p>
        L'AI deve rimanere uno strumento al servizio della precisione dell'utente, eseguito sul dispositivo o a zero-dati-personali, mai un pretesto per espropriare i cittadini della propria riservatezza.
      </p>
    </section>

    <section class="space-y-3">
      <h2 class="font-serif text-2xl font-bold text-[#18181B]">5. Il Patto con la Collettività</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div class="p-4 bg-white border border-[#E4E4E7] rounded-lg space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#059669]">GRATIS PER SEMPRE</span>
          <p class="text-xs text-[#52525B]">Nessuna versione premium, nessun paywall nascosto, nessun abbonamento.</p>
        </div>
        <div class="p-4 bg-white border border-[#E4E4E7] rounded-lg space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#1D4ED8]">ZERO COOKIE</span>
          <p class="text-xs text-[#52525B]">Nessun banner cookie necessario: zero cookie di terze parti, zero pixel di tracciamento.</p>
        </div>
        <div class="p-4 bg-white border border-[#E4E4E7] rounded-lg space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#18181B]">PUBBLICO DOMINIO</span>
          <p class="text-xs text-[#52525B]">Tutti i modelli seguono fedelmente la legge italiana e il DPR 445/2000 in pubblico dominio.</p>
        </div>
        <div class="p-4 bg-white border border-[#E4E4E7] rounded-lg space-y-1.5">
          <span class="font-mono text-xs font-bold text-[#7C3AED]">SOVRANITÀ DIGITALE</span>
          <p class="text-xs text-[#52525B]">I tuoi dati rimangono sul tuo ferro. La crittografia appartiene a chi la usa.</p>
        </div>
      </div>
    </section>

  </article>

  <!-- CTA Finale -->
  <div class="p-6 sm:p-8 bg-white border border-[#E4E4E7] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h3 class="font-serif text-lg font-bold text-[#18181B]">Inizia a compilare senza compromessi</h3>
      <p class="text-xs text-[#71717A] mt-0.5">Scegli uno dei 32 modelli gratuiti o carica il tuo modulo PDF.</p>
    </div>

    <a
      href="/compila"
      class="px-5 py-2.5 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shrink-0"
    >
      <span>Apri il Catalogo Modelli</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

</div>
