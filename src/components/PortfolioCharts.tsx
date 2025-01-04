import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DistributionChart } from './charts/DistributionChart';
import { ReturnsTooltip } from './tooltips/ReturnsTooltip';

interface ChartData {
  name: string;
  value: number;
  returns?: number;
}

interface PortfolioChartsProps {
  data: ChartData[];
  sectorData: ChartData[];
}

const COLORS = ['#60A5FA', '#10B981', '#818CF8', '#F472B6', '#F59E0B', '#6366F1', '#EC4899'];

const PortfolioCharts = ({ data, sectorData }: PortfolioChartsProps) => {
  const [currency, setCurrency] = useState<'GBP' | 'USD'>('GBP');
  const [exchangeRate, setExchangeRate] = useState<number>(0.79);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.GBP);
        console.log('Fetched exchange rate:', data.rates.GBP);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        toast.error('Failed to fetch exchange rate. Using fallback rate.');
      }
    };

    fetchExchangeRate();
  }, []);

  const convertValue = (value: number) => {
    return currency === 'GBP' ? value * exchangeRate : value;
  };

  const totalValue = data.reduce((sum, item) => sum + convertValue(item.value), 0);

  const formattedData = data.map(item => ({
    ...item,
    name: item.name.split('.')[0],
    value: convertValue(item.value),
    formattedValue: `${currency === 'GBP' ? '£' : '$'}${convertValue(item.value).toLocaleString()}`
  })).sort((a, b) => b.value - a.value);

  const formattedSectorData = sectorData.map(item => ({
    ...item,
    value: convertValue(item.value),
    formattedValue: `${currency === 'GBP' ? '£' : '$'}${convertValue(item.value).toLocaleString()}`
  }));

  const formattedReturnsData = [...formattedData].map(item => ({
    ...item,
    returns: convertValue(item.returns || 0)
  })).sort((a, b) => {
    const returnsA = a.returns || 0;
    const returnsB = b.returns || 0;
    return returnsB - returnsA;
  });

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'GBP' : 'USD');
  };

  const currencySymbol = currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Exchange Rate: 1 USD = {exchangeRate.toFixed(4)} GBP
        </div>
        <Button 
          onClick={toggleCurrency}
          variant="outline"
          className="mb-4"
        >
          Switch to {currency === 'GBP' ? 'USD' : 'GBP'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DistributionChart
          data={formattedData}
          title="Portfolio Distribution"
          currencySymbol={currencySymbol}
          totalValue={totalValue}
          colors={COLORS}
        />

        <DistributionChart
          data={formattedSectorData}
          title="Sector Distribution"
          currencySymbol={currencySymbol}
          totalValue={totalValue}
          colors={COLORS}
        />

        <div className="bg-background border p-6 rounded-lg shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Stock Values</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                stroke="currentColor"
              />
              <Tooltip
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Value']}
              />
              <Bar dataKey="value" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-background border p-6 rounded-lg shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Gains & Losses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedReturnsData}>
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                stroke="currentColor"
              />
              <Tooltip content={(props) => (
                <ReturnsTooltip 
                  {...props} 
                  currencySymbol={currencySymbol} 
                  convertValue={convertValue}
                />
              )} />
              <Bar 
                dataKey="returns" 
                fill="#10B981"
                stroke="#047857"
                fillOpacity={0.8}
              >
                {formattedReturnsData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.returns >= 0 ? '#10B981' : '#EF4444'}
                    stroke={entry.returns >= 0 ? '#047857' : '#B91C1C'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;