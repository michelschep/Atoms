const PARTICLE_TYPES = [
  { id: 0, name: 'Lumion',  color: '#FFD700', mass: 1.0, maxSpeed: 3.5, description: 'Glows brightly; attracts other Lumions from a distance.' },
  { id: 1, name: 'Vortaar', color: '#4169E1', mass: 2.0, maxSpeed: 2.0, description: 'Rotates slowly on its own axis; draws Lumions in.' },
  { id: 2, name: 'Nullon',  color: '#C0C0C0', mass: 1.5, maxSpeed: 2.5, description: 'Neutral by nature; strongly attracted to Gravon.' },
  { id: 3, name: 'Phasex',  color: '#8B00FF', mass: 1.0, maxSpeed: 3.0, description: 'Oscillates between attraction and repulsion.' },
  { id: 4, name: 'Gravon',  color: '#8B0000', mass: 4.0, maxSpeed: 0.8, description: 'Heavy and slow; weakly attracts everything nearby.' },
  { id: 5, name: 'Chromax', color: '#00CED1', mass: 1.5, maxSpeed: 2.8, description: 'Clusters together; pulled toward Phasex.' },
  { id: 6, name: 'Fluxar',  color: '#FF6600', mass: 1.0, maxSpeed: 4.0, description: 'Chaotic: force sign flips every ~2 seconds.' },
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

  if (typeId === 1) { // Vortaar — rotates slowly around its own axis
    p.rotAngle = 0;
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

const MAX_RANGE = 150;
const MIN_DIST   = 5;
const DAMPING    = 0.99;
const BOND_THRESHOLD = 0.5;
// Global force multiplier. Without this, raw matrix strengths (max 1.5) produce
// max F = 1.5/(5²) = 0.06 — too weak to reach maxSpeed or BOND_THRESHOLD.
// At FORCE_SCALE=400 a single neighbor at d=100 drives a Lumion to ~1.6 px/frame;
// multiple neighbors combine to push particles toward maxSpeed, creating lively dynamics.
// Bonds (|F| > 0.5) form when strong pairs are within ~35–55 px.
const FORCE_SCALE = 400;
// Short-range universal repulsion zone. ALL pairs repel for d < BETA regardless of type,
// preventing particle collapse (fusing) and frozen clusters.
// BETA_REPULSE calibrated so repulsion dominates max type-specific attraction for d < BETA,
// with a smooth linear ramp to zero at d = BETA (continuous with the outer force).
const BETA = 10;
const BETA_REPULSE = FORCE_SCALE * 0.3; // 120 — overcomes max attraction (~24) at d < BETA

// Computes pairwise forces for all particles and accumulates ax/ay on each.
// Returns an array of bond pairs [{ a, b }] where |F| > BOND_THRESHOLD.
// Call this once per frame before integrating velocity.
// w/h default to p5.js globals; pass explicit values in unit tests.
function applyForces(particles, fc, w = width, h = height) {
  // Zero out accelerations
  for (const p of particles) {
    p.ax = 0;
    p.ay = 0;
  }

  const bonds = [];
  const MAX_RANGE_SQ = MAX_RANGE * MAX_RANGE;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];

      const dx = toroidalDelta(a.x, b.x, w);
      const dy = toroidalDelta(a.y, b.y, h);
      const dSq = dx * dx + dy * dy;

      if (dSq > MAX_RANGE_SQ) continue;

      const d = Math.sqrt(dSq);
      if (d === 0) {
        // Break exact overlap: random impulse separates the pair next frame.
        // Prevents frozen "dimers" at d=0 where the force skip leaves them stuck.
        const angle = Math.random() * Math.PI * 2;
        a.vx += Math.cos(angle) * MIN_DIST;
        a.vy += Math.sin(angle) * MIN_DIST;
        b.vx -= Math.cos(angle) * MIN_DIST;
        b.vy -= Math.sin(angle) * MIN_DIST;
        continue;
      }

      const dClamped = Math.max(d, MIN_DIST);
      const strength = getForceStrength(a, b, fc);
      const F = strength * FORCE_SCALE / (dClamped * dClamped);

      // Unit vector uses d (not dClamped) to preserve direction accuracy
      const ux = dx / d;
      const uy = dy / d;

      a.ax += (F * ux) / a.mass;
      a.ay += (F * uy) / a.mass;
      b.ax -= (F * ux) / b.mass;
      b.ay -= (F * uy) / b.mass;

      if (Math.abs(F) > BOND_THRESHOLD) {
        bonds.push({ a, b });
      }

      // Short-range universal repulsion: prevents collapse to d=0.
      // Force is zero at d=BETA and increases linearly to -BETA_REPULSE at d=0.
      if (d < BETA) {
        const repF = BETA_REPULSE * (d / BETA - 1); // ≤ 0 (repulsive)
        a.ax += (repF * ux) / a.mass;
        a.ay += (repF * uy) / a.mass;
        b.ax -= (repF * ux) / b.mass;
        b.ay -= (repF * uy) / b.mass;
      }
    }
  }

  return bonds;
}

