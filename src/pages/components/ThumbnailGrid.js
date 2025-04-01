import React, { useState, useRef, useEffect } from 'react';
import { Row, Col } from 'antd';
import styles from './ThumbnailGrid.less';

const ThumbnailGrid = ({ images, onImageDoubleClick, magnifyingGlassActive }) => {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const imageRefs = useRef({});

  // Update screen width on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Determine if we should show the magnifying glass on the left side
  const determineZoomPosition = (x, y) => {
    // Magnifying glass width plus some margin
    const zoomWidth = 300;
    // If cursor is in the right 40% of the screen, show on left
    const showOnLeft = x > (screenWidth * 0.6);

    return {
      left: showOnLeft ? `${x - zoomWidth - 20}px` : `${x + 20}px`,
      top: `${y - 100}px`
    };
  };

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
          style={determineZoomPosition(zoomPosition.x, zoomPosition.y)}
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
