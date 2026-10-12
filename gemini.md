# COMPILALO — Costituzione & Data Schema

## 1. Visione del Prodotto
**COMPILALO** è una web application (PWA) italiana, 100% gratuita, totalmente anonima e local-first, che consente ai cittadini di compilare qualsiasi documento, modulo della Pubblica Amministrazione (autocertificazioni DPR 445/2000, deleghe, disdette contrattuali, ricorsi multe, contratti di locazione) a partire dai propri dati salvati localmente.

### Vincoli Inviolabili:
1. **Costo €0,00:** Zero euro per hosting, database, API, dominio di base, o licenze software.
2. **Anonimato Radicale (Zero-Knowledge):** Nessuna email, nessun numero di telefono, nessun account cloud identificativo. Nessun dato anagrafico inviato a server terzi.
3. **Local-First & E2EE:** Tutti i dati risiedono esclusivamente sul dispositivo dell'utente, cifrati con standard crittografici moderni (AES-GCM-256 / WebCrypto / Mnemonic BIP-39 o Passkey PRF).
4. **AI Deterministica & Privata:** Se un'operazione può essere risolta con logica deterministica (AcroForm parsing, regex di campi, dizionario semantico di alias italiani), l'AI è vietata. Quando serve (PDF piatti/scansionati o testo libero), l'AI viene eseguita in locale nel browser (Chrome Prompt API / Gemini Nano o WebLLM) oppure in modalità zero-dati-personali (inviando solo le etichette dei campi vuoti a API cloud gratuite).
5. **Anti AI-Look:** Interfaccia istituzionale, editoriale, pulita, priva dei cliché generici da AI (niente gradienti viola, niente card arrotondate generiche, niente Inter/Roboto di default).

---

## 2. Data Schemas (Input/Output Shapes)

### 2.1 Anagrafica Utente (Identity Vault Schema)
```typescript
interface UserProfile {
  id: string; // UUID v4 o NanoID
  label: string; // es. "Io (Principale)", "Mio Padre", "Coniuge"
  isDefault: boolean;
  
  // Dati Anagrafici
  nome: string;
  cognome: string;
  sesso: 'M' | 'F' | 'A';
  dataNascita: string; // YYYY-MM-DD
  luogoNascita: string;
  provinciaNascita: string; // Sigla 2 char es. 'RM'
  codiceFiscale: string; // 16 char calcolato/validato
  
  // Residenza e Domicilio
  comuneResidenza: string;
  provinciaResidenza: string;
  capResidenza: string;
  indirizzoResidenza: string; // Via/Piazza e civico
  
  // Contatti e Recapiti (Opzionali)
  telefono?: string;
  email?: string;
  pec?: string;
  
  // Documento d'Identità
  tipoDocumento?: 'carta_identita' | 'patente' | 'passaporto';
  numeroDocumento?: string;
  rilasciatoDa?: string; // es. "Comune di Roma"
  dataRilascio?: string; // YYYY-MM-DD
  dataScadenza?: string; // YYYY-MM-DD
  
  // Dati Professionali/Aggiuntivi
  partitaIva?: string;
  iban?: string;
  targaVeicolo?: string; // Per ricorsi multe
}

interface VaultState {
  version: 1;
  salt: string; // Base64 salt per PBKDF2 / Argon2id
  encryptedPayload: string; // Base64 ciphertext (AES-GCM 256)
  iv: string; // Base64 Initialization Vector (12 bytes)
  authTag?: string;
  updatedAt: number; // Timestamp Unix
}
```

### 2.2 Template Documento Schema
```typescript
interface DocumentField {
  id: string; // Chiave univoca (es. "delegante_nome")
  canonicalKey: keyof UserProfile | string; // Mappatura automatica
  label: string; // Etichetta visibile ("Nome del delegante")
  type: 'text' | 'date' | 'select' | 'checkbox' | 'signature' | 'textarea';
  required: boolean;
  options?: string[];
  pdfPosition?: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
  };
  acroFormFieldName?: string; // Se il PDF nativo ha un campo AcroForm
}

interface DocumentTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'autocertificazioni' | 'deleghe' | 'disdette' | 'multe' | 'locazioni' | 'diffide';
  normativaRiferimento?: string; // es. "Art. 46 D.P.R. 28 dicembre 2000, n. 445"
  fileType: 'pdf_acroform' | 'pdf_canvas' | 'docx';
  templatePath: string; // Percorso del file master vuoto
  fields: DocumentField[];
  conditionalSections?: {
    conditionFieldId: string;
    conditionValue: any;
    targetFields: string[];
  }[];
}
```

### 2.3 Payload di Compilazione (Execution Payload)
```typescript
interface CompilationPayload {
  templateId: string;
  values: Record<string, string | boolean | number>;
  signatureDataUrl?: string; // Firma autografa PNG
  generatedAt: string;
  outputFormat: 'pdf' | 'docx';
}
```
