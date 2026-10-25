import React from 'react';
import Modal from './Modal';
import Icon from '../Icon';
import { getOptimizedImageUrl, ImageSizePresets } from '../../utils/imageUtils';

interface ImageLightboxProps {
  /** The image to show; null keeps the lightbox closed. */
  imageUrl: string | null;
  alt: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, alt, onClose }) => (
  <Modal open={imageUrl !== null} onClose={onClose} label={alt}>
    {imageUrl && (
      <>
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-20 z-10 min-h-11 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-colors font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Icon name="external-link" className="w-5 h-5" />
          <span className="sr-only sm:not-sr-only">Open full size</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        <img
          src={getOptimizedImageUrl(imageUrl, ImageSizePresets.LARGE)}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none px-4">
          <span className="inline-block px-4 py-2 bg-black/50 text-white text-xs rounded-full backdrop-blur-md border border-white/10">
            Pinch to zoom or tap "Open full size"
          </span>
        </div>
      </>
    )}
  </Modal>
);

export default ImageLightbox;
