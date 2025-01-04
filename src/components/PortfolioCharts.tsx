import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PieDistributionChart } from './charts/PieDistributionChart';
import { StockValuesChart } from './charts/StockValuesChart';
import { GainLossChart } from './charts/GainLossChart';
import { CurrencyDistributionChart } from './charts/CurrencyDistributionChart';
import { SectorDistributionChart } from './charts/SectorDistributionChart';
import { useStockSectors } from '@/hooks/useStockSectors';
import type { ChartData } from './types/ChartTypes';

const COLORS = ['#60A5FA', '#10B981', '#818CF8', '#F472B6', '#F59E0B', '#6366F1', '#EC4899'];

interface PortfolioChartsProps {
  data: ChartData[];
}

const PortfolioCharts = ({ data }: PortfolioChartsProps) => {
  const [currency, setCurrency] = useState<'USD' | 'GBP'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: sectorData, isLoading: isSectorLoading } = useStockSectors(data);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.GBP);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        toast.error('Failed to fetch exchange rate');
      }
    };
    fetchExchangeRate();
  }, []);

  const toggleCurrency = () => {
    setIsLoading(true);
    setCurrency(prev => prev === 'USD' ? 'GBP' : 'USD');
    setIsLoading(false);
  };

  const convertValue = (value: number) => {
    return currency === 'GBP' ? value * exchangeRate : value;
  };

  const formatCurrency = (value: number) => {
    return currency === 'USD' 
      ? `$${value.toLocaleString()}`
      : `£${(value * exchangeRate).toLocaleString()}`;
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Transform the data to use ticker symbols for display
  const formattedData = data.map(item => ({
    ...item,
    name: item.symbol || item.name, // Use symbol if available, fallback to name
    value: convertValue(item.value),
    formattedValue: formatCurrency(item.value)
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={toggleCurrency}
          disabled={isLoading}
          variant="outline"
          className="mb-4"
        >
          Switch to {currency === 'USD' ? 'GBP' : 'USD'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PieDistributionChart 
          data={formattedData}
          formatCurrency={formatCurrency}
          totalValue={totalValue}
          COLORS={COLORS}
        />
        
        {sectorData && (
          <SectorDistributionChart 
            data={sectorData}
            formatCurrency={formatCurrency}
            totalValue={totalValue}
            COLORS={COLORS}
          />
        )}

        <StockValuesChart 
          data={formattedData}
          formatCurrency={formatCurrency}
          currency={currency}
        />

        <GainLossChart 
          data={formattedData}
          formatCurrency={formatCurrency}
          currency={currency}
        />

        <CurrencyDistributionChart 
          data={formattedData}
          currency={currency}
        />
      </div>
    </div>
  );
};

export default PortfolioCharts;