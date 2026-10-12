import type { DocumentTemplate } from '$lib/types';

export const TEMPLATES_CATALOG: DocumentTemplate[] = [
  // =========================================================================
  // CATEGORIA 1: AUTOCERTIFICAZIONI (D.P.R. 445/2000)
  // =========================================================================
  {
    id: 'autocertificazione-residenza',
    slug: 'autocertificazione-residenza-famiglia',
    title: 'Autocertificazione di Residenza e Stato di Famiglia',
    category: 'autocertificazioni',
    description: 'Dichiarazione sostitutiva per certificare la propria residenza e i componenti conviventi della famiglia.',
    normativaRiferimento: 'Art. 46 D.P.R. 28 dicembre 2000, n. 445',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'dataNascita', canonicalKey: 'dataNascita', label: 'Data di Nascita', type: 'date', required: true },
      { id: 'luogoNascita', canonicalKey: 'luogoNascita', label: 'Comune di Nascita', type: 'text', required: true },
      { id: 'provinciaNascita', canonicalKey: 'provinciaNascita', label: 'Provincia di Nascita', type: 'text', required: true },
      { id: 'indirizzoResidenza', canonicalKey: 'indirizzoResidenza', label: 'Indirizzo di Residenza', type: 'text', required: true },
      { id: 'comuneResidenza', canonicalKey: 'comuneResidenza', label: 'Comune di Residenza', type: 'text', required: true },
      { id: 'provinciaResidenza', canonicalKey: 'provinciaResidenza', label: 'Provincia di Residenza', type: 'text', required: true },
      { id: 'capResidenza', canonicalKey: 'capResidenza', label: 'CAP', type: 'text', required: true },
      { id: 'statoCivile', canonicalKey: 'statoCivile', label: 'Stato Civile', type: 'select', options: ['Celibe / Nubile', 'Coniugato/a', 'Unito/a Civilmente', 'Separato/a', 'Divorziato/a', 'Vedovo/a'], required: false },
      { id: 'dichiarazioneFamiglia', canonicalKey: 'dichiarazioneFamiglia', label: 'Componenti Famiglia Convivente (Nome, Cognome, Parentela)', type: 'textarea', required: false },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data del documento', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DICHIARAZIONE SOSTITUTIVA DI CERTIFICAZIONE
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
nato/a a ${v.luogoNascita || '...'} (${v.provinciaNascita || '..'}) il ${v.dataNascita || '...'},
codice fiscale: ${v.codiceFiscale || '...'},
residente a ${v.comuneResidenza || '...'} (${v.provinciaResidenza || '..'}) in ${v.indirizzoResidenza || '...'}, CAP ${v.capResidenza || '...'},

consapevole delle sanzioni penali richiamate dall'art. 76 del D.P.R. 445/2000 in caso di dichiarazioni mendaci,

DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ:
1. Di essere attualmente residente all'indirizzo sopra indicato;
2. Di essere di stato civile: ${v.statoCivile || 'non specificato'};
3. Che la propria famiglia anagrafica convivente è così composta:
${v.dichiarazioneFamiglia ? v.dichiarazioneFamiglia : 'Nessun altro componente convivente oltre al sottoscritto.'}

Informativa privacy (art. 13 Reg. UE 2016/679): I dati personali forniti saranno trattati esclusivamente per il procedimento per il quale sono resi.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del dichiarante: _______________________`
  },
  {
    id: 'atto-notorio-generico',
    slug: 'dichiarazione-sostitutiva-atto-notorieta',
    title: 'Dichiarazione Sostitutiva di Atto di Notorietà (Art. 47)',
    category: 'autocertificazioni',
    description: 'Per attestare qualsiasi stato, fatto o qualità personale a diretta conoscenza non compreso nei certificati standard.',
    normativaRiferimento: 'Art. 47 D.P.R. 28 dicembre 2000, n. 445',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'dichiarante_nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'dichiarante_cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'dichiarante_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'dichiarante_luogoNascita', canonicalKey: 'luogoNascita', label: 'Comune di Nascita', type: 'text', required: true },
      { id: 'dichiarante_dataNascita', canonicalKey: 'dataNascita', label: 'Data di Nascita', type: 'date', required: true },
      { id: 'dichiarante_residenza', canonicalKey: 'indirizzoResidenza', label: 'Indirizzo e Comune di Residenza', type: 'text', required: true },
      { id: 'testoDichiarazione', canonicalKey: 'testoDichiarazione', label: 'Fatti, Stati o Qualità Personali da Dichiarare', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DICHIARAZIONE SOSTITUTIVA DELL'ATTO DI NOTORIETÀ
(Art. 47 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.dichiarante_cognome || '...'} ${v.dichiarante_nome || '...'},
nato/a a ${v.dichiarante_luogoNascita || '...'} il ${v.dichiarante_dataNascita || '...'},
codice fiscale: ${v.dichiarante_cf || '...'},
residente a: ${v.dichiarante_residenza || '...'},

consapevole delle conseguenze penali in caso di dichiarazioni false ai sensi dell'art. 76 del D.P.R. 445/2000,

DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ:
${v.testoDichiarazione || 'Che i fatti e le circostanze di seguito esposte corrispondono a verità.'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del dichiarante: _______________________`
  },
  {
    id: 'autocertificazione-nascita-cittadinanza',
    slug: 'autocertificazione-nascita-cittadinanza',
    title: 'Autocertificazione di Nascita e Cittadinanza',
    category: 'autocertificazioni',
    description: 'Attesta data, comune di nascita e possesso continuativo della cittadinanza italiana.',
    normativaRiferimento: 'Art. 46 comma 1 lett. a) e g) D.P.R. 445/2000',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'dataNascita', canonicalKey: 'dataNascita', label: 'Data di Nascita', type: 'date', required: true },
      { id: 'luogoNascita', canonicalKey: 'luogoNascita', label: 'Comune di Nascita', type: 'text', required: true },
      { id: 'provinciaNascita', canonicalKey: 'provinciaNascita', label: 'Provincia di Nascita', type: 'text', required: true },
      { id: 'cittadinanza', canonicalKey: 'cittadinanza', label: 'Cittadinanza', type: 'text', required: true, defaultValue: 'Italiana' },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AUTOCERTIFICAZIONE DI NASCITA E CITTADINANZA
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
codice fiscale: ${v.codiceFiscale || '...'},

DICHIARA:
1. Di essere nato/a a ${v.luogoNascita || '...'} (${v.provinciaNascita || '..'}) in data ${v.dataNascita || '...'};
2. Di essere cittadino/a ${v.cittadinanza || 'Italiano/a'} e di non aver mai perso la cittadinanza.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },
  {
    id: 'autocertificazione-titolo-studio',
    slug: 'autocertificazione-titolo-studio-qualifica',
    title: 'Autocertificazione Titolo di Studio e Qualifica Professionale',
    category: 'autocertificazioni',
    description: 'Dichiara il conseguimento di diploma, laurea, master o iscrizione a ordini professionali.',
    normativaRiferimento: 'Art. 46 comma 1 lett. m) D.P.R. 445/2000',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'titoloStudio', canonicalKey: 'titoloStudio', label: 'Titolo di Studio Conseguito (es. Laurea Magistrale in Giurisprudenza)', type: 'text', required: true },
      { id: 'istitutoConseguimento', canonicalKey: 'istitutoConseguimento', label: 'Università / Istituto Scolastico', type: 'text', required: true },
      { id: 'annoConseguimento', canonicalKey: 'annoConseguimento', label: 'Anno Accademico / Data Conseguimento', type: 'text', required: true },
      { id: 'votazione', canonicalKey: 'votazione', label: 'Votazione Finale (Opzionale)', type: 'text', required: false },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AUTOCERTIFICAZIONE TITOLO DI STUDIO
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
codice fiscale: ${v.codiceFiscale || '...'},

