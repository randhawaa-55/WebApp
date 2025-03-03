import React, { useState } from 'react';
import Head from 'next/head';
import FileUploader from '../components/FileUploader';
import ToolSelector from '../components/ToolSelector';
import ProcessingOptions from '../components/ProcessingOptions';
import ActionButton from '../components/ActionButton';
import ResultDownload from '../components/ResultDownload';

export default function Home() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setFiles([]);
    setOptions({});
    setResult(null);
  };
  
  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
  };
  
  const handleOptionsChange = (newOptions) => {
    setOptions(newOptions);
  };
  
  const handleProcess = async () => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      // Add options to formData
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      const response = await fetch(`/api/${selectedTool}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Processing failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing files:', error);
      // Show error notification
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div>
      <Head>
        <title>Toolify - Your Document Processing Toolkit</title>
        <meta name="description" content="Process and convert documents online" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Toolify</h1>
        
        <ToolSelector onSelect={handleToolSelect} selectedTool={selectedTool} />
        
        {selectedTool && (
          <>
            <FileUploader 
              acceptedFileTypes={getAcceptedFileTypes(selectedTool)}
              maxFiles={getMaxFiles(selectedTool)}
              onFilesSelected={handleFilesSelected}
            />
            
            {files.length > 0 && (
              <ProcessingOptions 
                tool={selectedTool} 
                onChange={handleOptionsChange} 
              />
            )}
            
            {files.length > 0 && (
              <ActionButton 
                onClick={handleProcess} 
                isProcessing={isProcessing} 
                disabled={files.length === 0}
              />
            )}
            
            {result && (
              <ResultDownload result={result} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function getAcceptedFileTypes(tool) {
  // Return appropriate file types based on selected tool
  const typeMap = {
    'pdf-to-word': 'application/pdf',
    'merge-pdf': 'application/pdf',
    'jpg-to-pdf': 'image/jpeg,image/png',
    // Add more mappings
  };
  
  return typeMap[tool] || '*';
}

function getMaxFiles(tool) {
  // Return appropriate max files based on selected tool
  const maxMap = {
    'merge-pdf': 20,
    'split-pdf': 1,
    // Add more mappings
  };
  
  return maxMap[tool] || 1;
} 