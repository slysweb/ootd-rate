"use client";

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import RatingResult from './components/RatingResult';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = async (url: string) => {
    setImageUrl(url);
    setLoading(true);
    
    try {
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      
      const data = await response.json();
      setRating(data);
    } catch (error) {
      console.error('Error rating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">OOTD Rate by AI</h1>
        <p className="text-center mb-12">Upload your outfit of the day and get rated by AI</p>
        
        {!imageUrl ? (
          <ImageUploader onUpload={handleImageUpload} />
        ) : (
          <RatingResult 
            imageUrl={imageUrl} 
            rating={rating} 
            loading={loading} 
            onReset={() => {
              setImageUrl(null);
              setRating(null);
            }}
          />
        )}
      </div>
    </main>
  );
} 