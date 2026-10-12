export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Autocertificazioni' | 'Multe & Ricorsi' | 'Casa & Locazioni' | 'Deleghe' | 'Disdette' | 'Diffide';
  author: {
    name: string;
    role: string;
  };
  date: string;
  publishedAt: string; // ISO date
  readingTime: string;
  seoKeywords: string[];
  normativa: string;
  relatedTemplateId: string;
  ctaText: string;
  content: {
    heading: string;
    text: string;
  }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'guida-autocertificazione-residenza-dpr-445-2000',
    title: 'Autocertificazione di Residenza (DPR 445/2000): Quando è Obbligatoria e Come Scaricarla Gratis',
    excerpt: 'La Pubblica Amministrazione e i gestori di pubblici servizi non possono più richiedere certificati con marca da bollo. Ecco come funziona la decertificazione e come compilare la dichiarazione sostitutiva in 30 secondi.',
    category: 'Autocertificazioni',
    author: {
      name: 'Avv. Andrea De Luca',
      role: 'Diritto Amministrativo & Cittadinanza Digitale'
    },
    date: '10 Ottobre 2026',
    publishedAt: '2026-10-10',
    readingTime: '4 min',
    seoKeywords: ['autocertificazione residenza', 'dpr 445 2000 art 46', 'certificato residenza gratis', 'modulo autocertificazione residenza pdf'],
    normativa: 'Art. 46 e Art. 74 D.P.R. 28 dicembre 2000, n. 445 (modificato da L. 183/2011)',
    relatedTemplateId: 'autocert-residenza',
    ctaText: 'Compila l\'Autocertificazione di Residenza',
    content: [
      {
        heading: 'Il principio della "Decertificazione" nei rapporti con la PA',
        text: 'A partire dal 1° gennaio 2012, in applicazione dell\'articolo 15 della Legge 183/2011 che ha modificato il Testo Unico sulla documentazione amministrativa (D.P.R. 445/2000), le Pubbliche Amministrazioni italiane e i gestori di pubblici servizi (scuole, università, INPS, aziende sanitarie, fornitori di energia e gas in regime pubblico) hanno il divieto assoluto di richiedere o accettare certificati rilasciati da altri uffici pubblici. Sulle certificazioni anagrafiche rilasciate dai Comuni compare infatti per legge la dicitura: "Il presente certificato non può essere prodotto agli organi della pubblica amministrazione o ai privati gestori di pubblici servizi".'
      },
      {
        heading: 'Cosa rischia il pubblico funzionario che rifiuta l\'autocertificazione?',
        text: 'La mancata accettazione della dichiarazione sostitutiva di certificazione costituisce una formale violazione dei doveri d\'ufficio ai sensi dell\'art. 74 del D.P.R. 445/2000. Il cittadino ha il diritto di pretendere l\'acquisizione del modulo in carta semplice e, in caso di rifiuto immotivato, può segnalare l\'omissione al responsabile della prevenzione della corruzione e della trasparenza dell\'ente.'
      },
      {
        heading: 'Serve la marca da bollo?',
        text: 'Assolutamente no. Tutte le dichiarazioni sostitutive di certificazione rese ai sensi dell\'art. 46 del D.P.R. 445/2000 sono esenti dall\'imposta di bollo (D.P.R. 642/1972, Tabella B). Non è necessario acquistare marche da bollo né autenticare la firma davanti a un notaio o pubblico ufficiale: è sufficiente apporre la propria firma autografa e allegare una copia del documento d\'identità in corso di validità se presentata non di persona.'
      },
      {
        heading: 'Come compilare il documento con COMPILALO',
        text: 'Con COMPILALO non devi stampare né scansionare nulla: i tuoi dati anagrafici e il tuo indirizzo di residenza vengono posizionati sul modello conforme, la firma viene apposta direttamente dal tuo schermo (mouse o touch) e puoi scaricare il PDF pronto e legalmente inattaccabile.'
      }
    ]
  },
  {
    id: 'post-2',
    slug: 'ricorso-multa-autovelox-omologazione-cassazione-10505',
    title: 'Multa Autovelox Non Omologato: Come Fare Ricorso al Prefetto dopo Cassazione n. 10505/2024',
    excerpt: 'L\'approvazione ministeriale non equivale all\'omologazione tecnica prevista dall\'art. 142 CdS. Ecco i presupposti legali per annullare il verbale senza pagare spese di giustizia.',
    category: 'Multe & Ricorsi',
    author: {
      name: 'Dott.ssa Valeria Moretti',
      role: 'Esperta di Contenzioso della Circolazione Stradale'
    },
    date: '8 Ottobre 2026',
    publishedAt: '2026-10-08',
    readingTime: '6 min',
    seoKeywords: ['ricorso autovelox cassazione 10505 2024', 'omologazione autovelox art 142 cds', 'ricorso prefetto multa velocità fac simile', 'annullamento verbale autovelox'],
    normativa: 'Art. 203 Codice della Strada & Ordinanza Cassazione Civile Sez. II, n. 10505/2024',
    relatedTemplateId: 'ricorso-autovelox',
    ctaText: 'Genera il Ricorso Autovelox al Prefetto',
    content: [
      {
        heading: 'Il punto di svolta: l\'ordinanza n. 10505/2024 della Suprema Corte',
        text: 'Con l\'ordinanza storica n. 10505 depositata il 18 aprile 2024, la Seconda Sezione Civile della Corte di Cassazione ha definitivamente chiarito una distinzione giuridica ignorata per decenni da molti comandi di Polizia Locale: l\'approvazione ministeriale di un dispositivo autovelox NON equivale alla sua omologazione tecnica. L\'art. 142, comma 6, del Codice della Strada subordina la validità dell\'accertamento elettronico al fatto che l\'apparecchiatura sia debitamente "omologata".'
      },
      {
        heading: 'Come verificare se il verbale è viziato',
        text: 'Prendi in mano il verbale notificato. Nel corpo del testo che descrive l\'accertamento, leggi attentamente la formula utilizzata dall\'organo accertatore. Se il testo riporta esclusivamente espressioni come "dispositivo approvato con decreto ministeriale..." e omette qualsiasi riferimento a un formale "decreto di omologazione", l\'accertamento è viziato da nullità per difetto di idoneità metrologica dell\'apparecchio.'
      },
      {
        heading: 'Perché scegliere il Ricorso al Prefetto rispetto al Giudice di Pace',
        text: 'Il ricorso al Prefetto ex art. 203 CdS presenta vantaggi economici decisivi: è completamente GRATUITO, non richiede il versamento del contributo unificato (che davanti al Giudice di Pace parte da 43€ più marca da bollo) e può essere inviato comodamente tramite PEC (Posta Elettronica Certificata) entro 60 giorni dalla notifica del verbale.'
      },
      {
        heading: 'La formula difensiva da allegare',
        text: 'È fondamentale eccepire formalmente la violazione dell\'art. 142 comma 6 CdS, l\'assenza di conformità alle norme metrologiche primarie e richiedere l\'archiviazione degli atti con contestuale annullamento della sanzione pecuniaria e dell\'eventuale decurtazione dei punti patente.'
      }
    ]
  },
  {
    id: 'post-3',
    slug: 'disdetta-affitto-gravi-motivi-preavviso-6-mesi',
    title: 'Disdetta Contratto di Locazione per Gravi Motivi: Preavviso di 6 Mesi, Regole e Modello',
    excerpt: 'Quando il conduttore può recedere anticipatamente dal contratto di affitto senza perdere la caparra. Come documentare i gravi motivi e cosa scrivere nella raccomandata.',
    category: 'Casa & Locazioni',
    author: {
      name: 'Avv. Gabriele Ferri',
      role: 'Consulente Diritto Immobiliare e Locazioni'
    },
    date: '5 Ottobre 2026',
    publishedAt: '2026-10-05',
    readingTime: '5 min',
    seoKeywords: ['disdetta affitto 6 mesi preavviso', 'recesso conduttore gravi motivi l 431 98', 'lettera disdetta locazione fac simile', 'restituzione caparra affitto'],
    normativa: 'Art. 3, comma 6, Legge 9 dicembre 1998, n. 431 & Art. 1373 Codice Civile',
    relatedTemplateId: 'disdetta-locazione',
    ctaText: 'Compila la Lettera di Disdetta Affitto',
    content: [
      {
        heading: 'Cosa si intende per "Gravi Motivi" ai sensi della Legge 431/98',
        text: 'L\'articolo 3, comma 6, della Legge 431/98 riconosce al conduttore la facoltà di recedere in qualsiasi momento dal contratto di locazione ad uso abitativo, purché ricorrano "gravi motivi", dando comunicazione al locatore con un preavviso minimo di sei mesi. Secondo l\'orientamento costante della Corte di Cassazione, i motivi devono essere: (1) involontari, (2) imprevedibili al momento della stipula, e (3) sopravvenuti successivamente, tali da rendere oltremodo gravosa la prosecuzione del rapporto contrattuale.'
      },
      {
        heading: 'Esempi tipici riconosciuti dalla giurisprudenza',
        text: 'Rientrano pacificamente tra i gravi motivi: il trasferimento lavorativo in un comune distante imposto dal datore di lavoro; la perdita improvvisa del posto di lavoro o una riduzione drastica dello stipendio; gravi e documentati problemi di salute personali o di un convivente che rendano inidoneo l\'alloggio (es. sopraggiunta disabilità motoria in palazzo senza ascensore); insorgenza di gravi molestie condominiali o vizi insalubri dell\'immobile non risolti dal proprietario.'
      },
      {
        heading: 'L\'obbligo inderogabile di specificare il motivo nella raccomandata',
        text: 'Un errore frequentissimo che invalida il recesso è inviare una lettera generica con scritto "recedo per motivi personali". La Cassazione (sent. n. 24266/2020) stabilisce che la comunicazione deve enunciare in modo puntuale le ragioni del recesso, al fine di consentire al locatore di verificarne la veridicità. La lettera va recapitata tramite raccomandata A/R o PEC.'
      },
      {
        heading: 'I canoni durante i 6 mesi e la restituzione della cauzione',
        text: 'Durante il semestre di preavviso il conduttore è tenuto a versare regolarmente il canone pattuito, anche se lascia l\'immobile in anticipo. Al termine dei sei mesi, contestualmente alla riconsegna delle chiavi e al verbale di rilascio senza danni, il proprietario ha l\'obbligo legale di restituire per intero il deposito cauzionale maggiorato degli interessi legali maturati.'
      }
    ]
  },
  {
    id: 'post-4',
    slug: 'delega-ritiro-raccomandata-poste-documenti',
    title: 'Delega Ritiro Raccomandata alle Poste: Modello, Documenti da Allegare e Regole',
    excerpt: 'Cosa serve per ritirare una raccomandata o un pacco al posto di un familiare, anziano o persona impossibilitata. Le regole di Poste Italiane e la validità dell\'art. 38 DPR 445/2000.',
    category: 'Deleghe',
    author: {
      name: 'Sportello Civico COMPILALO',
      role: 'Semplificazione Burocratica per Cittadini'
    },
    date: '3 Ottobre 2026',
    publishedAt: '2026-10-03',
    readingTime: '3 min',
    seoKeywords: ['delega ritiro raccomandata poste', 'modulo delega poste pdf', 'delega ritiro pacco familiare', 'art 38 dpr 445 2000'],
    normativa: 'Art. 38 D.P.R. 28 dicembre 2000, n. 445 & Condizioni Generali Servizio Postale Universale',
    relatedTemplateId: 'delega-poste',
    ctaText: 'Compila la Delega per Ritiro Postale',
    content: [
      {
        heading: 'Cosa portare allo sportello postale',
        text: 'Quando il postino lascia un avviso di giacenza nella cassetta delle lettere per una raccomandata, un atto giudiziario o un pacco, il destinatario impossibilitato può delegare una terza persona maggiorenne al ritiro. Per procedere al ritiro senza contestazioni da parte dell\'operatore di sportello, sono necessari tre elementi: (1) l\'avviso di giacenza originale (o scontrino di mancato recapito), (2) il foglio di delega debitamente compilato e firmato dal delegante, e (3) la fotocopia fronte/retro del documento d\'identità del delegante in corso di validità.'
      },
      {
        heading: 'La firma non richiede alcuna autentica notarile',
        text: 'In base all\'art. 38 del D.P.R. 445/2000, le istanze e le deleghe rivolte a soggetti incaricati di pubblico servizio sono pienamente efficaci e valide se sottoscritte dall\'interessato e presentate unitamente alla fotocopia non autenticata di un documento di riconoscimento. Non serve recarsi in comune per autenticare la firma.'
      },
      {
        heading: 'Attenzione alle raccomandate con atti giudiziari (busta verde)',
        text: 'Per gli atti giudiziari (codici 75, 76, 77, 78) o le comunicazioni di avvenuta notifica (CAN), la delega deve contenere espressa menzione del potere di ritirare notifiche di atti giudiziari e il delegato deve esibire il proprio documento in originale allo sportellista.'
      }
    ]
  },
  {
    id: 'post-5',
    slug: 'diffida-ad-adempiere-art-1454-codice-civile-15-giorni',
    title: 'Diffida ad Adempiere ex Art. 1454 C.C.: Come Intimare il Termine di 15 Giorni',
    excerpt: 'Fornitore in ritardo, lavori incompiuti o mancata consegna? Ecco come impostare la diffida per ottenere la risoluzione di diritto del contratto e il rimborso degli acconti.',
    category: 'Diffide',
    author: {
      name: 'Avv. Marco Bellini',
      role: 'Diritto Contrattuale e Recupero Crediti'
    },
    date: '1 Ottobre 2026',
    publishedAt: '2026-10-01',
    readingTime: '5 min',
    seoKeywords: ['diffida ad adempiere art 1454', 'termine 15 giorni diffida fac simile', 'risoluzione contratto inadempimento', 'lettera intimazione adempiere'],
    normativa: 'Articolo 1454 del Codice Civile',
    relatedTemplateId: 'diffida-adempiere',
    ctaText: 'Crea la Diffida ad Adempiere (15 Giorni)',
    content: [
      {
        heading: 'La differenza tra un semplice sollecito e la diffida ad adempiere',
        text: 'Spesso, di fronte a un fornitore che ritarda la consegna o a un\'impresa che interrompe i lavori, si inviano email o telefonate informali. Questi solleciti non hanno alcun effetto risolutivo. La "Diffida ad adempiere" disciplinata dall\'art. 1454 del Codice Civile è l\'unico atto stragiudiziale che provoca la risoluzione automatica ("di diritto") del contratto senza dover attendere anni per una causa in tribunale.'
      },
      {
        heading: 'I tre requisiti di validità imposti dalla legge',
        text: 'Affinché la diffida produca i suoi effetti legali, devono sussistere inderogabilmente tre requisiti: (1) L\'intimazione esplicita ad adempiere la prestazione specificando esattamente cosa manca; (2) La concessione di un termine congruo, che per legge NON può essere inferiore a 15 giorni (salvo accordi contrattuali diversi o natura speciale della prestazione); (3) L\'avvertimento espresso che, decorso inutilmente il termine assegnato, il contratto si intenderà senz\'altro risolto di diritto.'
      },
      {
        heading: 'Cosa succede allo scadere del quindicesimo giorno',
        text: 'Allo scoccare del quindicesimo giorno dalla ricezione della PEC o della raccomandata, se la controparte non ha eseguito la prestazione, il vincolo contrattuale cessa istantaneamente. Da quel momento il debitore è costituito in mora, è tenuto all\'immediata restituzione degli acconti percepiti e al risarcimento di tutti i danni patrimoniali causati.'
      }
    ]
  },
  {
    id: 'post-6',
    slug: 'disdetta-telefonia-fibra-legge-bersani-senza-penali',
    title: 'Disdetta Telefonia e Fibra: Come Recedere Senza Penali con la Legge Bersani',
    excerpt: 'Gli operatori telefonici non possono imporre penali per recesso anticipato. Come contestare costi di disattivazione illegittimi e inviare la disdetta corretta via PEC o raccomandata.',
    category: 'Disdette',
    author: {
      name: 'Dott.ssa Sara Conti',
      role: 'Osservatorio Diritti dei Consumatori & Telecomunicazioni'
    },
    date: '28 Settembre 2026',
    publishedAt: '2026-09-28',
    readingTime: '4 min',
    seoKeywords: ['disdetta telefono legge bersani', 'penali recesso anticipato internet', 'modulo disdetta telecom vodafone fastweb windtre', 'costi disattivazione illegittimi'],
    normativa: 'Art. 1, comma 3, Legge 2 aprile 2007, n. 40 (Legge Bersani) & Delibera AGCOM 487/18/CONS',
    relatedTemplateId: 'disdetta-telefonia',
    ctaText: 'Compila la Disdetta Telefonia Legge Bersani',
    content: [
      {
        heading: 'Cosa prevede la Legge Bersani (L. 40/2007)',
        text: 'La Legge 40/2007 ha stabilito un principio fondamentale di libertà per gli utenti: i contratti per adesione stipulati con operatori telefonici, internet e pay-tv devono prevedere la facoltà del contraente di recedere dal contratto o di trasferire le utenze presso altro operatore in qualsiasi momento, senza vincoli temporali e senza l\'addebito di penali o spese non giustificate dai costi dell\'operatore.'
      },
      {
        heading: 'La stretta dell\'AGCOM sui costi di disattivazione',
        text: 'L\'Autorità per le Garanzie nelle Comunicazioni (AGCOM) con la delibera 487/18/CONS ha imposto limiti rigidissimi: i gestori non possono addebitare cifre arbitrarie a titolo di costo di disattivazione o chiusura linea. L\'importo massimo addebitabile non può eccedere il canone mensile standard o il costo reale sostenuto dal gestore (in media tra i 20€ e i 30€).'
      },
      {
        heading: 'Come evitare il rinnovo automatico e addebiti su conto corrente',
        text: 'Inviando la disdetta a mezzo PEC o raccomandata con ricevuta di ritorno con 30 giorni di preavviso, specifica esplicitamente la contestazione preventiva di qualsiasi addebito forfettario non documentato e diffida il gestore dall\'effettuare addebiti SDD sul tuo conto bancario oltre la data di cessazione.'
      }
    ]
  },
  {
    id: 'post-7',
    slug: 'dichiarazione-sostitutiva-atto-notorio-eredi-banca',
    title: 'Atto Notorio Eredi e Successione: Come Sbloccare il Conto Corrente del Defunto',
    excerpt: 'La banca ti chiede l\'atto notorio per sbloccare l\'eredità? Non serve spendere centinaia di euro dal notaio: ecco come utilizzare la dichiarazione sostitutiva ex art. 47 DPR 445/2000.',
    category: 'Autocertificazioni',
    author: {
      name: 'Avv. Andrea De Luca',
      role: 'Diritto Amministrativo & Cittadinanza Digitale'
    },
    date: '24 Settembre 2026',
    publishedAt: '2026-09-24',
    readingTime: '5 min',
    seoKeywords: ['atto notorio eredi banca', 'dichiarazione sostitutiva successione art 47', 'sblocco conto corrente defunto senza notaio', 'modulo eredi legittimi pdf'],
    normativa: 'Art. 47 D.P.R. 28 dicembre 2000, n. 445',
    relatedTemplateId: 'atto-notorio-eredi',
    ctaText: 'Compila l\'Atto Notorio Eredi e Successione',
    content: [
      {
        heading: 'Il blocco operativo dei rapporti bancari post-mortem',
        text: 'Alla morte di un correntista, l\'istituto bancario o postale, una volta venuto a conoscenza dell\'evento (o su comunicazione dei familiari), procede al blocco cautelare del conto corrente, dei depositi titoli e delle cassette di sicurezza fino alla corretta identificazione di tutti gli eredi legittimi o testamentari, al fine di scongiurare prelievi non autorizzati.'
      },
      {
        heading: 'Perché la banca accetta la dichiarazione sostitutiva',
        text: 'Molti cittadini credono erroneamente che per attestare la qualità di erede sia indispensabile recarsi presso un notaio o presso la cancelleria del tribunale pagando parcelle salate e marche da bollo. L\'art. 47 del D.P.R. 445/2000 consente invece di dichiarare sotto la propria personale responsabilità stati, fatti e qualità personali mediante dichiarazione sostitutiva di atto di notorietà, pienamente accettata dagli istituti bancari (con autentica di firma in comune o con fotocopia del documento a seconda del regolamento interno della banca).'
      },
      {
        heading: 'Cosa deve contenere la dichiarazione degli eredi',
        text: 'Il modulo deve indicare chiaramente: la data e il luogo del decesso del de cuius; l\'inesistenza di disposizioni testamentarie (oppure la presenza di un testamento regolarmente pubblicato); l\'elenco analitico di tutti gli eredi con grado di parentela, dati anagrafici e codice fiscale; e l\'attestazione che non sussistono altri soggetti aventi diritto alla successione legittima.'
      }
    ]
  },
  {
    id: 'post-8',
    slug: 'restituzione-cauzione-affitto-interessi-legali-sollecito',
    title: 'Cauzione Affitto Non Restituita: Come Pretendere il Rimborso con gli Interessi',
    excerpt: 'Il proprietario trattiene la caparra dopo il rilascio dell\'immobile senza verbale di danni? Ecco la procedura legale per intimare il pagamento entro 7 giorni con gli interessi maturati.',
    category: 'Casa & Locazioni',
    author: {
      name: 'Avv. Gabriele Ferri',
      role: 'Consulente Diritto Immobiliare e Locazioni'
    },
    date: '20 Settembre 2026',
    publishedAt: '2026-09-20',
    readingTime: '4 min',
    seoKeywords: ['restituzione cauzione affitto interessi legali', 'lettera sollecito caparra proprietario', 'art 11 legge 392 1978', 'mancata restituzione deposito cauzionale'],
    normativa: 'Art. 11 Legge 27 luglio 1978, n. 392 & Art. 1284 Codice Civile',
    relatedTemplateId: 'sollecito-cauzione',
    ctaText: 'Genera il Sollecito Restituzione Cauzione',
    content: [
      {
        heading: 'La funzione giuridica del deposito cauzionale',
        text: 'Il deposito cauzionale versato all\'inizio della locazione (massimo 3 mensilità per legge ai sensi dell\'art. 11 L. 392/1978) ha la sola e unica funzione di garantire il locatore contro eventuali danni materiali arrecati all\'immobile o inadempimenti nel pagamento dei canoni. Il proprietario non può trattenerlo arbitrariamente come "compensazione" per presunta usura ordinaria o per spese non concordate.'
      },
      {
        heading: 'Il verbale di riconsegna delle chiavi fa fede',
        text: 'Se al momento della riconsegna dell\'appartamento è stato redatto e sottoscritto dalle parti il verbale di rilascio attestante il buono stato dell\'immobile e la riconsegna delle chiavi, il locatore non ha alcun diritto di trattenere il deposito: la somma deve essere restituita contestualmente, con assegno circolare o bonifico bancario.'
      },
      {
        heading: 'Il diritto inderogabile agli interessi legali',
        text: 'L\'articolo 11 della Legge 392/78 stabilisce espressamente che il deposito cauzionale produce frutti civili: il proprietario è obbligato a corrispondere al conduttore gli interessi legali al termine di ciascun anno di locazione. Qualsiasi clausola contrattuale che escluda il pagamento degli interessi è considerata nulla di diritto.'
      },
      {
        heading: 'Come procedere se il locatore fa finta di niente',
        text: 'Invia una formale messa in mora tramite PEC o raccomandata A/R assegnando un termine perentorio di 7 giorni per il versamento integrale della somma comprensiva di tutti gli interessi maturati calcolati secondo i saggi legali dell\'art. 1284 c.c., avvisando che in difetto si procederà immediatamente con ricorso per decreto ingiuntivo provvisoriamente esecutivo.'
      }
    ]
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
