## 1. Incremental BTC OHLC Ingestion

- [x] 1.1 Modify `quant/btc_ohlc.py` to retrieve the latest date from the `btc_ohlc` table, filter incoming Bitview API data to only insert rows newer than this date, and batch insertions inside a single transaction.
- [x] 1.2 Add unit tests in a new file `quant/tests/test_btc_ohlc.py` to verify that incremental/delta fetching for BTC OHLC correctly filters historical data and only writes new records. Run tests via `.venv/bin/pytest quant/tests/test_btc_ohlc.py`.

## 2. Backend API Updates

- [x] 2.1 Update backend API in `backend/app.ts` at the `POST /api/pipeline/run` endpoint to parse and execute the incremental/delta mode correctly by passing the `--rebuild` flag to the CLI only when `rebuild: true` is requested.
- [x] 2.2 Add API integration tests in `backend/index.test.ts` to ensure `POST /api/pipeline/run` works correctly with both `rebuild: true` and `rebuild: false`. Verify via `bun run test` in the root workspace package.

## 3. Frontend UI Controls

- [x] 3.1 Modify `frontend/src/components/DashboardLayout.tsx` navbar to expose a main button for "Refetch Latest" and a dropdown option for "Full Rebuild" that triggers a browser confirmation dialog.
- [x] 3.2 Add or update frontend unit tests in `frontend/src/components/DashboardLayout.test.tsx` to verify that the refetch buttons trigger the correct API calls and that the confirmation prompt stops a cancelled rebuild. Run tests via `bun run test` inside the `frontend/` directory.

## 4. Manual User Validation

- [x] 4.1 Trigger "Refetch Latest" from the UI when the database is slightly behind and verify it finishes quickly by writing only the delta.
- [x] 4.2 Trigger "Full Rebuild" from the UI, accept the confirmation dialog, and verify it successfully performs a full historical rebuild of all metrics and reference price data.

## 5. Final Auto-Verification

- [x] 5.1 Perform final auto-verification checks:
  1. Read all artifacts (proposal, design, specs, tasks) to ensure zero gaps.
  2. Verify all SHALL/MUST requirements against the implementation.
  3. Start the Hono server locally and run an E2E verification using `curl`.
  4. Spawn parallel reviewer subagents to review implementation correctness, conventions, and style consistency.
