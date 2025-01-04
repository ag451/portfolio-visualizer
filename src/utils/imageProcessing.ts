import Tesseract from 'tesseract.js';

export interface StockData {
  name: string;
  symbol: string;
  price: number;
  shares: number;
  value: number;
  gainLoss: number;
}

// Map company names to their ticker symbols
const STOCK_SYMBOL_MAP: { [key: string]: string } = {
  'Amazon.com Inc.NASDAQ': 'AMZN',
  'ASML Holding NV.EURONEXT': 'ASML',
  'Lululemon Athletica inc.NASDAQ': 'LULU',
  'MercadoLibre Inc.NASDAQ': 'MELI',
  'On Holding AG - Ordinary Shares Class A.NYSE': 'ONON',
  'Taiwan Semiconductor Manufacturing - ADR.NYSE': 'TSM'
};

export const processStockImage = async (imageFile: File): Promise<StockData[]> => {
  console.log('Processing image:', imageFile.name);
  
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m)
    });

    console.log('OCR Result:', result.data.text);

    // Split the text into lines and process each line
    const lines = result.data.text.split('\n').filter(line => line.trim());
    
    const processedData = lines.map(line => {
      // Log each line being processed
      console.log('Processing line:', line);

      // More flexible regex that handles different formats
      const regex = /([A-Z]+)\.([A-Z]+)\s+(.*?)\s+(?:US\$|€)?(\d+(?:,\d+)?(?:\.\d+)?)\s+(\d+)\s+(\d+(?:,\d+)?(?:\.\d+)?)/;
      const match = line.match(regex);

      if (!match) {
        console.log('No match found for line:', line);
        return null;
      }

      const [_, symbol, exchange, companyName, price, shares, value] = match;
      
      // Extract gain/loss from the remaining part of the line
      const remainingLine = line.slice(line.indexOf(value) + value.length);
      const gainLossMatch = remainingLine.match(/-?\d+(?:,\d+)?(?:\.\d+)?/g);
      const gainLoss = gainLossMatch ? parseFloat(gainLossMatch[gainLossMatch.length - 1].replace(/,/g, '')) : 0;

      // Clean up numeric values
      const cleanPrice = price.replace(/,/g, '');
      const cleanValue = value.replace(/,/g, '');

      const fullName = `${companyName.trim()}.${exchange}`;
      
      // Get the ticker symbol from the map or use the extracted symbol
      const tickerSymbol = STOCK_SYMBOL_MAP[fullName] || symbol;
      console.log('Extracted ticker symbol:', tickerSymbol, 'for company:', fullName);

      const stockData: StockData = {
        name: fullName,
        symbol: tickerSymbol,
        price: parseFloat(cleanPrice),
        shares: parseInt(shares, 10),
        value: parseFloat(cleanValue),
        gainLoss: gainLoss
      };

      console.log('Processed stock data:', stockData);
      return stockData;
    }).filter((data): data is StockData => data !== null);

    console.log('Extracted portfolio data:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};