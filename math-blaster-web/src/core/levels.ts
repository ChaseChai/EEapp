export interface Target {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  name: string;
  hint: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Advanced" | "Calculus";
  targets: Target[];
  solution: string;
  initialExpression: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Origin",
    hint: "A straight line crossing the center.",
    difficulty: "Easy",
    targets: [{x: -100, y: -100}, {x: 100, y: 100}],
    solution: "1 * x",
    initialExpression: "a * x"
  },
  {
    id: 2,
    name: "Curve",
    hint: "It bends like a gentle smile.",
    difficulty: "Medium",
    targets: [{x: -100, y: 100}, {x: 0, y: 0}, {x: 100, y: 100}],
    solution: "1 * 0.01 * x^2 + 0",
    initialExpression: "a * 0.01 * x^2 + c"
  },
  {
    id: 3,
    name: "Gravity",
    hint: "A projectile falling through the sky.",
    difficulty: "Medium",
    targets: [{x: -100, y: -50}, {x: 0, y: 50}, {x: 100, y: -50}],
    solution: "-1 * 0.01 * x^2 + 5 * 10",
    initialExpression: "a * 0.01 * x^2 + c * 10"
  },
  {
    id: 4,
    name: "Offset",
    hint: "Shifted horizontally from the center.",
    difficulty: "Hard",
    targets: [{x: 0, y: 0}, {x: 100, y: 100}, {x: 200, y: 0}],
    solution: "-1 * 0.01 * (x - 10 * 10)^2 + 10 * 10",
    initialExpression: "a * 0.01 * (x - b * 10)^2 + c * 10"
  },
  {
    id: 5,
    name: "Construction",
    hint: "Endless waves oscillating over time. (Try a=10, b=1)",
    difficulty: "Hard",
    targets: [{x: -150, y: 100}, {x: -50, y: -100}, {x: 50, y: 100}, {x: 150, y: -100}],
    solution: "10 * 10 * sin(1 * 0.0314 * x)",
    initialExpression: "a * 10 * sin(b * 0.0314 * x)"
  },
  {
    id: 6,
    name: "Resonance",
    hint: "A parabolic curve mixed with a slope.",
    difficulty: "Advanced",
    targets: [{x: -100, y: 0}, {x: 0, y: 0}, {x: 100, y: 100}],
    solution: "1 * 0.005 * x^2 + 1 * 0.5 * x",
    initialExpression: "a * 0.005 * x^2 + b * 0.5 * x"
  },
  {
    id: 7,
    name: "Damping",
    hint: "Energy localized at the origin, dissipating outward like a bell.",
    difficulty: "Advanced",
    targets: [{x: -100, y: 36}, {x: 0, y: 100}, {x: 100, y: 36}],
    solution: "10 * 10 * exp(-1 * 0.01 * abs(x))",
    initialExpression: "a * 10 * exp(-b * 0.01 * abs(x))"
  },
  {
    id: 8,
    name: "Pulse (Agnesi)",
    hint: "A sudden rational burst that quickly returns to calm.",
    difficulty: "Calculus",
    targets: [{x: -30, y: 50}, {x: 0, y: 100}, {x: 30, y: 50}],
    solution: "1 * 10000 / (x^2 + 1 * 100)",
    initialExpression: "a * 10000 / (x^2 + b * 100)"
  },
  {
    id: 9,
    name: "The Abyss (Sigmoid)",
    hint: "A smooth transition from nothing to everything.",
    difficulty: "Calculus",
    targets: [{x: -100, y: -50}, {x: 0, y: 0}, {x: 100, y: 49}],
    solution: "1 * 100 / (1 + exp(-1 * 0.05 * x)) - 1 * 50",
    initialExpression: "a * 100 / (1 + exp(-b * 0.05 * x)) - c * 50"
  }
];
