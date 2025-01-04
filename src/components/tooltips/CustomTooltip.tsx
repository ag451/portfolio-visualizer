import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  currencySymbol: string;
  totalValue: number;
}

export const CustomTooltip = ({ active, payload, currencySymbol, totalValue }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded shadow-lg">
        <p className="font-semibold">{payload[0].payload.name}</p>
        <p className="text-foreground">{currencySymbol}{payload[0].value.toLocaleString()}</p>
        <p className="text-muted-foreground">
          {((payload[0].value / totalValue) * 100).toFixed(1)}% of portfolio
        </p>
      </div>
    );
  }
  return null;
};