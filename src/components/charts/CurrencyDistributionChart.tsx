import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types/ChartTypes';

interface CurrencyDistributionChartProps {
  data: ChartData[];
  currency: string;
}

export const CurrencyDistributionChart = ({ data, currency }: CurrencyDistributionChartProps) => {
  const currencyData = data.map(stock => ({
    name: stock.name,
    USD: stock.value * 0.7,
    EUR: stock.value * 0.3,
  }));

  return (
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
  );
};