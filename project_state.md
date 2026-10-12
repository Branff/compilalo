# COMPILALO — Project State (Living Manual)

## Stato Attuale del Sistema (Current Truth)
- **Data di avvio:** Ottobre 2026.
- **Fase:** Fase 0 — Ricerca Architetturale, Benchmarking & Definizione Stack.
- **Infrastruttura:** Repository locale `/Users/branf/Desktop/COMPILALO`.
- **Obiettivo Operativo:** Progettare e implementare una web app PWA italiana 100% anonima, gratuita, local-first con crittografia client-side per la compilazione automatica di documenti PDF/moduli, dotata di estrazione intelligente dei campi senza compromissione della privacy e a costo zero.

---

## Log delle Modifiche (Changelog)

### [2026-10-12] — Coerenza Visiva Emil Kowalski & Sincronizzazione Universale "Zero Informazioni Chiese Due Volte"
1. **Cosa è cambiato:**
   - **Sincronizzazione Universale dei Dati e della Firma (`src/lib/stores/vault.svelte.ts`):**
     - Collegato lo store `vault.activeIdentity` e `vault.savedSignature` a tutte le viste dell'applicazione (`/`, `/compila`, `/vault`, `/scanner`).
     - Eliminata qualsiasi richiesta ripetitiva: se l'utente compila un campo qualsiasi (nome, cognome, CF, comune o indirizzo) o disegna la propria firma in una pagina, tutti gli altri moduli e pagine ne ereditano istantaneamente i valori senza doverli mai ridigitare o risbloccare con passphrase se non richiesto dall'utente.
   - **Riprogettazione e Coerenza di `compila/+page.svelte` (Modelli Pronti):**
     - Popolamento automatico da `vault.activeIdentity` (se presente) o da `vault.activeProfile`.
     - Firma autografa auto-collegata se precedentemente tracciata.
     - Sincronizzazione bidirezionale: ogni modifica apportata nel form aggiorna in tempo reale `vault.updateActiveIdentity`.
     - Inserito banner visivo armonico: *"Dati inseriti automaticamente: [Nome Cognome] · Sincronizzato"*.
   - **Riprogettazione e Coerenza di `vault/+page.svelte` (Cassaforte):**
     - Se l'utente ha inserito dati nella home o altrove, la cassaforte li riconosce subito e li pre-compila senza chiedere di reinserirli.
     - Aggiunta sezione dedicata di gestione e visualizzazione della **Firma Autografa Memorizzata** (con pulsanti per ridisegnare, testare o eliminare).
   - **Riprogettazione e Coerenza di `scanner/+page.svelte` (Analizzatore Locale):**
     - I campi estratti dal testo libero o scansionato vengono pre-compilati automaticamente dai dati noti del dispositivo.
     - Integrata firma autografa locale per l'esportazione del PDF.
   - **Standard di Design Engineering di Emil Kowalski (`emil-design-eng`):**
     - Rimossi tutti i blocchi nativi `alert()` del browser, sostituiti da toast leggeri, non intrusivi con animazione di decelerazione (`craft-modal` a 180ms).
     - Standardizzati tutti i pulsanti con interazioni tattili `:active:scale-[0.97]` (`craft-press`).
     - Standardizzati tutti gli input con focus ring uniforme (`craft-input`).
     - Aggiornato `+layout.svelte` alle snippet rune di Svelte 5 (`let { children } = $props()` e `{@render children?.()}`).
   - **Verifica Tecnica:** `npm run check` completato con 0 errori e 0 warning; `npm run build` completato con successo.

2. **Perché è cambiato:**
   - Risposta al comando `/emil-design-eng`: migliorare la coerenza visiva e rimuovere qualsiasi attrito derivante dal chiedere informazioni più di una volta all'utente.

3. **Come funziona il sistema ora:**
   - L'utente inserisce i suoi dati anagrafici o traccia la sua firma in qualsiasi punto del sito (nel caricamento rapido, in un modello o nella cassaforte): da quel momento in poi, l'intero sito "ricorda" localmente chi è l'utente e applica firma e dati su ogni documento senza mai fare domande ridondanti. L'interfaccia risponde con micro-interazioni fisiche immediate sotto i 180ms.

