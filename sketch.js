const PARTICLE_TYPES = [
  { id: 0, name: 'Lumion',  color: '#FFD700', mass: 1.0, maxSpeed: 3.5 },
  { id: 1, name: 'Vortaar', color: '#4169E1', mass: 2.0, maxSpeed: 2.0 },
  { id: 2, name: 'Nullon',  color: '#C0C0C0', mass: 1.5, maxSpeed: 2.5 },
  { id: 3, name: 'Phasex',  color: '#8B00FF', mass: 1.0, maxSpeed: 3.0 },
  { id: 4, name: 'Gravon',  color: '#8B0000', mass: 4.0, maxSpeed: 0.8 },
  { id: 5, name: 'Chromax', color: '#00CED1', mass: 1.5, maxSpeed: 2.8 },
  { id: 6, name: 'Fluxar',  color: '#FF6600', mass: 1.0, maxSpeed: 4.0 },
];

// ±phase: resolved at runtime via Phasex sin() oscillation
// ±chaos: resolved at runtime via Fluxar chaosSign
const PHASE = 'PHASE';
const CHAOS = 'CHAOS';

//          [Lumion, Vortaar, Nullon,  Phasex, Gravon, Chromax, Fluxar]
const INTERACTION_MATRIX = [
  /* Lumion  */ [ +0.8,   +1.2,   -0.3,   PHASE,  +0.4,   0.0,    CHAOS ],
  /* Vortaar */ [ +1.2,   -0.6,   +0.9,    0.0,   +0.3,   -0.5,   CHAOS ],
  /* Nullon  */ [ -0.3,   +0.9,   -0.2,   PHASE,  +1.5,    0.0,    0.0  ],
  /* Phasex  */ [ PHASE,   0.0,   PHASE,  PHASE,  -0.7,   +1.1,   CHAOS ],
  /* Gravon  */ [ +0.4,   +0.3,   +1.5,   -0.7,   -1.0,   +0.6,   +0.2 ],
  /* Chromax */ [  0.0,   -0.5,    0.0,   +1.1,   +0.6,   +1.3,   -0.8 ],
  /* Fluxar  */ [ CHAOS,  CHAOS,   0.0,   CHAOS,  +0.2,   -0.8,    0.0  ],
];

// Golden-angle step ensures consecutive Phasex particles never share the same phaseOffset
let _nextPhasexOffset = 0;
const _PHASE_STEP = 2.399963229728653; // golden angle in radians

function createParticle(typeId, x, y) {
  const t = PARTICLE_TYPES[typeId];
  if (!t) throw new Error(`Unknown particle type: ${typeId}`);

  const p = {
    type: typeId,
    x, y,
    vx: 0, vy: 0,
    mass: t.mass,
    color: t.color,
    maxSpeed: t.maxSpeed,
  };

  if (typeId === 3) { // Phasex
    p.phaseOffset = _nextPhasexOffset;
    _nextPhasexOffset = (_nextPhasexOffset + _PHASE_STEP) % (Math.PI * 2);
  }

  if (typeId === 6) { // Fluxar
    p.chaosSign = 1;
    p.chaosTick = 0;
  }

  return p;
}

// Returns oscillation value in [-1, 1] for a Phasex particle.
// Returns 0 for any particle without a phaseOffset.
function getPhase(particle, fc) {
  if (particle.phaseOffset === undefined) return 0;
  return Math.sin(fc * 0.02 + particle.phaseOffset);
}

// Advances a Fluxar particle's chaos clock by one frame.
// Flips chaosSign (+1 ↔ -1) every 120 frames and resets the tick counter.
// No-op for non-Fluxar particles.
function tickFluxar(particle) {
  if (particle.chaosSign === undefined) return;
  particle.chaosTick++;
  if (particle.chaosTick >= 120) {
    particle.chaosSign *= -1;
    particle.chaosTick = 0;
  }
}

// Returns the resolved force strength between two particles at a given frameCount.
// Resolves PHASE tokens using the Phasex particle's phaseOffset,
// and CHAOS tokens using the Fluxar particle's chaosSign (base value 1.0).
function getForceStrength(particleA, particleB, frameCount) {
  const raw = INTERACTION_MATRIX[particleA.type][particleB.type];

  if (typeof raw === 'number') return raw;

  if (raw === PHASE) {
    // If both are Phasex, average their offsets for a mixed oscillation
    if (particleA.type === 3 && particleB.type === 3) {
      const avgOffset = (particleA.phaseOffset + particleB.phaseOffset) / 2;
      return Math.sin(frameCount * 0.02 + avgOffset);
    }
    const phasex = particleA.type === 3 ? particleA : particleB;
    return Math.sin(frameCount * 0.02 + phasex.phaseOffset);
  }

  if (raw === CHAOS) {
    const fluxar = particleA.type === 6 ? particleA : particleB;
    return fluxar.chaosSign; // base value 1.0
  }

  return 0;
}

