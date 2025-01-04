import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import PortfolioCharts from '@/components/PortfolioCharts';
import StockPerformanceTable from '@/components/StockPerformanceTable';
import { toast } from 'sonner';
import type { StockData } from '@/utils/imageProcessing';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<StockData[]>([
    {
      symbol: "LULU.NASDAQ",
      name: "Lululemon Athletica Inc.",
      price: 378.18,
      shares: 50,
      value: 15220.96,
      returns: 5221.49,
      sector: "CONSUMER NON DURABLES"
    },
    {
      symbol: "ONON.NYSE",
      name: "On Holding AG",
      price: 55.37,
      shares: 288,
      value: 12836.32,
      returns: 759.47,
      sector: "CONSUMER NON DURABLES"
    },
    {
      symbol: "ASML.EURONEXT",
      name: "ASML Holding NV",
      price: 688.00,
      shares: 188,
      value: 107359.79,
      returns: 2705.43,
      sector: "ELECTRONIC TECHNOLOGY"
    },
    {
      symbol: "TSM.NYSE",
      name: "Taiwan Semiconductor Manufacturing",
      price: 201.58,
      shares: 134,
      value: 21743.31,
      returns: 12012.84,
      sector: "ELECTRONIC TECHNOLOGY"
    },
    {
      symbol: "AMZN.NASDAQ",
      name: "Amazon.com Inc.",
      price: 224.19,
      shares: 617,
      value: 111346.08,
      returns: 21134.02,
      sector: "RETAIL TRADE"
    },
    {
      symbol: "MELI.NASDAQ",
      name: "MercadoLibre Inc",
      price: 1834.17,
      shares: 71,
      value: 104826.59,
      returns: -1793.67,
      sector: "RETAIL TRADE"
    },
    {
      symbol: "NU.NYSE",
      name: "Nu Holdings Ltd",
      price: 10.63,
      shares: 2149,
      value: 18388.37,
      returns: -1754.77,
      sector: "TECHNOLOGY SERVICES"
    }
  ]);
  const [showCharts, setShowCharts] = useState(true);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
  };

  const handleDataExtracted = (data: StockData[]) => {
    console.log('Extracted portfolio data:', data);
    setPortfolioData(data);
    setIsProcessing(false);
    setShowCharts(true);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  // Calculate sector totals
  const sectorData = React.useMemo(() => {
    const sectorTotals = portfolioData.reduce((acc, stock) => {
      if (!acc[stock.sector]) {
        acc[stock.sector] = 0;
      }
      acc[stock.sector] += stock.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [portfolioData]);

  const chartData = portfolioData.map(stock => ({
    name: stock.symbol,
    value: stock.value,
    returns: stock.returns || 0
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center animate-fadeIn">
            Portfolio Snapshot
          </h1>
          <p className="text-muted-foreground text-center mb-8 animate-fadeIn">
            Upload your portfolio screenshot to visualize your investments
          </p>

          <div className="space-y-8">
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onDataExtracted={handleDataExtracted}
            />

            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-pulse text-lg text-muted-foreground">
                  Processing your portfolio...
                </div>
              </div>
            )}

            {showCharts && chartData.length > 0 && (
              <div className="animate-fadeIn space-y-8">
                <div className="mb-6 p-4 bg-background border rounded-lg shadow-sm">
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">Portfolio Summary</h2>
                  <p className="text-muted-foreground">
                    Total Portfolio Value: ${portfolioData
                      .reduce((sum, stock) => sum + stock.value, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <PortfolioCharts data={chartData} sectorData={sectorData} />
                <StockPerformanceTable stocks={portfolioData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;