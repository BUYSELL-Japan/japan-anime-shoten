-- Migration number: 0001_init_translations
-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id TEXT PRIMARY KEY,
  ja TEXT NOT NULL,
  en TEXT,
  es TEXT,
  fr TEXT,
  zh TEXT
);

-- Initial Data
INSERT INTO translations (id, ja, en) VALUES 
('hero_title', 'Japan Directly To You', 'Japan Directly To You'),
('hero_subtitle', '本物のアニメグッズをあなたへ', 'Authentic Anime Goods'),
('btn_shop_now', '今すぐ購入', 'Shop Now'),
('section_featured', '注目のコレクション', 'Featured Collection'),
('currency_symbol', '¥', '¥'),
('trust_auth', '100% 正規品', '100% Authentic'),
('trust_shipping', 'グローバル配送', 'Global Shipping'),
('trust_payment', '安全な決済', 'Secure Payment'),
('trust_dispatch', '迅速な発送', 'Fast Dispatch');
