<div align="center">
  
  # 📈 BTC Cycle Valuation System
  
  **A quantitative and statistical valuation engine designed to identify Bitcoin cycle peaks, troughs, and mid-cycle phases.**

  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
  ![Hono](https://img.shields.io/badge/Hono-E36002.svg?style=for-the-badge&logo=hono&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
  ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![SQLite](https://img.shields.io/badge/SQLite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

  <br />
</div>

## 🎯 System Goal

The system aggregates metrics across on-chain data, sentiment indicators, and technical price action to output a **master valuation oscillator** bounded from `-2` (extreme low value / undervalued) to `+2` (extreme high value / overvalued).

## 🏗 System Architecture

The project is built on a modular, multi-language stack to optimize for both rigorous data science and high-performance web delivery:

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Quant / Data** | `Python` | Data scraping, on-chain metric calculations, and statistical modeling. |
| **Backend** | `Hono` + `Bun` | Fast, lightweight API service. |
| **Frontend** | `Vite` + `React` | Interactive dashboard for real-time charting and data visualization. |
| **Database** | `SQLite` | Local native storage for time-series metrics, valuation models, and raw data. |

## ⚙️ Core Data Workflow

The system's data modeling adheres strictly to the following pipeline rules:

1. **Raw Data Ingestion:** Raw data is fetched from online sources and stored directly into SQLite. Every data source exposes a callable function to either fetch fresh delta data incrementally or rebuild the entire historical dataset from scratch.
2. **Component Modeling:** Each raw data stream serves as a system "component". Components are manipulated via statistical workflows to normalize their metrics onto the standard `-2` to `+2` scale.
3. **The "Playground" Rule (1 Component = 1 Script):** Each component is housed in its own dedicated Python script. This ensures researchers have an isolated playground to visualize the data, tweak parameters (such as window lengths or moving averages), and experiment with statistical transformations.

## 🚀 Development Setup

> [!NOTE]  
> This project enforces [Bun](https://bun.sh/) for all Node/JS/TS operations and standard `pip` for Python.

### Prerequisites

- [Bun](https://bun.sh/) (latest)
- Python 3.10+
- Git

### Installation

1. **Install JavaScript/TypeScript dependencies (Frontend & Backend):**
   ```bash
   bun install
   ```

2. **Install Python dependencies (Quant Pipeline):**
   ```bash
   python -m pip install -r requirements.txt
   ```

## 🧪 Testing

Reliability is enforced via automated test suites across the stack.

**Python (Fast validation):**
```bash
python -m pytest -xvs
```

**Python (Full coverage):**
```bash
python -m pytest --cov
```

**JS/TS (Frontend & Backend):**
```bash
bun test
```

## 🧠 Spec-Driven Development

This repository is governed by [OpenSpec](https://openspec.pro/) to ensure predictable, spec-driven development and robust AI integration. 

All technical designs, implementation tasks, and system specifications are documented inside the `openspec/` directory. AI agents and developers must consult `AGENTS.md` and `openspec/config.yaml` to ensure they strictly follow the system architecture and ubiquitous language.

> [!IMPORTANT]  
> Force pushing (`git push --force` or `--force-with-lease`) is strictly prohibited in this repository. Always rebase your local branch (`git pull --rebase`) before pushing.
