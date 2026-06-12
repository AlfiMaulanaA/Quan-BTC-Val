## Context

Currently, the system triggers a delta fetch for components, but the price reference table `btc_ohlc` fetches and inserts all historical records (6,300+) sequentially on every pipeline run, creating a major performance bottleneck. Furthermore, the frontend has a single "REFETCH ALL DATA" button that runs a delta under the hood but is named confusingly, and there is no UI option to run a full rebuild if data gets corrupted or needs recalculation.

## Goals / Non-Goals

**Goals:**
- Optimize `quant/btc_ohlc.py` to support incremental fetching and store records using a bulk transaction.
- Update `/api/pipeline/run` to support and properly route `rebuild=true` and `rebuild=false`.
- Expose distinct "Refetch Latest" and "Full Rebuild" buttons/actions in the frontend UI.
- Display last updated date and status feedback to the user on the dashboard.

**Non-Goals:**
- Changing database schema columns or tables.
- Modifying metric calculations or formulas.

## Decisions

### 1. Incremental Ingestion for BTC OHLC Reference Data
- **Choice:** Fetch all from the Bitview API (which has a single static file endpoint), filter chronologically in Python relative to `SELECT MAX(date) FROM btc_ohlc`, and use `executemany` for bulk insertion.
- **Alternative:** Fetching only delta from a start date API parameter (unsupported by the Bitview OHLC endpoint).
- **Rationale:** Minimizes database write operations to only the missing days since last sync.

### 2. Frontend User Interface Controls
- **Choice:** Rename the existing navbar button to "Refetch Latest" and add a side-by-side "Full Rebuild" button (safeguarded by a browser confirmation dialog) for a cleaner, unified cybernetic layout.
- **Rationale:** Prevents accidental long-running database wipes while giving developers and users full flexibility and quick dashboard controls.

## Risks / Trade-offs

- **[Risk]** API rate limit on full rebuilds.
  - *Mitigation:* Ensure full rebuild has confirmation popups and only runs when explicitly triggered.
- **[Risk]** Clock drift or timezone offset issues with "latest date".
  - *Mitigation:* Normalize dates to UTC ISO8601 strings (`%Y-%m-%dT00:00:00Z`).
