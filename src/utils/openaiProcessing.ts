import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use a backend service
});

export const extractTickerSymbol = async (companyName: string): Promise<string> => {
  console.log('Extracting ticker symbol for:', companyName);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial assistant that extracts stock ticker symbols from company names. Return ONLY the ticker symbol, nothing else."
        },
        {
          role: "user",
          content: `Extract the ticker symbol from this company name: ${companyName}`
        }
      ]
    });

    const tickerSymbol = response.choices[0].message.content?.trim() || companyName;
    console.log('Extracted ticker symbol:', tickerSymbol, 'for company:', companyName);
    return tickerSymbol;
  } catch (error) {
    console.error('Error extracting ticker symbol:', error);
    return companyName;
  }
};