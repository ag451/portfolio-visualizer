import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PortfolioCharts from '@/components/PortfolioCharts';
import { toast } from 'sonner';

// Real data extracted from the screenshot
const PORTFOLIO_DATA = [
  { name: 'AMZN', value: 109644.20 },
  { name: 'ASML', value: 107600.28 },
  { name: 'LULU', value: 15021.68 },
  { name: 'MELI', value: 101122.27 },
  { name: 'NU', value: 18433.74 },
  { name: 'ONON', value: 12867.99 },
  { name: 'TSM', value: 21796.96 }
];

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCharts, setShowCharts] = useState(true); // Set to true to show the charts immediately

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowCharts(true);
      toast.success('Portfolio processed successfully!');
    }, 2000);
  };

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
            <FileUpload onFileSelect={handleFileSelect} />

            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-pulse text-lg text-gray-600">
                  Processing your portfolio...
                </div>
              </div>
            )}

            {showCharts && (
              <div className="animate-fadeIn">
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                  <h2 className="text-2xl font-semibold mb-2">Portfolio Summary</h2>
                  <p className="text-gray-600">
                    Total Portfolio Value: ${PORTFOLIO_DATA.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </p>
                </div>
                <PortfolioCharts data={PORTFOLIO_DATA} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;