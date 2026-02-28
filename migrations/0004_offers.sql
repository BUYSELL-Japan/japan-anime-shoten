-- Migration number: 0004  2026-02-28
-- Description: Create offers table for Make an Offer feature

CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_handle TEXT NOT NULL,
    original_price INTEGER NOT NULL,
    offer_price INTEGER NOT NULL,
    currency TEXT DEFAULT 'JPY',
    customer_email TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected
    discount_code TEXT,
    admin_note TEXT DEFAULT '',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_email ON offers(customer_email);
