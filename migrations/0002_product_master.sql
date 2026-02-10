-- Migration number: 0002 	 2024-02-06T00:00:00.000Z
-- Description: Create product master tables

-- Products Master Table (Business Logic)
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    supplier_url TEXT,
    purchase_price REAL, -- Cost in JPY
    sales_count INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    shopify_product_id TEXT, -- Link to Shopify Product ID (e.g. "gid://shopify/Product/...")
    status TEXT DEFAULT 'draft', -- draft, active, archived
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product Translations (Content for Shopify/Frontend)
CREATE TABLE product_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    language_code TEXT NOT NULL, -- 'ja', 'en', 'zh-TW', 'ko' etc.
    title TEXT,
    description TEXT,
    is_source BOOLEAN DEFAULT FALSE, -- TRUE for original Japanese content
    translation_status TEXT DEFAULT 'pending', -- pending, completed, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, language_code)
);

-- Product Reviews (Internal or Scraped)
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    author TEXT,
    source TEXT, -- 'internal', 'imported'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index for faster lookup by Shopify ID
CREATE INDEX idx_products_shopify_id ON products(shopify_product_id);
-- Index for looking up specific language content
CREATE INDEX idx_product_translations_lang ON product_translations(product_id, language_code);