// --- Unit tests for task 4.1 ---
{
  _nextPhasexOffset = 0;

  // Use Lumion (type 0): Lumion-Lumion strength = +0.8
  function makeLumion(x, y) { return createParticle(0, x, y); }

  // Early-exit: particles whose minimum-image distance > MAX_RANGE get zero acceleration
  {
    const W = 900, H = 700;
    const a = makeLumion(100, 350);
    const b = makeLumion(300, 350); // dx=200 > 150
    applyForces([a, b], 0, W, H);
    console.assert(a.ax === 0 && a.ay === 0, '4.1: particles >MAX_RANGE apart get zero ax/ay on a');
    console.assert(b.ax === 0 && b.ay === 0, '4.1: particles >MAX_RANGE apart get zero ax/ay on b');
  }

  // Within range: particles get non-zero acceleration
  {
    const W = 900, H = 700;
    const a = makeLumion(100, 350);
    const b = makeLumion(200, 350); // dx=100 < 150, strength=0.8 → non-zero
    applyForces([a, b], 0, W, H);
    console.assert(a.ax !== 0 || a.ay !== 0, '4.1: particles within MAX_RANGE get non-zero acceleration');
  }

  // Toroidal interaction: near opposite edges interact through the wrap
  {
    const W = 900, H = 700;
    const a = makeLumion(10, 350);
    const b = makeLumion(890, 350); // screen dist=880, toroidal dist=20
    applyForces([a, b], 0, W, H);
    console.assert(a.ax !== 0, '4.1: toroidal pair (opposite edges) gets non-zero acceleration');
  }

  // Newton's 3rd law: m_a * ax_a ≈ -m_b * ax_b
  {
    const W = 900, H = 700;
    const a = makeLumion(200, 350); // mass=1.0
    const b = createParticle(4, 280, 350); // Gravon, mass=4.0; dx=80 < 150
    applyForces([a, b], 0, W, H);
    const impulseA = a.mass * a.ax;
    const impulseB = b.mass * b.ax;
    const diff = Math.abs(impulseA + impulseB);
    console.assert(diff < 1e-10, `4.1: Newton's 3rd law: impulse sum should be ~0, got ${diff}`);
  }

  // d===0 edge: overlapping particles → no NaN, no crash
  {
    const W = 900, H = 700;
    const a = makeLumion(200, 200);
    const b = makeLumion(200, 200); // exact overlap
    applyForces([a, b], 0, W, H);
    console.assert(a.ax === 0 && isFinite(a.ax), '4.1: exact overlap → ax stays 0 (no NaN)');
  }

  _nextPhasexOffset = 0;
  console.log('✓ Task 4.1: applyForces tests passed');
}

// --- Unit tests for task 4.2: short-range repulsion (BETA zone) ---
// b is placed to the right of a (dx > 0) in all cases.
// Repulsion pushes a LEFT (ax < 0); type-specific attraction pulls a RIGHT (ax > 0).
{
  const W = 900, H = 700;

  function makeLumion(x, y) {
    _nextPhasexOffset = 0;
    return createParticle(0, x, y);
  }

  // At d=2 (deep inside BETA): repulsion dominates → ax < 0
  const a2 = makeLumion(400, 350);
  const b2 = makeLumion(402, 350); // d=2
  applyForces([a2, b2], 0, W, H);

  // At d=5 (inside BETA): repulsion still dominates but weaker than d=2
  const a5 = makeLumion(400, 350);
  const b5 = makeLumion(405, 350); // d=5
  applyForces([a5, b5], 0, W, H);

  console.assert(isFinite(a2.ax), '4.2: ax at d=2 should be finite (no singularity)');
  console.assert(a2.ax < 0, '4.2: d=2 inside BETA → net repulsion pushes a left (ax < 0)');
  console.assert(a5.ax < 0, '4.2: d=5 inside BETA → net repulsion (ax < 0)');
  console.assert(a2.ax < a5.ax, '4.2: d=2 has stronger repulsion than d=5 (closer to core)');

  // At d=BETA=10: repulsion = 0, only type-specific attraction applies
  // Lumion-Lumion strength = +0.8, d=10 → F = 0.8*FORCE_SCALE/100 > 0 → ax > 0 (toward b)
  const a10 = makeLumion(400, 350);
  const b10 = makeLumion(410, 350); // d=10 == BETA
  applyForces([a10, b10], 0, W, H);
  console.assert(a10.ax > 0, '4.2: at d=BETA repulsion=0, Lumion-Lumion attraction → ax > 0');
  console.assert(Math.abs(a10.ax) < Math.abs(a5.ax), '4.2: type-specific force at BETA weaker than inner repulsion at d=5');

  _nextPhasexOffset = 0;
  console.log('✓ Task 4.2: short-range repulsion (BETA) tests passed');
}

