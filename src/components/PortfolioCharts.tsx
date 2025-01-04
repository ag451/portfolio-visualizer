import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";

interface ChartData {
  name: string;
  value: number;
}

interface PortfolioChartsProps {
  data: ChartData[];
}

const COLORS = ['#60A5FA', '#10B981', '#818CF8', '#F472B6', '#F59E0B', '#6366F1', '#EC4899'];
const USD_TO_GBP = 0.79; // Fixed conversion rate for demonstration

const PortfolioCharts = ({ data }: PortfolioChartsProps) => {
  const [currency, setCurrency] = useState<'GBP' | 'USD'>('GBP');
  
  const convertValue = (value: number) => {
    return currency === 'GBP' ? value * USD_TO_GBP : value;
  };

  const totalValue = data.reduce((sum, item) => sum + convertValue(item.value), 0);

  // Format data and extract ticker symbol (everything before the dot)
  const formattedData = data.map(item => ({
    ...item,
    name: item.name.split('.')[0], // Extract ticker symbol
    value: convertValue(item.value),
    formattedValue: `${currency === 'GBP' ? '£' : '$'}${convertValue(item.value).toLocaleString()}`
  }));

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'GBP' : 'USD');
  };

  const currencySymbol = currency === 'GBP' ? '£' : '$';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-gray-600">{currencySymbol}{payload[0].value.toLocaleString()}</p>
          <p className="text-gray-500">
            {((payload[0].value / totalValue) * 100).toFixed(1)}% of portfolio
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
          variant="outline"
          className="mb-4"
        >
          Switch to {currency === 'GBP' ? 'USD' : 'GBP'}
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
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Value']}
              />
              <Bar dataKey="value" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;