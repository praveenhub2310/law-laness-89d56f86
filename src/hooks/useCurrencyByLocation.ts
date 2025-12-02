import { useState, useEffect } from 'react';

export interface CurrencyConfig {
  currency: 'INR' | 'USD';
  symbol: string;
  conversionRate: number;
}

export const useCurrencyByLocation = () => {
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig>({
    currency: 'INR',
    symbol: '₹',
    conversionRate: 1,
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to detect location using IP-based geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Check if user is in India
        const isIndia = data.country_code === 'IN';
        
        setCurrencyConfig({
          currency: isIndia ? 'INR' : 'USD',
          symbol: isIndia ? '₹' : '$',
          conversionRate: isIndia ? 1 : 0.012, // 1 INR = 0.012 USD (approx 83 INR = 1 USD)
        });
      } catch (error) {
        console.error('Error detecting location:', error);
        // Default to INR if detection fails
        setCurrencyConfig({
          currency: 'INR',
          symbol: '₹',
          conversionRate: 1,
        });
      }
    };

    detectLocation();
  }, []);

  const convertPrice = (priceInINR: number): number => {
    const converted = priceInINR * currencyConfig.conversionRate;
    return Math.round(converted); // Round to nearest whole number
  };

  const formatPrice = (priceInINR: number): string => {
    const converted = convertPrice(priceInINR);
    return `${currencyConfig.symbol}${converted}`;
  };

  return {
    currencyConfig,
    convertPrice,
    formatPrice,
  };
};
