import React from 'react';
import { Row, Col } from 'antd';
import styles from './ThumbnailGrid.less';

const ThumbnailGrid = ({ images, onImageDoubleClick }) => {
  var total = images.length;
  return (
    <div className={styles.thumbnailGrid}>
      <Row gutter={[16, 16]}>
        {images.map((image, index) => (
          <Col xs={6} key={image.FileId}>
            <div className={styles.imageContainer}>
              <img
                alt={image.FileName}
                src={image.ThumbnailUrl || image.FileUrl}
                className={styles.thumbnail}
                onDoubleClick={() => onImageDoubleClick(image, index)}
              />
              <div className={styles.filename}>({index + 1}/{total})</div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ThumbnailGrid;
