import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";

interface ChartData {
  name: string;
  value: number;
  returns?: number;
}

interface PortfolioChartsProps {
  data: ChartData[];
}

const COLORS = ['#60A5FA', '#10B981', '#818CF8', '#F472B6', '#F59E0B', '#6366F1', '#EC4899'];
const USD_TO_GBP = 0.79;

const PortfolioCharts = ({ data }: PortfolioChartsProps) => {
  const [currency, setCurrency] = useState<'GBP' | 'USD'>('GBP');
  
  const convertValue = (value: number) => {
    return currency === 'GBP' ? value * USD_TO_GBP : value;
  };

  const totalValue = data.reduce((sum, item) => sum + convertValue(item.value), 0);

  const formattedData = data.map(item => ({
    ...item,
    name: item.name.split('.')[0],
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

  const ReturnsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className={`${payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currencySymbol}{Math.abs(payload[0].value).toLocaleString()}
            {payload[0].value >= 0 ? ' gain' : ' loss'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Gains & Losses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ReturnsTooltip />} />
              <Bar 
                dataKey="returns" 
                fill="#10B981"
                stroke="#047857"
                fillOpacity={0.8}
              >
                {formattedData.map((entry, index) => (
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