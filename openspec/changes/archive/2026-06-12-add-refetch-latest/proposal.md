## Why

Currently, the data-pipeline executes complete historical fetches or performs redundant database transactions (e.g., writing over 6,300 price records in the `btc_ohlc` table on every execution), causing updates to be slow and resource-heavy. Adding a dedicated "Refetch Latest" capability ensures that only data for today (or missing days since the last sync) is fetched from external APIs and inserted, before running the normal statistical audit and composite model recalculations.

## What Changes

- **Incremental BTC OHLC updates**: Modify the price reference ingestion pipeline to only write price records newer than the latest date stored in the `btc_ohlc` table, rather than unconditionally overwriting all historical records on every run.
- **UI Update for Data Refresh**: Provide a clear interface on the dashboard to allow the user to trigger a fast delta update ("Refetch Latest") to fetch only missing days, and optionally perform a full database rebuild ("Full Rebuild") if required.
- **Standardized Pipeline Invocation**: Ensure backend API handles the request for refetching only latest missing data and invokes the correct python orchestrator routines.

## Capabilities

### New Capabilities
<!-- None needed, we are refining the existing pipeline and dashboard -->

### Modified Capabilities
- `data-pipeline`: Modify the price data and component pipeline ingestion to query existing table bounds and fetch/insert only the missing days since the latest record.
- `valuation-dashboard`: Update the navbar actions to clearly distinguish between a fast "Refetch Latest" delta update and a "Full Rebuild", and display the last updated timestamp.

## Impact

- `quant/btc_ohlc.py` and `quant/run_all.py`: Modified to check the database for the latest `btc_ohlc` date and skip redundant updates.
- `backend/app.ts`: Keep `/api/pipeline/run` compatible with a fast delta parameter (rebuild=false) and full rebuild (rebuild=true).
- `frontend/src/components/DashboardLayout.tsx`: Updated to display separate/renamed buttons for "Refetch Latest" and "Full Rebuild", and handle loading/success states appropriately.
- `database/db.py`: Ensure helper methods exist to query the max date for the `btc_ohlc` table.