### [2026-10-12] — Trasformazione UX: Drag & Drop Diretto, Auto-Compilazione e Linguaggio Umano
1. **Cosa è cambiato:**
   - **Riprogettazione completa della Homepage (`src/routes/+page.svelte`):**
     - Sostituito il linguaggio notarile/burocratico con una comunicazione immediata, chiara, calda e accessibile a qualsiasi cittadino: *"Carica il tuo documento. Lo compiliamo e firmiamo in automatico."*
     - Posizionata al centro della schermata un'area di rilascio (**Drag & Drop**) di grandi dimensioni che accetta qualsiasi PDF dal computer o smartphone.
     - Appena il file viene rilasciato:
       1. Il motore `uploaded-pdf-engine.ts` analizza la struttura del documento.
       2. Se il PDF contiene campi modulo o testo, abbina automaticamente i dati del profilo locale dell'utente (*Nome, Cognome, Codice Fiscale, Residenza, Documento...*).
       3. Mostra lo stato di compilazione con spunte verdi di conferma e isola i soli campi che necessitano di un dato mancante.
       4. Permette di tracciare la propria firma a mano libera con il dito o il mouse e la posiziona automaticamente in calce al PDF.
       5. Pulsante ad alta visibilità: *"Scarica Documento Compilato e Firmato"* (100% nel browser con `pdf-lib`).
     - Aggiunto box esplicativo amichevole: *"Perché i tuoi dati sono al 100% al sicuro"* (spiegazione in 3 passi senza gergo crittografico ostico).
     - Mantenuto l'accesso ai modelli pronti (autocertificazioni, deleghe, disdette) per chi non ha già un documento proprio.
   - Creato il motore dedicato `src/lib/engine/uploaded-pdf-engine.ts` per l'ispezione AcroForm, flattening ed injection della firma.
   - Build di produzione verificata ed eseguita con successo (`npm run build`).

2. **Perché è cambiato:**
   - Risposta al feedback dell'utente: l'obiettivo cardine della piattaforma è permettere a chiunque di trascinare un proprio documento e vederlo compilato e firmato in automatico con un linguaggio estremamente chiaro e senza burocratese.

3. **Come funziona il sistema ora:**
   - L'utente apre il sito, trascina il file PDF ricevuto dalla PA, dall'azienda o dal proprietario di casa: il sistema lo riconosce, lo compila con i dati salvati, applica la firma e restituisce il file pronto per l'invio in meno di 10 secondi.

2. **Perché è cambiato:**
   - Comando esplicito dell'utente `/taste Ridisegna tutta la landing e il backend` per eliminare qualsiasi compromesso estetico generativo e rafforzare l'architettura dei moduli.

3. **Come funziona il sistema ora:**
   - La landing page accoglie il cittadino con un'esperienza di cancelleria contemporanea di altissimo livello; il backend locale esegue controlli incrociati completi, calcola hash crittografici di integrità per ogni PDF e supporta l'esportazione immediata in PDF e Word (.docx).

2. **Perché è cambiato:**
   - Richiesta dell'utente di creare una landing page ad altissimo craft con le skill assegnate e massimizzare la robustezza dei moduli backend.

3. **Come funziona il sistema ora:**
   - Un nuovo utente atterra su una landing page autorevole e trasparente, comprende immediatamente il valore dell'anonimato grazie al simulatore crittografico, e può passare direttamente alla compilazione, esportando in PDF, Word o impostando promemoria calendario.

2. **Perché è cambiato:**
   - Realizzazione concreta della piattaforma richiesta dall'utente a costo zero, totalmente anonima e sicura.

3. **Come funziona il sistema ora:**
   - L'utente può aprire l'applicazione, salvare una sola volta i propri dati cifrati nella memoria locale del browser, selezionare qualsiasi modulo ufficiale o incollare un testo, firmare con il dito e scaricare il PDF ufficiale generato all'istante senza che un singolo byte esca dal suo computer.

### [2026-10-12] — Inizializzazione Architettura & Sintesi Ricerca
1. **Cosa è cambiato:**
   - Eseguita ricerca agentica approfondita su:
     - Stack frontend moderno reattivo local-first a costo zero.
     - Skill Antigravity anti-AI-slop e per design di alta qualità editoriale.
     - Benchmarking di competitor italiani e internazionali (LexDo, ModuloSemplice, SimplePDF, Docassemble, Stirling-PDF, DoNotPay).
     - Modelli AI in-browser (Chrome Prompt API / Gemini Nano, WebLLM, Transformers.js) e librerie di manipolazione PDF lato client (`pdf-lib`, `@pdfme`, `docxtemplater`).
   - Redatto `gemini.md` con la Costituzione di progetto e i Data Schema obbligatori (`UserProfile`, `DocumentTemplate`, `CompilationPayload`).
   - Definito il `task_plan.md` con roadmap a fasi.

2. **Perché è cambiato:**
   - Rispondere alla richiesta utente di definire lo stack tecnologico ottimale a costo zero, garantire l'anonimato radicale con un vault cifrato, e definire la strategia AI client-side per estrarre campi da moduli.

3. **Come funziona il sistema ora:**
   - La base documentale è allineata alla costituzione Anti-Gravity.
   - È stata definita la roadmap per implementare il Vault Crittografico (BIP-39 / Passkey PRF + AES-GCM) e il motore di compilazione PDF client-side.