// Integrates acceleration into velocity, applies DAMPING, clips to maxSpeed,
// then updates position.
// Call once per frame after applyForces() and before wrapPosition().
function updateParticles(particles) {
  for (const p of particles) {
    p.vx = (p.vx + p.ax) * DAMPING;
    p.vy = (p.vy + p.ay) * DAMPING;

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > p.maxSpeed) {
      const scale = p.maxSpeed / speed;
      p.vx *= scale;
      p.vy *= scale;
    }

    p.x += p.vx;
    p.y += p.vy;
  }
}

// --- Unit tests for task 4.3: DAMPING ---
{
  // Velocity decays by DAMPING each frame with zero acceleration
  // Use vx=2 (below Lumion's maxSpeed=3.5) to test DAMPING without hitting the clip
  const p = createParticle(0, 100, 100);
  p.ax = 0; p.ay = 0;
  p.vx = 2; p.vy = 0;

  updateParticles([p]);
  console.assert(Math.abs(p.vx - 2 * DAMPING) < 1e-10,
    `4.3: vx after 1 frame should be ${2 * DAMPING}, got ${p.vx}`);

  updateParticles([p]);
  console.assert(Math.abs(p.vx - 2 * DAMPING * DAMPING) < 1e-10,
    `4.3: vx after 2 frames should be ${2 * DAMPING * DAMPING}, got ${p.vx}`);

  // Acceleration is integrated before damping: v_new = (v + a) * DAMPING
  const p2 = createParticle(0, 0, 0);
  p2.vx = 0; p2.vy = 0;
  p2.ax = 2; p2.ay = 0;
  updateParticles([p2]);
  console.assert(Math.abs(p2.vx - 2 * DAMPING) < 1e-10,
    `4.3: vx from rest with ax=2 should be ${2 * DAMPING}, got ${p2.vx}`);

  // Position is updated by the post-damping velocity
  // Use vx=2, vy=-1 (speed≈2.24, after DAMPING≈2.19, below Lumion maxSpeed=3.5)
  const p3 = createParticle(0, 50, 80);
  p3.vx = 2; p3.vy = -1;
  p3.ax = 0; p3.ay = 0;
  const expectedVx = 2 * DAMPING;
  const expectedVy = -1 * DAMPING;
  updateParticles([p3]);
  console.assert(Math.abs(p3.x - (50 + expectedVx)) < 1e-10,
    `4.3: x should be ${50 + expectedVx}, got ${p3.x}`);
  console.assert(Math.abs(p3.y - (80 + expectedVy)) < 1e-10,
    `4.3: y should be ${80 + expectedVy}, got ${p3.y}`);

  console.log('✓ Task 4.3: updateParticles DAMPING tests passed');
}

