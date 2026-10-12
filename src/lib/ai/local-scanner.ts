import type { DocumentField } from '$lib/types';

/**
 * Verifica se l'ambiente del browser supporta l'AI locale integrata (Chrome Prompt API / Gemini Nano)
 */
export async function checkChromeBuiltinAi(): Promise<{ available: boolean; reason?: string }> {
  if (typeof window === 'undefined') return { available: false, reason: 'SSR' };

  try {
    // @ts-ignore - Chrome Prompt API specification
    const ai = (window as any).ai?.languageModel || (window as any).ai;
    if (!ai) {
      return { available: false, reason: 'Chrome Prompt API non presente nel browser' };
    }

    const capabilities = await ai.capabilities?.();
    if (capabilities && capabilities.available === 'readily') {
      return { available: true };
    } else if (capabilities && capabilities.available === 'after-download') {
      return { available: true, reason: 'Il modello locale Gemini Nano richiede download una tantum' };
    }
    return { available: false, reason: 'Gemini Nano non abilitato' };
  } catch (err: any) {
    return { available: false, reason: err.message };
  }
}

/**
 * Esegue l'estrazione intelligente dei campi da un testo grezzo di un documento
 * SENZA MAI INVIARE DATI PERSONALI: analizza solo lo scheletro del testo.
 */
export async function analyzeDocumentStructure(rawDocumentText: string): Promise<DocumentField[]> {
  const isAi = await checkChromeBuiltinAi();

  if (isAi.available) {
    try {
      // @ts-ignore
      const session = await (window as any).ai.languageModel.create({
        systemPrompt: 'Sei un analizzatore di moduli burocratici italiani. Estrai esclusivamente un array JSON di campi necessari con chiavi canoniche (es: nome, cognome, codiceFiscale, dataNascita, residenza).'
      });

      const prompt = `Analizza questo testo di documento ed estrai i campi da compilare:\n"""${rawDocumentText.slice(0, 2000)}"""\nRispondi solo con JSON: [{"id": "...", "label": "...", "type": "text"}]`;
      const result = await session.prompt(prompt);
      const cleaned = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `campo_${idx}`,
          canonicalKey: item.canonicalKey || item.id,
          label: item.label || item.id,
          type: item.type === 'date' ? 'date' : 'text',
          required: true
        }));
      }
    } catch (e) {
      console.warn('Fallback a parser deterministico causa errore AI locale:', e);
    }
  }

  // Motore Deterministico di Fallback (Zero AI, 100% Privacy)
  return deterministicFieldExtractor(rawDocumentText);
}

/**
 * Motore euristico e deterministico basato sui pattern dei formulari italiani
 */
export function deterministicFieldExtractor(text: string): DocumentField[] {
  const lower = text.toLowerCase();
  const fields: DocumentField[] = [];

  const addField = (id: string, label: string, canonicalKey: string, type: 'text' | 'date' = 'text') => {
    if (!fields.some(f => f.id === id)) {
      fields.push({ id, label, canonicalKey, type, required: true });
    }
  };

  if (/nome|sottoscritto|dichiarante/i.test(lower)) {
    addField('nome', 'Nome', 'nome');
    addField('cognome', 'Cognome', 'cognome');
  }

  if (/codice fiscale|c\.f\.|codfisc/i.test(lower)) {
    addField('codiceFiscale', 'Codice Fiscale', 'codiceFiscale');
  }

  if (/nato a|luogo di nascita/i.test(lower)) {
    addField('luogoNascita', 'Comune di Nascita', 'luogoNascita');
    addField('provinciaNascita', 'Provincia di Nascita', 'provinciaNascita');
  }

  if (/nato il|data di nascita/i.test(lower)) {
    addField('dataNascita', 'Data di Nascita', 'dataNascita', 'date');
  }

  if (/residente a|residenza|in via|domiciliato/i.test(lower)) {
    addField('indirizzoResidenza', 'Indirizzo di Residenza', 'indirizzoResidenza');
    addField('comuneResidenza', 'Comune di Residenza', 'comuneResidenza');
    addField('capResidenza', 'CAP', 'capResidenza');
  }

  if (/delega|delegato|incaricato/i.test(lower)) {
    addField('delegato_nome', 'Nome Delegato', 'delegato_nome');
    addField('delegato_cognome', 'Cognome Delegato', 'delegato_cognome');
    addField('delegato_cf', 'Codice Fiscale Delegato', 'delegato_cf');
  }

  if (/contratto|abbonamento|utenza|codice cliente/i.test(lower)) {
    addField('numero_contratto', 'Numero Contratto o Codice Cliente', 'numero_contratto');
  }

  if (fields.length === 0) {
    addField('testo_personalizzato', 'Dettagli Aggiuntivi', 'testo_personalizzato');
  }

  return fields;
}
