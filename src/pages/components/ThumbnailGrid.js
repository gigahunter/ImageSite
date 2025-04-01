import React, { useState, useRef, useEffect } from 'react';
import { Row, Col } from 'antd';
import styles from './ThumbnailGrid.less';

const ThumbnailGrid = ({ images, onImageDoubleClick, magnifyingGlassActive }) => {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [screenDimensions, setScreenDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const imageRefs = useRef({});

  // Update screen dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
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
    setZoomPosition({ 
      x: e.clientX, 
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    });
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

  // Constants for magnifying glass
  const ZOOM_WIDTH = 280;
  const ZOOM_HEIGHT = 280;
  const MARGIN = 20;

  // Determine optimal position for the magnifying glass
  const determineZoomPosition = (pos) => {
    // Get screen dimensions
    const { width: screenWidth, height: screenHeight } = screenDimensions;

    // Check horizontal position (left or right)
    const showOnLeft = pos.x > (screenWidth * 0.6);

    // Check vertical position (top or bottom)
    const showOnTop = pos.y > (screenHeight * 0.7);

    // Calculate position
    let left, top;

    if (showOnLeft) {
      left = `${pos.x - ZOOM_WIDTH - MARGIN}px`;
    } else {
      left = `${pos.x + MARGIN}px`;
    }

    if (showOnTop) {
      top = `${pos.y - ZOOM_HEIGHT - MARGIN}px`;
    } else {
      top = `${pos.y + MARGIN}px`;
    }

    return { left, top };
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
          style={determineZoomPosition(zoomPosition)}
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
