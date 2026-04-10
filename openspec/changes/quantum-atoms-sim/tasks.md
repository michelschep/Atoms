## 1. Project Setup

- [x] 1.1 Maak `index.html` aan met p5.js CDN-link, canvas-container en UI-paneel
- [ ] 1.2 Maak `style.css` aan met dark-theme layout (canvas links, controls rechts)
- [ ] 1.3 Maak `sketch.js` aan met lege `setup()` en `draw()` functies
- [ ] 1.4 Verifieer dat de pagina laadt via `npx serve .` zonder fouten

## 2. Deeltjestypen & Interactiematrix

- [ ] 2.1 Definieer `PARTICLE_TYPES` array met de 7 typen (naam, kleur, massa, maxSpeed)
- [ ] 2.2 Definieer `INTERACTION_MATRIX[7][7]` met alle krachtswaarden uit de spec
- [ ] 2.3 Implementeer Phasex `phaseOffset` en fase-berekening via `sin()`
- [ ] 2.4 Implementeer Fluxar `chaosSign` en `chaosTick` flip-logica (elke 120 frames)
- [ ] 2.5 Implementeer `getForceStrength(typeA, typeB, frameCount)` functie die matrix opzoekt en phase/chaos verwerkt

## 3. Toroidale Ruimte

- [ ] 3.1 Implementeer `wrapPosition(particle)` die x/y modulo canvas-grootte zet
- [ ] 3.2 Implementeer `toroidalDelta(a, b, dim)` voor minimum-image afstandsberekening
- [ ] 3.3 Schrijf unit-test (console.assert) voor de wrap aan linker/rechter rand
- [ ] 3.4 Schrijf unit-test voor het kortste-pad scenario (deeltje op x=10 en x=790, canvas 800px)

## 4. Force Engine

- [ ] 4.1 Implementeer `applyForces(particles)` O(n²) loop met `MAX_RANGE = 150` early-exit
- [ ] 4.2 Voeg `MIN_DIST = 5` clamp toe in de kracht-formule
- [ ] 4.3 Implementeer `DAMPING = 0.98` snelheids-damping na elke update
- [ ] 4.4 Clip snelheid op `maxSpeed` na force-toepassing
- [ ] 4.5 Verzamel paren met `|F| > BOND_THRESHOLD (0.5)` voor bindingslijn-rendering

## 5. Simulatie Loop

- [ ] 5.1 Implementeer `setup()`: canvas aanmaken (900×700), deeltjes initialiseren
- [ ] 5.2 Implementeer `initParticles(counts)` die deeltjes aanmaakt op willekeurige posities
- [ ] 5.3 Implementeer `draw()` in correcte volgorde: fade achtergrond → forces → update → wrap → render
- [ ] 5.4 Implementeer motion-blur via `background(0, 0, 0, 25)` (semi-transparant)

## 6. Rendering

- [ ] 6.1 Implementeer `drawParticle(p)` met outer-glow (grote semi-transparante cirkel) en kern
- [ ] 6.2 Voeg Vortaar rotatie-visualisatie toe (klein draaiend element om het deeltje)
- [ ] 6.3 Implementeer `drawBondLines(bonds)` met semi-transparante gemixte kleurlijnen

## 7. UI Controls

- [ ] 7.1 Voeg pause/play knop toe aan HTML, koppel aan `noLoop()` / `loop()`
- [ ] 7.2 Voeg 7 sliders toe (range 0–50) voor deeltjesaantallen, met kleurlabel per type
- [ ] 7.3 Bind slider `oninput` events aan `initParticles()` voor herstart
- [ ] 7.4 Voeg legenda toe met kleur-indicator, naam en korte gedragsbeschrijving per type

## 8. Afwerking & Tuning

- [ ] 8.1 Test met standaard aantallen (10 per type = 70 totaal): visueel interessant gedrag?
- [ ] 8.2 Tune interactiematrix-waarden als deeltjes te veel clusteren of juist vervliegen
- [ ] 8.3 Controleer performance bij 300 deeltjes (doel: >30fps)
- [ ] 8.4 Verifieer toroidal wrap visueel: deeltjes aan de rand verschijnen aan de andere kant
