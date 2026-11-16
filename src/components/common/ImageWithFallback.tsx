import React, { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Wrench,
  Package,
  Truck,
  Camera,
  Upload,
  ImageOff,
  Sparkles,
  ShieldCheck,
  Maximize2,
  X,
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export type ImageCategory =
  | 'trolley'
  | 'fixture'
  | 'welding'
  | 'fabrication'
  | 'inspection'
  | 'mhe'
  | 'general';

interface ImageWithFallbackProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  category?: ImageCategory;
  title?: string;
  subtitle?: string;
  showUploadButton?: boolean;
  onPhotoUploaded?: (previewUrl: string, file: File) => void;
  aspectRatio?: 'video' | 'square' | 'auto';
  allowZoom?: boolean;
}

// Curated pool of verified reliable Unsplash industrial images for manufacturing, fabrication & logistics
const RELIABLE_INDUSTRIAL_IMAGES: Record<ImageCategory, string[]> = {
  trolley: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  ],
  fixture: [
    'https://images.unsplash.com/photo-1641893823219-38b433f736c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  ],
  welding: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1641893823219-38b433f736c0?auto=format&fit=crop&w=800&q=80',
  ],
  fabrication: [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1641893823219-38b433f736c0?auto=format&fit=crop&w=800&q=80',
  ],
  inspection: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  ],
  mhe: [
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1641893823219-38b433f736c0?auto=format&fit=crop&w=800&q=80',
  ],
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Industrial Equipment',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  category = 'general',
  title,
  subtitle,
  showUploadButton = false,
  onPhotoUploaded,
  aspectRatio = 'video',
  allowZoom = true,
}) => {
  const { t } = useLanguage();
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync when prop changes
  useEffect(() => {
    setCurrentSrc(src || null);
    setAttemptCount(0);
  }, [src]);

  const handleInitialError = () => {
    if (attemptCount === 0) {
      // Try an alternative image from the pool that is NOT the same failing URL
      setAttemptCount(1);
      const pool = RELIABLE_INDUSTRIAL_IMAGES[category] || RELIABLE_INDUSTRIAL_IMAGES.general;
      const alternatives = pool.filter((u) => u !== currentSrc);
      if (alternatives.length > 0) {
        const nextUrl = alternatives[Math.floor(Math.random() * alternatives.length)];
        setCurrentSrc(nextUrl);
        return;
      }
    }
    // If alternative also failed or none available, switch immediately to Graceful Visual Fallback UI
    setCurrentSrc(null);
    setAttemptCount(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local object URL preview
    const objectUrl = URL.createObjectURL(file);
    setCurrentSrc(objectUrl);
    setAttemptCount(0);

    if (onPhotoUploaded) {
      onPhotoUploaded(objectUrl, file);
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'trolley':
        return Boxes;
      case 'fixture':
        return Package;
      case 'welding':
      case 'fabrication':
        return Wrench;
      case 'mhe':
        return Truck;
      case 'inspection':
        return ShieldCheck;
      default:
        return Camera;
    }
  };

  const IconComponent = getCategoryIcon();

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'h-full';

  // Determine if we should show the Graceful Visual Fallback UI
  const showVisualFallback = !currentSrc || attemptCount >= 2;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg bg-slate-100 border border-slate-200 group ${aspectClass} ${containerClassName}`}
      >
        {!showVisualFallback ? (
          <>
            <img
              src={currentSrc}
              alt={alt}
              className={`${className} transition duration-300 group-hover:scale-102`}
              onError={handleInitialError}
              loading="lazy"
            />

            {/* Subtle Gradient Overlay & Zoom Action */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
              <span className="text-[10px] font-medium text-white truncate max-w-[80%] drop-shadow-xs">
                {title || alt}
              </span>
              {allowZoom && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="p-1 rounded bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                  title={t('enlarge_photo', 'Enlarge Photo')}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Graceful Visual Fallback UI */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/80">
            {/* Industrial blueprint style grid line overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #0f172a 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-300/80 flex items-center justify-center text-teal-700 mb-2">
                <IconComponent className="w-5 h-5" />
              </div>

              <h5 className="font-bold text-xs text-slate-800 line-clamp-1 max-w-[200px]">
                {title || alt}
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[220px]">
                {subtitle || `${category.toUpperCase()} Visual Reference`}
              </p>

              {showUploadButton && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shadow-xs transition hover:text-teal-700 hover:border-teal-300 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-teal-600" />
                  <span>{t('btn_upload_photo', 'Upload Photo')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden File Input for Direct Upload */}
        {showUploadButton && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && currentSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 truncate">{title || alt}</span>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[80vh] bg-black">
              <img
                src={currentSrc}
                alt={alt}
                className="max-w-full max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
