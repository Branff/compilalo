# SOP 02: Motore di Compilazione Documenti (Deterministico First + AI Fallback)

## 1. Principi di Esecuzione
1. **Regola d'oro:** Non invocare mai un modello di intelligenza artificiale per un'operazione che può essere risolta con un algoritmo deterministico.
2. **Zero Allucinazioni:** I campi anagrafici ufficiali (Codice Fiscale, Comuni, Date) devono essere validati matematicamente, non affidati a generazioni probabilistiche.
3. **Zero Data Leakage:** Quando viene utilizzata un'AI (in locale o via API), i valori anagrafici reali dell'utente NON vengono mai inclusi nel prompt. L'AI analizza unicamente la struttura del documento vuoto per mappare i campi necessari.

---

## 2. Pipeline a 3 Livelli di Compilazione

```
                     [ Documento in Ingresso ]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      [ Template Ufficiale ]           [ PDF / Testo Libero Caricato ]
                 │                               │
                 ▼                               ▼
       AcroForm Native Fields?           AcroForm Presenti?
        ├── SI ──► [ Livello 1: Matching Deterministico ]
        └── NO ──► [ Livello 2: Parsing Testuale & Regex ]
                                 │ (Se fallisce o è ambiguo)
                                 ▼
                   [ Livello 3: AI di Estrazione Schema ]
                                 │
                                 ▼
                     [ Prompt AI: Schema Only ]
                    (Zero Dati Utente nel Prompt)
                                 │
                                 ▼
                 JSON Schema dei Campi Richiesti
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        Campi già nel Vault?              Campi Mancanti?
                 │                               │
                 ▼                               ▼
        Auto-Compilazione             Domande Mirate all'Utente
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
               [ Rendering Finale: pdf-lib / docx ]
                                 │
                                 ▼
                    [ Download Diretto nel Browser ]
```

### Livello 1: Matching Deterministico (Zero AI, 0ms)
- Lettura dei campi nativi PDF tramite `pdf-lib` (`pdfDoc.getForm().getFields()`).
- Normalizzazione dei nomi dei campi con dizionario di sinonimi italiani standard:
  - `nome`, `first_name`, `txt_nome`, `given_name` ➔ `user.nome`
  - `cognome`, `last_name`, `txt_cognome`, `family_name` ➔ `user.cognome`
  - `cf`, `codice_fiscale`, `tax_code`, `codfisc` ➔ `user.codiceFiscale`
  - `nato_a`, `comune_nascita`, `luogo_nascita` ➔ `user.luogoNascita`
  - `data_nascita`, `nato_il`, `birth_date` ➔ `user.dataNascita`
  - `residenza`, `indirizzo`, `via` ➔ `user.indirizzoResidenza`

### Livello 2: Riconoscimento Modelli Statici Noti
- Il catalogo di COMPILALO include le coordinate precise dei documenti più usati:
  - Autocertificazione di residenza e stato di famiglia (DPR 445/2000).
  - Dichiarazione sostitutiva di atto notorio.
  - Delega per ritiro raccomandate / documenti identità.
  - Modello disdetta contrattuale e recesso per giusta causa.
  - Ricorso al Prefetto ex art. 203 Codice della Strada.

### Livello 3: AI per Documenti Sconosciuti / Piatti (100% Privacy)
Quando un utente carica un documento non censito o un PDF scansionato:
1. **Ambiente Primario (Browser Nativo):** Utilizzo di **Chrome Built-in AI (Prompt API con Gemini Nano)**. L'elaborazione avviene interamente nella RAM/GPU dell'utente, senza consumare quote e senza trasmettere un singolo byte all'esterno.
2. **Ambiente Secondario (WebGPU / WebLLM):** Per browser Firefox/Safari con WebGPU abilitato, esecuzione di modelli leggeri on-device (es. `Qwen2.5-0.5B-Instruct` o `SmolLM2-360M`).
3. **Ambiente Terziario (Cloud Free-Tier Stateless):** Fallback su Cloudflare Workers AI o Groq Cloud gratuito:
   - **Regola di Sicurezza:** Viene inviato SOLO il testo estratto dal documento per estrarre lo schema JSON (`{ fields: [ { label: "Targa veicolo", key: "targa" } ] }`).
   - I dati anagrafici dell'utente vengono fusi con lo schema **esclusivamente nel client** dopo aver ricevuto il JSON.
