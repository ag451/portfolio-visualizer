import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { processStockImage } from '@/utils/imageProcessing';
import { processImageWithAI } from '@/utils/visionProcessing';
import { Switch } from "@/components/ui/switch";
import type { StockData } from '@/utils/imageProcessing';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onDataExtracted: (data: StockData[]) => void;
}

const FileUpload = ({ onFileSelect, onDataExtracted }: FileUploadProps) => {
  const [useAI, setUseAI] = useState(false);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        // Convert file to base64 first
        const base64Data = await convertFileToBase64(file);
        
        // Call onFileSelect with a new File object created from the base64 data
        const blob = await fetch(base64Data).then(res => res.blob());
        const clonedFile = new File([blob], file.name, { type: file.type });
        onFileSelect(clonedFile);
        
        toast.loading('Processing your portfolio screenshot...');
        
        const stockData = useAI 
          ? await processImageWithAI(base64Data)
          : await processStockImage(clonedFile);
          
        onDataExtracted(stockData);
        toast.success('Portfolio data extracted successfully!');
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image. Please try again.');
      }
    }
  }, [onFileSelect, onDataExtracted, useAI]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm text-gray-600">Use AI Vision</span>
        <Switch
          checked={useAI}
          onCheckedChange={setUseAI}
        />
      </div>
      
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="text-lg text-center text-gray-600">
            {isDragActive
              ? "Drop your portfolio screenshot here"
              : "Drag & drop your portfolio screenshot, or click to select"}
          </p>
          <p className="text-sm text-gray-400">Supports PNG, JPG up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;