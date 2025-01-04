import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StockPerformanceTableProps {
  stocks: Array<{
    symbol: string;
    price: number;
    shares: number;
  }>;
}

const StockPerformanceTable = ({ stocks }: StockPerformanceTableProps) => {
  const calculatePercentageDifference = (currentPrice: number, purchasePrice: number) => {
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  return (
    <div className="bg-background border p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stock Performance</h3>
      <div className="text-sm text-muted-foreground mb-4">
        Note: Live price updates temporarily disabled
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => {
            // Using purchase price as current price temporarily
            const currentPrice = stock.price;
            const percentDiff = calculatePercentageDifference(currentPrice, stock.price);

            return (
              <TableRow key={stock.symbol}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>${stock.price.toFixed(2)}</TableCell>
                <TableCell>${currentPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={percentDiff >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(2)}%
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockPerformanceTable;