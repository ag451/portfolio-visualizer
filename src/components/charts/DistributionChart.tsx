import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomTooltip } from '../tooltips/CustomTooltip';

interface DistributionChartProps {
  data: any[];
  title: string;
  currencySymbol: string;
  totalValue: number;
  colors: string[];
}

export const DistributionChart = ({ data, title, currencySymbol, totalValue, colors }: DistributionChartProps) => (
  <div className="bg-background border p-6 rounded-lg shadow-lg">
    <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={(props) => (
          <CustomTooltip {...props} currencySymbol={currencySymbol} totalValue={totalValue} />
        )} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);