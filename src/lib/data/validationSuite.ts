import { validateCodiceFiscale, decodeCodiceFiscale } from './codiceFiscale';
import { validatePartitaIva } from './partitaIva';
import { validateIbanItaliano } from './iban';
import type { UserProfile } from '$lib/types';

export interface CrossValidationReport {
  overallValid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Esegue un controllo incrociato di coerenza anagrafica sui dati dell'utente
 * (es. controlla se la data di nascita inserita coincide con quella codificata nel Codice Fiscale)
 */
export function crossValidateUserProfile(profile: Partial<UserProfile>): CrossValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Controllo Codice Fiscale
  if (profile.codiceFiscale) {
    const cfRes = validateCodiceFiscale(profile.codiceFiscale);
    if (!cfRes.valid && cfRes.error) {
      errors.push(`Codice Fiscale: ${cfRes.error}`);
    } else {
      // Controllo di congruenza con sesso e data di nascita
      const decoded = decodeCodiceFiscale(profile.codiceFiscale);
      
      if (profile.sesso && decoded.sesso && profile.sesso !== 'A') {
        if (profile.sesso !== decoded.sesso) {
          warnings.push(`Il sesso inserito (${profile.sesso}) non coincide con il sesso codificato nel Codice Fiscale (${decoded.sesso}).`);
        }
      }

      if (profile.dataNascita && decoded.giorno && decoded.mese) {
        const parts = profile.dataNascita.split('-');
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          if (month !== decoded.mese || day !== decoded.giorno) {
            warnings.push(`Il giorno/mese di nascita (${day}/${month}) differisce dalla data codificata nel Codice Fiscale (${decoded.giorno}/${decoded.mese}).`);
          }
        }
      }
    }
  }

  // 2. Controllo Partita IVA (se presente)
  if (profile.partitaIva) {
    const pivaRes = validatePartitaIva(profile.partitaIva);
    if (!pivaRes.valid && pivaRes.error) {
      errors.push(`Partita IVA: ${pivaRes.error}`);
    }
  }

  // 3. Controllo IBAN (se presente)
  if (profile.iban) {
    const ibanRes = validateIbanItaliano(profile.iban);
    if (!ibanRes.valid && ibanRes.error) {
      errors.push(`IBAN: ${ibanRes.error}`);
    }
  }

  // 4. Controllo CAP
  if (profile.capResidenza && !/^\d{5}$/.test(profile.capResidenza.trim())) {
    errors.push('CAP non valido: deve essere composto esattamente da 5 cifre numeriche.');
  }

  // 5. Controllo Email / PEC (se presente)
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.push('Indirizzo Email con formato non valido.');
  }

  if (profile.pec && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.pec.trim())) {
    errors.push('Indirizzo PEC con formato non valido.');
  }

  return {
    overallValid: errors.length === 0,
    errors,
    warnings
  };
}
