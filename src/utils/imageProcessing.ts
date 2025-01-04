import Tesseract from 'tesseract.js';

export interface StockData {
  name: string;
  symbol: string;
  price: number;
  shares: number;
  value: number;
  gainLoss: number;
}

const extractTickerSymbol = (text: string): string => {
  // Extract everything before the dot (.)
  const match = text.match(/^([^.]+)/);
  if (match) {
    return match[1];
  }
  return text;
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
      const regex = /([A-Z]+\.[A-Z]+)\s+(.*?)\s+(?:US\$|€)?(\d+(?:,\d+)?(?:\.\d+)?)\s+(\d+)\s+(\d+(?:,\d+)?(?:\.\d+)?)/;
      const match = line.match(regex);

      if (!match) {
        console.log('No match found for line:', line);
        return null;
      }

      const [_, symbolWithExchange, companyName, price, shares, value] = match;
      
      // Extract the ticker symbol (everything before the dot)
      const symbol = extractTickerSymbol(symbolWithExchange);
      console.log('Extracted ticker symbol:', symbol, 'from:', symbolWithExchange);

      // Clean up numeric values
      const cleanPrice = price.replace(/,/g, '');
      const cleanValue = value.replace(/,/g, '');

      // Extract gain/loss from the remaining part of the line
      const remainingLine = line.slice(line.indexOf(value) + value.length);
      const gainLossMatch = remainingLine.match(/-?\d+(?:,\d+)?(?:\.\d+)?/g);
      const gainLoss = gainLossMatch ? parseFloat(gainLossMatch[gainLossMatch.length - 1].replace(/,/g, '')) : 0;

      const stockData: StockData = {
        name: companyName.trim(),
        symbol: symbol,
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