---
name: emil-design-eng
description: Regole di design engineering, micro-interazioni e animazioni ad altissimo craft di Emil Kowalski (animations.dev). Usare per progettare o revisionare transizioni, feedback tattili, stati dei componenti e dettagli invisibili che rendono l'interfaccia fluida e premium.
---

# Emil Kowalski Design Engineering & Animation Guidelines

Ispirato alla filosofia di Emil Kowalski (*animations.dev*, creatore di Sonner e Vaul, ex Vercel/Linear), questo set di regole elimina le animazioni legnose o fuori luogo tipiche dell'AI e impone standard di altissimo artigianato digitale (*craft*).

## 1. Principi Fondamentali di Craft
- **Dettagli Invisibili:** La qualità percepita di un'interfaccia risiede nei dettagli non dichiarati (stati `:active` fisici, ombre semi-trasparenti sfumate invece di bordi duri, origini corrette dei popover e dei menu contestuali).
- **Mai partire da zero:** Non animare mai la scala partendo da `scale(0)` (effetto "fumetto/pop-up anni 2000"). Le entrate eleganti partono da `scale(0.95)` o `scale(0.97)` con `opacity: 0` a `scale(1)` con `opacity: 1`.
- **Origine dell'Animazione:** L'origine della trasformazione (`transform-origin`) deve sempre coincidere con l'elemento trigger (se un menu a tendina si apre da un bottone in alto a destra, l'origine deve essere `top right`, non il centro).

## 2. Regole Ferree di Fisica e Temporizzazione
1. **Regola dei 300ms:** Le animazioni di feedback UI (dialog, dropdown, bottoni, tooltip) devono completarsi tra i **120ms** e i **240ms**. Mai superare i 300ms per interazioni operative (un utente che compila un modulo non deve aspettare l'animazione per lavorare).
2. **Curve di Easing:**
   - **ENTRATA (Enter / Mount):** Usare SEMPRE curve di decelerazione (`ease-out` o cubic-bezier con arresto morbido: `cubic-bezier(0.16, 1, 0.3, 1)`). Vietato tassativamente `ease-in` per elementi che compaiono a schermo.
   - **USCITA (Exit / Unmount):** Usare curve veloci di accelerazione (`ease-in` o `cubic-bezier(0.7, 0, 0.84, 0)`), con durate più brevi dell'entrata (es. entrata 200ms, uscita 140ms).
   - **Transizioni di Stato (Hover / Focus / Active):** Massimo 100-150ms.
   - **VIETATO:** Mai usare `linear` o `ease-in-out` per aperture di modali, menu a tendina o accordion.
3. **Proprietà da Animare:**
   - Animare **SOLO** proprietà accelerate via hardware GPU: `transform` e `opacity`.
   - **MAI animare** `height`, `width`, `top`, `left`, `margin`, `padding` direttamente perché innescano il *layout thrashing* e ricomputazione del DOM. Se serve animare l'altezza (es. accordion), usare `grid-template-rows: 0fr -> 1fr` oppure calcolare il delta con FLIP/transform.
   - **VIETATO:** `transition: all` è severamente bandito. Specificare sempre le singole proprietà (`transition: transform 150ms cubic-bezier(...), opacity 150ms ease`).

## 3. Micro-Interazioni per COMPILALO
- **Feedback Tattile di Cifratura:** Al salvataggio dei dati anagrafici o allo sblocco del Vault, l'indicatore di sicurezza (lucchetto/timbro) deve reagire con un micro-scale `scale(0.96)` su `:active` seguito da una transizione di conferma rassicurante e rapida (160ms).
- **Modulo che si Compila:** Quando i campi del PDF o del form vengono iniettati dal profilo dell'utente, l'aggiornamento visivo dei campi deve essere un reveal sfalsato (*stagger*) di appena 20ms per riga, comunicando precisione meccanica e automazione.
- **Rispetto di `prefers-reduced-motion`:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

## 4. Formato di Revisione Obbligatorio
Quando questa skill revisiona codice CSS/animazioni, deve produrre una tabella strutturata:
| Elemento | Prima (Prima della revisione) | Dopo (Standard Emil) | Perché (Fisica / UX rationale) |
| :--- | :--- | :--- | :--- |
