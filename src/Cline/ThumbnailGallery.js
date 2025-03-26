import React from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import config from '../../config';

import styles from './ThumbnailGallery.less';

class ThumbnailGallery extends React.Component {
  handleThumbnailClick = (fileId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'imgData/selectByItemId',
      payload: { key: fileId },
    });
  };
  
  handleThumbnailDoubleClick = (fileId) => {
    const { dispatch, onToggleGallery } = this.props;
    
    // First select the image
    dispatch({
      type: 'imgData/selectByItemId',
      payload: { key: fileId },
    });
    
    // Then toggle back to editor view
    if (onToggleGallery) {
      onToggleGallery();
    }
  };

  render() {
    const { selectedItems } = this.props;
    
    if (!selectedItems || selectedItems.length === 0) {
      return <div className={styles.emptyGallery}>No images available</div>;
    }

    return (
      <div className={styles.galleryContainer}>
        <Row gutter={[16, 16]}>
          {selectedItems.map((item, index) => {
            const thumbnailUrl = item.Thumbnail
              ? config.remote + item.Thumbnail.substring(1, item.Thumbnail.length)
              : item.Thumbnail;
            
            return (
              <Col span={6} key={item.FileId}>
                <div 
                  className={styles.thumbnailItem} 
                  onClick={() => this.handleThumbnailClick(item.FileId)}
                  onDoubleClick={() => this.handleThumbnailDoubleClick(item.FileId)}
                >
                  <div className={styles.thumbnailImage}>
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={`Thumbnail ${index + 1}`} />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                  </div>
                  <div className={styles.thumbnailInfo}>
                    <span>({index + 1}/{selectedItems.length})</span>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { selectedItems } = state.imgData;
  return { selectedItems };
}

export default connect(mapStateToProps)(ThumbnailGallery);
