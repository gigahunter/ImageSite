import { download, postJSON } from '../utils/request';
import config from '../config';

const urlRoot = config.remote + '/api/export2/';

export function viewPdf(docPath, attach, fileName) {
  if (!attach) attach = '';
  const url = `${urlRoot}ViewPdf?docPath=${encodeURI(docPath)}&attach=${encodeURI(attach)}`;

  return download(url, fileName + '.pdf');
}

export function exportZIP(docType, docId) {
  const url = `${urlRoot}Export?docType=${encodeURI(docType)}&docId=${encodeURI(docId)}`;

  return download(url, docId + '.zip');
}

export function importToFinish(id, param) {
  const url = `${urlRoot}ImportToFinish?id=${encodeURI(id)}`;
  const ret = postJSON(url, param);
  return ret;
}

export function downFromServer(docId) {
  const url = `${urlRoot}Download?docId=${encodeURI(docId)}`;
  const ret = postJSON(url, null);
  return ret;
}

/**
 * @param items format: [{docType: String, docId: String}, ...]
 * @returns format: [{docId: String, docType: String, msg: String}, ...]
 */
export function uploadTickedItmesToServer(items) {
  const url = `${urlRoot}UploadAsync`;
  const ret = postJSON(url, items);
  return ret;
}

/**
 * @param items format: [{docId: String}, ...]
 * @returns format: [{docId: String, result: Int}, ...]
 */
export function uploadTickedItmesCheck(items) {
  if (config.NoUploadCheck) {
    return {
      data: 0,
    };
  }
  const url = `${urlRoot}UploadCheckAsync`;
  const ret = postJSON(url, items);
  return ret;
}

export function uploadToServer(docType, docId) {
  const url = `${urlRoot}Upload?docType=${encodeURI(docType)}&docId=${encodeURI(docId)}`;
  const ret = postJSON(url, null);
  return ret;
}

export function uploadCheck(docId) {
  if (config.NoUploadCheck) {
    return {
      data: 0,
    };
  }

  const url = `${urlRoot}UploadCheck?docId=${encodeURI(docId)}`;
  const ret = postJSON(url, null);
  return ret;
}

export function viewFromServer(docId) {
  const url = `${urlRoot}View?docId=${encodeURI(docId)}`;
  const ret = postJSON(url, null);
  return ret;
}
