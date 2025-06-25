import React from "react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt = "Attachment", className }) => {
  return (
    <div className={`w-full max-w-xs rounded-lg overflow-hidden shadow-sm ${className}`}>
      <img
        src={src}
        alt={alt}
        className="object-contain w-full h-auto max-h-60 border border-gray-300 dark:border-gray-600"
      />
    </div>
  );
};

export default ImagePreview;

