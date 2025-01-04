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
    
    return lines.map(line => {
      // Updated regex to capture company name
      const match = line.match(/([A-Z]+)\.([A-Z]+)\s+(.*?)\s+US?\$?€?(\d+\.?\d*)\s+(\d+)\s+(\d+,?\d*\.?\d*)/);
      
      if (!match) {
        console.log('No match found for line:', line);
        return null;
      }

      const [_, symbol1, symbol2, companyName, price, shares, value] = match;
      const fullSymbol = `${symbol1}.${symbol2}`;

      return {
        symbol: fullSymbol,
        name: companyName.trim(),
        price: parseFloat(price.replace(',', '')),
        shares: parseInt(shares, 10),
        value: parseFloat(value.replace(',', ''))
      };
    }).filter((data): data is StockData => data !== null);
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};