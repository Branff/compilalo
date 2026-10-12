# SOP 01: Architettura del Vault Anonimo a Conoscenza Zero (Zero-Knowledge)

## 1. Obiettivo
Permettere all'utente di salvare in modo permanente sul proprio browser tutti i propri dati anagrafici, documenti e contatti personali (e quelli dei propri familiari), senza creare un account tradizionale (niente email, password inviate a server, numeri di telefono) e con la certezza matematica che nessun server o terza parte possa mai leggerli.

---

## 2. Meccanismo Crittografico

### 2.1 Derivazione della Chiave (Key Derivation)
L'utente può scegliere tra 2 modalità di sblocco:
1. **Passphrase / Mnemonic Seed (Stile Mullvad VPN / BIP-39):**
   - Vengono generate 12 o 24 parole casuali (o un codice numerico univoco tipo conto Mullvad).
   - Dalla passphrase viene generata una chiave crittografica simmetrica tramite **PBKDF2** (con SHA-256 e almeno 600.000 iterazioni) o **Argon2id** (via WASM) con un salt univoco memorizzato localmente.
2. **Passkey / WebAuthn PRF (Pseudo-Random Function Extension):**
   - Utilizzo del chip di sicurezza hardware del dispositivo (TouchID, FaceID, Windows Hello).
   - L'estensione PRF di WebAuthn permette di estrarre un segreto deterministico direttamente dal biometrico, derivando la chiave AES senza che l'utente debba digitare nulla.

### 2.2 Cifratura Simmetrica (Authenticated Encryption)
- **Algoritmo:** `AES-GCM-256` (Advanced Encryption Standard in Galois/Counter Mode) tramite la `window.crypto.subtle` API nativa del browser.
- **IV (Initialization Vector):** 12 bytes casuali generati crittograficamente (`crypto.getRandomValues(new Uint8Array(12))`) per ogni operazione di salvataggio.
- **Integrità & Autenticazione:** Il tag di autenticazione a 128 bit garantisce che il payload non possa essere manomesso.

### 2.3 Persistenza Locale (Origin Private Storage)
- I dati cifrati vengono memorizzati in **IndexedDB** (usando `Dexie.js` o `idb-keyval`).
- Solo il payload cifrato (`ciphertext`), l'IV e il salt risiedono sul disco.
- I dati in chiaro (Plaintext `UserProfile`) risiedono **esclusivamente nella RAM** durante la sessione attiva e vengono azzerati alla chiusura della scheda o al blocco manuale.

### 2.4 Portabilità e Backup Multi-Dispositivo senza Server
- **Esportazione Vault Cifrato:** File `.compilalo` (JSON cifrato) scaricabile con un click.
- **Scambio Rapido via QR Code:** Compressione con Gzip + codifica Base64 per importare il profilo dallo smartphone al PC semplicemente inquadrando la fotocamera (nessun dato transita su internet).