DICHIARA:
Di aver conseguito il seguente titolo di studio:
- Titolo: ${v.titoloStudio || '...'}
- Istituto / Ateneo: ${v.istitutoConseguimento || '...'}
- Data / Anno: ${v.annoConseguimento || '...'}
- Votazione: ${v.votazione || 'Non specificata'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },
  {
    id: 'autocertificazione-godimento-diritti-politici',
    slug: 'autocertificazione-godimento-diritti-politici',
    title: 'Autocertificazione Diritti Politici e Assenza Condanne Penali',
    category: 'autocertificazioni',
    description: 'Certifica il godimento dei diritti elettorali e la non sussistenza di condanne penali o misure di sicurezza.',
    normativaRiferimento: 'Art. 46 comma 1 lett. d) e aa) D.P.R. 445/2000',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'comuneIscrizioneListe', canonicalKey: 'comuneResidenza', label: 'Comune di Iscrizione nelle Liste Elettorali', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DICHIARAZIONE SOSTITUTIVA DIRITTI POLITICI E CASELLARIO GIUDIZIALE
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
codice fiscale: ${v.codiceFiscale || '...'},

DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ:
1. Di godere pienamente dei diritti civili e politici e di essere iscritto/a nelle liste elettorali del Comune di ${v.comuneIscrizioneListe || '...'};
2. Di non aver riportato condanne penali e di non essere destinatario/a di provvedimenti che riguardano l'applicazione di misure di sicurezza o di prevenzione;
3. Di non essere a conoscenza di essere sottoposto/a a procedimenti penali pendenti.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },
  {
    id: 'autocertificazione-esistenza-in-vita',
    slug: 'autocertificazione-esistenza-in-vita',
    title: 'Autocertificazione di Esistenza in Vita',
    category: 'autocertificazioni',
    description: 'Dichiarazione richiesta da enti pensionistici (INPS, casse professionali o estere) per l’erogazione dei trattamenti.',
    normativaRiferimento: 'Art. 46 comma 1 lett. e) D.P.R. 445/2000',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'comuneResidenza', canonicalKey: 'comuneResidenza', label: 'Comune di Residenza', type: 'text', required: true },
      { id: 'indirizzoResidenza', canonicalKey: 'indirizzoResidenza', label: 'Indirizzo', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AUTOCERTIFICAZIONE DI ESISTENZA IN VITA
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
codice fiscale: ${v.codiceFiscale || '...'}, residente in ${v.indirizzoResidenza || '...'}, ${v.comuneResidenza || '...'},

DICHIARA:
A tutti gli effetti di legge di essere in vita alla data odierna.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },
  {
    id: 'autocertificazione-decesso-familiare',
    slug: 'autocertificazione-morte-familiare',
    title: 'Autocertificazione di Morte del Familiare / Coniuge',
    category: 'autocertificazioni',
    description: 'Dichiara il decesso del coniuge, genitore o parente per pratiche successorie, utenze o INPS.',
    normativaRiferimento: 'Art. 46 comma 1 lett. h) D.P.R. 445/2000',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'dichiarante_nome', canonicalKey: 'nome', label: 'Nome del Dichiarante', type: 'text', required: true },
      { id: 'dichiarante_cognome', canonicalKey: 'cognome', label: 'Cognome del Dichiarante', type: 'text', required: true },
      { id: 'dichiarante_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Dichiarante', type: 'text', required: true },
      { id: 'defunto_nome', canonicalKey: 'defunto_nome', label: 'Nome del Defunto', type: 'text', required: true },
      { id: 'defunto_cognome', canonicalKey: 'defunto_cognome', label: 'Cognome del Defunto', type: 'text', required: true },
      { id: 'defunto_cf', canonicalKey: 'defunto_cf', label: 'Codice Fiscale Defunto', type: 'text', required: true },
      { id: 'gradoParentela', canonicalKey: 'gradoParentela', label: 'Grado di Parentela (es. Coniuge, Figlio/a, Fratello/Sorella)', type: 'text', required: true },
      { id: 'luogoDecesso', canonicalKey: 'luogoDecesso', label: 'Comune del Decesso', type: 'text', required: true },
      { id: 'dataDecesso', canonicalKey: 'dataDecesso', label: 'Data del Decesso', type: 'date', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AUTOCERTIFICAZIONE DI DECESSO
(Art. 46 D.P.R. 28 dicembre 2000, n. 445)

Il/La sottoscritto/a ${v.dichiarante_cognome || '...'} ${v.dichiarante_nome || '...'},
codice fiscale: ${v.dichiarante_cf || '...'}, in qualità di ${v.gradoParentela || 'parente'},

DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ:
Che il/la Sig./Sig.ra ${v.defunto_cognome || '...'} ${v.defunto_nome || '...'},
codice fiscale: ${v.defunto_cf || '...'},
è deceduto/a a ${v.luogoDecesso || '...'} in data ${v.dataDecesso || '...'}.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },

  // =========================================================================
  // CATEGORIA 2: DELEGHE
  // =========================================================================
  {
    id: 'delega-ritiro-documenti',
    slug: 'delega-ritiro-documenti-pacchi',
    title: 'Delega per Ritiro Documenti, Pacchi o Corrispondenza',
    category: 'deleghe',
    description: 'Delega formale per incaricare un’altra persona al ritiro di atti, raccomandate, pacchi postali o certificati.',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'delegante_nome', canonicalKey: 'nome', label: 'Nome del Delegante', type: 'text', required: true },
      { id: 'delegante_cognome', canonicalKey: 'cognome', label: 'Cognome del Delegante', type: 'text', required: true },
      { id: 'delegante_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Delegante', type: 'text', required: true },
      { id: 'delegato_nome', canonicalKey: 'delegato_nome', label: 'Nome del Delegato', type: 'text', required: true },
      { id: 'delegato_cognome', canonicalKey: 'delegato_cognome', label: 'Cognome del Delegato', type: 'text', required: true },
      { id: 'delegato_cf', canonicalKey: 'delegato_cf', label: 'Codice Fiscale Delegato', type: 'text', required: true },
      { id: 'delegato_documento', canonicalKey: 'delegato_documento', label: 'Tipo e N. Documento Delegato (es. C.I. CA12345AA)', type: 'text', required: true },
      { id: 'oggettoDelega', canonicalKey: 'oggettoDelega', label: 'Oggetto della Delega (es. Ritiro raccomandata n. 12345 presso Poste Italiane)', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `ATTO DI DELEGA FORMALE

Il/La sottoscritto/a ${v.delegante_cognome || '...'} ${v.delegante_nome || '...'},
Codice Fiscale: ${v.delegante_cf || '...'},

DELEGA
Il/La Sig./Sig.ra ${v.delegato_cognome || '...'} ${v.delegato_nome || '...'},
Codice Fiscale: ${v.delegato_cf || '...'},
identificato/a con documento: ${v.delegato_documento || '...'},

A svolgere per proprio conto le seguenti operazioni:
${v.oggettoDelega || 'Ritiro documenti/pacchi e sottoscrizione dei relativi registri.'}

Si allega alla presente copia del documento di identità del delegante in corso di validità.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Delegante: _______________________`
  },
  {
    id: 'delega-assemblea-condominio',
    slug: 'delega-assemblea-condominio',
    title: 'Delega per Assemblea di Condominio (con Istruzioni di Voto)',
    category: 'deleghe',
    description: 'Delega ex art. 67 Disp. Att. C.C. per farsi rappresentare in assemblea ordinaria o straordinaria di condominio.',
    normativaRiferimento: 'Art. 67 Disposizioni di Attuazione del Codice Civile',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'delegante_nome', canonicalKey: 'nome', label: 'Nome Condòmino Delegante', type: 'text', required: true },
      { id: 'delegante_cognome', canonicalKey: 'cognome', label: 'Cognome Condòmino Delegante', type: 'text', required: true },
      { id: 'condominioNome', canonicalKey: 'condominioNome', label: 'Nome del Condominio e Indirizzo', type: 'text', required: true },
      { id: 'millesimi', canonicalKey: 'millesimi', label: 'Millesimi di Proprietà / Subalterno', type: 'text', required: true },
      { id: 'delegato_nominativo', canonicalKey: 'delegato_nominativo', label: 'Nome e Cognome della Persona Delegata', type: 'text', required: true },
      { id: 'dataAssemblea', canonicalKey: 'dataAssemblea', label: 'Data dell’Assemblea (Prima o Seconda Convocazione)', type: 'date', required: true },
      { id: 'istruzioniVoto', canonicalKey: 'istruzioniVoto', label: 'Eventuali Istruzioni di Voto o Limitazioni', type: 'textarea', required: false },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DELEGA PER ASSEMBLEA DI CONDOMINIO
