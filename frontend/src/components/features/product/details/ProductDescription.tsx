'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-quill-new/dist/quill.snow.css';

interface ProductDescriptionProps {
  description: string | null | undefined;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-base font-bold text-foreground">About this product</h3>
      <div className="relative">
        <div
          className={cn(
            'text-muted-foreground leading-relaxed text-sm transition-all duration-500 overflow-hidden',
            !isExpanded && 'max-h-[350px]'
          )}>
          <div
            dangerouslySetInnerHTML={{ __html: description }}
            className="ql-editor !p-0 !text-sm !font-sans !leading-relaxed"
          />
        </div>

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-hover transition-colors pt-1">
        {isExpanded ? (
          <>
            Show Less <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Show More <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

