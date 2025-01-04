import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartData } from '../types/ChartTypes';

interface SectorChartData {
  name: string;
  value: number;
}

interface SectorDistributionChartProps {
  data: SectorChartData[];
  formatCurrency: (value: number) => string;
  totalValue: number;
  COLORS: string[];
}

const CustomTooltip = ({ active, payload, formatCurrency, totalValue }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold">{payload[0].payload.name}</p>
        <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        <p className="text-gray-500">
          {((payload[0].value / totalValue) * 100).toFixed(1)}% of portfolio
        </p>
      </div>
    );
  }
  return null;
};

export const SectorDistributionChart = ({ data, formatCurrency, totalValue, COLORS }: SectorDistributionChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Sector Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={(props) => CustomTooltip({ ...props, formatCurrency, totalValue })} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};