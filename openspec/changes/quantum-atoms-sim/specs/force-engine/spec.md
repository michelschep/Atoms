## ADDED Requirements

### Requirement: Pairwise kracht-berekening

De force engine SHALL voor elk paar deeltjes (i, j) de kracht berekenen op basis van de toroidale afstand en de interactiematrix.

Kracht-formule:
```
d = toroidal_distance(particle_i, particle_j)
d_clamped = max(d, MIN_DIST)  // voorkomt singulariteit
strength = interaction_matrix[type_i][type_j]
F = strength / (d_clamped * d_clamped)  // 1/r² wet
acceleration = F / particle.mass
```

De kracht wordt opgeteld bij de versnelling van beide deeltjes (actie = reactie).

#### Scenario: Kracht binnen interactie-radius
- **WHEN** twee deeltjes binnen `MAX_RANGE` (150px) van elkaar zijn
- **THEN** SHALL de kracht-bijdrage berekend en toegepast worden

#### Scenario: Kracht buiten interactie-radius
- **WHEN** twee deeltjes verder dan `MAX_RANGE` (150px) van elkaar zijn
- **THEN** SHALL geen kracht berekend worden (early exit voor performance)

#### Scenario: Minimum afstand clamp
- **WHEN** twee deeltjes minder dan `MIN_DIST` (5px) van elkaar zijn
- **THEN** SHALL de afstand geclampt worden op 5px om singulariteit te voorkomen

### Requirement: Snelheids-damping

Elk deeltje SHALL een maximale snelheid (`maxSpeed`) hebben. Na elke update-stap wordt de snelheid geclipt.

#### Scenario: Snelheid begrenzen
- **WHEN** een deeltje na kracht-toepassing een snelheid groter dan `maxSpeed` heeft
- **THEN** SHALL de snelheid genormaliseerd worden naar `maxSpeed` (richting behouden)

### Requirement: Velocity damping (wrijving)

De simulatie SHALL een kleine wrijvingsfactor toepassen zodat deeltjes niet oneindig versnellen.

`velocity *= DAMPING` waarbij `DAMPING = 0.98`

#### Scenario: Wrijving toepassen
- **WHEN** elke frame de positie geüpdatet wordt
- **THEN** SHALL de snelheid vermenigvuldigd worden met 0.98 vóór positie-update

### Requirement: Visuele kracht-indicatie

De simulatie SHALL een subtiele "bindingslijn" tekenen tussen twee deeltjes die sterk op elkaar inwerken (|F| > drempelwaarde).

#### Scenario: Bindingslijn tekenen
- **WHEN** de kracht tussen twee deeltjes groter is dan `BOND_THRESHOLD` (0.5)
- **THEN** SHALL een semi-transparante lijn getekend worden tussen de twee deeltjes
- **THEN** SHALL de kleur van de lijn een mix zijn van de kleuren van beide deeltjes