// --- Unit tests (run at load time) ---
{
  _nextPhasexOffset = 0; // reset for reproducible tests
  const p1 = createParticle(3, 0, 0);
  const p2 = createParticle(3, 0, 0);

  console.assert(typeof p1.phaseOffset === 'number', '2.3: Phasex p1 should have phaseOffset');
  console.assert(typeof p2.phaseOffset === 'number', '2.3: Phasex p2 should have phaseOffset');
  console.assert(p1.phaseOffset !== p2.phaseOffset, '2.3: Phasex particles should have unique offsets');

  const ph1 = getPhase(p1, 100);
  const ph2 = getPhase(p2, 100);
  console.assert(ph1 >= -1 && ph1 <= 1, '2.3: getPhase should return value in [-1, 1]');
  console.assert(ph1 !== ph2, '2.3: Different phaseOffsets should produce different phase values at same frameCount');

  const lumion = createParticle(0, 0, 0);
  console.assert(lumion.phaseOffset === undefined, '2.3: Non-Phasex particle should not have phaseOffset');
  console.assert(getPhase(lumion, 100) === 0, '2.3: getPhase of non-Phasex should return 0');

  _nextPhasexOffset = 0; // reset so simulation starts fresh
  console.log('✓ Task 2.3: Phasex phaseOffset and getPhase tests passed');
}

// --- Unit tests for task 2.4 ---
{
  const fluxar = createParticle(6, 0, 0);
  console.assert(fluxar.chaosSign === 1 || fluxar.chaosSign === -1, '2.4: Fluxar should have chaosSign');
  console.assert(fluxar.chaosTick === 0, '2.4: Fluxar should start with chaosTick 0');

  const initialSign = fluxar.chaosSign;
  for (let i = 0; i < 119; i++) tickFluxar(fluxar);
  console.assert(fluxar.chaosSign === initialSign, '2.4: chaosSign should not flip before 120 ticks');

  tickFluxar(fluxar); // 120th tick — should flip
  console.assert(fluxar.chaosSign === -initialSign, '2.4: chaosSign should flip after 120 ticks');
  console.assert(fluxar.chaosTick === 0, '2.4: chaosTick should reset to 0 after flip');

  // Verify a second flip happens after another 120 ticks
  for (let i = 0; i < 120; i++) tickFluxar(fluxar);
  console.assert(fluxar.chaosSign === initialSign, '2.4: chaosSign should flip back after second 120-tick cycle');

  const lumion = createParticle(0, 0, 0);
  console.assert(lumion.chaosSign === undefined, '2.4: Non-Fluxar should not have chaosSign');
  tickFluxar(lumion); // should be a no-op
  console.assert(lumion.chaosSign === undefined, '2.4: tickFluxar on non-Fluxar should be no-op');

  console.log('✓ Task 2.4: Fluxar chaosSign and chaosTick tests passed');
}

// --- Unit tests for task 2.5 ---
{
  _nextPhasexOffset = 0;
  const lumion  = createParticle(0, 0, 0);
  const vortaar = createParticle(1, 0, 0);
  const nullon  = createParticle(2, 0, 0);
  const phasex1 = createParticle(3, 0, 0);
  const phasex2 = createParticle(3, 0, 0);
  const gravon  = createParticle(4, 0, 0);
  const chromax = createParticle(5, 0, 0);
  const fluxar  = createParticle(6, 0, 0);

  // Numeric matrix entries are returned as-is
  console.assert(getForceStrength(lumion, lumion, 0)   === 0.8,  '2.5: Lumion-Lumion = 0.8');
  console.assert(getForceStrength(lumion, vortaar, 0)  === 1.2,  '2.5: Lumion-Vortaar = 1.2');
  console.assert(getForceStrength(gravon, gravon, 0)   === -1.0, '2.5: Gravon-Gravon = -1.0');
  console.assert(getForceStrength(nullon, lumion, 0)   === -0.3, '2.5: Nullon-Lumion = -0.3');

  // Matrix symmetry
  console.assert(getForceStrength(vortaar, lumion, 0)  === getForceStrength(lumion, vortaar, 0), '2.5: Matrix is symmetric for numeric values');

  // PHASE: result must be in [-1, 1]
  const pStrength = getForceStrength(phasex1, lumion, 100);
  console.assert(pStrength >= -1 && pStrength <= 1, '2.5: PHASE strength in [-1,1]');
  // Reverse order should give same value (same Phasex particle)
  console.assert(getForceStrength(lumion, phasex1, 100) === pStrength, '2.5: PHASE is symmetric for same Phasex particle');
  // Two different Phasex particles produce different strengths at the same frameCount
  const p1p1 = getForceStrength(phasex1, phasex1, 50);
  const p1p2 = getForceStrength(phasex1, phasex2, 50);
  console.assert(typeof p1p1 === 'number' && p1p1 >= -1 && p1p1 <= 1, '2.5: Phasex-Phasex PHASE in [-1,1]');
  console.assert(p1p1 !== p1p2, '2.5: Phasex-Phasex and Phasex-Phasex2 differ (different offsets)');

  // CHAOS: result equals chaosSign of the Fluxar particle
  fluxar.chaosSign = 1;
  console.assert(getForceStrength(fluxar, lumion, 0)  === 1,  '2.5: CHAOS chaosSign=+1 → +1');
  console.assert(getForceStrength(lumion, fluxar, 0)  === 1,  '2.5: CHAOS symmetric chaosSign=+1');
  fluxar.chaosSign = -1;
  console.assert(getForceStrength(fluxar, lumion, 0)  === -1, '2.5: CHAOS chaosSign=-1 → -1');
  console.assert(getForceStrength(vortaar, fluxar, 0) === -1, '2.5: CHAOS Vortaar-Fluxar chaosSign=-1');

  // Zero entries stay zero
  console.assert(getForceStrength(lumion, chromax, 0) === 0.0, '2.5: Lumion-Chromax = 0.0');

  _nextPhasexOffset = 0; // reset so simulation starts fresh
  console.log('✓ Task 2.5: getForceStrength tests passed');
}

