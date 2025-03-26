import React from 'react';
import { Row, Col } from 'antd';
import styles from './Content.less';

const ThumbnailGrid = ({ items }) => {
  return (
    <div className={styles.thumbnailContainer}>
      <Row gutter={[8, 8]}>
        {items.map((item, index) => (
          <Col xs={12} sm={8} md={6} key={item.FileId}>
            <div className={styles.thumbnailItem}>
              <img 
                src={item.thumbnailUrl} 
                alt={`Thumbnail ${index + 1}`}
                className={styles.thumbnailImage}
              />
              <div className={styles.pageNumber}>{index + 1}</div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ThumbnailGrid;