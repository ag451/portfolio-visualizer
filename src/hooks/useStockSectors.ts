import { useQuery } from '@tanstack/react-query';
import { ChartData } from '@/components/types/ChartTypes';

const FINNHUB_API_KEY = 'ctsaonhr01qh9oeso5e0ctsaonhr01qh9oeso5eg';

// Map full names to their stock symbols
const STOCK_SYMBOL_MAP: { [key: string]: string } = {
  'Amazon.US': 'AMZN',
  'ASML Holding NV.US': 'ASML',
  'Lululemon Athletica inc.US': 'LULU',
  'MercadoLibre Inc.US': 'MELI'
};

async function fetchStockSector(symbol: string): Promise<string> {
  try {
    // Get the actual stock symbol from the map, or extract it from the name
    const stockName = symbol.split('.')[0]; // Remove the .US suffix
    const actualSymbol = STOCK_SYMBOL_MAP[symbol] || stockName;
    
    console.log('Fetching sector for symbol:', actualSymbol);
    
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${actualSymbol}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
    
    console.log('Finnhub response for', actualSymbol, ':', data);
    
    return data.finnhubIndustry || 'Unknown';
  } catch (error) {
    console.error('Error fetching sector for', symbol, error);
    return 'Unknown';
  }
}

export function useStockSectors(stocks: ChartData[]) {
  return useQuery({
    queryKey: ['stockSectors', stocks.map(s => s.name)],
    queryFn: async () => {
      const sectorMap = new Map<string, number>();
      
      for (const stock of stocks) {
        const sector = await fetchStockSector(stock.name);
        
        const currentValue = sectorMap.get(sector) || 0;
        sectorMap.set(sector, currentValue + stock.value);
      }
      
      return Array.from(sectorMap.entries()).map(([sector, value]) => ({
        name: sector,
        value
      }));
    },
    enabled: stocks.length > 0,
  });
}