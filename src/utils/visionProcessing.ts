import Replicate from 'replicate';
import type { StockData } from './imageProcessing';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const processImageWithAI = async (imageFile: File): Promise<StockData[]> => {
  console.log('Processing image with AI vision:', imageFile.name);
  
  try {
    // Convert file to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

    // Use BLIP model to extract text from image
    const output = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: base64Image,
          task: "image_captioning",
          caption: "List all stocks with their prices, shares, and values visible in this portfolio screenshot."
        }
      }
    );

    console.log('AI Vision output:', output);

    // Parse the AI output into stock data
    // This is a basic implementation - you'll need to adjust the parsing logic
    // based on the actual format of the AI output
    const stockData = parseAIOutput(output as string);
    
    return stockData;
  } catch (error) {
    console.error('Error processing image with AI:', error);
    throw new Error('Failed to process image with AI vision');
  }
};

const parseAIOutput = (output: string): StockData[] => {
  // This is a placeholder implementation
  // You'll need to adjust this based on the actual format of the AI output
  const stocks: StockData[] = [];
  
  // Split the output into lines and try to extract stock information
  const lines = output.split('\n');
  
  for (const line of lines) {
    const match = line.match(/(\w+)\s+at\s+\$?([\d,.]+)\s+with\s+(\d+)\s+shares/i);
    if (match) {
      const [_, symbol, price, shares] = match;
      const numericPrice = parseFloat(price.replace(/,/g, ''));
      const numericShares = parseInt(shares, 10);
      const value = numericPrice * numericShares;
      
      stocks.push({
        symbol: `${symbol}.NASDAQ`, // Default to NASDAQ, adjust as needed
        name: symbol,
        price: numericPrice,
        shares: numericShares,
        value: value,
        gainLoss: 0 // You might need to extract this from the AI output as well
      });
    }
  }
  
  return stocks;
};