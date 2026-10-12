# COMPILALO — Design Tokens & Aesthetics (DESIGN.md)

## 1. Direzione Estetica: "Cancelleria Digitale Contemporanea & High-Craft SaaS"
Un'estetica che fonde il rigore tipografico degli atti giuridici con l'ergonomia, la leggerezza e le micro-interazioni dei migliori SaaS moderni (Linear, Stripe, Raycast, Craft Docs).

- **Personalità:** Professionale, autorevole, rapido, incorruttibile, accogliente.
- **Divieto Assoluto Anti-AI Slop:** Nessun gradiente viola/blu generico, nessuna card dentro card (Russian doll), nessun box decorativo inutile, nessun testo grigio ipo-contrastato.

---

## 2. Tipografia & Gerarchia
- **Display / Titoli Documento:**
  - Font primario: `Instrument Serif` (Google Fonts, libero SIL OFL).
  - Fallback: `Georgia`, `serif`.
  - Stile: Pesi calibrati, corsivo per enfasi istituzionale, tracking leggermente negativo (`tracking-tight`).
- **Interfaccia, Form & Corpo del Testo:**
  - Font primario: `IBM Plex Sans`.
  - Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
  - Leggibilità impeccabile, altezza riga generosa (`leading-relaxed` per testi lunghi, `leading-snug` per titoli).
- **Dati Tecnici, Codici Fiscali, Date & Crittografia:**
  - Font: `IBM Plex Mono`.
  - Regola obbligatoria: `font-variant-numeric: tabular-nums;`.

---

## 3. Token di Superficie & Palette Colori
```css
:root {
  /* Superfici */
  --bg-canvas: #FAFAF9;            /* Canvas caldo, pietra chiara (Zinc 50) */
  --bg-surface: #FFFFFF;           /* Foglio bianco puro elevato */
  --bg-subtle: #F4F4F5;            /* Sfondi secondari e hover pills (Zinc 100) */
  --bg-muted: #E4E4E7;             /* Barre di stato e divisori (Zinc 200) */

  /* Inchiostri & Contrasto Elevato (WCAG AAA) */
  --text-primary: #09090B;         /* Inchiostro nero profondo (Zinc 950) */
  --text-secondary: #52525B;       /* Testo descrittivo e sottotitoli (Zinc 600) */
  --text-muted: #71717A;           /* Note a margine, placeholder (Zinc 500) */

  /* Bordi di Precisione */
  --border-subtle: rgba(24, 24, 27, 0.08); /* Bordo hairline 1px leggero */
  --border-strong: rgba(24, 24, 27, 0.20); /* Bordo focus e bottoni secondari */

  /* Accenti Istituzionali Funzionali (Mai gradienti sfumati) */
  --accent-cobalt: #2563EB;        /* Blu reale / sigillo istituzionale */
  --accent-cobalt-hover: #1D4ED8;
  --accent-emerald: #059669;       /* Stato valido, crittografia attiva, successo */
  --accent-emerald-subtle: #ECFDF5;
  --accent-amber: #D97706;         /* Avviso campo richiesto */
  --accent-amber-subtle: #FEF3C7;
  --accent-crimson: #DC2626;       /* Errore o cancellazione */
}
```

---

## 4. Parametri di Calibrazione Taste
- `DESIGN_VARIANCE = 4`: Asimmetria funzionale ed editoriale (visualizzazione a split screen per il documento).
- `MOTION_INTENSITY = 4`: Micro-feedback sotto i 200ms, stati hover con micro-lift (`translateY(-1px)`), active tattile (`scale(0.98)`).
- `VISUAL_DENSITY = 7`: Ergonomia compatta, densità operativa senza dispersione.

---

## 5. Regole di Motion & Craft (Emil Kowalski Standard)
1. **Durata e Curve:**
   - Transizioni di stato: `140ms - 180ms cubic-bezier(0.16, 1, 0.3, 1)`.
   - Modali ed entrate: `opacity: 0 -> 1`, `transform: scale(0.98) translateY(4px) -> scale(1) translateY(0)` in 180ms.
   - Vietato `transition: all`.
2. **Proprietà Accelerate:** Solo `transform` e `opacity`.
3. **Rispetto Assoluto:** `@media (prefers-reduced-motion: reduce)`.
