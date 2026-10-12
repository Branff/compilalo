---
name: claude-seo
description: "Claude SEO Master Skill suite for search engine optimization, programmatic civic SEO, AI search readiness (GEO/AEO, llms.txt), E-E-A-T structured data, keyword discovery, and content auditing."
---

# Claude SEO Master Engine

## Panoramica
La skill **claude-seo** fornisce una metodologia sistematica per dominare la ricerca organica tradizionale (Google, Bing) e la nuova ricerca generativa AI (Perplexity, ChatGPT Search, Gemini, Claude).

## Architettura dei Subagent & Moduli
1. **`seo-researcher`**: Analisi dell'intento di ricerca (Search Intent), query transazionali, informative e civiche PA (es. "modulo delega poste pdf", "disdetta affitto 6 mesi").
2. **`programmatic-seo`**: Generazione di hub tematici e forum Q&A per scalare centinaia di pagine senza duplicazione, basati su dati pubblici e casi d'uso concreti.
3. **`geo-aeo-optimizer`**: Ottimizzazione per Answer Engine Optimization (AEO) e Generative Engine Optimization (GEO):
   - Generazione di `llms.txt` strutturato e machine-readable.
   - Definizione concisa di entità, definizioni e link diretti.
4. **`schema-architect`**: Schema markup JSON-LD (Schema.org):
   - `SoftwareApplication` (caratteristiche, prezzo 0, local-first).
   - `FAQPage` (risposte dirette conformi alle linee guida Google).
   - `HowTo` (passaggi numerati per la compilazione).
5. **`eeat-auditor`**: Garanzia di autorevolezza legale, riferimenti a gazzette ufficiali, articoli di legge (DPR 445/2000, Codice Civile) e trasparenza zero-profit.

## Regole per COMPILALO
- **Tono Istituzionale e Trasparente**: Niente clickbait o termini da marketing aggressivo. Linguaggio chiaro, autorevole, preciso sui riferimenti normativi.
- **Funnel Verso il Tool**: Ogni risposta di forum o guida deve avere una CTA contestuale diretta a `/compila?id=...` che apre il modulo già pronto in un click.
- **Privacy Zero-Knowledge come Differenziatore SEO**: Evidenziare in ogni meta description l'assenza di cookie, server e registrazione rispetto a competitor commerciali traccianti.
