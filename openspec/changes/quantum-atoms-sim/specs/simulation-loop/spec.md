## ADDED Requirements

### Requirement: p5.js setup en initialisatie

De simulatie SHALL een `setup()` functie hebben die het canvas aanmaakt en alle deeltjes initialiseert met willekeurige startposities en -snelheden.

#### Scenario: Canvas aanmaken
- **WHEN** de pagina geladen wordt
- **THEN** SHALL een canvas van 900×700px aangemaakt worden

#### Scenario: Deeltjes initialiseren
- **WHEN** `setup()` wordt aangeroepen
- **THEN** SHALL voor elk deeltjestype het geconfigureerde aantal deeltjes aangemaakt worden met willekeurige posities over het canvas verspreid

### Requirement: Hoofd draw-loop

De simulatie SHALL een `draw()` functie hebben die elke frame de volgende stappen uitvoert (in volgorde):
1. Achtergrond tekenen (donker, lichte fade voor motion blur effect)
2. Krachten berekenen (force engine)
3. Posities en snelheden updaten
4. Toroidale wrapping toepassen
5. Alle deeltjes en bindingslijnen renderen

#### Scenario: Motion blur via semi-transparante achtergrond
- **WHEN** elke frame getekend wordt
- **THEN** SHALL de achtergrond met alpha 25 (semi-transparant) getekend worden zodat een sleep-effect ontstaat

#### Scenario: Volgorde van stappen
- **WHEN** `draw()` wordt aangeroepen
- **THEN** SHALL krachten berekend worden vóór posities geüpdatet worden
- **THEN** SHALL wrapping toegepast worden ná positie-update

### Requirement: Deeltje-rendering

Elk deeltje SHALL als gevulde cirkel getekend worden, met een glow-effect via meerdere concentrische cirkels met afnemende alpha.

#### Scenario: Glow-effect
- **WHEN** een deeltje getekend wordt
- **THEN** SHALL het deeltje bestaan uit een grote semi-transparante outer-glow en een kleine heldere kern

#### Scenario: Vortaar rotatie-visualisatie
- **WHEN** een Vortaar-deeltje getekend wordt
- **THEN** SHALL een klein draaiend kruisje of spiraal-indicatie om het deeltje getekend worden

### Requirement: Pause/resume

De simulatie SHALL gepauzeerd en hervat kunnen worden.

#### Scenario: Pauzeren
- **WHEN** de gebruiker op de pause-knop klikt
- **THEN** SHALL de `draw()`-loop gestopt worden via `noLoop()`

#### Scenario: Hervatten
- **WHEN** de gebruiker op de play-knop klikt terwijl de simulatie gepauzeerd is
- **THEN** SHALL de `draw()`-loop hervat worden via `loop()`
