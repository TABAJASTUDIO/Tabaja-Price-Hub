-- TABAJA Price Hub future database schema

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  agent TEXT,
  card_code TEXT UNIQUE NOT NULL,
  can_view_offers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_companies (
  customer_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  PRIMARY KEY (customer_id, company_id)
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT DEFAULT 'Active',
  is_offer INTEGER DEFAULT 0,
  offer_price REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE upload_history (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  file_name TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code TEXT,
  event TEXT,
  company_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
