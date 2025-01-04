import { useQuery } from '@tanstack/react-query';
import { ChartData } from '@/components/types/ChartTypes';

const FINNHUB_API_KEY = 'ctsaonhr01qh9oeso5e0ctsaonhr01qh9oeso5eg';

async function fetchStockSector(symbol: string): Promise<string> {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
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
        const symbol = stock.name.split('.')[0]; // Extract symbol from name (e.g., "AMZN.US" -> "AMZN")
        const sector = await fetchStockSector(symbol);
        
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