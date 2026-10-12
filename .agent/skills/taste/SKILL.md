---
name: taste
description: Skill di discernimento estetico e calibrazione visiva avanzata (Leonxlnx/taste-skill). Usare per definire le 'manopole' di varianza, densità e movimento prima di scrivere codice UI, eliminando le scelte mediocri e l'omogeneità generativa.
---

# Taste: Frontend Aesthetic & Variance Protocol

Ispirato al sistema *design-taste-frontend* di Leonxlnx, questa skill impedisce all'agente di convergere sulla "media statistica noiosa" dei layout web.

## 1. Fase 0: Brief Inference (Dichiarazione Esplicita)
Prima di generare qualsiasi codice di layout o componente grafico, l'agente deve internamente formulare una **Design Read** in una riga:
- *Cosa rappresenta questo schermo?* (es. "Sportello civico per la compilazione di autocertificazioni legali").
- *Quale emozione deve trasmettere?* (es. "Precisione notarile, sicurezza impenetrabile, facilità immediata").

## 2. Le Tre Manopole di Calibrazione (The Dials 1-10)

L'agente deve dichiarare e rispettare i valori delle tre variabili di ambiente per il progetto:

### `DESIGN_VARIANCE` (Scala 1 - 10)
Misura la deviazione dalla simmetria standard e la creatività strutturale:
- **1 - 3:** Simmetria pura, rigore cartesiano, griglia classica (ideale per terminali finanziari o moduli fiscali rigidi).
- **4 - 6:** Asimmetria funzionale ed editoriale (struttura a due colonne sbilanciate, documenti a confronto).
- **8 - 10:** Espressività artistica, composizioni editoriali d'avanguardia.
- **CALIBRAZIONE PER COMPILALO:** `DESIGN_VARIANCE = 4` (Rigore istituzionale e chiarezza, ma con ritmo editoriale moderno per evitare la sterilità della vecchia PA).

### `MOTION_INTENSITY` (Scala 1 - 10)
Misura l'intensità e la frequenza delle animazioni:
- **1 - 2:** Movimento quasi invisibile (solo cambi di stato istantanei e micro-feedback di conferma).
- **5 - 6:** Transizioni fluide su navigazione e accordi di visualizzazione.
- **8 - 10:** Esperienze immersive WebGL/Canvas con animazioni continue.
- **CALIBRAZIONE PER COMPILALO:** `MOTION_INTENSITY = 2` (Nessuna distrazione, feedback solo su cifratura, copia negli appunti e completamento campi).

### `VISUAL_DENSITY` (Scala 1 - 10)
Misura la concentrazione di informazioni a schermo:
- **1 - 3:** Spazi enormi, testi giganti, layout stile landing page promozionale (pochi dati per pagina).
- **6 - 8:** Densità operativa (i campi necessari sono visibili senza dover scrollare chilometri, tabelle compatte e leggibili).
- **CALIBRAZIONE PER COMPILALO:** `VISUAL_DENSITY = 7` (Il cittadino deve vedere il modulo, i campi da riempire e l'anteprima del foglio in un colpo d'occhio).

---

## 3. Direttive Operative
1. **Rifiuto dell'Uniformità:** Non allineare tutti i campi con le stesse larghezze generiche `w-full`. Il codice fiscale ha una dimensione precisa (16 caratteri), il CAP ha 5 caratteri, la data di nascita ha un formato definito. Usare la larghezza che rispecchia il dato.
2. **Tabular Numerics:** Quando si mostrano date, importi, codici alfanumerici, applicare `font-mono` o `tabular-nums` per preservare l'allineamento geometrico verticale.
3. **Texture e Sostanza:** Usare sottili bordi a contrasto e sfondi materici caldi (es. color carta d'archivio) per dare al documento la sensazione di un atto ufficiale compilato con perizia.
