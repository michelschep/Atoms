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

function setup() {
  const canvas = createCanvas(900, 700);
  canvas.parent('canvas-container');
}

function draw() {
}
