import Replicate from 'replicate';
import type { StockData } from './imageProcessing';

const replicate = new Replicate({
  auth: 'r8_7MhpRKemCwseyKHJ1e9xcS7c7k4cs3u4TLqt0',
});

export const processImageWithAI = async (imageFile: File): Promise<StockData[]> => {
  console.log('Starting AI vision processing for:', imageFile.name);
  
  try {
    // Convert file to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      }
    });

    console.log('Image successfully converted to base64, length:', base64Image.length);

    try {
      console.log('Calling Replicate API...');
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

      console.log('Replicate API response received:', output);

      // Ensure output is treated as string before parsing
      const outputText = String(output);
      
      // Parse the AI output into stock data
      const stockData = parseAIOutput(outputText);
      
      return stockData;
    } catch (apiError) {
      console.error('Error calling Replicate API:', apiError);
      throw new Error(`Failed to process image with Replicate API: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error in AI vision processing:', error);
    throw error;
  }
};

const parseAIOutput = (output: string): StockData[] => {
  console.log('Parsing AI output:', output);
  
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
        name: `${symbol}.NASDAQ`,
        price: numericPrice,
        shares: numericShares,
        value: value,
        gainLoss: 0 // You might need to extract this from the AI output as well
      });
    }
  }
  
  console.log('Parsed stock data:', stocks);
  return stocks;
};