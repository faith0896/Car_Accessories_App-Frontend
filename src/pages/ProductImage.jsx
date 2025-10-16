import React, { useState } from "react";

const ProductImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc("https://via.placeholder.com/150?text=Not+Found");
      console.error("Image failed to load:", src);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      className="product-image"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

export default ProductImage;
