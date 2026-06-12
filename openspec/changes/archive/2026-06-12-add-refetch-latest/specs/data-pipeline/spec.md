## MODIFIED Requirements

### Requirement: Run All Pipeline Orchestrator
The system SHALL provide a CLI entry point at `quant/run_all.py` that executes all 17 component pipelines sequentially.

- The script SHALL be executable via `python -m quant.run_all`
- It SHALL accept a `--rebuild` CLI flag to trigger full rebuild mode for all components
- It SHALL import and instantiate all 17 component classes from `quant/components/`
- It SHALL execute each component's `run_pipeline()` method sequentially, catching and logging any exceptions per component without halting the entire run
- The script SHALL query the latest date in the `btc_ohlc` table before running component pipelines.
- When `--rebuild` is NOT specified, the script SHALL only fetch and insert new BTC price records from the Bitview API whose dates are strictly greater than the latest date stored in `btc_ohlc`.
- When `--rebuild` is specified, the script SHALL perform a full fetch and update all historical BTC price records.
- All price insertions SHALL be batched and executed inside a single database transaction for bulk execution.
- After all components have run, it SHALL print a summary table to stdout showing: component name, rows fetched, rows stored, status, and error message (if any)
- The exit code SHALL be `0` if all components succeeded, or `1` if any component reported an error

#### Scenario: All components succeed
- **WHEN** `python -m quant.run_all` is executed and all 17 components fetch and store successfully
- **THEN** the summary table SHALL show `status` equal to `"success"` for all 17 rows
- **THEN** the process SHALL exit with code `0`

#### Scenario: One component fails, others continue
- **WHEN** `python -m quant.run_all` is executed and the `fear_greed_cmc` component raises an exception during fetch
- **THEN** the orchestrator SHALL log the error for `fear_greed_cmc` and continue executing the remaining components
- **THEN** the summary table SHALL show `status` equal to `"error"` for `fear_greed_cmc` and `"success"` for all other components
- **THEN** the process SHALL exit with code `1`

#### Scenario: Full rebuild via CLI flag
- **WHEN** `python -m quant.run_all --rebuild` is executed
- **THEN** every component's `run_pipeline()` SHALL be called with `full_rebuild=True`
- **AND** the BTC OHLC database table SHALL be fully rebuilt from the earliest available historical price data
