/**
 * Motore Matematico Bidirezionale del Codice Fiscale Italiano
 * Conforme al D.M. 23/12/1976 del Ministero delle Finanze
 * Include calcolo diretto, decodifica inversa e validazione con carattere di controllo.
 */

const ODD_CHARS_MAP: Record<string, number> = {
  '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
  'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
  'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
  'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
};

const EVEN_CHARS_MAP: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
  'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
  'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
};

const MONTH_CODES = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
const CHECK_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function extractConsonantsAndVowels(str: string): { consonants: string; vowels: string } {
  const normalized = str.toUpperCase().replace(/[^A-Z]/g, '');
  const consonants = normalized.replace(/[AEIOU]/g, '');
  const vowels = normalized.replace(/[^AEIOU]/g, '');
  return { consonants, vowels };
}

/**
 * Calcola i 3 caratteri del Cognome
 */
function computeSurnameCode(surname: string): string {
  const { consonants, vowels } = extractConsonantsAndVowels(surname);
  const combined = consonants + vowels + 'XXX';
  return combined.slice(0, 3);
}

/**
 * Calcola i 3 caratteri del Nome (se 4+ consonanti, prende 1a, 3a, 4a)
 */
function computeNameCode(name: string): string {
  const { consonants, vowels } = extractConsonantsAndVowels(name);
  if (consonants.length >= 4) {
    return consonants[0] + consonants[2] + consonants[3];
  }
  const combined = consonants + vowels + 'XXX';
  return combined.slice(0, 3);
}

/**
 * Calcola il carattere di controllo (16° carattere)
 */
export function calculateCheckChar(first15: string): string {
  const upper = first15.toUpperCase().trim();
  if (upper.length !== 15) return '';

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const char = upper[i];
    const isOdd = (i + 1) % 2 !== 0;
    sum += isOdd ? (ODD_CHARS_MAP[char] ?? 0) : (EVEN_CHARS_MAP[char] ?? 0);
  }

  return CHECK_LETTERS[sum % 26];
}

/**
 * CALCOLO COMPLETO DEL CODICE FISCALE
 */
export function generateCodiceFiscale(params: {
  nome: string;
  cognome: string;
  sesso: 'M' | 'F' | 'A';
  dataNascita: string; // YYYY-MM-DD
  codiceCatastaleComune: string; // es. 'H501' per Roma
}): string | null {
  const { nome, cognome, sesso, dataNascita, codiceCatastaleComune } = params;
  if (!nome || !cognome || !dataNascita || !codiceCatastaleComune) return null;

  const parts = dataNascita.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12) return null;

  const codeSurname = computeSurnameCode(cognome);
  const codeName = computeNameCode(nome);
  const codeYear = String(year).slice(-2);
  const codeMonth = MONTH_CODES[month - 1];

  let codeDayNum = day;
  if (sesso === 'F') {
    codeDayNum += 40;
  }
  const codeDay = String(codeDayNum).padStart(2, '0');
  const codeCatastale = codiceCatastaleComune.toUpperCase().trim();

  const first15 = `${codeSurname}${codeName}${codeYear}${codeMonth}${codeDay}${codeCatastale}`;
  if (first15.length !== 15) return null;

  const checkChar = calculateCheckChar(first15);
  return `${first15}${checkChar}`;
}

/**
 * Valida formalmente e matematicamente un Codice Fiscale
 */
export function validateCodiceFiscale(cf: string): { valid: boolean; error?: string } {
  const upper = cf.toUpperCase().trim();
  if (!upper) return { valid: false, error: 'Codice fiscale obbligatorio' };

  if (upper.length !== 16) {
    return { valid: false, error: 'Il codice fiscale deve essere esattamente di 16 caratteri' };
  }

  const cfRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-EHLMPR-T][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;
  if (!cfRegex.test(upper)) {
    return { valid: false, error: 'Formato caratteri non conforme al codice fiscale italiano' };
  }

  const first15 = upper.slice(0, 15);
  const expectedCheckChar = calculateCheckChar(first15);
  const actualCheckChar = upper[15];

  if (expectedCheckChar !== actualCheckChar) {
    return {
      valid: false,
      error: `Carattere di controllo errato (Atteso: '${expectedCheckChar}', Trovato: '${actualCheckChar}')`
    };
  }

  return { valid: true };
}

/**
 * Decodifica inversa del Codice Fiscale
 */
export function decodeCodiceFiscale(cf: string): {
  sesso?: 'M' | 'F';
  giorno?: number;
  mese?: number;
  annoPresunto?: number;
} {
  const upper = cf.toUpperCase().trim();
  if (upper.length !== 16) return {};

  const monthMap: Record<string, number> = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'H': 6,
    'L': 7, 'M': 8, 'P': 9, 'R': 10, 'S': 11, 'T': 12
  };

  const rawDay = parseInt(upper.slice(9, 11), 10);
  const monthChar = upper[8];
  const month = monthMap[monthChar];

  let sesso: 'M' | 'F' | undefined = undefined;
  let giorno: number | undefined = undefined;

  if (!isNaN(rawDay)) {
    if (rawDay > 40) {
      sesso = 'F';
      giorno = rawDay - 40;
    } else {
      sesso = 'M';
      giorno = rawDay;
    }
  }

  return { sesso, giorno, mese: month };
}

import { getCodiceCatastale } from './comuni';

/**
 * Calcola automaticamente il codice fiscale se sono forniti i dati anagrafici essenziali
 */
export function autoCalculateCodiceFiscale(params: {
  nome?: string;
  cognome?: string;
  sesso?: 'M' | 'F' | 'A';
  dataNascita?: string; // YYYY-MM-DD
  luogoNascita?: string; // Nome del comune
}): string | null {
  const { nome, cognome, sesso = 'M', dataNascita, luogoNascita } = params;
  if (!nome || !cognome || !dataNascita || !luogoNascita) return null;

  const codeCatastale = getCodiceCatastale(luogoNascita);
  if (!codeCatastale) return null;

  return generateCodiceFiscale({
    nome: nome.trim(),
    cognome: cognome.trim(),
    sesso: (sesso as 'M' | 'F') || 'M',
    dataNascita,
    codiceCatastaleComune: codeCatastale
  });
}
