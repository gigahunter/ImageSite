import React, { useState } from 'react';
import { Spin } from 'antd';
import fetch from 'dva/fetch';

import styles from './Image.less';

const Width = 172;
let size = 0;

function delay(n) {
  return new Promise(function(resolve) {
    setTimeout(resolve, n * 1000);
  });
}

const CardContent = ({ url, title }) => {
  const [src, setSrc] = useState(!title ? url : null); //no title => preview, not to load from server

  async function run(imgSrc) {
    if (size > 5) await delay(size / 20);

    fetch(imgSrc).then(response => {
      if (response.status >= 200 && response.status < 300) {
        setSrc(imgSrc);
      }
      size--;
    });
  }

  if (url && !src) {
    size++;
    run(url);
  }

  return (
    <div className="card-outer">
      <div className="card-inner">
        {src ? (
          <img src={src} draggable="false" alt={title} width={Width} />
        ) : (
          <div width={Width} className={styles.loading}>
            <Spin />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardContent;
