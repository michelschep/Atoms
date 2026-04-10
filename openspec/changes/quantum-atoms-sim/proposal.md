## Why

De wereld van de atoomfysica is fascinerend, maar de echte deeltjes zijn bekend. Dit project creëert een eigen, verzonnen universum van deeltjes met unieke eigenschappen, interacties en emergent gedrag — een interactieve simulatie in p5.js waarbij je kunt toekijken hoe nieuwe levensvormen van materie ontstaan.

## What Changes

- Nieuw p5.js sketch bestand (`sketch.js`) als enige entry point
- Simulatie van **7 unieke fictieve deeltjessoorten** elk met eigen massa, kleur, snelheid en interactieregels
- Toroidaal vlak: deeltjes lopen over aan de randen (links→rechts, boven→onder)
- Kracht-engine op basis van afstand en deeltjestype-combinaties (aantrekking / afstoting / neutraal)
- Eenvoudige UI: aantal deeltjes per soort instelbaar, pause/play knop

## Capabilities

### New Capabilities

- `particle-types`: De 7 fictieve deeltjessoorten met hun eigenschappen en interactiematrix
- `force-engine`: Berekening van krachten tussen deeltjes op basis van type-combinatie en afstand
- `toroidal-space`: Wrapping logica zodat het vlak geen grenzen heeft maar wel eindig is
- `simulation-loop`: Hoofd p5.js draw-loop met update, force-apply en render stappen
- `ui-controls`: Simpele HTML controls voor pause/play en deeltjesaantallen

### Modified Capabilities

## Impact

- Alleen front-end: HTML + p5.js (geen server, geen framework)
- Eén sketch bestand plus een klein CSS-bestand voor layout
- Geen dependencies behalve p5.js (via CDN)
