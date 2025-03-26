import request, { postJSON } from '../utils/request';
import config from '../config';

const urlRoot = config.remote + '/api/operator/';

export function remove(docParam) {
  return postJSON(`${urlRoot}Remove`, docParam);
}

export function removeBlank(docParam) {
  return postJSON(`${urlRoot}RemoveBlank`, docParam);
}

export function split(params) {
  return postJSON(`${urlRoot}Split`, params);
}

export function change(docType, doc1, doc2) {
  const url = `${urlRoot}Change?docType=${encodeURI(docType)}&doc1=${encodeURI(
    doc1
  )}&doc2=${encodeURI(doc2)}`;

  return request(url);
}

export function reorder(docParam, fidAfter, fid) {
  const url = `${urlRoot}Reorder?fidAfter=${encodeURI(fidAfter)}&fid=${encodeURI(fid)}`;
  return postJSON(url, docParam);
}

export function reorders(docParam, fidAfter, fids) {
  if (fidAfter === null) fidAfter = '0';
  const url = `${urlRoot}Reorders?fidAfter=${encodeURI(fidAfter)}`;

  docParam.Fids = fids;
  return postJSON(url, docParam);
}

export function rotate(rParam) {
  return postJSON(`${urlRoot}Rotate`, rParam);
}

export function deleteFid(docParam) {
  const url = `${urlRoot}Delete`;
  return postJSON(url, docParam);
}

export function deleteByFids(docParam) {
  const url = `${urlRoot}Delete`;
  return postJSON(url, docParam);
}

export function saveImage(docParam, base64, dpiOld, dpiNew) {
  const url = `${urlRoot}Save`;
  const param = {
    DocFile: docParam,
    Base64: base64,
    dpiOld,
    dpiNew,
  };
  return postJSON(url, param);
}
