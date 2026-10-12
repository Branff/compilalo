---
name: impeccable
description: Design language, linter e protocollo anti-AI slop di Paul Bakaus (pbakaus/impeccable). Usare per inizializzare il contesto di design (PRODUCT.md / DESIGN.md), verificare la gerarchia visiva, rimuovere card dentro card, bordi laterali decorativi, gradienti generici e garantire qualità artigianale da design director.
---

# Impeccable Design Language & Anti-AI Slop Protocol

Ispirato al sistema creato da Paul Bakaus (*pbakaus/impeccable*), questo protocollo costringe l'agente a pensare come un Design Director umano prima di generare markup o stili.

## 1. I Due Documenti di Verità Duratura

### `PRODUCT.md` (Scopo & Utilità)
Creato al momento dell'inizializzazione. Definisce la verità del prodotto per evitare assunzioni generiche:
- **Pubblico:** Cittadini italiani di ogni età che necessitano di sbrigare pratiche burocratiche e documenti legali.
- **Tono di Voce:** Autorevole, sobrio, rassicurante, efficiente, trasparente. Nessun tono da "marketing startup" né da "assistente virtuale giocoso".
- **Vincoli:** Anonimato assoluto, costo €0,00, accessibilità WCAG 2.2 AA, funzionamento offline.

### `DESIGN.md` (Token di Design)
Contiene i vincoli visivi immodificabili. Se un colore o un font non è censito in `DESIGN.md`, è un errore di compilazione.

---

## 2. Riconoscimento ed Eliminazione dei Pattern "AI Slop"
Il linter `impeccable` bandisce tassativamente i seguenti cliché:

1. **Il Gradiente Viola/Blu:** Niente sfumature da `#8b5cf6` a `#3b82f6` su bottoni, loghi o testi (`bg-clip-text`).
2. **Card dentro Card (Russian Doll Syndrome):** Non inserire elementi a scatola dentro altre scatole arrotondate con bordi grigi identici. Separare le sezioni con spazio bianco ritmico o sottilissime linee di registro (1px solid `#E4E4E7`).
3. **Bordi Laterali Decorativi ("Side-Stripes"):** Niente bordi colorati spessi a sinistra delle card (es. `border-l-4 border-indigo-500`) usati come decorazione pigra.
4. **Tile di Icone con Sfondo Circolare Colorato:** Evitare la fila di tre card con un'icona centrata in un cerchietto colorato pastello sopra il titolo.
5. **Glassmorphism Automatico:** Nessun `backdrop-blur-md bg-white/10 border-white/20` abusato su elementi funzionali.
6. **Testo Grigio Ipo-Contrastato:** Nessun grigio chiaro su fondo bianco o grigio medio su fondo colorato. Contrasto sempre verificato.

---

## 3. Vocabolario dei Comandi (`/impeccable <command>`)

Quando viene invocato un task di design, applicare i seguenti sottocomandi concettuali:

- **`craft`**: Progetta il componente partendo dalla funzione e dallo scheletro semantico prima di applicare lo stile.
- **`typeset`**: Calibra la scala tipografica, il `line-height` e il `letter-spacing` (stringere leggermente i titoli display, allargare le didascalie e usare `tabular-nums` per i dati).
- **`colorize`**: Applica i token da `DESIGN.md`, garantendo contrasto elevato e coerenza di registro.
- **`quieter`**: Riduci il rumore visivo (meno bordi, meno ombre, alleggerisci gli sfondi, aumenta il respiro).
- **`bolder`**: Aumenta l'impatto e il contrasto della gerarchia quando la schermata appare piatta e monotona.
- **`audit`**: Verifica accessibilità (a11y), target touch minimi (44px), navigabilità da tastiera e supporto screen-reader.
- **`polish`**: Verifica micro-allineamenti, stati hover/active, padding interni coerenti e assenza di testo troncato malamente.
