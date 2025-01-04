import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types/ChartTypes';

interface GainLossChartProps {
  data: ChartData[];
  formatCurrency: (value: number) => string;
  currency: string;
}

const GAIN_COLOR = '#10B981'; // Green
const LOSS_COLOR = '#EF4444'; // Red

const GainLossTooltip = ({ active, payload, formatCurrency }: any) => {
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

export const GainLossChart = ({ data, formatCurrency, currency }: GainLossChartProps) => {
  const gainLossData = data.map(stock => ({
    name: stock.name,
    value: stock.gainLoss || 0,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Gain/Loss Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={gainLossData}>
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) => `${currency === 'USD' ? '$' : '£'}${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={(props) => GainLossTooltip({ ...props, formatCurrency })} />
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
  );
};