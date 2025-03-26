import React from 'react';
import styles from './Content.less';

const ThumbnailGallery = ({ thumbnails }) => {
    return (
        <div className={styles.thumbnailGallery}>
            {thumbnails.map((thumbnail, index) => (
                <img
                    key={index}
                    src={thumbnail.ThumbnailUrl}
                    alt={thumbnail.Title}
                    style={{ width: '25%', padding: '5px' }}
                />
            ))}
        </div>
    );
};

export default ThumbnailGallery;