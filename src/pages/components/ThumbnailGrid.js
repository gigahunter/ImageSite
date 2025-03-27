import React from 'react';
import { Row, Col, Card } from 'antd';
import styles from './ThumbnailGrid.less';

const ThumbnailGrid = ({ images }) => {
  return (
    <div className={styles.thumbnailGrid}>
      <Row gutter={[16, 16]}>
        {images.map((image, index) => (
          <Col xs={6} key={image.FileId}>
            <Card
              hoverable
              cover={
                <img
                  alt={image.FileName}
                  src={image.ThumbnailUrl || image.FileUrl}
                  className={styles.thumbnail}
                />
              }
            >
              <Card.Meta title={image.FileName} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ThumbnailGrid;
