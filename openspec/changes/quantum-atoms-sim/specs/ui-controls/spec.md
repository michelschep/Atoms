## ADDED Requirements

### Requirement: Pause/Play knop

De UI SHALL een knop bevatten waarmee de simulatie gepauzeerd en hervat kan worden.

#### Scenario: Knop toont correcte staat
- **WHEN** de simulatie loopt
- **THEN** SHALL de knop de tekst "⏸ Pause" tonen

#### Scenario: Pauzeren via knop
- **WHEN** de gebruiker op de "⏸ Pause" knop klikt
- **THEN** SHALL de simulatie pauzeren en de knop "▶ Play" tonen

#### Scenario: Hervatten via knop
- **WHEN** de simulatie gepauzeerd is en de gebruiker op "▶ Play" klikt
- **THEN** SHALL de simulatie hervatten en de knop "⏸ Pause" tonen

### Requirement: Deeltjesaantal sliders

De UI SHALL voor elk van de 7 deeltjestypen een slider bevatten waarmee het aantal deeltjes (0–50) ingesteld kan worden.

#### Scenario: Slider aanwezig per type
- **WHEN** de pagina laadt
- **THEN** SHALL voor elk deeltjestype een gelabelde slider zichtbaar zijn met de naam en kleurcodering van het type

#### Scenario: Slider past simulatie aan
- **WHEN** een slider veranderd wordt
- **THEN** SHALL de simulatie herstarten met de nieuwe aantallen deeltjes

### Requirement: Legenda

De UI SHALL een compacte legenda tonen met de naam en kleur van elk deeltjestype en een korte beschrijving van zijn gedrag.

#### Scenario: Legenda zichtbaar
- **WHEN** de pagina laadt
- **THEN** SHALL de legenda altijd zichtbaar zijn naast of onder het canvas

#### Scenario: Kleurcodering in legenda
- **WHEN** de legenda getoond wordt
- **THEN** SHALL elk type een gekleurde indicator tonen die overeenkomt met de deeltjeskleur in de simulatie