// Wraps a particle's position to stay within [0, w) × [0, h).
// Optional w/h default to p5.js globals (set after setup); pass explicit
// values in load-time unit tests where the globals are not yet available.
function wrapPosition(particle, w = width, h = height) {
  particle.x = ((particle.x % w) + w) % w;
  particle.y = ((particle.y % h) + h) % h;
}

// Returns the signed minimum-image delta from coordinate a to coordinate b
// along a periodic dimension of size dim (minimum image convention).
// The result is always in [-dim/2, +dim/2).
function toroidalDelta(a, b, dim) {
  const d = b - a;
  return d - dim * Math.round(d / dim);
}

// --- Unit tests for task 3.1 / 3.3 ---
{
  const W = 900, H = 700;
  const p = { x: 0, y: 0 };

  // Right edge: exactly at canvas width wraps to 0
  p.x = 900; p.y = 350;
  wrapPosition(p, W, H);
  console.assert(p.x === 0, '3.1: x=900 should wrap to 0');

  // Beyond right edge
  p.x = 950; p.y = 350;
  wrapPosition(p, W, H);
  console.assert(p.x === 50, '3.1: x=950 should wrap to 50');

  // Left edge (negative)
  p.x = -10; p.y = 350;
  wrapPosition(p, W, H);
  console.assert(p.x === 890, '3.3: x=-10 should wrap to 890');

  // Bottom edge: exactly at canvas height wraps to 0
  p.x = 450; p.y = 700;
  wrapPosition(p, W, H);
  console.assert(p.y === 0, '3.1: y=700 should wrap to 0');

  // Top edge (negative)
  p.x = 450; p.y = -5;
  wrapPosition(p, W, H);
  console.assert(p.y === 695, '3.3: y=-5 should wrap to 695');

  // Value well inside bounds stays unchanged
  p.x = 400; p.y = 300;
  wrapPosition(p, W, H);
  console.assert(p.x === 400 && p.y === 300, '3.1: in-bounds position unchanged');

  console.log('✓ Tasks 3.1 + 3.3: wrapPosition and edge-wrap tests passed');
}

// --- Unit tests for task 3.4: toroidalDelta shortest-path ---
{
  const W = 800;

  // Shortest path: x=10 to x=790 via the wrap → delta = -20 (not +780)
  const dx = toroidalDelta(10, 790, W);
  console.assert(Math.abs(dx) === 20, `3.4: |delta| should be 20, got ${Math.abs(dx)}`);
  console.assert(dx === -20, `3.4: delta should be -20 (wrap direction), got ${dx}`);

  // Direct path: x=100 to x=300 → delta = +200 (no wrap needed)
  console.assert(toroidalDelta(100, 300, W) === 200, '3.4: direct delta 100→300 should be 200');

  // Symmetric: delta(a→b) === -delta(b→a)
  console.assert(toroidalDelta(790, 10, W) === 20, '3.4: reverse delta 790→10 should be +20');

  // Midpoint case: exactly half the dimension — Math.round ties to even (banker's rounding)
  // but the important invariant is |result| === W/2
  console.assert(Math.abs(toroidalDelta(0, 400, W)) === 400, '3.4: delta at exactly W/2 has magnitude 400');

  // Delta of 0 for same position
  console.assert(toroidalDelta(500, 500, W) === 0, '3.4: same position → delta 0');

  console.log('✓ Task 3.4: toroidalDelta shortest-path tests passed');
}

function setup() {
  const canvas = createCanvas(900, 700);
  canvas.parent('canvas-container');
}

function draw() {
}
