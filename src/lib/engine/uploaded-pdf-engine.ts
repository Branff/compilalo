import { PDFDocument, PDFTextField, PDFCheckBox, StandardFonts, rgb } from 'pdf-lib';
import type { UserProfile } from '$lib/types';

export interface DetectedFormField {
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'signature';
  value: string | boolean;
  suggestedProfileKey?: keyof UserProfile | string;
  matched: boolean;
}

export interface UploadedPdfAnalysis {
  hasAcroForm: boolean;
  pageCount: number;
  detectedFields: DetectedFormField[];
  pdfBytes: Uint8Array;
}

// Mappatura semantica dei nomi di campo comuni nei moduli PDF italiani
const SEMANTIC_MAPPINGS: Record<string, keyof UserProfile> = {
  nome: 'nome',
  first_name: 'nome',
  txt_nome: 'nome',
  cognome: 'cognome',
  last_name: 'cognome',
  txt_cognome: 'cognome',
  cf: 'codiceFiscale',
  codice_fiscale: 'codiceFiscale',
  codfisc: 'codiceFiscale',
  fiscal_code: 'codiceFiscale',
  data_nascita: 'dataNascita',
  nato_il: 'dataNascita',
  birth_date: 'dataNascita',
  luogo_nascita: 'luogoNascita',
  nato_a: 'luogoNascita',
  comune_nascita: 'luogoNascita',
  provincia_nascita: 'provinciaNascita',
  indirizzo: 'indirizzoResidenza',
  residenza: 'indirizzoResidenza',
  via: 'indirizzoResidenza',
  comune_residenza: 'comuneResidenza',
  comune: 'comuneResidenza',
  provincia_residenza: 'provinciaResidenza',
  provincia: 'provinciaResidenza',
  cap: 'capResidenza',
  telefono: 'telefono',
  cellulare: 'telefono',
  email: 'email',
  pec: 'pec',
  documento: 'numeroDocumento',
  numero_documento: 'numeroDocumento',
  targa: 'targaVeicolo'
};

function humanizeFieldName(raw: string): string {
  const clean = raw.replace(/[_\-\.]+/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function matchProfileKey(rawFieldName: string): keyof UserProfile | undefined {
  const normalized = rawFieldName.toLowerCase().replace(/[^a-z0-9_]/g, '');
  for (const [key, profileProp] of Object.entries(SEMANTIC_MAPPINGS)) {
    if (normalized.includes(key)) {
      return profileProp;
    }
  }
  return undefined;
}

/**
 * Analizza un file PDF caricato dall'utente ed estrae i campi da compilare
 */
export async function analyzeUploadedPdf(fileBuffer: ArrayBuffer): Promise<UploadedPdfAnalysis> {
  const pdfBytes = new Uint8Array(fileBuffer);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  let hasAcroForm = false;
  const detectedFields: DetectedFormField[] = [];

  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (fields.length > 0) {
      hasAcroForm = true;
      for (const field of fields) {
        const rawName = field.getName();
        const suggestedKey = matchProfileKey(rawName);

        if (field instanceof PDFCheckBox) {
          detectedFields.push({
            name: rawName,
            label: humanizeFieldName(rawName),
            type: 'checkbox',
            value: field.isChecked(),
            suggestedProfileKey: suggestedKey,
            matched: !!suggestedKey
          });
        } else {
          let currentVal = '';
          if (field instanceof PDFTextField) {
            currentVal = field.getText() || '';
          }
          detectedFields.push({
            name: rawName,
            label: humanizeFieldName(rawName),
            type: 'text',
            value: currentVal,
            suggestedProfileKey: suggestedKey,
            matched: !!suggestedKey
          });
        }
      }
    }
  } catch (e) {
    // Il PDF non ha campi form nativi (PDF piatto o scansionato)
    hasAcroForm = false;
  }

  // Se il PDF è piatto (senza campi form), creiamo i campi essenziali predefiniti
  if (!hasAcroForm || detectedFields.length === 0) {
    const standardFields: { label: string; key: keyof UserProfile }[] = [
      { label: 'Nome e Cognome', key: 'nome' },
      { label: 'Codice Fiscale', key: 'codiceFiscale' },
      { label: 'Data di Nascita', key: 'dataNascita' },
      { label: 'Comune di Residenza', key: 'comuneResidenza' },
      { label: 'Indirizzo Completo', key: 'indirizzoResidenza' }
    ];

    for (const f of standardFields) {
      detectedFields.push({
        name: f.key,
        label: f.label,
        type: 'text',
        value: '',
        suggestedProfileKey: f.key,
        matched: true
      });
    }
  }

  return {
    hasAcroForm,
    pageCount,
    detectedFields,
    pdfBytes
  };
}

/**
 * Compila il PDF caricato con i valori inseriti o presi dal profilo utente,
 * appone la firma autografa e restituisce il file pronto per il download.
 */
export async function fillAndSignUploadedPdf(params: {
  pdfBytes: Uint8Array;
  fieldValues: Record<string, string | boolean>;
  hasAcroForm: boolean;
  signatureDataUrl?: string;
}): Promise<Uint8Array> {
  const { pdfBytes, fieldValues, hasAcroForm, signatureDataUrl } = params;
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  if (hasAcroForm) {
    try {
      const form = pdfDoc.getForm();
      for (const [fieldName, val] of Object.entries(fieldValues)) {
        try {
          const field = form.getField(fieldName);
          if (field instanceof PDFTextField && typeof val === 'string') {
            field.setText(val);
          } else if (field instanceof PDFCheckBox) {
            if (val) field.check();
            else field.uncheck();
          }
        } catch {
          // Campo non trovato o non scrivibile
        }
      }
      // Fissa i campi per evitare manomissioni
      form.flatten();
    } catch (e) {
      console.warn('Compilazione form nativo parziale:', e);
    }
  } else {
    // Se il PDF è piatto, aggiungiamo una pagina riassuntiva di certificazione in calce
    const page = pdfDoc.addPage([595.28, 841.89]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    const margin = 50;
    let cursorY = height - margin;

    page.drawText('DATI DI COMPILAZIONE INTEGRATI', {
      x: margin,
      y: cursorY,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15)
    });

    cursorY -= 25;

    for (const [key, val] of Object.entries(fieldValues)) {
      if (val && typeof val === 'string') {
        page.drawText(`${humanizeFieldName(key)}:`, {
          x: margin,
          y: cursorY,
          size: 10,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2)
        });
        page.drawText(`${val}`, {
          x: margin + 140,
          y: cursorY,
          size: 10,
          font,
          color: rgb(0.1, 0.1, 0.1)
        });
        cursorY -= 20;
      }
    }
  }

  // Aggiungi la firma autografa se presente
  if (signatureDataUrl) {
    try {
      const base64Data = signatureDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const signatureBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        signatureBytes[i] = binaryString.charCodeAt(i);
      }

      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width } = lastPage.getSize();

      const dims = signatureImage.scale(0.3);
      lastPage.drawImage(signatureImage, {
        x: width - 50 - dims.width,
        y: 60,
        width: dims.width,
        height: dims.height
      });

      lastPage.drawText('Firmato digitalmente con COMPILALO', {
        x: width - 50 - dims.width,
        y: 48,
        size: 7,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
    } catch (err) {
      console.warn('Errore aggiunta firma:', err);
    }
  }

  return await pdfDoc.save();
}
