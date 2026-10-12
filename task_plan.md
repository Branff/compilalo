# COMPILALO — Piano di Lavoro (Task Plan)

## Obiettivo Globale
Costruire una PWA local-first per la compilazione rapida, anonima e gratuita di moduli/documenti legali e amministrativi italiani, con salvataggio sicuro dei dati sul dispositivo dell'utente e AI client-side per l'estrazione e il mapping dei campi.

---

## Fasi di Sviluppo

- [x] **Fase 0: Ricerca Architetturale, Analisi Competitor & Selezione Stack**
  - [x] Analisi competitor italiani e internazionali (gap di mercato individuati).
  - [x] Ricerca e scouting skill anti-AI look, accessibilità e testing.
  - [x] Selezione stack tecnologico reattivo a costo zero (SvelteKit 5 / Astro + Tailwind v4 + Cloudflare Pages).
  - [x] Progettazione architettura di crittografia per account anonimo (Zero-Knowledge, BIP-39 / Passkey PRF, AES-GCM).
  - [x] Definizione Data Schema in `gemini.md`.

- [x] **Fase 1: Setup Workspace & Installazione Skill Antigravity**
  - [x] Creazione cartella `.agent/skills/`.
  - [x] Installazione skill di design (`impeccable`, `frontend-design`, `emil-design-eng`, `taste`, `client-pdf-engine`).
  - [x] Configurazione inizializzazione repository SvelteKit 5 + TypeScript + Tailwind v4 + adapter-static.

- [x] **Fase 2: Core Crittografico & Identity Vault (Zero-Knowledge Account)**
  - [x] Implementazione modulo crittografico WebCrypto nativo (`AES-GCM-256`, derivazione chiave con `PBKDF2`, Mnemonic 12 parole in italiano).
  - [x] Storage persistente locale su `IndexedDB` (via `idb-keyval`).
  - [x] Export / Import sicuro del Vault (file `.compilalo` cifrato).
  - [x] Gestione multi-profilo (Io, Padre, Figlio, Coniuge) per deleghe facili e reattive.

- [x] **Fase 3: Motore di Compilazione Documenti (Deterministico First)**
  - [x] Integrazione `pdf-lib` con impaginazione A4 formale della Repubblica Italiana.
  - [x] Algoritmo deterministico di alias-matching (codice fiscale, residenza, nome, comune di nascita).
  - [x] Anteprima in tempo reale (visualizzazione asimmetrica foglio a destra, modulo a sinistra).
  - [x] Componente firma autografa canvas (`signature_pad`) con incorporamento PNG nel PDF.

- [x] **Fase 4: Integrazione AI in-Browser (Zero-Server, Zero-Data-Leak)**
  - [x] Supporto per Chrome Built-in AI (`window.ai` / Prompt API con Gemini Nano) per estrazione campi da testi non strutturati.
  - [x] Fallback locale deterministico/euristico che rileva schemi di moduli senza MAI inviare dati personali dell'utente.

- [x] **Fase 5: Catalogo Moduli Italiani & Validatori Specifici**
  - [x] Dataset comuni italiani (ISTAT / CAP) per autocompletamento.
  - [x] Calcolatore e validatore matematico del Codice Fiscale italiano con verifica del carattere di controllo.
  - [x] Primi template ufficiali completi:
    - Autocertificazione residenza / stato di famiglia (DPR 445/2000)
    - Delega formale universale per ritiro documenti / pacchi
    - Lettera di disdetta contratto / utenza con diffida ad adempiere (Art. 1454 C.C.)
