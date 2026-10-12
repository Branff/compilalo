<script lang="ts">
  import {
    Search,
    HelpCircle,
    MessageSquare,
    ArrowRight,
    ExternalLink,
    CheckCircle2,
    Scale,
    ShieldCheck,
    FileText,
    Tag,
    ChevronDown,
    ChevronUp,
    Sparkles
  } from 'lucide-svelte';

  interface ForumThread {
    id: string;
    slug: string;
    title: string;
    category: 'autocertificazioni' | 'deleghe' | 'disdette' | 'multe' | 'locazioni' | 'diffide';
    author: string;
    date: string;
    views: number;
    repliesCount: number;
    question: string;
    verifiedAnswer: {
      author: string;
      role: string;
      normativa: string;
      body: string;
      recommendedTemplateId: string;
      ctaLabel: string;
    };
  }

  const FORUM_THREADS: ForumThread[] = [
    {
      id: 'thread-1',
      slug: 'autocertificazione-residenza-scuola-bando',
      title: 'Come fare l\'autocertificazione di residenza per iscrizione scolastica o bando pubblico?',
      category: 'autocertificazioni',
      author: 'Chiara_B',
      date: '2 giorni fa',
      views: 1420,
      repliesCount: 4,
      question: 'Devo iscrivere mia figlia a scuola e il comune mi chiede il certificato di residenza a pagamento con marca da bollo. È vero che la Pubblica Amministrazione è obbligata ad accettare l\'autocertificazione gratuita senza bollo?',
      verifiedAnswer: {
        author: 'Sportello Civico COMPILALO',
        role: 'Orientamento Legale PA',
        normativa: 'Art. 46 D.P.R. 28 dicembre 2000, n. 445',
        body: 'Sì, assolutamente. Dal 1° gennaio 2012 (Legge 183/2011, "decertificazione"), le Pubbliche Amministrazioni e i gestori di pubblici servizi non possono più richiedere né accettare certificati rilasciati da altre PA. I funzionari che rifiutano l\'autocertificazione commettono violazione dei doveri d\'ufficio (Art. 74 DPR 445/2000). Puoi firmare la dichiarazione sostitutiva in carta semplice senza alcuna marca da bollo.',
        recommendedTemplateId: 'autocert-residenza',
        ctaLabel: 'Compila l\'Autocertificazione di Residenza'
      }
    },
    {
      id: 'thread-2',
      slug: 'ricorso-multa-autovelox-omologazione-cassazione-10505',
      title: 'Multa autovelox: come fare ricorso al Prefetto dopo la sentenza di Cassazione n. 10505/2024?',
      category: 'multe',
      author: 'Marco_Torino',
      date: '3 giorni fa',
      views: 3890,
      repliesCount: 12,
      question: 'Ho ricevuto un verbale per eccesso di velocità rilevato con dispositivo fisso. Nel verbale c\'è scritto "approvato dal Ministero" ma non c\'è scritto "omologato". Come posso impugnarlo al Prefetto entro i 60 giorni?',
      verifiedAnswer: {
        author: 'Consulenza Ricorsi CdS',
        role: 'Diritto della Circolazione Stradale',
        normativa: 'Art. 203 Codice della Strada & Cass. Civ. Sez. II, n. 10505/2024',
        body: 'La Suprema Corte di Cassazione con ordinanza n. 10505/2024 ha ribadito il principio vincolante: l\'approvazione ministeriale non equivale all\'omologazione tecnica prevista dall\'art. 142 c.6 CdS. Se il verbale non attesta la conformità ad un decreto di omologazione, l\'accertamento è nullo. Il ricorso al Prefetto va presentato entro 60 giorni dalla notifica (a mezzo PEC o raccomandata A/R) ed è esente da contributo unificato.',
        recommendedTemplateId: 'ricorso-autovelox',
        ctaLabel: 'Compila il Ricorso Autovelox Fac-simile'
      }
    },
    {
      id: 'thread-3',
      slug: 'disdetta-affitto-conduttore-gravi-motivi-6-mesi',
      title: 'Disdetta contratto di locazione per gravi motivi: come scrivere la lettera con 6 mesi di preavviso?',
      category: 'locazioni',
      author: 'Elena_F',
      date: '4 giorni fa',
      views: 2150,
      repliesCount: 6,
      question: 'Devo trasferirmi per un cambio imprevisto di sede lavorativa a 300 km. Il contratto prevede 6 mesi di preavviso. Cosa devo scrivere esattamente nella raccomandata per non perdere il deposito cauzionale?',
      verifiedAnswer: {
        author: 'Area Casa & Locazioni',
        role: 'Disciplina Contrattuale 431/98',
        normativa: 'Art. 3, comma 6, Legge 9 dicembre 1998, n. 431',
        body: 'Il conduttore può recedere in qualsiasi momento dal contratto di locazione qualora ricorrano gravi motivi, dandone comunicazione al locatore con preavviso di sei mesi tramite raccomandata con ricevuta di ritorno o PEC. I gravi motivi devono essere involontari, imprevedibili e sopravvenuti alla stipula del contratto (il trasferimento lavorativo disposto dall\'azienda è un classico grave motivo riconosciuto dalla giurisprudenza). È indispensabile specificare la causa nella lettera.',
        recommendedTemplateId: 'disdetta-locazione',
        ctaLabel: 'Genera Lettera di Disdetta Affitto'
      }
    },
    {
      id: 'thread-4',
      slug: 'delega-ritiro-raccomandata-posta-anziani',
      title: 'Come delegare un familiare al ritiro di una raccomandata o atto giudiziario alle Poste?',
      category: 'deleghe',
      author: 'Giovanni_78',
      date: '1 settimana fa',
      views: 1980,
      repliesCount: 3,
      question: 'Mia nonna ha ricevuto un avviso di giacenza per una raccomandata ma è allettata. Posso andare io con la delega scritta? Cosa serve allegare allo sportello postale?',
      verifiedAnswer: {
        author: 'Ufficio Relazioni Pubblico',
        role: 'Procedure Amministrative e Postali',
        normativa: 'Art. 38 D.P.R. 445/2000 & Condizioni Generali di Servizio Poste Italiane',
        body: 'Sì. Per ritirare la raccomandata serve la delega sottoscritta dal delegante compilata con i dati completi di entrambi, la copia del documento d\'identità del delegante in corso di validità e l\'avviso di giacenza originale. L\'art. 38 DPR 445/2000 stabilisce che le istanze sottoscritte con allegata copia del documento d\'identità sono pienamente valide senza necessità di autentica di firma.',
        recommendedTemplateId: 'delega-poste',
        ctaLabel: 'Compila la Delega Ritiro Postale'
      }
    },
    {
      id: 'thread-5',
      slug: 'diffida-ad-adempiere-15-giorni-art-1454',
      title: 'Fornitore o artigiano non consegna il lavoro: come inviare diffida ad adempiere ex art. 1454 c.c.?',
      category: 'diffide',
      author: 'Matteo_V',
      date: '5 giorni fa',
      views: 1670,
      repliesCount: 5,
      question: 'Ho pagato l\'acconto per un lavoro di falegnameria che doveva essere consegnato un mese fa. Continuano a rimandare. Come posso dare un termine perentorio scaduto il quale il contratto si risolve e posso chiedere la restituzione dei soldi?',
      verifiedAnswer: {
        author: 'Diritto delle Obbligazioni',
        role: 'Assistenza Contratti Privati',
        normativa: 'Articolo 1454 del Codice Civile',
        body: 'Lo strumento giuridico corretto è la "Diffida ad adempiere" (Art. 1454 C.C.). Devi intimare per iscritto alla controparte di eseguire la prestazione entro un termine congruo (non inferiore a 15 giorni per legge), dichiarando espressamente che, decorso inutilmente detto termine, il contratto si intenderà senz\'altro risolto di diritto. Inviare via PEC o raccomandata A/R.',
        recommendedTemplateId: 'diffida-adempiere',
        ctaLabel: 'Crea Diffida ad Adempiere (15 Giorni)'
      }
    },
    {
      id: 'thread-6',
      slug: 'disdetta-telefonia-internet-legge-bersani-costi-disattivazione',
      title: 'Disdetta contratto telefonico o fibra: posso recedere senza pagare penali illegittime?',
      category: 'disdette',
      author: 'Sara_Roma',
      date: '1 settimana fa',
      views: 3120,
      repliesCount: 8,
      question: 'L\'operatore mi chiede 80 euro di penale per chiudere la linea fissa dopo 14 mesi. È legale o si applica la Legge Bersani?',
      verifiedAnswer: {
        author: 'Tutela Consumatori Telefonia',
        role: 'Regolamentazione AGCOM',
        normativa: 'Art. 1 comma 3 Legge 40/2007 (Legge Bersani) & Delibere AGCOM',
        body: 'La Legge Bersani ha vietato penali o costi ingiustificati per il recesso anticipato o il passaggio ad altro operatore. Gli operatori possono addebitare solo i costi vivi di disattivazione rigorosamente giustificati e approvati dall\'AGCOM (in genere pari a una mensilità standard o 20-30€ al massimo). Inserisci nella lettera di disdetta la contestazione preventiva di qualsiasi penale contrattuale non conforme.',
        recommendedTemplateId: 'disdetta-telefonia',
        ctaLabel: 'Compila Disdetta Telefonia Bersani'
      }
    },
    {
      id: 'thread-7',
      slug: 'dichiarazione-sostitutiva-atto-notorio-eredi-banca',
      title: 'Sblocco conto corrente bancario defunto: come compilare l\'atto notorio degli eredi?',
      category: 'autocertificazioni',
      author: 'Luigi_Napoli',
      date: '2 settimane fa',
      views: 2840,
      repliesCount: 9,
      question: 'La banca di mio padre defunto ci chiede l\'atto notorio attestante chi sono gli eredi legittimi. Dobbiamo per forza andare dal notaio o possiamo presentare la dichiarazione sostitutiva dell\'atto di notorietà?',
      verifiedAnswer: {
        author: 'Diritto Successorio Pratico',
        role: 'Supporto Eredi e Pratiche Bancarie',
        normativa: 'Art. 47 D.P.R. 28 dicembre 2000, n. 445',
        body: 'La legge consente di attestare la qualità di erede mediante dichiarazione sostitutiva di atto di notorietà (Art. 47 DPR 445/2000). Anche gli istituti bancari privati accettano la dichiarazione sostitutiva degli eredi legittimi, solitamente con firma autenticata in comune o con allegata copia del documento d\'identità a seconda delle policy interne della banca, risparmiando centinaia di euro di parcella notarile.',
        recommendedTemplateId: 'atto-notorio-eredi',
        ctaLabel: 'Compila Atto Notorio Eredi e Successione'
      }
    },
    {
      id: 'thread-8',
      slug: 'richiesta-restituzione-cauzione-affitto-interessi',
      title: 'Il proprietario non restituisce il deposito cauzionale alla consegna delle chiavi: come richiederlo con gli interessi?',
      category: 'locazioni',
      author: 'Andrea_Milano',
      date: '1 settimana fa',
      views: 1890,
      repliesCount: 5,
      question: 'Ho riconsegnato le chiavi con verbale di rilascio firmato senza danni un mese fa. Il proprietario trattiene ancora 1.500 euro inventando scuse. Come intimare il rimborso con gli interessi legali maturati?',
      verifiedAnswer: {
        author: 'Area Inquilinato & Diritti',
        role: 'Disciplina Locatizia',
        normativa: 'Art. 11 Legge 392/1978 & Art. 1284 Codice Civile',
        body: 'Il deposito cauzionale deve essere restituito contestualmente alla riconsegna dell\'immobile se non vi sono danni accertati nel verbale di rilascio. Inoltre, per legge produce interessi legali che il proprietario deve corrispondere al conduttore al termine di ogni anno. Se non paga, invia una formale costituzione in mora con termine perentorio di 7 giorni prima di procedere per vie legali o decreto ingiuntivo.',
        recommendedTemplateId: 'sollecito-cauzione',
        ctaLabel: 'Genera Sollecito Restituzione Cauzione'
      }
    }
  ];

  let searchQuery = $state('');
  let selectedCategory = $state<string>('tutti');
  let expandedThreadId = $state<string | null>(null);

  let filteredThreads = $derived.by(() => {
    let list = FORUM_THREADS;
    if (selectedCategory !== 'tutti') {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.question.toLowerCase().includes(q) ||
        t.verifiedAnswer.body.toLowerCase().includes(q) ||
        t.verifiedAnswer.normativa.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function toggleExpand(id: string) {
    expandedThreadId = expandedThreadId === id ? null : id;
  }
</script>

<svelte:head>
  <title>Forum Civico & Guide Burocratiche PA &mdash; Risposte e Modelli Pronti | COMPILALO</title>
  <meta name="description" content="Domande, risposte legali verificate e fac-simile gratuiti per pratiche della Pubblica Amministrazione, disdette, multe, contratti di affitto e autocertificazioni DPR 445/2000." />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {#each FORUM_THREADS as thread, i}
          {
            "@type": "Question",
            "name": {JSON.stringify(thread.title)},
            "acceptedAnswer": {
              "@type": "Answer",
              "text": {JSON.stringify(thread.verifiedAnswer.body + " Riferimento normativo: " + thread.verifiedAnswer.normativa)}
            }
          }{i < FORUM_THREADS.length - 1 ? ',' : ''}
        {/each}
      ]
    }
  </script>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-10 py-4">

  <!-- Header del Forum Civico -->
  <header class="space-y-4">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#1D4ED8]">
      <MessageSquare class="w-3.5 h-3.5" />
      <span>Sportello Civico Aperto &middot; Domande Frequenti & Risposte Verificate</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
          Forum di Orientamento Civico & Modelli PA
        </h1>
        <p class="text-xs sm:text-sm text-[#52525B] mt-1 max-w-2xl leading-relaxed">
          Consulta le risposte alle problematiche burocratiche più frequenti dei cittadini italiani. Ogni risposta cita i riferimenti normativi ufficiali e ti porta direttamente al modulo fac-simile precompilato.
        </p>
      </div>

      <a
        href="/compila"
        class="px-4 py-2 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shrink-0 self-start md:self-auto"
      >
        <FileText class="w-3.5 h-3.5" />
        <span>Vedi Tutti i 32 Modelli</span>
      </a>
    </div>

    <!-- Barra di Ricerca e Categorie Programmatic SEO -->
    <div class="pt-2 space-y-3">
      <div class="relative">
        <Search class="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cerca per domanda, articolo di legge (es. 'art. 46', 'Cassazione 10505', 'affitto')..."
          class="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E4E4E7] rounded-lg craft-input shadow-sm"
        />
      </div>

      <div class="flex flex-wrap gap-1.5 text-xs">
        {#each [
          { id: 'tutti', label: 'Tutti i Temi' },
          { id: 'autocertificazioni', label: 'Autocertificazioni DPR 445' },
          { id: 'multe', label: 'Multe & Ricorsi CdS' },
          { id: 'locazioni', label: 'Casa & Affitti' },
          { id: 'deleghe', label: 'Deleghe' },
          { id: 'disdette', label: 'Disdette & Utenze' },
          { id: 'diffide', label: 'Diffide & Contratti' }
        ] as cat}
          <button
            onclick={() => selectedCategory = cat.id}
            class="px-3 py-1 rounded text-[11px] font-medium craft-transition craft-press {selectedCategory === cat.id ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E4E4E7] text-[#52525B] hover:bg-[#F9F9F8]'}"
          >
            {cat.label}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Lista Thread Q&A del Forum -->
  <div class="space-y-4">
    <div class="flex items-center justify-between text-xs text-[#71717A] border-b border-[#E4E4E7] pb-2">
      <span>{filteredThreads.length} discussioni con risposta legale verificata</span>
      <span>Ordinati per rilevanza & visualizzazioni</span>
    </div>

    {#if filteredThreads.length === 0}
      <div class="p-12 text-center bg-white border border-[#E4E4E7] rounded-xl space-y-2">
        <HelpCircle class="w-8 h-8 text-[#A1A1AA] mx-auto" />
        <p class="text-sm font-bold text-[#18181B]">Nessuna discussione trovata</p>
        <p class="text-xs text-[#71717A]">Prova a cambiare i termini di ricerca o visualizza tutti i modelli pronti.</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each filteredThreads as thread}
          <div class="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden hover:border-[#18181B] craft-transition shadow-sm">
            
            <!-- Intestazione Domanda -->
            <button
              onclick={() => toggleExpand(thread.id)}
              class="w-full p-5 text-left flex items-start justify-between gap-4 craft-press"
            >
              <div class="space-y-1.5 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[10px] font-mono uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded font-semibold">
                    {thread.category}
                  </span>
                  <span class="text-[11px] text-[#71717A]">
                    Da {thread.author} &middot; {thread.date}
                  </span>
                  <span class="text-[11px] text-[#71717A] flex items-center space-x-1">
                    <span>{thread.views} letture</span>
                  </span>
                </div>

                <h3 class="font-serif text-base sm:text-lg font-bold text-[#18181B] leading-snug">
                  {thread.title}
                </h3>

                <p class="text-xs text-[#52525B] line-clamp-2 leading-relaxed">
                  {thread.question}
                </p>
              </div>

              <div class="text-[#71717A] pt-1">
                {#if expandedThreadId === thread.id}
                  <ChevronUp class="w-5 h-5 text-[#18181B]" />
                {:else}
                  <ChevronDown class="w-5 h-5" />
                {/if}
              </div>
            </button>

            <!-- Risposta Verificata Espansa (Emil Kowalski micro-craft) -->
            {#if expandedThreadId === thread.id}
              <div class="px-5 pb-5 pt-2 border-t border-[#F2F1ED] space-y-4 bg-[#FAFAFA]">
                
                <!-- Box Risposta Verificata con Normativa -->
                <div class="bg-white border border-[#A7F3D0] rounded-lg p-4 space-y-3 shadow-xs">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECFDF5] pb-2">
                    <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                        <CheckCircle2 class="w-4 h-4" />
                      </div>
                      <div>
                        <span class="text-xs font-bold text-[#065F46]">{thread.verifiedAnswer.author}</span>
                        <span class="text-[10px] text-[#71717A] ml-1">({thread.verifiedAnswer.role})</span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-1.5 text-[11px] font-mono text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
                      <Scale class="w-3.5 h-3.5" />
                      <span>{thread.verifiedAnswer.normativa}</span>
                    </div>
                  </div>

                  <p class="text-xs sm:text-sm text-[#18181B] leading-relaxed">
                    {thread.verifiedAnswer.body}
                  </p>
                </div>

                <!-- Funnel CTA Diretto verso il Tool /compila -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                  <div class="text-xs text-[#1E40AF]">
                    <span class="font-bold">Hai bisogno di questo documento adesso?</span>
                    <p class="text-[11px] text-[#3B82F6]">Compila il modulo in memoria locale gratis senza account.</p>
                  </div>

                  <a
                    href="/compila?id={thread.verifiedAnswer.recommendedTemplateId}"
                    class="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded flex items-center justify-center space-x-1.5 craft-transition craft-press shrink-0 shadow-xs"
                  >
                    <span>{thread.verifiedAnswer.ctaLabel}</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            {/if}

          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Banner per stimolare la partecipazione civica -->
  <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-serif text-xl font-bold text-[#18181B]">Non trovi la risposta al tuo caso specifico?</h3>
        <p class="text-xs text-[#52525B] mt-1">
          Puoi caricare direttamente il foglio o PDF che ti è stato consegnato nella nostra home page: lo analizzeremo ed estrarremo i campi senza mandare alcun dato online.
        </p>
      </div>

      <a
        href="/"
        class="px-4 py-2.5 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shrink-0"
      >
        <Sparkles class="w-3.5 h-3.5 text-[#10B981]" />
        <span>Carica il tuo PDF personalizzato</span>
      </a>
    </div>
  </section>

</div>
