"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value = [],
  limitValue = 3
}) {
  const [previews, setPreviews] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPreviews(value);
  }, [value]);

  const handleFileChange = async (event) => {
    const input = event.target;
    const files = Array.from(input.files);
    if (!files.length) return;

    input.value = '';

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    setIsLoading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(data.path);

        onChange(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (url) => {
    // Revoke the object URL
    URL.revokeObjectURL(url);

    // Remove from previews
    const updatedPreviews = previews.filter((preview) => preview !== url);
    setPreviews(updatedPreviews);

    setIsLoading(true);
    
    // Remove from Supabase storage
    try {
      const fileName = url.split('/').pop();
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (error) throw error;

      // Call onRemove to update form state
      onRemove(url);
    } catch (error) {
      console.error('Error removing image from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLimitReached = previews.length >= limitValue;

  return (
    <div className="space-y-4">
           {previews.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
              <Image 
                fill
                className="object-cover"
                alt="Preview"
                src={preview}
              />
              <Button 
                type="button"
                onClick={() => handleRemove(preview)}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 z-10"
                disabled={isLoading}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div>
        <Button 
          type="button"
          onClick={() => document.getElementById('file-input').click()} 
          disabled={isLoading || isLimitReached || disabled}
          variant={"secondary"}
          className={cn(
            'flex items-center justify-center gap-2', 
            'transition border-dotted border-[2px]',
            {
              'bg-gray-400 cursor-not-allowed': isLoading,
            }
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
          <span>
            {isLoading ? 'Uploading...' : isLimitReached ? 'Limit Reached' : 'Upload Image'}
          </span>
        </Button>
        <input 
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isLimitReached} 
          accept="image/*"
        />
      </div>
    </div>
  );
}