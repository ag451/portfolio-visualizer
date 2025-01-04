import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockPerformanceTableProps {
  stocks: Array<{
    symbol: string;
    price: number;
    shares: number;
  }>;
}

interface FinnhubResponse {
  c: number; // Current price
}

const StockPerformanceTable = ({ stocks }: StockPerformanceTableProps) => {
  const fetchStockPrice = async (symbol: string) => {
    console.log('Fetching API key for symbol:', symbol);
    
    try {
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'FINNHUB_API_KEY')
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching API key:', error);
        toast.error('Failed to fetch API key. Please try again later.');
        throw error;
      }

      if (!data) {
        console.error('No API key found in secrets table');
        toast.error('API key not found. Please add it in settings.');
        throw new Error('API key not found');
      }

      console.log('Successfully retrieved API key');
      const cleanSymbol = symbol.split('.')[0]; // Remove exchange suffix
      
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${data.value}`
        );
        
        if (!response.ok) {
          console.error('Finnhub API error:', response.statusText);
          throw new Error(`Failed to fetch stock price: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Successfully fetched price for symbol:', symbol);
        return result;
      } catch (error) {
        console.error('Error fetching stock price:', error);
        toast.error(`Failed to fetch price for ${symbol}`);
        throw error;
      }
    } catch (error) {
      console.error('Error in fetchStockPrice:', error);
      throw error;
    }
  };

  const queries = stocks.map(stock => ({
    queryKey: ['stockPrice', stock.symbol],
    queryFn: () => fetchStockPrice(stock.symbol),
  }));

  const results = queries.map(query => useQuery(query));

  const calculatePercentageDifference = (currentPrice: number, purchasePrice: number) => {
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  return (
    <div className="bg-background border p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stock Performance</h3>
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
          {stocks.map((stock, index) => {
            const { data, isLoading, error } = results[index];
            const currentPrice = data?.c;
            const percentDiff = currentPrice 
              ? calculatePercentageDifference(currentPrice, stock.price)
              : null;

            return (
              <TableRow key={stock.symbol}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>${stock.price.toFixed(2)}</TableCell>
                <TableCell>
                  {isLoading && 'Loading...'}
                  {error && (
                    <span className="text-red-500">
                      Error fetching price
                    </span>
                  )}
                  {currentPrice && `$${currentPrice.toFixed(2)}`}
                </TableCell>
                <TableCell>
                  {percentDiff && (
                    <span className={percentDiff >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(2)}%
                    </span>
                  )}
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