import React from 'react';

interface ReturnsTooltipProps {
  active?: boolean;
  payload?: any[];
  currencySymbol: string;
  convertValue: (value: number) => number;
}

export const ReturnsTooltip = ({ active, payload, currencySymbol, convertValue }: ReturnsTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded shadow-lg">
        <p className="font-semibold text-foreground">{payload[0].payload.name}</p>
        <p className={`${payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {currencySymbol}{Math.abs(payload[0].value).toLocaleString()}
          {payload[0].value >= 0 ? ' gain' : ' loss'}
        </p>
        <p className="text-muted-foreground">
          Original value: {currencySymbol}{convertValue(payload[0].payload.value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};