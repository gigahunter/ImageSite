/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image loader
 */
import Component from '../interface/component';
import consts from '../consts';
import { arrayBuffer } from '../../../utils/request';
import util from '../util';

// var xhr = require("xhr-request");
// const Jimp = require('jimp');

const { componentNames, rejectMessages } = consts;
const imageOption = {
  padding: 0,
  // crossOrigin: 'anonymous'
};

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 * @param {Graphics} graphics - Graphics instance
 * @ignore
 */
class ImageLoader extends Component {
  constructor(graphics) {
    super(componentNames.IMAGE_LOADER, graphics);
  }

  /**
   * Load image from url
   * @param {?string} imageName - File name
   * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
   * @returns {jQuery.Deferred} deferred
   */
  load(imageName, img) {
    let promise;

    if (!imageName && !img) {
      // Back to the initial state, not error.
      const canvas = this.getCanvas();

      canvas.backgroundImage = null;
      canvas.renderAll();

      promise = new Promise(resolve => {
        this.setCanvasImage('', null);
        resolve();
      });
    } else {
      promise = this._setBackgroundImage(img)
        .then(oImage => {
          this.setCanvasImage(imageName, oImage);
          this.adjustCanvasDimension();

          return oImage;
        })
        .catch(err => err);
    }

    return promise;
  }

  /**
   * Set background image
   * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
   * @returns {$.Deferred} deferred
   * @private
   */
  _setBackgroundImage(img) {
    if (!img) {
      return Promise.reject(rejectMessages.loadImage);
    }

    return new Promise((resolve, reject) => {
      const canvas = this.getCanvas();
      const graphics = this.graphics;

      function setExif(arrBuffer, elm) {
        try {
          const exif = graphics.exif || {};
          exif.width = elm.width;
          exif.height = elm.height;

          const dv = new DataView(arrBuffer);
          //JPEG
          if (0xffd8 === dv.getUint16(0)) {
            const xD = dv.getUint16(14);
            const yD = dv.getUint16(16);

            if (xD > 0 && yD > 0) {
              exif.densityUnits = dv.getUint8(13);
              exif.xDensity = dv.getUint16(14);
              exif.yDensity = dv.getUint16(16);
            }
          }

          graphics.exif = exif;
        } catch (e) {}
      }

      canvas.setBackgroundImage(
        img,
        () => {
          const oImage = canvas.backgroundImage;
          const elm = oImage.getElement();

          if (elm) {
            const url = elm.src;
            if (url) {
              if (url.length < 1000) {
                arrayBuffer(url, body => {
                  if (body !== null) {
                    setExif(body, elm);
                    resolve(oImage);
                  } else reject(rejectMessages.loadingImageFailed);
                });
              } else {
                // dataUrl
                if (util.isSupportFileApi()) {
                  var blob = util.base64ToArrayBuffer(url);
                  setExif(blob, elm);
                  resolve(oImage);
                }
              }
            } else {
              reject(rejectMessages.loadingImageFailed);
            }
          } else {
            reject(rejectMessages.loadingImageFailed);
          }
        },
        imageOption
      );
    });
  }
}

export default ImageLoader;