(Ai sensi dell'art. 67 Disp. Att. Codice Civile)

Il/La sottoscritto/a ${v.delegante_cognome || '...'} ${v.delegante_nome || '...'},
proprietario/a dell'unità immobiliare sita nel Condominio: ${v.condominioNome || '...'},
con caratura millesimale pari a: ${v.millesimi || '...'} millesimi,

DELEGA
Il/La Sig./Sig.ra ${v.delegato_nominativo || '...'}
a rappresentarlo/a a tutti gli effetti di legge nell'assemblea condominiale indetta per il giorno ${v.dataAssemblea || '...'}, approvando sin d'ora il suo operato.

Istruzioni e vincoli di voto:
${v.istruzioniVoto || 'Pieni poteri di discussione e voto su tutti i punti all’ordine del giorno. È vietata la sub-delega ad alcuno.'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Condòmino Delegante: _______________________`
  },
  {
    id: 'delega-operazioni-postali',
    slug: 'delega-operazioni-postali-sportello',
    title: 'Delega per Operazioni Postali e Ritiro Pensione',
    category: 'deleghe',
    description: 'Incarico per compiere prelievi, invio o ritiro vaglia e pensioni presso gli uffici di Poste Italiane.',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'delegante_nome', canonicalKey: 'nome', label: 'Nome Titolare/Pensionato', type: 'text', required: true },
      { id: 'delegante_cognome', canonicalKey: 'cognome', label: 'Cognome Titolare/Pensionato', type: 'text', required: true },
      { id: 'delegante_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Delegante', type: 'text', required: true },
      { id: 'delegato_nominativo', canonicalKey: 'delegato_nominativo', label: 'Nome e Cognome del Delegato', type: 'text', required: true },
      { id: 'delegato_cf', canonicalKey: 'delegato_cf', label: 'Codice Fiscale Delegato', type: 'text', required: true },
      { id: 'tipoOperazione', canonicalKey: 'tipoOperazione', label: 'Dettaglio Operazione Autorizzata', type: 'text', required: true, defaultValue: 'Ritiro rateo pensione / operazione su libretto o c/c postale' },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DELEGA OPERAZIONI POSTALI

Il/La sottoscritto/a ${v.delegante_cognome || '...'} ${v.delegante_nome || '...'},
Codice Fiscale: ${v.delegante_cf || '...'},

DELEGA
Il/La Sig./Sig.ra ${v.delegato_nominativo || '...'},
Codice Fiscale: ${v.delegato_cf || '...'},

A compiere per proprio conto presso l'ufficio postale di competenza la seguente operazione:
${v.tipoOperazione || 'Riscossione e quietanza rateo pensionistico o operazioni collegate.'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Delegante: _______________________`
  },
  {
    id: 'delega-sanitaria-referti',
    slug: 'delega-sanitaria-ritiro-referti',
    title: 'Delega Sanitaria per Ritiro Referti ed Esami Medici',
    category: 'deleghe',
    description: 'Autorizza un familiare o terzo di fiducia al ritiro di analisi cliniche e cartelle nel rispetto del GDPR e segreto medico.',
    normativaRiferimento: 'Regolamento UE 2016/679 (GDPR) e Codice Privacy',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'paziente_nome', canonicalKey: 'nome', label: 'Nome Paziente', type: 'text', required: true },
      { id: 'paziente_cognome', canonicalKey: 'cognome', label: 'Cognome Paziente', type: 'text', required: true },
      { id: 'paziente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Paziente', type: 'text', required: true },
      { id: 'strutturaSanitaria', canonicalKey: 'strutturaSanitaria', label: 'Ospedale / ASL / Laboratorio', type: 'text', required: true },
      { id: 'delegato_nominativo', canonicalKey: 'delegato_nominativo', label: 'Nome e Cognome Delegato', type: 'text', required: true },
      { id: 'delegato_documento', canonicalKey: 'delegato_documento', label: 'Documento d’Identità Delegato', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `DELEGA PER IL RITIRO DI REFERTI MEDICI E DOCUMENTAZIONE CLINICA

Spett.le Struttura Sanitaria: ${v.strutturaSanitaria || '...'}

Il/La sottoscritto/a ${v.paziente_cognome || '...'} ${v.paziente_nome || '...'},
Codice Fiscale: ${v.paziente_cf || '...'},

DELEGA
Il/La Sig./Sig.ra ${v.delegato_nominativo || '...'},
identificato/a con documento: ${v.delegato_documento || '...'},

Al ritiro delle risposte degli esami clinici e referti diagnostici a me intestati, sollevando la struttura da ogni vincolo relativo al segreto professionale nei confronti del delegato.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Paziente: _______________________`
  },

  // =========================================================================
  // CATEGORIA 3: DISDETTE & RECESSI
  // =========================================================================
  {
    id: 'disdetta-contratto-diffida',
    slug: 'disdetta-contratto-utenza-diffida',
    title: 'Disdetta Contratto Telefonia / Internet (L. Bersani n. 40/2007)',
    category: 'disdette',
    description: 'Recesso da contratti telefonici e internet con divieto assoluto di penali ingiustificate o ulteriori addebiti SDD/RID.',
    normativaRiferimento: 'Art. 1 comma 3 Legge 40/2007 (Decreto Bersani) e Codice del Consumo',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'mittente_nome', canonicalKey: 'nome', label: 'Nome Intestatario', type: 'text', required: true },
      { id: 'mittente_cognome', canonicalKey: 'cognome', label: 'Cognome Intestatario', type: 'text', required: true },
      { id: 'mittente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'mittente_indirizzo', canonicalKey: 'indirizzoResidenza', label: 'Indirizzo e Città', type: 'text', required: true },
      { id: 'operatore_destinatario', canonicalKey: 'operatore_destinatario', label: 'Operatore (es. TIM, Vodafone, WindTre, Fastweb)', type: 'text', required: true },
      { id: 'numero_utenza', canonicalKey: 'numero_utenza', label: 'Numero Linea o Codice Cliente', type: 'text', required: true },
      { id: 'codice_migrazione', canonicalKey: 'codice_migrazione', label: 'Codice Migrazione (Se presente)', type: 'text', required: false },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Spettabile ${v.operatore_destinatario || 'Società Erogatrice'}
Ufficio Recessi e Gestione Contrattuale

OGGETTO: COMUNICAZIONE DI RECESSO IMMEDIATO AI SENSI DELL'ART. 1 COMMA 3 L. 40/2007
Utenza / Codice Cliente: ${v.numero_utenza || '...'}
${v.codice_migrazione ? `Codice di Migrazione: ${v.codice_migrazione}` : ''}

Il/La sottoscritto/a ${v.mittente_cognome || '...'} ${v.mittente_nome || '...'},
Codice Fiscale: ${v.mittente_cf || '...'}, residente in ${v.mittente_indirizzo || '...'},
in qualità di intestatario del contratto in oggetto,

COMUNICA
il formale recesso dal contratto con effetto immediato o entro il termine massimo di legge di 30 giorni dalla ricezione della presente.

DIFFIDA
la società in indirizzo dall'applicare penali contrattuali non conformi alla Legge 40/2007 e intima la contestuale revoca dell'autorizzazione all'addebito diretto su conto corrente (SDD/RID bancario).

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma dell'Intestatario: _______________________`
  },
  {
    id: 'disdetta-palestra-abbonamento',
    slug: 'disdetta-palestra-abbonamento-sportivo',
    title: 'Disdetta Abbonamento Palestra o Centro Sportivo',
    category: 'disdette',
    description: 'Comunicazione di disdetta anticipata o mancato rinnovo automatico per palestra o piscina con blocco pagamenti.',
    normativaRiferimento: 'Art. 1469-bis C.C. e D.Lgs. 206/2005 (Clausole Vessatorie)',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome Iscritto', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome Iscritto', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'nomeStruttura', canonicalKey: 'nomeStruttura', label: 'Nome della Palestra / Centro Sportivo', type: 'text', required: true },
      { id: 'numeroTessera', canonicalKey: 'numeroTessera', label: 'Numero Tessera / Iscrizione', type: 'text', required: true },
      { id: 'motivoRecesso', canonicalKey: 'motivoRecesso', label: 'Motivo (es. Scadenza naturale / Trasferimento / Motivi di salute)', type: 'text', required: true, defaultValue: 'Scadenza naturale e diniego di rinnovo tacito' },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Spettabile Direzione di: ${v.nomeStruttura || '...'}

OGGETTO: DISDETTA E MANCATO RINNOVO ABBONAMENTO
Tessera n.: ${v.numeroTessera || '...'}

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
Codice Fiscale: ${v.codiceFiscale || '...'},

COMUNICA
la disdetta del proprio abbonamento sportivo per: ${v.motivoRecesso || 'mancato rinnovo a scadenza'}.
Con la presente si diffida la struttura dal procedere a qualsiasi ulteriore addebito RID/SEPA o su carta di credito a decorrere dalla data della presente.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },
  {
    id: 'disdetta-polizza-assicurativa',
    slug: 'disdetta-polizza-assicurativa-scadenza',
    title: 'Disdetta Polizza Assicurativa a Scadenza (Art. 1899 C.C.)',
    category: 'disdette',
    description: 'Disdetta di polizze infortuni, vita, casa o sanitarie inviata nel rispetto del termine di preavviso contrattuale.',
    normativaRiferimento: 'Art. 1899 Codice Civile e L. 221/2012',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'assicurato_nome', canonicalKey: 'nome', label: 'Nome Contraente', type: 'text', required: true },
      { id: 'assicurato_cognome', canonicalKey: 'cognome', label: 'Cognome Contraente', type: 'text', required: true },
      { id: 'assicurato_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'compagniaAssicurativa', canonicalKey: 'compagniaAssicurativa', label: 'Compagnia di Assicurazione ed Agenzia', type: 'text', required: true },
      { id: 'numeroPolizza', canonicalKey: 'numeroPolizza', label: 'Numero di Polizza', type: 'text', required: true },
      { id: 'dataScadenzaPolizza', canonicalKey: 'dataScadenzaPolizza', label: 'Data Scadenza Annuale', type: 'date', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Spettabile Compagnia: ${v.compagniaAssicurativa || '...'}

OGGETTO: DISDETTA FORMALE POLIZZA ASSICURATIVA N. ${v.numeroPolizza || '...'}
Scadenza contrattuale del: ${v.dataScadenzaPolizza || '...'}

Il/La sottoscritto/a ${v.assicurato_cognome || '...'} ${v.assicurato_nome || '...'},
Codice Fiscale: ${v.assicurato_cf || '...'},

COMUNICA
ai sensi dell'art. 1899 del Codice Civile la formale disdetta della polizza assicurativa in epigrafe alla sua naturale scadenza, intendendo cessare ogni vincolo e copertura a partire da tale data.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Contraente: _______________________`
  },
  {
    id: 'disdetta-fornitura-luce-gas',
    slug: 'recesso-fornitura-energia-gas',
    title: 'Recesso e Chiusura Fornitura Energia Elettrica / Gas',
    category: 'disdette',
    description: 'Richiesta di cessazione fornitura con chiusura e piombatura del contatore (POD / PDR).',
    normativaRiferimento: 'Delibere ARERA in materia di recesso dei clienti finali',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome Intestatario', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome Intestatario', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'fornitore', canonicalKey: 'fornitore', label: 'Fornitore Elettricità/Gas', type: 'text', required: true },
      { id: 'codicePodPdr', canonicalKey: 'codicePodPdr', label: 'Codice POD (Luce) o PDR (Gas)', type: 'text', required: true },
      { id: 'indirizzoFornitura', canonicalKey: 'indirizzoFornitura', label: 'Indirizzo del Punto di Fornitura', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Spettabile Società: ${v.fornitore || '...'}

OGGETTO: RICHIESTA DI CHIUSURA FORNITURA E CESSAZIONE PUNTO
Punto POD/PDR: ${v.codicePodPdr || '...'}
Indirizzo di Fornitura: ${v.indirizzoFornitura || '...'}

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
Codice Fiscale: ${v.codiceFiscale || '...'},

CHIEDE
la formale cessazione della fornitura e la disattivazione del contatore per il punto sopra identificato, con emissione della fattura di conguaglio e chiusura definitiva.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma dell'Intestatario: _______________________`
  },
  {
    id: 'dichiarazione-non-detenzione-tv',
    slug: 'esenzione-canone-rai-non-detenzione-tv',
    title: 'Esenzione Canone RAI per Mancata Detenzione TV',
    category: 'disdette',
    description: 'Dichiarazione sostitutiva all’Agenzia delle Entrate per attestare che nessun componente possiede apparecchi televisivi.',
    normativaRiferimento: 'Art. 1, commi da 152 a 160 della Legge 28 dicembre 2015, n. 208',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'nome', canonicalKey: 'nome', label: 'Nome', type: 'text', required: true },
      { id: 'cognome', canonicalKey: 'cognome', label: 'Cognome', type: 'text', required: true },
      { id: 'codiceFiscale', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'annoRiferimento', canonicalKey: 'annoRiferimento', label: 'Anno di Riferimento per l’Esenzione', type: 'text', required: true, defaultValue: '2026' },
      { id: 'codicePod', canonicalKey: 'codicePod', label: 'Codice POD Utenza Elettrica Domestica', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `ALL'AGENZIA DELLE ENTRATE - DIREZIONE PROVINCIALE I DI TORINO
Ufficio Canone TV

DICHIARAZIONE SOSTITUTIVA RELATIVA AL CANONE DI ABBONAMENTO ALLA TELEVISIONE PER USO PRIVATO
(Quadro A - Non detenzione di apparecchi TV)

Il/La sottoscritto/a ${v.cognome || '...'} ${v.nome || '...'},
Codice Fiscale: ${v.codiceFiscale || '...'},
titolare dell'utenza elettrica di tipo domestico residenziale contraddistinta dal codice POD: ${v.codicePod || '...'},

DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ:
Che in nessuna delle abitazioni per le quali il dichiarante è titolare di utenza elettrica di tipo domestico residenziale è detenuto un apparecchio televisivo da parte di alcun componente della famiglia anagrafica per l'anno ${v.annoRiferimento || '2026'}.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Dichiarante: _______________________`
  },

  // =========================================================================
  // CATEGORIA 4: MULTE & RICORSI
  // =========================================================================
  {
    id: 'ricorso-multa-prefetto',
    slug: 'ricorso-multa-prefetto-cds',
    title: 'Ricorso al Prefetto per Sanzione Stradale / Autovelox (Art. 203 CdS)',
    category: 'multe',
    description: 'Ricorso gratuito senza spese legali per contestare verbali di violazione del Codice della Strada dinanzi al Prefetto.',
    normativaRiferimento: 'Art. 203 D.Lgs. 30 aprile 1992, n. 285 (Codice della Strada)',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'ricorrente_nome', canonicalKey: 'nome', label: 'Nome del Ricorrente', type: 'text', required: true },
      { id: 'ricorrente_cognome', canonicalKey: 'cognome', label: 'Cognome del Ricorrente', type: 'text', required: true },
      { id: 'ricorrente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'ricorrente_residenza', canonicalKey: 'indirizzoResidenza', label: 'Indirizzo di Residenza Completo', type: 'text', required: true },
      { id: 'prefettura_competente', canonicalKey: 'prefettura_competente', label: 'Prefettura di Competenza (es. Prefettura di Milano)', type: 'text', required: true },
      { id: 'comando_accertatore', canonicalKey: 'comando_accertatore', label: 'Comando Accertatore (es. Polizia Locale di Milano)', type: 'text', required: true },
      { id: 'verbale_numero', canonicalKey: 'verbale_numero', label: 'Numero e Registro del Verbale', type: 'text', required: true },
      { id: 'verbale_data', canonicalKey: 'verbale_data', label: 'Data di Notifica del Verbale', type: 'date', required: true },
      { id: 'targa_veicolo', canonicalKey: 'targaVeicolo', label: 'Targa del Veicolo', type: 'text', required: true },
      { id: 'motivi_ricorso', canonicalKey: 'motivi_ricorso', label: 'Motivi di Opposizione (Vizio di notifica, mancata taratura autovelox, segnaletica inesistente)', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AL SIG. PREFETTO DI: ${v.prefettura_competente || '...'}
(Per il tramite del Comando: ${v.comando_accertatore || '...'})

RICORSO AMMINISTRATIVO EX ART. 203 D.LGS. 285/1992 (C.d.S.)

Il/La sottoscritto/a ${v.ricorrente_cognome || '...'} ${v.ricorrente_nome || '...'},
Codice Fiscale: ${v.ricorrente_cf || '...'}, residente in ${v.ricorrente_residenza || '...'},
proprietario/conducente del veicolo targato: ${v.targa_veicolo || '...'},

PREMESSO CHE
in data ${v.verbale_data || '...'} gli veniva notificato il verbale n. ${v.verbale_numero || '...'} elevato dal Comando in indirizzo;

PROPONE FORMALE RICORSO PER I SEGUENTI MOTIVI:
${v.motivi_ricorso || 'Illegittimità dell’accertamento per violazione delle norme sulla segnaletica e difetto di omologazione/taratura periodica dell’apparecchiatura di rilevazione.'}

CHIEDE
l'annullamento e l'archiviazione del verbale impugnato per insussistenza della violazione contestata.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Ricorrente: _______________________`
  },
  {
    id: 'ricorso-multa-ztl',
    slug: 'ricorso-multa-ztl-varco-permesso',
    title: 'Ricorso per Transito in ZTL (Permesso Valido / Varco Non Segnalato)',
    category: 'multe',
    description: 'Opposizione a verbale per presunto accesso abusivo in Zona a Traffico Limitato in presenza di pass disabili, residenti o varco spento.',
    normativaRiferimento: 'Art. 203 CdS e Art. 7 Codice della Strada',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'ricorrente_nome', canonicalKey: 'nome', label: 'Nome del Ricorrente', type: 'text', required: true },
      { id: 'ricorrente_cognome', canonicalKey: 'cognome', label: 'Cognome del Ricorrente', type: 'text', required: true },
      { id: 'ricorrente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'verbale_numero', canonicalKey: 'verbale_numero', label: 'Numero del Verbale', type: 'text', required: true },
      { id: 'targa_veicolo', canonicalKey: 'targaVeicolo', label: 'Targa Veicolo', type: 'text', required: true },
      { id: 'varcoZtl', canonicalKey: 'varcoZtl', label: 'Varco d’Ingresso Contestato', type: 'text', required: true },
      { id: 'tipoAutorizzazione', canonicalKey: 'tipoAutorizzazione', label: 'Dettagli Permesso / Ragione di Esenzione (es. CUDE disabili n. 1234 / Permesso carico-scarico)', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AL PREFETTO COMPETENTE
(Per il tramite del Comando di Polizia Locale)

OGGETTO: RICORSO CONTRO VERBALE DI VIOLAZIONE ZTL N. ${v.verbale_numero || '...'}
Veicolo Targato: ${v.targa_veicolo || '...'} - Varco: ${v.varcoZtl || '...'}

Il/La sottoscritto/a ${v.ricorrente_cognome || '...'} ${v.ricorrente_nome || '...'},
Codice Fiscale: ${v.ricorrente_cf || '...'},

CHIEDE L'ANNULLAMENTO DEL VERBALE IN QUANTO:
Il transito è avvenuto nel pieno rispetto della normativa in virtù della seguente valida causa di giustificazione:
${v.tipoAutorizzazione || 'Veicolo munito di regolare contrassegno / autorizzazione all’accesso temporaneo.'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },
  {
    id: 'comunicazione-dati-conducente',
    slug: 'comunicazione-dati-conducente-decurtazione-punti',
    title: 'Comunicazione Dati Conducente per Decurtazione Punti (Art. 126-bis CdS)',
    category: 'multe',
    description: 'Modulo obbligatorio da inviare entro 60 giorni dalla notifica per indicare chi era alla guida ed evitare la sanzione aggiuntiva ex art. 126-bis c.2.',
    normativaRiferimento: 'Art. 126-bis comma 2 D.Lgs. 285/1992',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'proprietario_nome', canonicalKey: 'nome', label: 'Nome del Proprietario', type: 'text', required: true },
      { id: 'proprietario_cognome', canonicalKey: 'cognome', label: 'Cognome del Proprietario', type: 'text', required: true },
      { id: 'verbale_numero', canonicalKey: 'verbale_numero', label: 'Numero del Verbale', type: 'text', required: true },
      { id: 'conducente_nome', canonicalKey: 'conducente_nome', label: 'Nome Effettivo Conducente', type: 'text', required: true },
      { id: 'conducente_cognome', canonicalKey: 'conducente_cognome', label: 'Cognome Effettivo Conducente', type: 'text', required: true },
      { id: 'conducente_cf', canonicalKey: 'conducente_cf', label: 'Codice Fiscale Conducente', type: 'text', required: true },
      { id: 'patenteNumero', canonicalKey: 'patenteNumero', label: 'Numero Patente di Guida', type: 'text', required: true },
      { id: 'patenteRilascio', canonicalKey: 'patenteRilascio', label: 'Rilasciata da e Scadenza Patente', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AL COMANDO ACCERTATORE

OGGETTO: DICHIARAZIONE DEI DATI DEL CONDUCENTE AI SENSI DELL'ART. 126-BIS COMMA 2 C.D.S.
Verbale n. ${v.verbale_numero || '...'}

Il/La sottoscritto/a ${v.proprietario_cognome || '...'} ${v.proprietario_nome || '...'}, in qualità di proprietario/obbligato in solido del veicolo,

DICHIARA
che all'ora e nel luogo dell'infrazione indicata nel verbale, il veicolo era condotto da:
Sig./Sig.ra: ${v.conducente_cognome || '...'} ${v.conducente_nome || '...'}
Codice Fiscale: ${v.conducente_cf || '...'}
Titolare di patente di guida n.: ${v.patenteNumero || '...'} (${v.patenteRilascio || '...'})

Si allega copia fotostatica della patente di guida sottoscritta dal conducente.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Proprietario: _______________________
Firma del Conducente (per presa visione): _______________________`
  },

  // =========================================================================
  // CATEGORIA 5: LOCAZIONI & CASA
  // =========================================================================
  {
    id: 'recesso-locazione-abitativa',
    slug: 'recesso-locazione-conduttore-gravi-motivi',
    title: 'Recesso del Conduttore per Gravi Motivi (Art. 3 c.6 L. 431/1998)',
    category: 'locazioni',
    description: 'Lettera raccomandata con preavviso legale di 6 mesi per rilasciare l’immobile in locazione per motivi gravi e imprevedibili.',
    normativaRiferimento: 'Art. 3, comma 6, Legge 9 dicembre 1998, n. 431',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'conduttore_nome', canonicalKey: 'nome', label: 'Nome Inquilino (Conduttore)', type: 'text', required: true },
      { id: 'conduttore_cognome', canonicalKey: 'cognome', label: 'Cognome Inquilino (Conduttore)', type: 'text', required: true },
      { id: 'conduttore_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Inquilino', type: 'text', required: true },
      { id: 'locatore_nominativo', canonicalKey: 'locatore_nominativo', label: 'Nome e Cognome Proprietario (Locatore)', type: 'text', required: true },
      { id: 'locatore_indirizzo', canonicalKey: 'locatore_indirizzo', label: 'Indirizzo di Residenza del Locatore', type: 'text', required: true },
      { id: 'immobile_indirizzo', canonicalKey: 'immobile_indirizzo', label: 'Indirizzo dell’Immobile Locato', type: 'text', required: true },
      { id: 'dataContratto', canonicalKey: 'dataContratto', label: 'Data di Stipula del Contratto', type: 'date', required: true },
      { id: 'graviMotivi', canonicalKey: 'graviMotivi', label: 'Descrizione dei Gravi Motivi (es. Trasferimento lavorativo, sopraggiunte esigenze familiari)', type: 'textarea', required: true },
      { id: 'dataRilascioPrevista', canonicalKey: 'dataRilascioPrevista', label: 'Data Prevista Rilascio (dopo i 6 mesi)', type: 'date', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Gentile Sig./Sig.ra: ${v.locatore_nominativo || '...'}
Indirizzo: ${v.locatore_indirizzo || '...'}

OGGETTO: RECESSO ANTICIPATO DAL CONTRATTO DI LOCAZIONE EX ART. 3, C. 6, L. 431/1998
Immobile sito in: ${v.immobile_indirizzo || '...'}
Contratto stipulato in data: ${v.dataContratto || '...'}

Il/La sottoscritto/a ${v.conduttore_cognome || '...'} ${v.conduttore_nome || '...'},
Codice Fiscale: ${v.conduttore_cf || '...'}, in qualità di conduttore dell'immobile in epigrafe,

COMUNICA
il proprio formale recesso anticipato dal contratto di locazione per il ricorrere dei seguenti gravi motivi, estranei alla propria volontà e sopravvenuti:
${v.graviMotivi || 'Gravi e documentati motivi personali/lavorativi non prevedibili alla stipula del contratto.'}

L'immobile verrà riconsegnato libero da persone e cose entro e non oltre la data del: ${v.dataRilascioPrevista || '...'}, previo rispetto del termine di preavviso contrattuale di 6 mesi.
In tale sede si procederà alla verifica dello stato dei luoghi e alla restituzione del deposito cauzionale con i relativi interessi legali maturati.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Conduttore: _______________________`
  },
  {
    id: 'sollecito-restituzione-cauzione',
    slug: 'sollecito-restituzione-deposito-cauzionale',
    title: 'Messa in Mora per Restituzione Deposito Cauzionale con Interessi',
    category: 'locazioni',
    description: 'Intimazione al locatore che trattiene illegittimamente la cauzione dopo la riconsegna dell’appartamento senza contestazioni.',
    normativaRiferimento: 'Art. 11 Legge 392/1978 e Art. 1284 Codice Civile',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'exConduttore_nome', canonicalKey: 'nome', label: 'Nome Ex Inquilino', type: 'text', required: true },
      { id: 'exConduttore_cognome', canonicalKey: 'cognome', label: 'Cognome Ex Inquilino', type: 'text', required: true },
      { id: 'locatore_nominativo', canonicalKey: 'locatore_nominativo', label: 'Nome del Locatore', type: 'text', required: true },
      { id: 'importoCauzione', canonicalKey: 'importoCauzione', label: 'Importo del Deposito Cauzionale (€)', type: 'text', required: true },
      { id: 'dataRiconsegnaChiavi', canonicalKey: 'dataRiconsegnaChiavi', label: 'Data Verbale di Riconsegna Immobile', type: 'date', required: true },
      { id: 'ibanAccredito', canonicalKey: 'iban', label: 'IBAN su cui Accreditare la Somma', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `A mezzo Raccomandata A/R o PEC
Spett.le ${v.locatore_nominativo || '...'}

OGGETTO: DIFFIDA E MESSA IN MORA PER RESTITUZIONE DEPOSITO CAUZIONALE ED INTERESSI LEGALI
Contratto di locazione cessato in data: ${v.dataRiconsegnaChiavi || '...'}

Il/La sottoscritto/a ${v.exConduttore_cognome || '...'} ${v.exConduttore_nome || '...'},

PREMESSO CHE
- In data ${v.dataRiconsegnaChiavi || '...'} l'immobile è stato rilasciato in perfetto stato come da verbale controfirmato;
- Ad oggi non è stata restituita la cauzione pari a € ${v.importoCauzione || '...'}, trattenuta in violazione di legge;

DIFFIDA E METTE IN MORA
la S.V. a voler corrispondere entro 7 giorni dal ricevimento della presente l'importo di € ${v.importoCauzione || '...'} maggiorato degli interessi legali maturati ex art. 11 L. 392/1978, mediante bonifico bancario su IBAN:
${v.ibanAccredito || '...'}

Con espresso avviso che in difetto si adiranno le vie legali con aggravio di spese e interessi di mora.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },
  {
    id: 'richiesta-riparazioni-urgenti',
    slug: 'richiesta-riparazioni-urgenti-locatore',
    title: 'Richiesta Riparazioni Straordinarie Urgenti al Locatore (Art. 1577 C.C.)',
    category: 'locazioni',
    description: 'Sollecita l’intervento urgente del padrone di casa per guasti a caldaia, tubature, tetto o infiltrazioni gravi.',
    normativaRiferimento: 'Artt. 1576 e 1577 del Codice Civile',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'conduttore_nome', canonicalKey: 'nome', label: 'Nome Inquilino', type: 'text', required: true },
      { id: 'conduttore_cognome', canonicalKey: 'cognome', label: 'Cognome Inquilino', type: 'text', required: true },
      { id: 'locatore_nominativo', canonicalKey: 'locatore_nominativo', label: 'Nome del Locatore', type: 'text', required: true },
      { id: 'descrizioneGuasto', canonicalKey: 'descrizioneGuasto', label: 'Descrizione del Danno/Guasto (es. rottura caldaia, infiltrazioni soffitto)', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `Gentile Locatore: ${v.locatore_nominativo || '...'}

OGGETTO: SEGNALAZIONE GUASTO GRAVE E RICHIESTA INTERVENTO URGENTE EX ART. 1577 C.C.

Il/La sottoscritto/a ${v.conduttore_cognome || '...'} ${v.conduttore_nome || '...'}, conduttore dell'immobile,

SEGNALA
che nell'immobile si è verificato il seguente grave guasto che compromette la normale abitabilità del bene locato:
${v.descrizioneGuasto || 'Guasto urgente non imputabile a colpa del conduttore richiedente manutenzione straordinaria.'}

INVITA E DIFFIDA
la proprietà a disporre l'immediato intervento di tecnici specializzati entro 48 ore dalla presente, avvisando che in mancanza il conduttore provvederà direttamente ai sensi del comma 2 dell'art. 1577 c.c. con diritto al rimborso delle spese anticipate.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },

  // =========================================================================
  // CATEGORIA 6: DIFFIDE, RECLAMI & PRIVACY
  // =========================================================================
  {
    id: 'diffida-ad-adempiere-1454',
    slug: 'diffida-ad-adempiere-15-giorni',
    title: 'Diffida ad Adempiere con Termine di 15 Giorni (Art. 1454 C.C.)',
    category: 'diffide',
    description: 'Atto formale di intimazione ad eseguire una prestazione o consegna dovuta con risoluzione automatica del contratto in caso di inadempimento.',
    normativaRiferimento: 'Art. 1454 Codice Civile',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'mittente_nome', canonicalKey: 'nome', label: 'Nome del Mittente', type: 'text', required: true },
      { id: 'mittente_cognome', canonicalKey: 'cognome', label: 'Cognome del Mittente', type: 'text', required: true },
      { id: 'mittente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale Mittente', type: 'text', required: true },
      { id: 'destinatario_inadempiente', canonicalKey: 'destinatario_inadempiente', label: 'Persona o Società Inadempiente', type: 'text', required: true },
      { id: 'prestazione_dovuta', canonicalKey: 'prestazione_dovuta', label: 'Prestazione o Consegna Non Eseguita', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `A mezzo Raccomandata A/R o PEC
Spett.le ${v.destinatario_inadempiente || '...'}

ATTO DI DIFFIDA AD ADEMPIERE AI SENSI DELL'ART. 1454 DEL CODICE CIVILE

Il/La sottoscritto/a ${v.mittente_cognome || '...'} ${v.mittente_nome || '...'},
Codice Fiscale: ${v.mittente_cf || '...'},

PREMESSO CHE
Nonostante i solleciti intercorsi, la S.V. non ha ancora provveduto all'adempimento della seguente obbligazione contrattuale:
${v.prestazione_dovuta || 'Adempimento delle prestazioni pattuite e/o consegna beni.'}

DIFFIDA E INTIMA FORMALMENTE
la S.V. ad adempiere esattamente alla predetta prestazione entro e non oltre il termine perentorio di 15 (quindici) giorni dal ricevimento della presente comunicazione, avvertendo espressamente che, decorso inutilmente tale termine, il contratto si intenderà senz'altro RISOLTO DI DIRITTO ai sensi dell'art. 1454 c.c., con riserva di agire per il risarcimento di tutti i danni subiti e subendi.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },
  {
    id: 'richiesta-risarcimento-volo',
    slug: 'reclamo-risarcimento-ritardo-volo-aereo',
    title: 'Richiesta Risarcimento Volo Cancellato o Ritardato (Reg. CE 261/2004)',
    category: 'diffide',
    description: 'Reclamo alla compagnia aerea per compensazione pecuniaria (€250 - €600) per ritardo superiore a 3 ore o cancellazione del volo.',
    normativaRiferimento: 'Regolamento (CE) n. 261/2004 del Parlamento Europeo e del Consiglio',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'passeggero_nome', canonicalKey: 'nome', label: 'Nome Passeggero', type: 'text', required: true },
      { id: 'passeggero_cognome', canonicalKey: 'cognome', label: 'Cognome Passeggero', type: 'text', required: true },
      { id: 'compagniaAerea', canonicalKey: 'compagniaAerea', label: 'Compagnia Aerea (es. Ryanair, ITA, EasyJet)', type: 'text', required: true },
      { id: 'numeroVolo', canonicalKey: 'numeroVolo', label: 'Numero Volo (es. FR1234)', type: 'text', required: true },
      { id: 'trattaVolo', canonicalKey: 'trattaVolo', label: 'Tratta (Partenza - Destinazione)', type: 'text', required: true },
      { id: 'dataVolo', canonicalKey: 'dataVolo', label: 'Data del Volo', type: 'date', required: true },
      { id: 'disagioSubito', canonicalKey: 'disagioSubito', label: 'Tipo di Disagio (Cancellazione / Ritardo oltre 3 ore / Overbooking)', type: 'text', required: true, defaultValue: 'Ritardo all’arrivo superiore a 3 ore' },
      { id: 'iban', canonicalKey: 'iban', label: 'IBAN per Bonifico Compensazione', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `ALL'UFFICIO RECLAMI E RIMBORSI DELLA COMPAGNIA: ${v.compagniaAerea || '...'}

OGGETTO: RICHIESTA DI COMPENSAZIONE PECUNIARIA EX REGOLAMENTO (CE) N. 261/2004
Volo n.: ${v.numeroVolo || '...'} del ${v.dataVolo || '...'} - Tratta: ${v.trattaVolo || '...'}

Il/La sottoscritto/a ${v.passeggero_cognome || '...'} ${v.passeggero_nome || '...'}, in qualità di passeggero munito di regolare titolo di viaggio,

LAMENTA
il grave disagio subito consistente in: ${v.disagioSubito || 'grave ritardo all’arrivo / cancellazione non causata da circostanze eccezionali'}.

CHIEDE
la liquidazione immediata dell'indennizzo forfettario di legge (compreso tra € 250,00 e € 600,00 a passeggero in base alla distanza chilometrica), da accreditare tramite bonifico su conto corrente bancario:
IBAN: ${v.iban || '...'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma: _______________________`
  },
  {
    id: 'esercizio-diritti-gdpr-cancellazione',
    slug: 'richiesta-cancellazione-dati-gdpr-oblio',
    title: 'Istanza Cancellazione Dati e Diritto all’Oblio (Art. 17 GDPR)',
    category: 'diffide',
    description: 'Richiesta a piattaforme, aziende o banche dati per la rimozione definitiva e cancellazione dei propri dati personali.',
    normativaRiferimento: 'Art. 17 Regolamento (UE) 2016/679 (GDPR)',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'interessato_nome', canonicalKey: 'nome', label: 'Nome Interessato', type: 'text', required: true },
      { id: 'interessato_cognome', canonicalKey: 'cognome', label: 'Cognome Interessato', type: 'text', required: true },
      { id: 'interessato_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'titolareTrattamento', canonicalKey: 'titolareTrattamento', label: 'Titolare del Trattamento (Società o Piattaforma)', type: 'text', required: true },
      { id: 'emailAccount', canonicalKey: 'email', label: 'Email o Username Associato all’Account', type: 'text', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `AL RESPONSABILE DELLA PROTEZIONE DEI DATI (DPO) / TITOLARE DEL TRATTAMENTO
Spett.le ${v.titolareTrattamento || '...'}

OGGETTO: ISTANZA DI ESERCIZIO DEI DIRITTI IN MATERIA DI PROTEZIONE DEI DATI PERSONALI
(Articolo 17 del Regolamento UE 2016/679 - Diritto alla Cancellazione / Diritto all'Oblio)
Account / Riferimento: ${v.emailAccount || '...'}

Il/La sottoscritto/a ${v.interessato_cognome || '...'} ${v.interessato_nome || '...'},
Codice Fiscale: ${v.interessato_cf || '...'},

CHIEDE
la cancellazione tempestiva e definitiva di tutti i dati personali che lo/la riguardano conservati nei vostri archivi informatici e cartacei, revocando qualsiasi consenso precedentemente prestato a fini promozionali, di profilazione o contrattuali.

Si ricorda che ai sensi dell'art. 12, paragrafo 3 del GDPR, il titolare ha l'obbligo di fornire riscontro entro il termine perentorio di 1 mese.

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma dell'Interessato: _______________________`
  },
  {
    id: 'accesso-atti-amministrativi',
    slug: 'istanza-accesso-atti-legge-241-1990',
    title: 'Istanza di Accesso agli Atti Amministrativi (Legge 241/1990)',
    category: 'diffide',
    description: 'Domanda per visionare ed estrarre copia di documenti, verbali o concessioni detenuti dalla Pubblica Amministrazione.',
    normativaRiferimento: 'Artt. 22 e ss. Legge 7 agosto 1990, n. 241',
    fileType: 'pdf_builtin',
    fields: [
      { id: 'richiedente_nome', canonicalKey: 'nome', label: 'Nome Richiedente', type: 'text', required: true },
      { id: 'richiedente_cognome', canonicalKey: 'cognome', label: 'Cognome Richiedente', type: 'text', required: true },
      { id: 'richiedente_cf', canonicalKey: 'codiceFiscale', label: 'Codice Fiscale', type: 'text', required: true },
      { id: 'amministrazione_destinataria', canonicalKey: 'amministrazione_destinataria', label: 'Pubblica Amministrazione o Ufficio Competente', type: 'text', required: true },
      { id: 'documenti_richiesti', canonicalKey: 'documenti_richiesti', label: 'Documenti di cui si Chiede Visione o Copia', type: 'textarea', required: true },
      { id: 'interesse_diretto', canonicalKey: 'interesse_diretto', label: 'Interesse Diretto, Concreto e Attuale (Motivazione Giuridica)', type: 'textarea', required: true },
      { id: 'dataCompilazione', canonicalKey: 'dataCompilazione', label: 'Data', type: 'date', required: true, defaultValue: new Date().toISOString().slice(0, 10) }
    ],
    previewText: (v) => `ALLA SPETTABILE AMMINISTRAZIONE: ${v.amministrazione_destinataria || '...'}

ISTANZA DI ACCESSO AI DOCUMENTI AMMINISTRATIVI EX ARTT. 22 E SS. LEGGE 241/1990

Il/La sottoscritto/a ${v.richiedente_cognome || '...'} ${v.richiedente_nome || '...'},
Codice Fiscale: ${v.richiedente_cf || '...'},

CHIEDE
di poter visionare ed estrarre copia dei seguenti documenti amministrativi:
${v.documenti_richiesti || 'Atti, fascicoli e verbali afferenti al procedimento in oggetto.'}

MOTIVAZIONE:
Il sottoscritto è titolare del seguente interesse diretto, concreto e attuale corrispondente ad una situazione giuridicamente tutelata:
${v.interesse_diretto || 'Tutela dei propri diritti e interessi legittimi ai sensi dell’art. 22 L. 241/1990.'}

Data: ${v.dataCompilazione || new Date().toISOString().slice(0, 10)}
Firma del Richiedente: _______________________`
  }
];