// --- Unit tests for task 4.4: maxSpeed clipping ---
{
  // Velocity above maxSpeed is clipped to maxSpeed (magnitude), direction preserved
  const p = createParticle(0, 0, 0); // Lumion, maxSpeed=3.5
  p.ax = 0; p.ay = 0;
  p.vx = 10; p.vy = 0; // well above maxSpeed
  updateParticles([p]);
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  console.assert(speed <= p.maxSpeed + 1e-10,
    `4.4: speed should be clipped to maxSpeed=${p.maxSpeed}, got ${speed}`);
  console.assert(p.vx > 0, '4.4: direction (positive x) should be preserved after clipping');
  console.assert(Math.abs(p.vy) < 1e-10, '4.4: vy should remain 0 (direction preserved)');

  // Velocity below maxSpeed is NOT clipped
  const p2 = createParticle(0, 0, 0); // Lumion, maxSpeed=3.5
  p2.ax = 0; p2.ay = 0;
  p2.vx = 1; p2.vy = 0; // 1 * DAMPING = 0.98, well below 3.5
  updateParticles([p2]);
  console.assert(Math.abs(p2.vx - 1 * DAMPING) < 1e-10,
    `4.4: velocity below maxSpeed should not be clipped, got ${p2.vx}`);

  // Diagonal velocity clipped preserves direction
  const p3 = createParticle(6, 0, 0); // Fluxar, maxSpeed=4.0
  p3.ax = 0; p3.ay = 0;
  p3.vx = 20; p3.vy = 20;
  updateParticles([p3]);
  const speed3 = Math.sqrt(p3.vx * p3.vx + p3.vy * p3.vy);
  console.assert(speed3 <= p3.maxSpeed + 1e-10,
    `4.4: diagonal speed should be clipped to maxSpeed=${p3.maxSpeed}, got ${speed3}`);
  console.assert(Math.abs(p3.vx - p3.vy) < 1e-10,
    '4.4: diagonal clipping should preserve equal vx/vy ratio');

  // Different particle types respect their own maxSpeed
  const gravon = createParticle(4, 0, 0); // Gravon, maxSpeed=0.8
  gravon.ax = 0; gravon.ay = 0;
  gravon.vx = 5; gravon.vy = 0;
  updateParticles([gravon]);
  const speedGravon = Math.sqrt(gravon.vx * gravon.vx + gravon.vy * gravon.vy);
  console.assert(speedGravon <= gravon.maxSpeed + 1e-10,
    `4.4: Gravon speed clipped to maxSpeed=${gravon.maxSpeed}, got ${speedGravon}`);

  console.log('✓ Task 4.4: maxSpeed clipping tests passed');
}

// --- Unit tests for task 4.5: bond pair collection ---
{
  const W = 900, H = 700;

  // No bond for distant pair: Lumion-Lumion at d=100
  // F = 0.8 * FORCE_SCALE / 10000 = 0.032 < BOND_THRESHOLD → no bond
  {
    _nextPhasexOffset = 0;
    const a = createParticle(0, 200, 350);
    const b = createParticle(0, 300, 350); // d=100, well below bond threshold
    const bonds = applyForces([a, b], 0, W, H);
    console.assert(bonds.length === 0, `4.5: distant pair (d=100, F<BOND_THRESHOLD) should not produce bond, got ${bonds.length}`);
  }

  // Bond forms for close strong pair: Nullon-Gravon at d=5
  // F = 1.5 * FORCE_SCALE / 25 = 24 >> BOND_THRESHOLD → bond
  {
    _nextPhasexOffset = 0;
    const a = createParticle(2, 100, 100); // Nullon
    const b = createParticle(4, 105, 100); // Gravon, d=5
    const bonds = applyForces([a, b], 0, W, H);
    console.assert(Array.isArray(bonds), '4.5: applyForces should return an Array');
    console.assert(bonds.length === 1, `4.5: strong close pair (Nullon-Gravon, d=5) should bond, got ${bonds.length}`);
    console.assert('a' in bonds[0] && 'b' in bonds[0], '4.5: bond entry has { a, b } shape');
  }

  // Invariant: every bond in a multi-particle scenario satisfies |F * FORCE_SCALE| > BOND_THRESHOLD
  // Uses types 0-4 spaced 20px apart (all within MAX_RANGE); PHASE tokens resolve to 0 at fc=0
  {
    _nextPhasexOffset = 0;
    const particles = Array.from({ length: 5 }, (_, i) => createParticle(i, i * 20, 350));
    const bonds = applyForces(particles, 0, W, H);
    console.assert(Array.isArray(bonds), '4.5: multi-particle applyForces returns Array');
    for (const bond of bonds) {
      console.assert(Math.abs(
        getForceStrength(bond.a, bond.b, 0) * FORCE_SCALE /
        Math.pow(Math.max(
          Math.sqrt(
            Math.pow(toroidalDelta(bond.a.x, bond.b.x, W), 2) +
            Math.pow(toroidalDelta(bond.a.y, bond.b.y, H), 2)
          ), MIN_DIST), 2)
      ) > BOND_THRESHOLD, '4.5: every bond in result has |F| > BOND_THRESHOLD');
    }
  }

  _nextPhasexOffset = 0;
  console.log('✓ Task 4.5: bond pair collection tests passed');
}

