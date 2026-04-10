## 1. Project Setup

- [x] 1.1 Maak `index.html` aan met p5.js CDN-link, canvas-container en UI-paneel
- [x] 1.2 Maak `style.css` aan met dark-theme layout (canvas links, controls rechts)
- [x] 1.3 Maak `sketch.js` aan met lege `setup()` en `draw()` functies
- [x] 1.4 Verifieer dat de pagina laadt via `npx serve .` zonder fouten

## 2. Deeltjestypen & Interactiematrix

- [x] 2.1 Definieer `PARTICLE_TYPES` array met de 7 typen (naam, kleur, massa, maxSpeed)
- [x] 2.2 Definieer `INTERACTION_MATRIX[7][7]` met alle krachtswaarden uit de spec
- [x] 2.3 Implementeer Phasex `phaseOffset` en fase-berekening via `sin()`
- [x] 2.4 Implementeer Fluxar `chaosSign` en `chaosTick` flip-logica (elke 120 frames)
- [x] 2.5 Implementeer `getForceStrength(typeA, typeB, frameCount)` functie die matrix opzoekt en phase/chaos verwerkt

## 3. Toroidale Ruimte

- [x] 3.1 Implementeer `wrapPosition(particle)` die x/y modulo canvas-grootte zet
- [x] 3.2 Implementeer `toroidalDelta(a, b, dim)` voor minimum-image afstandsberekening
- [x] 3.3 Schrijf unit-test (console.assert) voor de wrap aan linker/rechter rand
- [x] 3.4 Schrijf unit-test voor het kortste-pad scenario (deeltje op x=10 en x=790, canvas 800px)

## 4. Force Engine

- [x] 4.1 Implementeer `applyForces(particles)` O(n²) loop met `MAX_RANGE = 150` early-exit
- [x] 4.2 Voeg `MIN_DIST = 5` clamp toe in de kracht-formule
- [x] 4.3 Implementeer `DAMPING = 0.98` snelheids-damping na elke update
- [x] 4.4 Clip snelheid op `maxSpeed` na force-toepassing
- [x] 4.5 Verzamel paren met `|F| > BOND_THRESHOLD (0.5)` voor bindingslijn-rendering

## 5. Simulatie Loop

- [x] 5.1 Implementeer `setup()`: canvas aanmaken (900×700), deeltjes initialiseren
- [x] 5.2 Implementeer `initParticles(counts)` die deeltjes aanmaakt op willekeurige posities
- [x] 5.3 Implementeer `draw()` in correcte volgorde: fade achtergrond → forces → update → wrap → render
- [x] 5.4 Implementeer motion-blur via `background(0, 0, 0, 25)` (semi-transparant)

## 6. Rendering

- [x] 6.1 Implementeer `drawParticle(p)` met outer-glow (grote semi-transparante cirkel) en kern
- [x] 6.2 Voeg Vortaar rotatie-visualisatie toe (klein draaiend element om het deeltje)
- [x] 6.3 Implementeer `drawBondLines(bonds)` met semi-transparante gemixte kleurlijnen

## 7. UI Controls

- [x] 7.1 Voeg pause/play knop toe aan HTML, koppel aan `noLoop()` / `loop()`
- [x] 7.2 Voeg 7 sliders toe (range 0–50) voor deeltjesaantallen, met kleurlabel per type
- [x] 7.3 Bind slider `oninput` events aan `initParticles()` voor herstart
- [x] 7.4 Voeg legenda toe met kleur-indicator, naam en korte gedragsbeschrijving per type

## 8. Afwerking & Tuning

- [x] 8.1 Test met standaard aantallen (10 per type = 70 totaal): visueel interessant gedrag?
  <!-- Bevindingen: alle 10 unit-testgroepen groen. Kracht-analyse: bij gemiddelde afstand ~90px is v_ss ≈ 0.002 px/frame → deeltjes drijven nauwelijks. BOND_THRESHOLD=0.5 nooit haalbaar (max F=0.06) → bindingslijnen renderen nooit. Conclusie: functie correct, maar parameters vereisen tuning (→ 8.2). -->
- [x] 8.2 Tune interactiematrix-waarden als deeltjes te veel clusteren of juist vervliegen
  <!-- Oplossing: FORCE_SCALE=400 toegevoegd. Krachten zijn nu 400× sterker: deeltjes bereiken maxSpeed bij middellange afstanden, bonds vormen zich wanneer sterke paren binnen ~35–55 px zijn. Unit-tests bijgewerkt: stale "bonds kunnen nooit vormen" commentaar verwijderd, expliciete no-bond (d=100) en bond-vormt (Nullon-Gravon d=5) cases toegevoegd, invariant-check aangepast om FORCE_SCALE mee te nemen. -->
- [ ] 8.3 Controleer performance bij 300 deeltjes (doel: >30fps)
- [ ] 8.4 Verifieer toroidal wrap visueel: deeltjes aan de rand verschijnen aan de andere kant

## 9. Bugs
- [x] 9.1 Alle particles staan heel snel stil en er gebeurt daarna bijna niks
  <!-- Root cause: attracting particles collapsed to d=0 (force skipped, DAMPING killed remaining velocity → frozen dimers).
       Fix: (1) d=0 now gives random separation impulse instead of silent skip; (2) BETA=10px short-range repulsion
       (BETA_REPULSE=120) prevents collapse; (3) DAMPING 0.98→0.99 slows velocity decay; (4) tiny thermal noise
       (±0.02 px/frame) in draw() prevents complete freeze in symmetric equilibria.
       Unit test 4.2 updated: MIN_DIST-clamp equality tests replaced by BETA-repulsion gradient tests. -->
- [ ] 9.2 Het is nog geen torus (of torusoppervlak).
