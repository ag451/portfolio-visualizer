import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PortfolioCharts from '@/components/PortfolioCharts';
import { toast } from 'sonner';

// Mock data - in real app this would come from image processing
const MOCK_DATA = [
  { name: 'AAPL', value: 15000 },
  { name: 'GOOGL', value: 12000 },
  { name: 'MSFT', value: 10000 },
  { name: 'AMZN', value: 8000 },
  { name: 'TSLA', value: 5000 },
];

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

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
        <div className="max-w-4xl mx-auto">
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
                <PortfolioCharts data={MOCK_DATA} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;