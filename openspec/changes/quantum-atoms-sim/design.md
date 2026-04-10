## Context

Een standalone p5.js simulatie zonder server of framework. Alles draait in de browser via één HTML-pagina. De uitdaging is een geloofwaardig, visueel aantrekkelijk deeltjes-universum te bouwen waarbij emergent gedrag ontstaat uit simpele pairwise interactieregels.

## Goals / Non-Goals

**Goals:**
- 7 unieke fictieve deeltjessoorten met elk eigen visuele identiteit en interactiegedrag
- Toroidaal vlak (wrap-around) zodat het universum eindig maar grenzeloos aanvoelt
- Real-time kracht-simulatie op basis van pairwise afstand en type-combinaties
- Aantrekkelijk visueel resultaat: glow-effecten, kleursporen, zichtbare forcefields
- Simpele UI om te pauzeren en aantallen bij te stellen

**Non-Goals:**
- Server-side code of opslag
- Botsingsdetectie / collision resolution (krachten zijn voldoende)
- Meer dan ~300 deeltjes totaal (performance)
- Multiplayer of opgeslagen sessies

## Decisions

### Beslissing 1: p5.js instance mode vs. globale mode

**Keuze:** Globale mode (enkel sketch.js bestand).  
**Reden:** Eenvoudiger voor een single-sketch app, geen module-bundler nodig.  
**Alternatief overwogen:** Instance mode zou beter isoleren maar voegt complexiteit toe zonder meerwaarde hier.

### Beslissing 2: Kracht-berekening O(n²) vs. spatial hashing

**Keuze:** O(n²) pairwise met maximale interactie-radius als early-exit.  
**Reden:** Bij ≤300 deeltjes is O(n²) prima (max 90.000 paren, snel genoeg op 60fps).  
**Alternatief overwogen:** QuadTree / spatial hash is sneller maar significant complexer te implementeren.

### Beslissing 3: Kracht-magnitude formule

**Keuze:** `F = strength * (1/d² - cutoff)` met minimum distance clamp (vermijdt singulariteit).  
**Reden:** Lijkt op Lennard-Jones potentiaal — aantrekkend op middellange afstand, afstotend dichtbij. Geeft realistisch orbitaal gedrag.  
**Alternatief:** Lineaire kracht — simpeler maar minder interessant emergent gedrag.

### Beslissing 4: Interactiematrix representatie

**Keuze:** 7×7 matrix van `{attract: number, repel: number, range: number}` objecten, geïndexeerd op deeltjestype-ID.  
**Reden:** Volledig declaratief, makkelijk te tweaken zonder code aan te raken.

### Beslissing 5: Toroidale afstand berekening

**Keuze:** Shortest-path afstand via `dx = dx - W * round(dx/W)` (voor zowel x als y).  
**Reden:** Correcte minimum-image conventie, standaard in moleculaire dynamica simulaties.

### Beslissing 6: Phasex oscillatie implementatie

**Keuze:** `phase = sin(frameCount * speed)` — de outputwaarde van sin() wordt vermenigvuldigd met de kracht in de interactiematrix.  
**Reden:** Vloeiende, voorspelbare oscillatie. Elke Phasex-deeltje heeft een eigen `phaseOffset` zodat ze niet synchroon gaan.

### Beslissing 7: Fluxar chaos implementatie

**Keuze:** Elke Fluxar heeft een `chaosTick` counter. Elke 120 frames flipt de `chaosSign` (±1) per interactiepaar.  
**Reden:** Zichtbaar, interessant gedrag zonder te willekeurig te worden.

## Risks / Trade-offs

| Risico | Mitigatie |
|--------|-----------|
| Performance degradeert bij veel deeltjes | Max 300 totaal; interactie-radius cap op 150px |
| Deeltjes clusteren in één punt (singulariteit) | Minimum afstand clamp op 5px in kracht-formule |
| Phasex maakt simulatie onstabiel | Kracht-multiplier gedempt bij faseovergang (smooth) |
| Fluxar te chaotisch, breekt de visuele rust | Chaos flipt max 1x per 2 seconden per deeltje |

## Open Questions

- Worden deeltjes ook visueel verbonden met "bindingslijnen" als ze dicht bij elkaar zijn? → Leuk maar optioneel; bewaar als uitbreidingsidee.
