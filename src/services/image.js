import { postJSON } from "../utils/request";
import config from '../config';

const urlRoot = config.remote + "/api/image/";

export function Resize(width, height, dpi, dataUrl) {
  const url = `${urlRoot}/Resize?width=${width * 0.01}&height=${height *
    0.01}&dpi=${dpi}`;
  const ret = postJSON(url, dataUrl);
  return ret;
}

export function BlackWhite(dpi, dataUrl) {
  const url = `${urlRoot}BlackWhite?dpi=${dpi}`;
  const ret = postJSON(url, dataUrl);
  return ret;
}

export function GrayScale(dpi, dataUrl) {
  const url = `${urlRoot}GrayScale?dpi=${dpi}`;
  const ret = postJSON(url, dataUrl);
  return ret;
}

export function AutoEffect(dpi, dataUrl) {
  const url = `${urlRoot}AutoEffect?dpi=${dpi}`;
  const ret = postJSON(url, dataUrl);
  return ret;
}

export function RemoveDirty(dpi, dataUrl) {
  const url = `${urlRoot}RemoveDirty?dpi=${dpi}`;
  const ret = postJSON(url, dataUrl);
  return ret;
}
