# Proof or Bluff — demoLand

**The fully playable demo version. No blockchain, no wallet, no real money. Just the game.**

> For full architecture details, iterations, folder structure, running instructions, and environment config, see **[DEMOLAND_VS_REALDEAL.md](DEMOLAND_VS_REALDEAL.md)**.

---

## Quick Start

```bash
npm install
npm run dev:demo
# → http://localhost:3015
```

No Docker, no wallet, no internet required.

---

## What Lives Here

```
demoLand/src/
├── game/
│   ├── engine.js        # Core game loop
│   ├── deck.js          # Deck creation + shuffle (Home / Casino)
│   ├── rules.js         # Rule enforcement
│   └── ai/
│       ├── scripted.js  # Iterations 1–2: scripted AI
│       ├── agent.js     # Iteration 3: live AI agent (stub)
│       └── difficulty.js # Easy / Medium / Hard
└── providers/
    ├── types.js         # Shared interfaces
    ├── index.js         # Provider factory
    └── demoland/
        ├── gameProvider.js
        └── aiProvider.js
```

---

📚 **Full docs**: [Game Rules](RULES.md) · [Gameplay Design](GAMEPLAY_RESEARCH.md) · [Architecture](DEMOLAND_VS_REALDEAL.md) · [Roadmap](ROADMAP.md) · [Back to README](../README.md)
