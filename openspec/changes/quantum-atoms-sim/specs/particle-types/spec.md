## ADDED Requirements

### Requirement: Zeven fictieve deeltjessoorten

De simulatie SHALL zeven unieke deeltjessoorten bevatten, elk met een eigen naam, kleur, massa, maximale snelheid en visueel effect. De types zijn:

| ID | Naam     | Kleur        | Massa | MaxSpeed | Bijzonderheid                          |
|----|----------|--------------|-------|----------|----------------------------------------|
| 0  | Lumion   | Goud (#FFD700) | 1   | 3.5      | Gloeit, trekt andere Lumions aan op afstand |
| 1  | Vortaar  | Koningsblauw (#4169E1) | 2 | 2.0 | Draait langzaam om eigen as, trekt Lumions aan |
| 2  | Nullon   | Zilver (#C0C0C0) | 1.5 | 2.5   | Neutraal van nature, wordt aangetrokken door Gravon |
| 3  | Phasex   | Violet (#8B00FF) | 1  | 3.0      | Oscilleert tussen aantrekking en afstoting |
| 4  | Gravon   | Donkerrood (#8B0000) | 4 | 0.8  | Zwaar, langzaam, trekt alles zwak aan over grote afstand |
| 5  | Chromax  | Cyaan (#00CED1) | 1.5 | 2.8   | Klontert samen, wordt aangetrokken door Phasex+ |
| 6  | Fluxar   | Oranje (#FF6600) | 1   | 4.0     | Chaotisch: kracht wisselt periodiek van teken |

#### Scenario: Deeltje aanmaken met correcte eigenschappen
- **WHEN** de simulatie opstart
- **THEN** SHALL elk deeltje een `type` (0-6), `pos` (x,y), `vel` (vx,vy), `mass` en `color` hebben overeenkomstig de tabel

#### Scenario: Phasex oscillatie
- **WHEN** de simulatie draait
- **THEN** SHALL elke Phasex-deeltje een unieke `phaseOffset` hebben zodat ze niet synchroon oscilleren
- **THEN** SHALL de fase berekend worden als `sin(frameCount * 0.02 + phaseOffset)`

#### Scenario: Fluxar chaos-flip
- **WHEN** een Fluxar-deeltje 120 frames actief is
- **THEN** SHALL zijn `chaosSign` omdraaien (van +1 naar -1 of vice versa)
- **THEN** SHALL de flip maximaal 1x per 2 seconden (120 frames bij 60fps) plaatsvinden

### Requirement: Interactiematrix

De simulatie SHALL een 7×7 interactiematrix bevatten die per paar deeltjestypen de krachtsparameters definieert. De matrix is symmetrisch (`matrix[a][b] === matrix[b][a]`).

Interactiematrix (attract = positief = aantrekken, negatief = afstoten):

| A↓ B→    | Lumion | Vortaar | Nullon | Phasex | Gravon | Chromax | Fluxar |
|----------|--------|---------|--------|--------|--------|---------|--------|
| Lumion   | +0.8   | +1.2    | -0.3   | ±phase | +0.4   | 0.0     | ±chaos |
| Vortaar  | +1.2   | -0.6    | +0.9   | 0.0    | +0.3   | -0.5    | ±chaos |
| Nullon   | -0.3   | +0.9    | -0.2   | ±phase | +1.5   | 0.0     | 0.0    |
| Phasex   | ±phase | 0.0     | ±phase | ±phase | -0.7   | +1.1    | ±chaos |
| Gravon   | +0.4   | +0.3    | +1.5   | -0.7   | -1.0   | +0.6    | +0.2   |
| Chromax  | 0.0    | -0.5    | 0.0    | +1.1   | +0.6   | +1.3    | -0.8   |
| Fluxar   | ±chaos | ±chaos  | 0.0    | ±chaos | +0.2   | -0.8    | 0.0    |

Waarbij:
- `±phase` = basiswaarde × sin(frameCount * 0.02 + phaseOffset van de Phasex-deeltje)
- `±chaos` = basiswaarde × chaosSign van de Fluxar-deeltje (basiswaarde = 1.0)

#### Scenario: Symmetrie van de matrix
- **WHEN** kracht berekend wordt tussen deeltje A (type i) en deeltje B (type j)
- **THEN** SHALL de krachtsterkte gelijk zijn aan matrix[j][i] (symmetrisch)

#### Scenario: Phasex-afhankelijke kracht
- **WHEN** een Phasex-deeltje interageert met een Lumion
- **THEN** SHALL de kracht variëren tussen aantrekking en afstoting op basis van de Phasex-fase
