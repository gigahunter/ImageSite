import React, { useState, useRef } from 'react';
import { Row, Col } from 'antd';
import styles from './ThumbnailGrid.less';

const ThumbnailGrid = ({ images, onImageDoubleClick, magnifyingGlassActive }) => {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRefs = useRef({});

  const handleMouseMove = (e, image, index) => {
    if (!magnifyingGlassActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate relative position within the image (0-1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
    setZoomPosition({ x: e.clientX, y: e.clientY });
    setActiveImageUrl(image.FileUrl);
    setShowZoom(true);
    
    // Store the reference to the image for dimensions
    if (!imageRefs.current[index]) {
      imageRefs.current[index] = {
        width: e.currentTarget.naturalWidth,
        height: e.currentTarget.naturalHeight
      };
    }
  };

  const handleMouseLeave = () => {
    if (!magnifyingGlassActive) return;
    setShowZoom(false);
  };

  // Calculate zoom factor - how much to magnify
  const zoomFactor = 2.5;

  return (
    <div className={styles.thumbnailGrid}>
      <Row gutter={[16, 16]}>
        {images.map((image, index) => (
          <Col xs={6} key={image.FileId}>
            <div 
              className={styles.imageContainer}
              style={{ cursor: magnifyingGlassActive ? 'zoom-in' : 'default' }}
            >
              <img
                alt={image.FileName}
                src={image.ThumbnailUrl || image.FileUrl}
                className={styles.thumbnail}
                onDoubleClick={() => onImageDoubleClick(image, index)}
                onMouseMove={(e) => handleMouseMove(e, image, index)}
                onMouseLeave={handleMouseLeave}
                onLoad={(e) => {
                  imageRefs.current[index] = {
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight
                  };
                }}
              />
            </div>
          </Col>
        ))}
      </Row>
      
      {magnifyingGlassActive && showZoom && activeImageUrl && (
        <div 
          className={styles.zoomView}
          style={{
            left: `${zoomPosition.x + 20}px`,
            top: `${zoomPosition.y - 100}px`,
          }}
        >
          <div 
            className={styles.zoomContent}
            style={{
              backgroundImage: `url(${activeImageUrl})`,
              backgroundPosition: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
              backgroundSize: `${zoomFactor * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ThumbnailGrid;
