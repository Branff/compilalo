/**
 * Validatore deterministico per Partita IVA italiana (D.P.R. 633/1972)
 * Formato: 11 cifre numeriche (7 cifre progressivo + 3 cifre codice ufficio/provincia + 1 cifra controllo Luhn)
 */

export function validatePartitaIva(piva: string): { valid: boolean; error?: string } {
  const clean = piva.replace(/\s+/g, '');

  if (!clean) {
    return { valid: false, error: 'Partita IVA obbligatoria' };
  }

  if (!/^\d{11}$/.test(clean)) {
    return { valid: false, error: 'La Partita IVA deve essere composta da esattamente 11 cifre numeriche' };
  }

  // Primi 7 caratteri: numero di matricola
  // Successivi 3 caratteri: codice provincia (da 001 a 100, oppure 120/121 per agenzie speciali)
  const codeProvincia = parseInt(clean.slice(7, 10), 10);
  if (codeProvincia === 0) {
    return { valid: false, error: 'Codice provincia non valido nella Partita IVA' };
  }

  // Calcolo cifra di controllo (Algoritmo di Luhn applicato alla PA italiana)
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = parseInt(clean[i], 10);
    if (i % 2 === 0) {
      // Posizioni dispari (1, 3, 5, 7, 9 - indice 0, 2, 4, 6, 8): valore diretto
      sum += digit;
    } else {
      // Posizioni pari (2, 4, 6, 8, 10 - indice 1, 3, 5, 7, 9): moltiplicato per 2
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }

  const expectedControlDigit = (10 - (sum % 10)) % 10;
  const actualControlDigit = parseInt(clean[10], 10);

  if (expectedControlDigit !== actualControlDigit) {
    return {
      valid: false,
      error: `Cifra di controllo non corrispondente (Attesa: ${expectedControlDigit}, Trovata: ${actualControlDigit})`
    };
  }

  return { valid: true };
}
