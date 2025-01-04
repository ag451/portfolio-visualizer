import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types/ChartTypes';

interface StockValuesChartProps {
  data: ChartData[];
  formatCurrency: (value: number) => string;
  currency: string;
}

export const StockValuesChart = ({ data, formatCurrency, currency }: StockValuesChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Stock Values</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
  );
};