let particles = [];
const DEFAULT_COUNTS = [10, 10, 10, 10, 10, 10, 10]; // 10 per type = 70 total

// Creates all particles for the simulation.
// counts[i] = number of particles of type i to create.
// Particles are placed at random positions with a small random initial velocity.
function initParticles(counts = DEFAULT_COUNTS) {
  _nextPhasexOffset = 0;
  particles = [];
  for (let typeId = 0; typeId < counts.length; typeId++) {
    const t = PARTICLE_TYPES[typeId];
    for (let i = 0; i < counts[typeId]; i++) {
      const p = createParticle(typeId, random(width), random(height));
      p.vx = random(-t.maxSpeed * 0.3, t.maxSpeed * 0.3);
      p.vy = random(-t.maxSpeed * 0.3, t.maxSpeed * 0.3);
      particles.push(p);
    }
  }
}

// Builds the slider UI for all particle types in the #sliders container.
// Each slider row contains a color dot, a type name, and a count display.
// Returns an array of { slider, countEl } in PARTICLE_TYPES order.
function buildSliderUI() {
  const container = document.getElementById('sliders');
  const refs = [];

  for (const t of PARTICLE_TYPES) {
    const row = document.createElement('div');
    row.className = 'slider-row';

    const label = document.createElement('div');
    label.className = 'slider-label';

    const dot = document.createElement('span');
    dot.className = 'slider-dot';
    dot.style.background = t.color;

    const name = document.createElement('span');
    name.textContent = t.name;

    const countEl = document.createElement('span');
    countEl.className = 'slider-count';
    countEl.textContent = String(DEFAULT_COUNTS[t.id]);

    label.appendChild(dot);
    label.appendChild(name);
    label.appendChild(countEl);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '50';
    slider.value = String(DEFAULT_COUNTS[t.id]);
    slider.dataset.typeId = String(t.id);

    slider.addEventListener('input', () => {
      countEl.textContent = slider.value;
      const counts = sliderRefs.map(ref => parseInt(ref.slider.value, 10));
      initParticles(counts);
    });

    row.appendChild(label);
    row.appendChild(slider);
    container.appendChild(row);

    refs.push({ slider, countEl });
  }

  return refs;
}

// Builds the legend UI for all particle types in the #legend container.
// Each item shows a color dot, the type name, and a short behaviour description.
function buildLegendUI() {
  const container = document.getElementById('legend');

  for (const t of PARTICLE_TYPES) {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = t.color;

    const text = document.createElement('div');
    text.className = 'legend-text';

    const nameEl = document.createElement('span');
    nameEl.className = 'legend-name';
    nameEl.textContent = t.name;

    const descEl = document.createElement('span');
    descEl.className = 'legend-desc';
    descEl.textContent = t.description;

    text.appendChild(nameEl);
    text.appendChild(descEl);
    item.appendChild(dot);
    item.appendChild(text);
    container.appendChild(item);
  }
}

// When true: full opaque clear each frame — particles move with no trails.
// When false: no background call — particle traces accumulate into a painting.
let clearScreen = true;

let sliderRefs = [];

function setup() {
  const canvas = createCanvas(900, 700);
  canvas.parent('canvas-container');
  colorMode(RGB, 255);
  initParticles();

  sliderRefs = buildSliderUI();
  buildLegendUI();

  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.addEventListener('click', () => {
    if (isLooping()) {
      noLoop();
      pauseBtn.textContent = '▶ Play';
    } else {
      loop();
      pauseBtn.textContent = '⏸ Pause';
    }
  });

  const trailsBtn = document.getElementById('trails-btn');
  trailsBtn.addEventListener('click', () => {
    clearScreen = !clearScreen;
    if (clearScreen) {
      trailsBtn.textContent = '🎨 Painting';
      trailsBtn.classList.remove('active');
    } else {
      trailsBtn.textContent = '✋ Stop painting';
      trailsBtn.classList.add('active');
    }
  });
}

