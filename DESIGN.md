# COMPILALO — Design Tokens & Aesthetics (DESIGN.md)

## 1. Direzione Estetica: "La Carta Bollata Contemporanea"
Un'estetica che fonde il rigore tipografico dei documenti legali e di stato italiani con la pulizia e l'efficienza degli strumenti software più raffinati.

---

## 2. Tipografia & Gerarchia
- **Display / Titoli Documento:**
  - Font primario: `Instrument Serif` (Google Fonts, libero SIL OFL) o `Newsreader`.
  - Fallback: `Georgia`, `serif`.
  - *Scopo:* Conferire dignità e autorevolezza notarile al documento.
- **Interfaccia, Form & Corpo del Testo:**
  - Font primario: `Geist` o `IBM Plex Sans`.
  - Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- **Dati Tecnici, Codici Fiscali & Valute:**
  - Font: `IBM Plex Mono` o `Geist Mono`.
  - Regola CSS obbligatoria: `font-variant-numeric: tabular-nums;`.

---

## 3. Palette Colori (Token Ufficiali)
È vietato utilizzare valori esadecimali arbitrari fuori da questi token:

```css
:root {
  /* Superfici (Sfondo tipo carta d'archivio e avorio naturale) */
  --surface-canvas: #F9F9F8;       /* Sfondo principale dell'app */
  --surface-sheet: #FFFFFF;        /* Il foglio A4 o la scheda documento */
  --surface-panel: #F2F1ED;        /* Pannelli laterali e raggruppamenti */
  --surface-subtle: #EBEAE5;       /* Campi input a riposo */

  /* Inchiostri (Tipografia minerale, mai nero #000) */
  --ink-primary: #18181B;          /* Testo principale ad alto contrasto (Zinc 900) */
  --ink-secondary: #52525B;        /* Didascalie, etichette secondarie (Zinc 600) */
  --ink-muted: #71717A;            /* Placeholder e note a margine (Zinc 500) */

  /* Bordi & Linee di Registro */
  --border-sheet: #E4E4E7;         /* Bordo sottile foglio (Zinc 200) */
  --border-strong: #27272A;        /* Separatori di rilievo (Zinc 800) */

  /* Accenti Istituzionali Funzionali (Mai gradienti) */
  --accent-cobalt: #1D4ED8;        /* Blu timbro/sigillo istituzionale */
  --accent-cobalt-hover: #1E40AF;
  --accent-emerald: #059669;       /* Stato valido, cifratura completata */
  --accent-amber: #D97706;         /* Campo mancante, attenzione */
  --accent-crimson: #DC2626;       /* Errore o codice fiscale errato */
}
```

---

## 4. Parametri Taste Calibrati
- `DESIGN_VARIANCE = 4`: Asimmetria funzionale (colonna form a sinistra ~45%, anteprima foglio reale a destra ~55%).
- `MOTION_INTENSITY = 2`: Micro-feedback sotto i 180ms, rispetto assoluto di `prefers-reduced-motion`.
- `VISUAL_DENSITY = 7`: Campi input compatti, spaziatura intenzionale senza dispersione.

---

## 5. Standard di Craft (Emil Kowalski Rules)
- Nessuna animazione con `transition: all`.
- Entrate animate solo con `transform` (`scale(0.97)` a `scale(1)`) e `opacity: 0` a `1` con curva `cubic-bezier(0.16, 1, 0.3, 1)` in 180ms.
- Input focus ring: 2px solido con offset pulito (`outline: 2px solid var(--ink-primary); outline-offset: 2px`).
- Nessun blocco al copia-incolla sui campi.
