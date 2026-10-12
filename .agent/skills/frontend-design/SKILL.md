---
name: frontend-design
description: Guida di design frontend anti-AI slop. Usare quando si crea o si modifica l'interfaccia utente di COMPILALO per evitare layout banali generati da AI (gradienti viola, card arrotondate generiche, Inter/Roboto ovunque).
---

# Frontend Design Anti-AI Slop Guidelines

Questa skill stabilisce i principi visivi per creare interfacce autentiche, editoriali, distintive e prive dei pattern riconoscibili tipici dell'AI generativa.

## 1. Tipografia (Typography Mandate)
- **DIVIETO ASSOLUTO:** Non usare mai `Inter`, `Roboto`, `Arial` o i font di sistema come carattere identitario.
- **DIVIETO:** Evitare il "secondo cliché AI" (`Space Grotesk` o `Plus Jakarta Sans` usati senza contesto).
- **SCELTA TIPOGRAFICA PER COMPILALO:**
  - *Display / Intestazioni:* Un carattere serif editoriale autorevole o un grotesk ad alto contrasto (es. `Instrument Serif`, `Fraunces`, o `Newsreader` abbinato a un sobrio `Geist` o `IBM Plex Sans`).
  - *Numeri e Codici:* Sempre `font-variant-numeric: tabular-nums` per codici fiscali, date di nascita, importi, CAP.
  - *Input:* Dimensione minima `16px` per prevenire lo zoom automatico e fastidioso su dispositivi mobili (iOS Safari).

## 2. Palette Colori & Superfici
- **DIVIETO:** Nessun gradiente sfumato viola/blu ("AI purple/indigo glow"), nessun testo con clip a gradiente, nessun bagliore soffuso circolare ("ambient light blur").
- **Superfici:**
  - Ispirazione ai documenti d'archivio, alla carta bollata italiana e ai registri anagrafici contemporanei: sfondi caldi avorio/pietra (es. `#FBFBFA` o `#F7F6F2`), inchiostro scuro tipografico (es. `#18181B` o `#121214`), mai nero puro `#000000` né grigi sterili Tailwind.
  - Accenti di colore funzionali: un blu registro istituzionale (`#1D4ED8` o cobalto profondo) o verde timbro per le conferme di validazione.
  - Contrasto elevato: rapporto minimo WCAG AAA (7:1 per testo normale, 4.5:1 per componenti grandi).

## 3. Layout e Composizione
- **DIVIETO:** Nessun layout standard "Hero centrato con badge in pillola arrotondata in cima + 3 feature cards identiche con icone cerchiate".
- **DIVIETO:** Nessun abuso di card dentro card e nessun bordo decorativo privo di funzione.
- **Struttura Adottata:**
  - Layout asimmetrico e orientato al documento.
  - Visualizzazione affiancata "Foglio / Modulo reale": a sinistra il questionario essenziale, a destra l'anteprima del documento che si compila in tempo reale con l'inchiostro digitale.
  - Micro-dettagli fisici: sottili linee di demarcazione (1px solid), timbri di stato di validità, marcatempo di compilazione.

## 4. Animazioni & Micro-Interazioni
- **DIVIETO:** Nessuna animazione generica `transition: all 0.3s ease`.
- Animare solo `transform` e `opacity` con durate corte (< 180ms).
- Feedback visivo tangibile al momento della cifratura/salvataggio del vault (es. icona lucchetto con click tattile, micro-indicatore di cifratura AES-256 completata).
- Rispetto totale di `prefers-reduced-motion`.
