# Proof or Bluff — realDeal

**The real thing. Midnight private state, ZK proofs, Lace wallet, provable fairness.**

> For full architecture details, Compact contract design, Midnight dependencies, running instructions, and environment config, see **[DEMOLAND_VS_REALDEAL.md](DEMOLAND_VS_REALDEAL.md)**.

---

## Quick Start

```bash
# 1. Start proof server
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v

# 2. Compile contract
compactc proof-or-bluff.compact

# 3. Start the app
npm run dev:real
# → http://localhost:3015
```

See [Midnight Vitals](MIDNIGHT_VITALS.md) for the full startup checklist and troubleshooting.

---

## What Lives Here

```
realDeal/
├── contracts/
│   └── proof-or-bluff.compact  # Compact smart contract (stub)
├── src/                         # (planned)
│   ├── providers/realdeal/     # Midnight-backed providers
│   ├── sdk/                    # Contract API, proof client, indexer
│   └── utils/                  # Network config, wallet utils
├── tests/                       # Contract + integration tests
└── managed/                     # Compiled contract artifacts
```

---

## Status

🔲 **Contract design phase** — not yet compiled or deployed. The demoLand game loop must be working first.

---

📚 **Full docs**: [Architecture](DEMOLAND_VS_REALDEAL.md) · [Midnight Vitals](MIDNIGHT_VITALS.md) · [Game Rules](RULES.md) · [Gameplay Design](GAMEPLAY_RESEARCH.md) · [Roadmap](ROADMAP.md) · [Back to README](../README.md)
