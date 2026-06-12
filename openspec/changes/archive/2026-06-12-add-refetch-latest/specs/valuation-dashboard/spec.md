## MODIFIED Requirements

### Requirement: Data Fetching and Loading States
The dashboard SHALL fetch data from the Hono API using the following endpoints:

1. `GET /api/metrics` — fetch summary data for all metrics (used for MetricCard grid). The response SHALL contain an array of metric objects, each with: `metric_name`, `category`, `latest_raw_value`, `latest_normalized_value`, `sparkline_data` (array of recent normalized values).
2. `GET /api/metrics/:metric_name` — fetch full timeseries for a specific metric (used for detail view). The response SHALL contain `metric_name` and `data` array with objects containing: `date`, `raw_value`, `normalized_value`, `btc_price`.
3. `GET /api/composite` — fetch composite oscillator timeseries. The response SHALL contain `data` array with objects containing: `date`, `composite_score`, `btc_price`.
4. `POST /api/pipeline/run` — trigger the data ingestion pipeline and statistical audit runner. The request payload SHALL contain `rebuild` (boolean) and optional `metric` (string | null).

The dashboard SHALL implement the following loading states:
- **Initial load**: full-page skeleton with placeholder shapes for the Composite Oscillator Chart and MetricCard grid
- **MetricCard grid loading**: individual card skeletons while `GET /api/metrics` is in flight
- **Detail view loading**: chart skeleton while `GET /api/metrics/:metric_name` is in flight
- **Pipeline refetch loading**: disable all refetch buttons and display execution feedback to indicate active update
- **Error state**: if any API call fails, display an inline error message with a "Retry" button in the affected area

Data SHALL be fetched on initial dashboard mount. The dashboard top navigation bar SHALL provide two data sync actions:
- **Refetch Latest**: Triggers the incremental delta pipeline (`rebuild: false`) for today's or missing days.
- **Full Rebuild**: Prompts a browser confirmation dialog. If confirmed, triggers a full historical data rebuild pipeline (`rebuild: true`).

#### Scenario: Dashboard initial data load
- **WHEN** the dashboard mounts for the first time
- **THEN** the system SHALL simultaneously call `GET /api/metrics` and `GET /api/composite`
- **AND** a loading skeleton SHALL be displayed for both the Composite Oscillator Chart and the MetricCard grid
- **AND** once both responses arrive, the full dashboard SHALL render

#### Scenario: API error on initial load
- **WHEN** the `GET /api/metrics` call fails with a network error or non-200 status
- **THEN** the MetricCard grid area SHALL display an error message: "Failed to load metrics. Check your connection and try again."
- **AND** a "Retry" button SHALL be displayed that re-triggers the `GET /api/metrics` call when clicked

#### Scenario: API error on composite load
- **WHEN** the `GET /api/composite` call fails
- **THEN** the Composite Oscillator Chart area SHALL display an error message: "Failed to load composite oscillator data."
- **AND** a "Retry" button SHALL be displayed
- **AND** the MetricCard grid below SHALL still render normally if its data loaded successfully

#### Scenario: Detail view data fetch
- **WHEN** the user clicks a MetricCard for "AVIV Ratio-Z"
- **THEN** the system SHALL call `GET /api/metrics/aviv_ratio_z`
- **AND** a loading skeleton SHALL be shown in the detail view chart area until the response arrives

#### Scenario: Triggering Refetch Latest
- **WHEN** the user clicks the "Refetch Latest" button
- **THEN** the system SHALL send a `POST /api/pipeline/run` request with `rebuild: false`
- **AND** the refetch actions SHALL enter a loading state
- **AND** upon successful completion, the system SHALL reload dashboard data and display a success alert

#### Scenario: Triggering Full Rebuild with Confirmation
- **WHEN** the user clicks the "Full Rebuild" button and confirms the browser prompt
- **THEN** the system SHALL send a `POST /api/pipeline/run` request with `rebuild: true`
- **AND** the refetch actions SHALL enter a loading state
- **AND** upon successful completion, the system SHALL reload dashboard data and display a success alert

#### Scenario: Triggering Full Rebuild Cancelled
- **WHEN** the user clicks the "Full Rebuild" button and cancels the browser prompt
- **THEN** the system SHALL NOT send any API requests
- **AND** no loading state SHALL be triggered
