import Tesseract from 'tesseract.js';

export interface StockData {
  name: string;
  symbol: string;
  price: number;
  shares: number;
  value: number;
}

export const processStockImage = async (imageFile: File): Promise<StockData[]> => {
  console.log('Processing image:', imageFile.name);
  
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m)
    });

    console.log('OCR Result:', result.data.text);

    // Split the text into lines and process each line
    const lines = result.data.text.split('\n').filter(line => line.trim());
    console.log('Processed lines:', lines);
    
    const stockData = lines.map(line => {
      // Updated regex pattern to better match the actual format
      const pattern = /([A-Z]+)\.(NYSE|NASDAQ|EURONEXT)\s+(.*?)\s+[US$€£]?([\d,.]+)\s+(\d+)\s+[US$€£]?([\d,.]+)/i;
      const match = line.match(pattern);
      
      if (!match) {
        console.log('No match found for line:', line);
        return null;
      }

      console.log('Match found:', match);
      const [_, symbol1, exchange, name, price, shares, value] = match;
      const fullSymbol = `${symbol1}.${exchange}`;

      // Clean up numeric values
      const cleanPrice = parseFloat(price.replace(/,/g, ''));
      const cleanShares = parseInt(shares.replace(/,/g, ''), 10);
      const cleanValue = parseFloat(value.replace(/,/g, ''));

      console.log('Extracted data:', {
        symbol: fullSymbol,
        name: name.trim(),
        price: cleanPrice,
        shares: cleanShares,
        value: cleanValue
      });

      return {
        symbol: fullSymbol,
        name: name.trim(),
        price: cleanPrice,
        shares: cleanShares,
        value: cleanValue
      };
    }).filter((data): data is StockData => {
      if (!data) {
        return false;
      }
      // Validate the extracted data
      const isValid = !isNaN(data.price) && 
                     !isNaN(data.shares) && 
                     !isNaN(data.value) &&
                     data.price > 0 &&
                     data.shares > 0 &&
                     data.value > 0;
      
      if (!isValid) {
        console.log('Invalid data found:', data);
      }
      return isValid;
    });

    console.log('Final extracted stock data:', stockData);
    return stockData;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};