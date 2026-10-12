/**
 * Validatore deterministico per IBAN Italiano (ISO 13616)
 * Lunghezza standard Italia: 27 caratteri (IT + 2 cifre controllo + 1 CIN + 5 ABI + 5 CAB + 12 C/C)
 */

export function validateIbanItaliano(iban: string): { valid: boolean; error?: string } {
  const clean = iban.replace(/\s+/g, '').toUpperCase();

  if (!clean) {
    return { valid: false, error: 'IBAN vuoto' };
  }

  if (!clean.startsWith('IT')) {
    return { valid: false, error: 'Atteso un IBAN con prefisso italiano (IT)' };
  }

  if (clean.length !== 27) {
    return { valid: false, error: `Un IBAN italiano deve contenere esattamente 27 caratteri (rilevati ${clean.length})` };
  }

  // Sposta i primi 4 caratteri alla fine: [IT][XX] -> fine
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Sostituisce ogni lettera con il suo valore numerico (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numericString += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numericString += rearranged[i];
    } else {
      return { valid: false, error: 'L’IBAN contiene caratteri non validi' };
    }
  }

  // Algoritmo Modulo 97 (MOD 97-10) su stringa numerica di grandi dimensioni
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = remainder.toString() + numericString.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  if (remainder !== 1) {
    return { valid: false, error: 'Codice di controllo IBAN non corrispondente (errore di digitazione)' };
  }

  return { valid: true };
}
