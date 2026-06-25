-- FoodieGo Platform Admin — database schema.
-- Reverse-engineered from the queries in src/models/* and src/services/reportService.js.
-- Idempotent: safe to run on every boot (CREATE TABLE IF NOT EXISTS).
-- FK constraints are intentionally omitted (the tables reference each other
-- circularly: users -> restaurants -> brands -> users); the app uses LEFT JOINs,
-- not enforced foreign keys.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password      TEXT        NOT NULL,
  role          TEXT,
  restaurant_id INTEGER,
  branch_id     INTEGER,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS brands (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  gst_number  TEXT,
  owner_id    INTEGER,
  status      TEXT        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id          SERIAL PRIMARY KEY,
  brand_id    INTEGER,
  name        TEXT        NOT NULL,
  address     TEXT,
  city        TEXT,
  phone       TEXT,
  email       TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily per-restaurant rollups powering the reports/KPI endpoints.
CREATE TABLE IF NOT EXISTS report_aggregates (
  id                     SERIAL PRIMARY KEY,
  restaurant_id          INTEGER     NOT NULL,
  report_date            DATE        NOT NULL,
  total_orders           INTEGER     NOT NULL DEFAULT 0,
  total_revenue          NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_delivery_time_mins NUMERIC(6,2)  NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, report_date)
);

-- Per-restaurant rating used by the "top items" report.
CREATE TABLE IF NOT EXISTS restaurant_stats (
  restaurant_id INTEGER PRIMARY KEY,
  avg_rating    NUMERIC(3,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_brands_status        ON brands (status);
CREATE INDEX IF NOT EXISTS idx_restaurants_status   ON restaurants (status);
CREATE INDEX IF NOT EXISTS idx_restaurants_brand    ON restaurants (brand_id);
CREATE INDEX IF NOT EXISTS idx_users_deleted        ON users (deleted_at);
CREATE INDEX IF NOT EXISTS idx_report_agg_date      ON report_aggregates (report_date);
CREATE INDEX IF NOT EXISTS idx_report_agg_rest      ON report_aggregates (restaurant_id);
