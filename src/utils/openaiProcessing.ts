import { supabase } from "@/integrations/supabase/client";

export const extractTickerSymbol = async (companyName: string): Promise<string> => {
  console.log('Extracting ticker symbol for:', companyName);
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-ticker', {
      body: { companyName }
    });

    if (error) {
      console.error('Error calling extract-ticker function:', error);
      return companyName;
    }

    console.log('Extracted ticker symbol:', data.tickerSymbol, 'for company:', companyName);
    return data.tickerSymbol;
  } catch (error) {
    console.error('Error extracting ticker symbol:', error);
    return companyName;
  }
};