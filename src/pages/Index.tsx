import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PortfolioCharts from '@/components/PortfolioCharts';
import { toast } from 'sonner';
import type { StockData } from '@/utils/imageProcessing';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<StockData[]>([]);
  const [showCharts, setShowCharts] = useState(false);

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

  // Transform stock data for charts
  const chartData = portfolioData.map(stock => ({
    name: stock.symbol,
    value: stock.value
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4 text-center animate-fadeIn">
            Portfolio Snapshot
          </h1>
          <p className="text-gray-600 text-center mb-8 animate-fadeIn">
            Upload your portfolio screenshot to visualize your investments
          </p>

          <div className="space-y-8">
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onDataExtracted={handleDataExtracted}
            />

            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-pulse text-lg text-gray-600">
                  Processing your portfolio...
                </div>
              </div>
            )}

            {showCharts && chartData.length > 0 && (
              <div className="animate-fadeIn">
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                  <h2 className="text-2xl font-semibold mb-2">Portfolio Summary</h2>
                  <p className="text-gray-600">
                    Total Portfolio Value: ${portfolioData
                      .reduce((sum, stock) => sum + stock.value, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <PortfolioCharts data={chartData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;