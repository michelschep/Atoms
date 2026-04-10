## ADDED Requirements

### Requirement: Toroidale positie-wrapping

De simulatie SHALL een toroidaal vlak implementeren: een deeltje dat aan de rechterkant verdwijnt, verschijnt aan de linkerkant — en hetzelfde geldt voor boven/onder.

#### Scenario: Horizontale wrap
- **WHEN** een deeltje een x-positie groter dan de canvas-breedte bereikt
- **THEN** SHALL de x-positie modulo de canvas-breedte gezet worden

#### Scenario: Verticale wrap
- **WHEN** een deeltje een y-positie groter dan de canvas-hoogte bereikt
- **THEN** SHALL de y-positie modulo de canvas-hoogte gezet worden

#### Scenario: Negatieve positie wrap
- **WHEN** een deeltje een negatieve x- of y-positie heeft
- **THEN** SHALL de positie correct gewrapt worden naar de andere kant van het canvas

### Requirement: Toroidale afstandsberekening (minimum image convention)

De force engine SHALL de kortste afstand over het toroidale vlak gebruiken bij kracht-berekening. Een deeltje aan de rechterrand en een deeltje aan de linkerrand zijn dus dichtbij.

Formule:
```
dx = pos_j.x - pos_i.x
dy = pos_j.y - pos_i.y
dx = dx - W * Math.round(dx / W)   // W = canvas breedte
dy = dy - H * Math.round(dy / H)   // H = canvas hoogte
d = sqrt(dx*dx + dy*dy)
```

#### Scenario: Kortste pad over de rand
- **WHEN** deeltje A op x=10 staat en deeltje B op x=790 (canvas 800px breed)
- **THEN** SHALL de berekende afstand 20px zijn (via de rechter/linker rand), niet 780px

#### Scenario: Kracht-richting via wrap
- **WHEN** de kortste afstand over de rand loopt
- **THEN** SHALL de kracht-vector in de richting van het kortste pad wijzen
