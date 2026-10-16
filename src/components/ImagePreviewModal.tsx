import React from 'react';

interface ImagePreviewModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, alt, onClose }) => {
  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt || 'Preview'} />
      </div>
    </div>
  );
};
