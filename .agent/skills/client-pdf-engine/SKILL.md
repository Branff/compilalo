---
name: client-pdf-engine
description: Regole e pattern per la manipolazione, lettura AcroForm, compilazione e render di documenti PDF 100% lato client tramite pdf-lib e pdf.js nel browser.
---

# Client-Side PDF Engine Guidelines

Questa skill guida l'implementazione del motore di elaborazione documenti PDF a costo zero e senza server.

## 1. Librerie Chiave nel Browser
- **`pdf-lib`**: Per la lettura e scrittura binaria di PDF, estrazione di campi modulo AcroForm (`pdfDoc.getForm().getFields()`), compilazione campi testo/checkbox/radio, aggiunta di firme PNG e unione di pagine (es. allegare scansione carta d'identità).
- **`pdfjs-dist` (PDF.js)**: Per renderizzare ad altissima fedeltà le pagine del PDF su un `<canvas>` HTML5 come anteprima interattiva in tempo reale durante la digitazione.
- **`@pdfme/generator`**: Per template personalizzati disegnati visivamente con coordinate millimetriche.

## 2. Parsing Deterministico di AcroForm
```typescript
import { PDFDocument } from 'pdf-lib';

export async function extractFormFields(pdfBytes: Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map((field) => ({
    name: field.getName(),
    type: field.constructor.name, // PDFTextField, PDFCheckBox, etc.
    isReadOnly: field.isReadOnly(),
  }));
}
```

## 3. Gestione Font & Flattening
- Per garantire che i documenti compilati siano accettati dalla Pubblica Amministrazione e da qualsiasi visualizzatore (anche senza font incorporati):
  1. Usare sempre font standard PDF incorporabili (`StandardFonts.Helvetica`, `StandardFonts.TimesRoman`) oppure caricare via fetch locale il set TTF/WOFF2 di un font libero (es. *Liberation Sans* o *Inter* solo per il PDF generato).
  2. Eseguire sempre il **flattening** dei campi prima del download (`form.flatten()`) in modo che i campi compilati diventino testo statico non alterabile.
