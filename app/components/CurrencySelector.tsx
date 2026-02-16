import { useState, useEffect } from 'react';

const CURRENCIES = [
    { code: 'TWD', symbol: 'NT$', name: '新台湾ドル', country: 'TW' },
    { code: 'CNY', symbol: '¥', name: '人民元', country: 'CN' },
    { code: 'KRW', symbol: '₩', name: 'ウォン', country: 'KR' },
    { code: 'THB', symbol: '฿', name: 'バーツ', country: 'TH' },
    { code: 'USD', symbol: '$', name: 'ドル', country: 'US' },
    { code: 'EUR', symbol: '€', name: 'ユーロ', country: 'DE' },
    { code: 'GBP', symbol: '£', name: 'ポンド', country: 'GB' },
    { code: 'CAD', symbol: 'CA$', name: 'カナダドル', country: 'CA' },
];

export default function CurrencySelector({ currentCurrency }: { currentCurrency: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCurrencyChange = (currencyCode: string) => {
        // Save to cookie
        document.cookie = `preferred_currency=${currencyCode}; path=/; max-age=31536000`;

        // Reload page to fetch new prices
        window.location.reload();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.currency-selector')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    const currentCurrencyObj = CURRENCIES.find(c => c.code === currentCurrency) || CURRENCIES[0]; // Default to TWD

    return (
        <div className="currency-selector" style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
            >
                <span>{currentCurrencyObj.symbol}</span>
                <span>{currentCurrencyObj.code}</span>
                <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    zIndex: 1000,
                    overflow: 'hidden',
                }}>
                    {CURRENCIES.map(currency => (
                        <button
                            key={currency.code}
                            onClick={() => handleCurrencyChange(currency.code)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: currency.code === currentCurrency ? '#f5f5f5' : 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '14px',
                                color: '#333',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (currency.code !== currentCurrency) {
                                    e.currentTarget.style.background = '#f9f9f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currency.code !== currentCurrency) {
                                    e.currentTarget.style.background = 'white';
                                }
                            }}
                        >
                            <span>{currency.name}</span>
                            <span style={{ fontWeight: '600', color: '#666' }}>
                                {currency.symbol} {currency.code}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
