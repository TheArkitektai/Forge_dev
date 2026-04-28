-- Rename alert_threshold columns to use underscore-separated numbering
-- matching the API contract and TypeScript interfaces
ALTER TABLE tenant_budgets
  RENAME COLUMN alert_threshold_pct1 TO alert_threshold_pct_1;

ALTER TABLE tenant_budgets
  RENAME COLUMN alert_threshold_pct2 TO alert_threshold_pct_2;

ALTER TABLE tenant_budgets
  RENAME COLUMN alert_threshold_pct3 TO alert_threshold_pct_3;
