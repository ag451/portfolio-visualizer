import { useQuery } from '@tanstack/react-query';
import type { ChartData } from '@/components/types/ChartTypes';

const FINNHUB_API_KEY = 'ctsaonhr01qh9oeso5e0ctsaonhr01qh9oeso5eg';

// Map exchange symbols to their stock symbols
const STOCK_SYMBOL_MAP: { [key: string]: string } = {
  'Amazon.com Inc.NASDAQ': 'AMZN',
  'ASML Holding NV.EURONEXT': 'ASML',
  'Lululemon Athletica inc.NASDAQ': 'LULU',
  'MercadoLibre Inc.NASDAQ': 'MELI'
};

async function fetchStockSector(fullName: string): Promise<string> {
  try {
    // Get the actual stock symbol from the map
    const actualSymbol = STOCK_SYMBOL_MAP[fullName];
    
    if (!actualSymbol) {
      console.log('No mapping found for:', fullName);
      return 'Unknown';
    }
    
    console.log('Fetching sector for symbol:', actualSymbol);
    
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${actualSymbol}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
    
    console.log('Finnhub response for', fullName, ':', data);
    
    return data.finnhubIndustry || 'Unknown';
  } catch (error) {
    console.error('Error fetching sector for', fullName, error);
    return 'Unknown';
  }
}

export function useStockSectors(stocks: ChartData[]) {
  return useQuery({
    queryKey: ['stockSectors', stocks],
    queryFn: async () => {
      const sectorMap = new Map<string, number>();
      
      for (const stock of stocks) {
        const sector = await fetchStockSector(stock.name);
        
        const currentValue = sectorMap.get(sector) || 0;
        sectorMap.set(sector, currentValue + stock.value);
      }
      
      return Array.from(sectorMap.entries()).map(([name, value]) => ({
        name,
        value
      }));
    },
    enabled: stocks.length > 0
  });
}