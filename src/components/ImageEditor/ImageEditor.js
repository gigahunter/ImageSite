import React from "react";
import snippet from "tui-code-snippet";

import consts from "./consts";
import Graphics from "./graphics";
import Invoker from "./invoker";
import action from "./action";
import commandFactory from "./factory/command";

import styles from "./ImageEditor.less";

const { rejectMessages, componentNames, keyCodes } = consts;
const events = consts.eventNames;
const commands = consts.commandNames;

const { CustomEvents } = snippet;

class ImageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.config = props.cfg || {};

    this._invoker = new Invoker();

    /**
     * Event handler list
     * @type {Object}
     * @private
     */
    this._handlers = {
      keydown: this._onKeyDown.bind(this),
      mousedown: this._onMouseDown.bind(this),
      objectActivated: this._onObjectActivated.bind(this),
      objectMoved: this._onObjectMoved.bind(this),
      objectScaled: this._onObjectScaled.bind(this),
      addText: this._onAddText.bind(this),
      addObject: this._onAddObject.bind(this),
      addObjectAfter: this._onAddObjectAfter.bind(this),
      textEditing: this._onTextEditing.bind(this),
      textChanged: this._onTextChanged.bind(this),
      iconCreateResize: this._onIconCreateResize.bind(this),
      iconCreateEnd: this._onIconCreateEnd.bind(this),
      selectionCleared: this._selectionCleared.bind(this),
      selectionCreated: this._selectionCreated.bind(this)
    };

    // this.actions = action.getActions();
  }

  init() {
    const options = this.config;

    this._graphics = new Graphics(this._wrapper, {
      cssMaxWidth: options.cssMaxWidth,
      cssMaxHeight: options.cssMaxHeight
    });

    this._attachInvokerEvents();
    this._attachGraphicsEvents();
    this._attachDomEvents();
    this._setSelectionStyle(options.selectionStyle, {
      applyCropSelectionStyle: options.applyCropSelectionStyle,
      applyGroupSelectionStyle: options.applyGroupSelectionStyle
    });

    if (options.file) {
      this.loadImage(options.file, "initImage").then(img => {
        if (options.callback) options.callback(img);
        this._invoker.clearUndoStack();
      });
    }
  }

  componentDidMount() {
    this.init();
  }

  loadImage(url, name) {
    /*
    if (!name || !url) {
      return Promise.reject(rejectMessages.invalidParameters);
    }
    */

    return this.execute(commands.LOAD_IMAGE, name, url);
  }

  /**
   * Load image from url
   * @param {string} url - File url
   * @param {string} imageName - imageName
   * @returns {Promise<SizeChange, ErrorMsg>}
   * @example
   * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena').then(result => {
   *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
   *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
   * });
   */
  loadImageFromURL(url, imageName) {
    if (!imageName || !url) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.execute(commands.LOAD_IMAGE, imageName, url);
  }

  saveImage() {
    return this._graphics.toDataURL({
      format: "jpeg",
      quality: 0.9
    });
  }

  /**
   * Crop this image with rect
   * @param {Object} rect crop rect
   *  @param {Number} rect.left left position
   *  @param {Number} rect.top top position
   *  @param {Number} rect.width width
   *  @param {Number} rect.height height
   * @returns {Promise}
   * @example
   * imageEditor.crop(imageEditor.getCropzoneRect());
   */
  crop(rect) {
    const data = this._graphics.getCroppedImageData(rect);
    if (!data) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.loadImageFromURL(data.url, data.imageName);
  }

  /**
   * Get the cropping rect
   * @returns {Object}  {{left: number, top: number, width: number, height: number}} rect
   */
  getCropzoneRect() {
    return this._graphics.getCropzoneRect();
  }

  execute(commandName, ...args) {
    // Inject an Graphics instance as first parameter
    const theArgs = [this._graphics].concat(args);

    return this._invoker.execute(commandName, ...theArgs);
  }

  applyFilter(type, options) {
    return this.execute(commands.APPLY_FILTER, type, options);
  }

  getFilterOptions(type) {
    const filterComp = this._graphics.getComponent(componentNames.FILTER);
    return filterComp.getOptions(type);
  }

  undo() {
    if (this._invoker.isEmptyUndoStack()) return;
    return this._invoker.undo();
  }

  redo() {
    if (this._invoker.isEmptyRedoStack()) return;
    return this._invoker.redo();
  }

  clearUndoStack() {
    this._invoker.clearUndoStack();
  }

  clearRedoStack() {
    this._invoker.clearRedoStack();
  }

  isEmptyUndoStack() {
    return this._invoker.isEmptyUndoStack();
  }

  isEmptyRedoStack() {
    return this._invoker.isEmptyRedoStack();
  }

  getExif() {
    return this._graphics.exif;
  }

  /**
   * Set scaling image ratio
   * @param {float} value - 1: scale with width, 2: scale with height, other: ratio
   * @memberof ImageEditor
   */
  setRatio(value) {
    if (!value) return;
    this._graphics.adjustCanvasDimension(value);
  }
  /**
   * Get scaling image ratio
   * @returns ratio
   * @memberof ImageEditor
   */
  getRatio() {
    return this._graphics.ratio;
  }

  /**
   * Set drawing brush
   * @param {Object} option brush option
   *  @param {Number} option.width width
   *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
   * @example
   * imageEditor.startDrawingMode('FREE_DRAWING');
   * imageEditor.setBrush({
   *     width: 12,
   *     color: 'rgba(0, 0, 0, 0.5)'
   * });
   * imageEditor.setBrush({
   *     width: 8,
   *     color: 'FFFFFF'
   * });
   */
  setBrush(option) {
    this._graphics.setBrush(option);
  }

  //events

  /**
   * Keydown event handler
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  /* eslint-disable complexity */
  _onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
      // There is no error message on shortcut when it's empty
      this.undo()["catch"](() => {});
    }

    if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
      // There is no error message on shortcut when it's empty
      this.redo()["catch"](() => {});
    }

    if (e.keyCode === keyCodes.BACKSPACE || e.keyCode === keyCodes.DEL) {
      e.preventDefault();
      this.removeActiveObject();
    }
  }
  /* eslint-enable complexity */

  /**
   * mouse down event handler
   * @param {Event} event mouse down event
   * @param {Object} originPointer origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onMouseDown(event, originPointer) {
    /**
     * The mouse down event with position x, y on canvas
     * @event ImageEditor#mousedown
     * @param {Object} event - browser mouse event object
     * @param {Object} originPointer origin pointer
     *  @param {Number} originPointer.x x position
     *  @param {Number} originPointer.y y position
     * @example
     * imageEditor.on('mousedown', function(event, originPointer) {
     *     console.log(event);
     *     console.log(originPointer);
     *     if (imageEditor.hasFilter('colorFilter')) {
     *         imageEditor.applyFilter('colorFilter', {
     *             x: parseInt(originPointer.x, 10),
     *             y: parseInt(originPointer.y, 10)
     *         });
     *     }
     * });
     */
    this.fire(events.MOUSE_DOWN, event, originPointer);
  }

  /**
   * 'objectActivated' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectActivated(props) {
    /**
     * The event when object is selected(aka activated).
     * @event ImageEditor#objectActivated
     * @param {ObjectProps} objectProps - object properties
     * @example
     * imageEditor.on('objectActivated', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     *     console.log(props.id);
     * });
     */
    this.fire(events.OBJECT_ACTIVATED, props);
  }

  /**
   * 'objectMoved' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectMoved(props) {
    /**
     * The event when object is moved
     * @event ImageEditor#objectMoved
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectMoved', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     * });
     */
    this.fire(events.OBJECT_MOVED, props);
  }

  /**
   * 'objectScaled' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectScaled(props) {
    /**
     * The event when scale factor is changed
     * @event ImageEditor#objectScaled
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectScaled', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     * });
     */
    this.fire(events.OBJECT_SCALED, props);
  }

  /**
   * Mousedown event handler in case of 'TEXT' drawing mode
   * @param {fabric.Event} event - Current mousedown event object
   * @private
   */
  _onAddText(event) {
    /**
     * The event when 'TEXT' drawing mode is enabled and click non-object area.
     * @event ImageEditor#addText
     * @param {Object} pos
     *  @param {Object} pos.originPosition - Current position on origin canvas
     *      @param {Number} pos.originPosition.x - x
     *      @param {Number} pos.originPosition.y - y
     *  @param {Object} pos.clientPosition - Current position on client area
     *      @param {Number} pos.clientPosition.x - x
     *      @param {Number} pos.clientPosition.y - y
     * @example
     * imageEditor.on('addText', function(pos) {
     *     imageEditor.addText('Double Click', {
     *         position: pos.originPosition
     *     });
     *     console.log('text position on canvas: ' + pos.originPosition);
     *     console.log('text position on brwoser: ' + pos.clientPosition);
     * });
     */
    this.fire(events.ADD_TEXT, {
      originPosition: event.originPosition,
      clientPosition: event.clientPosition
    });
  }

  /**
   * 'addObject' event handler
   * @param {Object} objectProps added object properties
   * @private
   */
  _onAddObject(objectProps) {
    const obj = this._graphics.getObject(objectProps.id);
    this._pushAddObjectCommand(obj);
  }

  /**
   * 'addObjectAfter' event handler
   * @param {Object} objectProps added object properties
   * @private
   */
  _onAddObjectAfter(objectProps) {
    this.fire(events.ADD_OBJECT_AFTER, objectProps);
  }

  /**
   * 'textEditing' event handler
   * @private
   */
  _onTextEditing() {
    /**
     * The event which starts to edit text object
     * @event ImageEditor#textEditing
     * @example
     * imageEditor.on('textEditing', function() {
     *     console.log('text editing');
     * });
     */
    this.fire(events.TEXT_EDITING);
  }

  /**
   * 'textChanged' event handler
   * @param {Object} objectProps changed object properties
   * @private
   */
  _onTextChanged(objectProps) {
    this.changeText(objectProps.id, objectProps.text);
  }

  /**
   * 'iconCreateResize' event handler
   * @param {Object} originPointer origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onIconCreateResize(originPointer) {
    this.fire(events.ICON_CREATE_RESIZE, originPointer);
  }

  /**
   * 'iconCreateEnd' event handler
   * @param {Object} originPointer origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onIconCreateEnd(originPointer) {
    this.fire(events.ICON_CREATE_END, originPointer);
  }

  /**
   * 'selectionCleared' event handler
   * @private
   */
  _selectionCleared() {
    this.fire(events.SELECTION_CLEARED);
  }

  /**
   * 'selectionCreated' event handler
   * @param {Object} eventTarget - Fabric object
   * @private
   */
  _selectionCreated(eventTarget) {
    this.fire(events.SELECTION_CREATED, eventTarget);
  }

  /**
   * Set selection style by init option
   * @param {Object} selectionStyle - Selection styles
   * @param {Object} applyTargets - Selection apply targets
   *   @param {boolean} applyCropSelectionStyle - whether apply with crop selection style or not
   *   @param {boolean} applyGroupSelectionStyle - whether apply with group selection style or not
   * @private
   */
  _setSelectionStyle(
    selectionStyle,
    { applyCropSelectionStyle, applyGroupSelectionStyle }
  ) {
    if (selectionStyle) {
      this._graphics.setSelectionStyle(selectionStyle);
    }

    if (applyCropSelectionStyle) {
      this._graphics.setCropSelectionStyle(selectionStyle);
    }

    if (applyGroupSelectionStyle) {
      this.on("selectionCreated", eventTarget => {
        if (eventTarget.type === "group") {
          eventTarget.set(selectionStyle);
        }
      });
    }
  }

  /**
   * Attach invoker events
   * @private
   */
  _attachInvokerEvents() {
    const { UNDO_STACK_CHANGED, REDO_STACK_CHANGED } = events;

    /**
     * Undo stack changed event
     * @event ImageEditor#undoStackChanged
     * @param {Number} length - undo stack length
     * @example
     * imageEditor.on('undoStackChanged', function(length) {
     *     console.log(length);
     * });
     */
    this._invoker.on(
      UNDO_STACK_CHANGED,
      this.fire.bind(this, UNDO_STACK_CHANGED)
    );
    /**
     * Redo stack changed event
     * @event ImageEditor#redoStackChanged
     * @param {Number} length - redo stack length
     * @example
     * imageEditor.on('redoStackChanged', function(length) {
     *     console.log(length);
     * });
     */
    this._invoker.on(
      REDO_STACK_CHANGED,
      this.fire.bind(this, REDO_STACK_CHANGED)
    );
  }

  /**
   * Attach canvas events
   * @private
   */
  _attachGraphicsEvents() {
    this._graphics.on({
      mousedown: this._handlers.mousedown,
      objectMoved: this._handlers.objectMoved,
      objectScaled: this._handlers.objectScaled,
      objectActivated: this._handlers.objectActivated,
      addText: this._handlers.addText,
      addObject: this._handlers.addObject,
      textEditing: this._handlers.textEditing,
      textChanged: this._handlers.textChanged,
      iconCreateResize: this._handlers.iconCreateResize,
      iconCreateEnd: this._handlers.iconCreateEnd,
      selectionCleared: this._handlers.selectionCleared,
      selectionCreated: this._handlers.selectionCreated,
      addObjectAfter: this._handlers.addObjectAfter
    });
  }

  /**
   * Attach dom events
   * @private
   */
  _attachDomEvents() {
    // ImageEditor supports IE 9 higher
    // document.addEventListener("keydown", this._handlers.keydown);
  }

  /**
   * Detach dom events
   * @private
   */
  _detachDomEvents() {
    // ImageEditor supports IE 9 higher
    // document.removeEventListener("keydown", this._handlers.keydown);
  }

  /**
   * Flip
   * @returns {Promise}
   * @param {string} type - 'flipX' or 'flipY' or 'reset'
   * @returns {Promise<FlipStatus, ErrorMsg>}
   * @private
   */
  flip(type) {
    return this.execute(commands.FLIP_IMAGE, type);
  }

  /**
   * @param {string} type - 'rotate' or 'setAngle'
   * @param {number} angle - angle value (degree)
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @private
   */
  _rotate(type, angle) {
    return this.execute(commands.ROTATE_IMAGE, type, angle);
  }

  /**
   * Rotate image
   * @returns {Promise}
   * @param {number} angle - Additional angle to rotate image
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @example
   * imageEditor.setAngle(10); // angle = 10
   * imageEditor.rotate(10); // angle = 20
   * imageEidtor.setAngle(5); // angle = 5
   * imageEidtor.rotate(-95); // angle = -90
   * imageEditor.rotate(10).then(status => {
   *     console.log('angle: ', status.angle);
   * })).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  rotate(angle) {
    return this._rotate("rotate", angle);
  }

  /**
   * Set angle
   * @param {number} angle - Angle of image
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @example
   * imageEditor.setAngle(10); // angle = 10
   * imageEditor.rotate(10); // angle = 20
   * imageEidtor.setAngle(5); // angle = 5
   * imageEidtor.rotate(50); // angle = 55
   * imageEidtor.setAngle(-40); // angle = -40
   * imageEditor.setAngle(10).then(status => {
   *     console.log('angle: ', status.angle);
   * })).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  setAngle(angle) {
    return this._rotate("setAngle", angle);
  }

  getAngle() {
    const image = this._graphics.getCanvasImage();
    if (!image) return 0;

    return image.angle;
  }

  /**
   * Get data url
   * @param {string} type - A DOMString indicating the image format. The default type is image/png.
   * @returns {string} A DOMString containing the requested data URI
   * @example
   * imgEl.src = imageEditor.toDataURL();
   *
   * imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
   *      imageEditor.addImageObject(imgUrl);
   * });
   */
  toDataURL(type) {
    return this._graphics.toDataURL(type);
  }

  render() {
    return (
      <div ref={elm => (this._wrapper = elm)} className={styles.wrapper} />
    );
  }

  //use for action => deactivateAll, changeSelectableAll, discardSelection, stopDrawingMode
  /**
   * Deactivate all objects
   * @example
   * imageEditor.deactivateAll();
   */
  deactivateAll() {
    this._graphics.deactivateAll();
    this._graphics.renderAll();
  }

  /**
   * selectable status change
   * @param {boolean} selectable - selctable status
   * @example
   * imageEditor.changeSelectableAll(false); // or true
   */
  changeSelectableAll(selectable) {
    this._graphics.changeSelectableAll(selectable);
  }

  /**
   * discard selction
   * @example
   * imageEditor.discardSelection();
   */
  discardSelection() {
    this._graphics.discardSelection();
  }

  /**
   * Stop the current drawing mode and back to the 'NORMAL' mode
   * @example
   * imageEditor.stopDrawingMode();
   */
  stopDrawingMode() {
    this._graphics.stopDrawingMode();
  }

  /**
   * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
   * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'</I>
   * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
   *  @param {Number} [option.width] brush width
   *  @param {String} [option.color] brush color
   * @returns {boolean} true if success or false
   * @example
   * imageEditor.startDrawingMode('FREE_DRAWING', {
   *      width: 10,
   *      color: 'rgba(255,0,0,0.5)'
   * });
   */
  startDrawingMode(mode, option) {
    return this._graphics.startDrawingMode(mode, option);
  }

  /**
   * Remove Active Object
   */
  removeActiveObject() {
    const activeObject = this._graphics.getActiveObject();
    const activeObjectGroup = this._graphics.getActiveGroupObject();

    if (activeObjectGroup) {
      const objects = activeObjectGroup.getObjects();
      this.discardSelection();
      this._removeObjectStream(objects);
    } else if (activeObject) {
      const activeObjectId = this._graphics.getObjectId(activeObject);
      this.removeObject(activeObjectId);
    }
  }

  /**
   * Add a 'addObject' command
   * @param {Object} obj - Fabric object
   * @private
   */
  _pushAddObjectCommand(obj) {
    const command = commandFactory.create(
      commands.ADD_OBJECT,
      this._graphics,
      obj
    );
    this._invoker.pushUndoStack(command);
  }
}

action.mixin(ImageEditor);
CustomEvents.mixin(ImageEditor);

export default ImageEditor;
