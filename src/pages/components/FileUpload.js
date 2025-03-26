import React from 'react';
import { connect } from 'dva';
import { message } from 'antd';

import FileInput from 'react-fine-uploader/file-input';
import FineUploaderTraditional from 'fine-uploader-wrappers';
import config from '../../config';

function FileUpload({ dispatch, settings }) {
  const uploader = new FineUploaderTraditional({
    options: {
      cors: {
        //all requests are expected to be cross-domain requests
        expected: true,
      },
      callbacks: {
        onAllComplete: (succeeded, failed) => {
          dispatch({ type: 'imgData/queryDownload' });
        },
        onComplete: (id, fileName, json) => {
          if (json.success) message.info(`[${fileName}]匯入成功!`);
          else message.error(`[${fileName}]匯入失敗: ${json.error ? json.error : ''}`);
        },
        onError: (id, fileName, errMsg) => {
          //message.error(`[${fileName}]匯入失敗: ${errMsg}`);
        },
        onUpload: (id, name) => {
          dispatch({
            type: 'imgData/setLoading',
            loading: true,
          });
        },
      },
      request: {
        requireSuccessJson: false,
        endpoint: config.remote + '/api/export2/import/',
        params: { settings: JSON.stringify(settings) },
      },
    },
  });

  return (
    <FileInput multiple accept=".zip,.pdf,.tif,.tiff,.jpg,.jpeg" uploader={uploader}>
      本機匯入
    </FileInput>
  );
}

function mapStateToProps(state) {
  const settings = state.scanSettings.scanSettings;
  return { settings };
}

export default connect(mapStateToProps)(FileUpload);
