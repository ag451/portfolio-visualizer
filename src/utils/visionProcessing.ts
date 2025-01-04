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

    console.log('Image successfully converted to base64');

    try {
      console.log('Calling Replicate API...');
      const output = await replicate.run(
        "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
        {
          input: {
            image: base64Image,
            task: "image_captioning",
            caption: "Extract and list all stocks with their exact prices, number of shares, and total values from this portfolio screenshot. Format as: Stock Symbol: Price per share, Number of shares, Total value"
          }
        }
      );

      console.log('Raw API response:', output);

      // Ensure output is treated as string before parsing
      const outputText = String(output);
      console.log('Converted output text:', outputText);
      
      // Parse the AI output into stock data
      const stockData = parseAIOutput(outputText);
      console.log('Parsed stock data:', stockData);
      
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
  console.log('Starting to parse AI output');
  
  // Split the output into lines and extract stock information
  const lines = output.split('\n').filter(line => line.trim());
  console.log('Split lines:', lines);
  
  const stocks: StockData[] = [];
  
  for (const line of lines) {
    console.log('Processing line:', line);
    
    // Try to match patterns like "AAPL: $150.50, 100 shares, $15050"
    const match = line.match(/([A-Z]+):\s*\$?([\d,.]+),\s*(\d+)\s*shares?,\s*\$?([\d,.]+)/i);
    
    if (match) {
      const [_, symbol, price, shares, value] = match;
      console.log('Matched values:', { symbol, price, shares, value });
      
      const numericPrice = parseFloat(price.replace(/,/g, ''));
      const numericShares = parseInt(shares, 10);
      const numericValue = parseFloat(value.replace(/,/g, ''));
      
      stocks.push({
        symbol: `${symbol}.NASDAQ`, // Adding exchange suffix as required by the interface
        name: `${symbol}.NASDAQ`,   // Using same format as OCR processing
        price: numericPrice,
        shares: numericShares,
        value: numericValue,
        gainLoss: 0 // Since AI might not detect gain/loss, defaulting to 0
      });
    } else {
      console.log('No match found for line:', line);
    }
  }
  
  console.log('Final parsed stocks:', stocks);
  return stocks;
};