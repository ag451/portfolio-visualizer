import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChartData {
  name: string;
  value: number;
  gainLoss?: number;
}

interface PortfolioChartsProps {
  data: ChartData[];
}

const COLORS = ['#60A5FA', '#10B981', '#818CF8', '#F472B6', '#F59E0B', '#6366F1', '#EC4899'];
const GAIN_COLOR = '#10B981'; // Green
const LOSS_COLOR = '#EF4444'; // Red

const PortfolioCharts = ({ data }: PortfolioChartsProps) => {
  const [currency, setCurrency] = useState<'USD' | 'GBP'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Use actual gain/loss data from the image
  const gainLossData = data.map(stock => ({
    name: stock.name,
    value: stock.gainLoss || 0,
  }));

  // Mock currency distribution (for demonstration)
  const currencyData = data.map(stock => ({
    name: stock.name,
    USD: stock.value * 0.7, // Example: 70% in USD
    EUR: stock.value * 0.3, // Example: 30% in EUR
  }));

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

  // Format data for better display
  const formattedData = data.map(item => ({
    ...item,
    value: convertValue(item.value),
    formattedValue: formatCurrency(item.value)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-gray-600">{formatCurrency(payload[0].value / (currency === 'GBP' ? exchangeRate : 1))}</p>
          <p className="text-gray-500">
            {((payload[0].value / totalValue) * 100).toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  const GainLossTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className={value >= 0 ? "text-green-600" : "text-red-600"}>
            {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Stock Values</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${currency === 'USD' ? '$' : '£'}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Value']}
              />
              <Bar dataKey="value" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Gain/Loss Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gainLossData}>
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${currency === 'USD' ? '$' : '£'}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<GainLossTooltip />} />
              <Bar
                dataKey="value"
                fill={GAIN_COLOR}
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const isGain = value >= 0;
                  const actualHeight = Math.abs(height);
                  const actualY = isGain ? y : y - actualHeight;
                  
                  return (
                    <rect
                      x={x}
                      y={actualY}
                      width={width}
                      height={actualHeight}
                      fill={isGain ? GAIN_COLOR : LOSS_COLOR}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Currency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currencyData}>
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${currency === 'USD' ? '$' : '£'}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="USD" stackId="a" fill="#60A5FA" name="USD" />
              <Bar dataKey="EUR" stackId="a" fill="#818CF8" name="EUR" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;