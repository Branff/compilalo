export interface UserProfile {
  id: string;
  label: string; // es. "Io (Principale)", "Mio Padre", "Coniuge"
  isDefault: boolean;

  // Dati Anagrafici
  nome: string;
  cognome: string;
  sesso: 'M' | 'F' | 'A';
  dataNascita: string; // YYYY-MM-DD
  luogoNascita: string;
  provinciaNascita: string; // 2 caratteri, es. RM
  codiceFiscale: string; // 16 caratteri

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

export interface VaultState {
  version: 1;
  salt: string; // Base64 salt per PBKDF2
  encryptedPayload: string; // Base64 ciphertext (AES-GCM 256)
  iv: string; // Base64 IV (12 bytes)
  updatedAt: number;
}

export interface DocumentField {
  id: string;
  canonicalKey: keyof UserProfile | string;
  label: string;
  description?: string;
  type: 'text' | 'date' | 'select' | 'checkbox' | 'textarea' | 'signature';
  required: boolean;
  options?: string[];
  defaultValue?: string | boolean;
  acroFormFieldName?: string;
}

export interface DocumentTemplate {
  id: string;
  slug: string;
  title: string;
  category: 'autocertificazioni' | 'deleghe' | 'disdette' | 'multe' | 'locazioni' | 'diffide';
  description: string;
  normativaRiferimento?: string;
  fileType: 'pdf_builtin' | 'docx_builtin' | 'custom_upload';
  fields: DocumentField[];
  previewText?: (values: Record<string, any>) => string;
}

export interface CompilationPayload {
  templateId: string;
  values: Record<string, any>;
  signatureDataUrl?: string;
  generatedAt: string;
  outputFormat: 'pdf' | 'docx';
}