// Draws semi-transparent bond lines between strongly-interacting particle pairs.
// Colour is a 50/50 lerpColor blend of the two particle colours.
// Bonds that cross the toroidal boundary are skipped to avoid canvas-spanning lines.
function drawBondLines(bonds) {
  const W = width, H = height;
  strokeWeight(1.5);
  for (const { a, b } of bonds) {
    // Skip bonds whose shortest toroidal path crosses the canvas edge
    const directDx = Math.abs(b.x - a.x);
    const directDy = Math.abs(b.y - a.y);
    const toroidDx = Math.abs(toroidalDelta(a.x, b.x, W));
    const toroidDy = Math.abs(toroidalDelta(a.y, b.y, H));
    if (toroidDx < directDx - 0.5 || toroidDy < directDy - 0.5) continue;

    const ca = color(a.color);
    const cb = color(b.color);
    const mc = lerpColor(ca, cb, 0.5);
    stroke(red(mc), green(mc), blue(mc), 110);
    line(a.x, a.y, b.x, b.y);
  }
  noStroke();
}

// Outer glow radius — must match the largest circle drawn in drawParticleAt (diameter 28 → radius 14).
// Ghost copies are rendered when a particle is within this distance of any canvas edge.
const RENDER_RADIUS = 14;

// Draws a single particle at an arbitrary (x, y) position.
// Used both for the real position and for ghost copies near canvas edges.
function drawParticleAt(p, x, y) {
  const c = color(p.color);
  const r = red(c), g = green(c), b = blue(c);
  noStroke();

  fill(r, g, b, 35);
  circle(x, y, 28);

  fill(r, g, b, 80);
  circle(x, y, 14);

  fill(r, g, b, 220);
  circle(x, y, 6);

  if (p.type === 1) {
    const orbitRadius = 10;
    fill(r, g, b, 160);
    for (let i = 0; i < 3; i++) {
      const ang = p.rotAngle + (i * TWO_PI / 3);
      circle(x + cos(ang) * orbitRadius, y + sin(ang) * orbitRadius, 4);
    }
  }
}

// Draws a particle at its real position plus ghost copies near canvas edges.
// Ghost copies make the simulation look like a true torus: a particle exiting the
// right edge is simultaneously seen entering the left edge, with no teleport jump.
// Uses a cross-product of X and Y ghost positions to handle all four corners correctly.
function drawParticle(p) {
  const W = width, H = height;

  const xs = [p.x];
  if (p.x < RENDER_RADIUS)          xs.push(p.x + W);
  else if (p.x > W - RENDER_RADIUS) xs.push(p.x - W);

  const ys = [p.y];
  if (p.y < RENDER_RADIUS)          ys.push(p.y + H);
  else if (p.y > H - RENDER_RADIUS) ys.push(p.y - H);

  for (const gx of xs) {
    for (const gy of ys) {
      drawParticleAt(p, gx, gy);
    }
  }
}

function draw() {
  // 1. Clear screen — full opaque clear when clearScreen is true (no trails),
  //    skipped when false so particle traces accumulate into a painting.
  if (clearScreen) background(0, 0, 0, 255);

  // 2. Compute pairwise forces and collect bond pairs
  const bonds = applyForces(particles, frameCount);

  // 3. Advance Fluxar chaos clock and Vortaar rotation angle
  for (const p of particles) {
    tickFluxar(p);
    if (p.rotAngle !== undefined) p.rotAngle += 0.04;
  }

  // 4. Integrate velocities and update positions
  updateParticles(particles);

  // 4a. Tiny thermal kicks — prevents complete stillness in symmetric equilibria
  // (equivalent to low-temperature Brownian motion; magnitude is ~2% of min maxSpeed)
  for (const p of particles) {
    p.vx += random(-0.02, 0.02);
    p.vy += random(-0.02, 0.02);
  }

  // 5. Apply toroidal wrapping
  for (const p of particles) wrapPosition(p);

  // 6. Render bond lines first so particles appear on top
  drawBondLines(bonds);
  for (const p of particles) drawParticle(p);

  // 7. Update FPS display every 30 frames so it is readable without jitter.
  //    frameRate() is p5.js's built-in rolling average.
  //    Green ≥ 30 fps (target), yellow 20-29, red < 20.
  if (frameCount % 30 === 0) {
    const fpsEl = document.getElementById('fps-display');
    if (fpsEl) {
      const fps = Math.round(frameRate());
      fpsEl.textContent = `FPS: ${fps} | ${particles.length} particles`;
      fpsEl.className = fps >= 30 ? 'fps-good' : fps >= 20 ? 'fps-warn' : 'fps-bad';
    }
  }
}
