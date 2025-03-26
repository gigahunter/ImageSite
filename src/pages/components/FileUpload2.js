import React from "react";
import { connect } from "dva";

import FileInput from "react-fine-uploader/file-input";
import FineUploaderTraditional from "fine-uploader-wrappers";
import config from '../../config';

function toRandom() {
  return parseInt(Math.random() * 10000, 10).toString();
}

function getGUID() {
  return toRandom() + toRandom() + toRandom() + toRandom();
}

function FileUpload({ dispatch, imgData }) {
  const tempId = getGUID();
  //const id2File = {};
  let fileList = [];
  const uploader = new FineUploaderTraditional({
    options: {
      callbacks: {
        //>>> 20210116 frank, support pdf
        onComplete: (id, name, response) => {
          // handle completed upload
          if(response.success) {
            if(response.fileList && response.fileList.length > 0)
              fileList = fileList.concat(response.fileList);
          }
        },
        //<<<
        onAllComplete: (succeeded, failed) => {
          // alert("onAllComplete!");
          try {
            /*for (let i = 0, iC = succeeded.length; i < iC; i++) {
              fileList.push(id2File[succeeded[i]]);
            }*/

            dispatch({
              type: "imgData/importTo",
              payload: { tempId, fileList }
            });
          } catch (e) {
            console.error(e.message);
          }
        },
        onUpload: (id, name) => {
          //id2File[id] = name;
          dispatch({
            type: "imgData/setLoading",
            loading: true
          });
        }
      },
      request: {
        requireSuccessJson: false,
        endpoint: config.remote + "/api/export2/ImportTo?id=" + tempId
      }
    }
  });

  return (
    <FileInput multiple accept=".zip,.pdf,.tif,.tiff,.jpg,.jpeg" uploader={uploader}>
      從檔案插入新頁
    </FileInput>
  );
}

function mapStateToProps(state) {
  const { imgData } = state;

  return { imgData };
}

export default connect(mapStateToProps)(FileUpload);
