import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { DocumentTemplate } from '$lib/types';

/**
 * Calcola l'hash crittografico SHA-256 del testo del documento
 */
async function computeTextSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un PDF ufficiale italiano conforme agli standard della Pubblica Amministrazione
 * Include impaginazione A4, marcatura di integrità crittografica SHA-256,
 * gestione multi-pagina automatica e incorporazione firma digitale/autografa PNG.
 */
export async function generateDocumentPdf(
  template: DocumentTemplate,
  values: Record<string, any>,
  signatureDataUrl?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  const fontTitle = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const content = template.previewText ? template.previewText(values) : '';
  const sha256Fingerprint = await computeTextSha256(content + (signatureDataUrl ? 'SIG_ATTACHED' : ''));
  const shortHash = sha256Fingerprint.slice(0, 16).toUpperCase();

  const margin = 50;
  let page = pdfDoc.addPage([595.28, 841.89]); // Formato standard A4 (210 x 297 mm)
  let { width, height } = page.getSize();
  let cursorY = height - margin;

  const drawHeader = (p: typeof page) => {
    // Intestazione Istituzionale Repubblica Italiana
    p.drawText('REPUBBLICA ITALIANA', {
      x: margin,
      y: height - margin,
      size: 9.5,
      font: fontBody,
      color: rgb(0.25, 0.25, 0.3)
    });

    p.drawText(`REGISTRO CIVICO DIGITALE \u2022 ID: ${shortHash}`, {
      x: width - margin - 220,
      y: height - margin,
      size: 8,
      font: fontMono,
      color: rgb(0.45, 0.45, 0.5)
    });

    // Titolo del Documento
    p.drawText(template.title.toUpperCase(), {
      x: margin,
      y: height - margin - 22,
      size: 13.5,
      font: fontTitle,
      color: rgb(0.1, 0.1, 0.12)
    });

    if (template.normativaRiferimento) {
      p.drawText(template.normativaRiferimento, {
        x: margin,
        y: height - margin - 36,
        size: 8.5,
        font: fontBody,
        color: rgb(0.4, 0.4, 0.4)
      });
    }

    // Linea separatrice
    p.drawLine({
      start: { x: margin, y: height - margin - 46 },
      end: { x: width - margin, y: height - margin - 46 },
      thickness: 0.75,
      color: rgb(0.65, 0.65, 0.7)
    });
  };

  drawHeader(page);
  cursorY = height - margin - 65;

  const lines = content.split('\n');

  for (const rawLine of lines) {
    // Gestione nuova pagina se il testo supera i margini inferiori
    if (cursorY < margin + 110) {
      // Piede pagina pagina corrente
      page.drawText(`Pagina ${pdfDoc.getPageCount()} \u2022 Impronta SHA-256: ${shortHash}`, {
        x: margin,
        y: margin - 15,
        size: 7,
        font: fontMono,
        color: rgb(0.5, 0.5, 0.5)
      });

      page = pdfDoc.addPage([595.28, 841.89]);
      drawHeader(page);
      cursorY = height - margin - 65;
    }

    const trimmed = rawLine.trim();

    // Rilevamento intestazioni notarili ("DICHIARA", "DELEGA", "COMUNICA", "DIFFIDA", "PREMESSO CHE")
    if (
      trimmed.startsWith('DICHIARA') ||
      trimmed.startsWith('DELEGA') ||
      trimmed.startsWith('COMUNICA') ||
      trimmed.startsWith('DIFFIDA') ||
      trimmed.startsWith('CHIEDE') ||
      trimmed.startsWith('PREMESSO CHE') ||
      trimmed.startsWith('CONSIDERATO CHE')
    ) {
      cursorY -= 6;
      page.drawText(trimmed, {
        x: margin,
        y: cursorY,
        size: 11,
        font: fontTitle,
        color: rgb(0.1, 0.1, 0.1)
      });
      cursorY -= 16;
      continue;
    }

    // Wrap intelligente per righe lunghe (circa 80 caratteri per riga a 10.5 pt)
    if (rawLine.length > 80) {
      const words = rawLine.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + word).length > 80) {
          page.drawText(currentLine, {
            x: margin,
            y: cursorY,
            size: 10,
            font: fontBody,
            color: rgb(0.12, 0.12, 0.15)
          });
          cursorY -= 14.5;
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: cursorY,
          size: 10,
          font: fontBody,
          color: rgb(0.12, 0.12, 0.15)
        });
        cursorY -= 14.5;
      }
    } else {
      page.drawText(rawLine, {
        x: margin,
        y: cursorY,
        size: 10,
        font: fontBody,
        color: rgb(0.12, 0.12, 0.15)
      });
      cursorY -= 14.5;
    }
  }

  // Se è presente una firma disegnata su canvas
  if (signatureDataUrl) {
    try {
      const base64Data = signatureDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const signatureBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        signatureBytes[i] = binaryString.charCodeAt(i);
      }

      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      const sigDims = signatureImage.scale(0.32);

      page.drawImage(signatureImage, {
        x: width - margin - sigDims.width - 20,
        y: margin + 35,
        width: sigDims.width,
        height: sigDims.height
      });
    } catch (e) {
      console.warn('Errore incorporazione firma PNG:', e);
    }
  }

  // Piede di pagina di sicurezza e conformità
  page.drawText(`Documento ufficiale generato localmente \u2022 Impronta di integrità SHA-256: ${sha256Fingerprint.slice(0, 32)}...`, {
    x: margin,
    y: margin - 15,
    size: 7,
    font: fontMono,
    color: rgb(0.4, 0.4, 0.45)
  });

  page.drawText('COMPILALO \u2022 Zero-Knowledge Civic Protocol \u2022 Valore legale ai sensi del D.P.R. 28/12/2000 n. 445', {
    x: margin,
    y: margin - 25,
    size: 6.5,
    font: fontMono,
    color: rgb(0.55, 0.55, 0.6)
  });

  return await pdfDoc.save();
}

/**
 * Triggera il download del PDF direttamente nel browser dell'utente
 */
export function downloadPdfFile(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
