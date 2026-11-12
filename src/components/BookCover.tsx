/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  src?: string | null;
  alt: string;
  className?: string;
  title?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  src,
  alt,
  className = '',
  title,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 select-none ${className}`}
        role="img"
        aria-label={alt || title || 'Couverture de livre'}
      >
        <BookOpen className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0 mb-1" />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 line-clamp-2 leading-tight">
          {title || alt || 'Ouvrage'}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 font-mono">
          BU Livres
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
