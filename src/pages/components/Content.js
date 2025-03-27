import React, { Component } from 'react';
import { Layout, Popover, Button, Divider, InputNumber } from 'antd';
import { connect } from 'dva';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import EasyEdit, { Types } from 'react-easy-edit';

import ImageList from './image';
import GoPage from './GoPage';
import DrawSettings from './DrawSettings';
import ImageEditor from '../../components/ImageEditor';
import ThumbnailGrid from './ThumbnailGrid';
import consts from '../../components/ImageEditor/consts';

import styles from './Content.less';

const buttonStyle = {
  border: 'none',
};

const { UNDO_STACK_CHANGED, REDO_STACK_CHANGED } = consts.eventNames;
const ButtonGroup = Button.Group;

const { Sider, Content } = Layout;

class myContent extends Component {
  state = {
    showThumbnailGrid: false,
  };

  onPage = page => {
    debugger;
    const { selectedItems } = this.props;
    const index = page - 1;
    if (index < 0 || selectedItems.length <= index) return;

    const { dispatch } = this.props;
    dispatch({
      type: 'imgData/selectByIndex',
      payload: { index: index },
    });

    const imageList = this.getImageList();
    if (imageList) {
      imageList.scrollTo(selectedItems[index].FileId);
    }
  };

  onMove = page => {
    const imageList = this.getImageList();
    if (!imageList) return;

    const fidAry = imageList.getSelectedIds();
    if (!fidAry || fidAry.length === 0) return;

    const f = fidAry[0];
    const { selectedItems } = this.props;
    const fIndex = selectedItems.findIndex(elm => {
      return elm.FileId === f;
    });

    let index = page - 2;
    if (fIndex <= index) index++;

    if (selectedItems.length <= index) index = selectedItems.length - 1;

    let after = '';
    if (index >= 0) after = selectedItems[index].FileId;

    const { dispatch } = this.props;
    dispatch({
      type: 'imgData/reorders',
      payload: { after, fidAry },
    });

    dispatch({
      type: 'imgData/selectByItemId',
      payload: { key: fidAry[0].FileId },
    });

    if (imageList) {
      setTimeout(function() {
        imageList.scrollTo(f);
      }, 1500);
    }
  };

  getImageList() {
    if (!this.refImageList) return null;
    return this.refImageList.getWrappedInstance();
  }

  setPage = idx => {
    const { dispatch, selectedItems } = this.props;
    if (!selectedItems || selectedItems.length === 0) return;

    let index = idx - 1;
    if (index < 0 || index >= selectedItems.length) return;

    dispatch({
      type: 'imgData/selectByIndex',
      payload: { index },
    });

    const imageList = this.getImageList();
    if (imageList) {
      imageList.scrollTo(selectedItems[index].FileId);
    }
  };

  setRatio = v => {
    const { dispatch } = this.props;
    dispatch({
      type: 'imgEditor/setRatio',
      payload: v,
    });
  };

  toggleView = () => {
    this.setState(prevState => ({
      showThumbnailGrid: !prevState.showThumbnailGrid
    }));
  };

  handleImageDoubleClick = (image, index) => {
    const { dispatch } = this.props;
    
    // Select the image
    dispatch({
      type: 'imgData/selectByIndex',
      payload: { index },
    });

    // Switch to ImageEditor view
    this.setState({
      showThumbnailGrid: false
    });
  };

  render() {
    const {
      dispatch,
      selected,
      selectedItems,
      selectedItem,
      isCrop,
      isDraw,
      clickNext,
      clickPre,
      attachKey,
      imageRatio,
    } = this.props;

    if (clickNext) {
      dispatch({ type: 'UI/reset', payload: { key: 'clickNext' } });
      if (selectedItem) {
        this.onPage(selectedItem.Order + 2);
      }
    }

    if (clickPre) {
      dispatch({ type: 'UI/reset', payload: { key: 'clickPre' } });
      if (selectedItem && selectedItem.Order > 0) {
        this.onPage(selectedItem.Order);
      }
    }

    const unRedoCheck = size => {
      dispatch({ type: 'imgEditor/updateInfo', payload: {} });
    };

    const handleClick = (e, data) => {
      if (data.type === 'last') {
        this.onPage(selectedItems.length);
        return;
      }

      const fidAry = this.getImageList().getSelectedIds();
      dispatch({
        type: 'imgData/rotate',
        payload: { type: data.type, fidAry },
      });
    };

    const ref = elm => {
      const payload = {
        editor: elm,
        unRedoCheck,
      };

      if (elm) {
        elm.on(UNDO_STACK_CHANGED, unRedoCheck);
        elm.on(REDO_STACK_CHANGED, unRedoCheck);
      }

      dispatch({ type: 'imgEditor/setEditor', payload });
    };

    dispatch({ type: 'imgEditor/loadImage', payload: { dispatch } });

    const title = selected ? selected.Title : '';

    function save(value) {
      if (!selected) return;

      dispatch({
        type: 'imgData/change',
        payload: value,
      });
    }

    const order = selectedItem ? selectedItem.Order + 1 : 0;
    const count = selectedItems ? selectedItems.length : 0;
    const pdfName = title + (attachKey ? '_' + attachKey : '');
    let hidden = {};
    if (!selectedItems || selectedItems.length === 0) hidden = { display: 'none' };
    const { showThumbnailGrid } = this.state;

    return (
      <Layout className={styles.content}>
        <Sider className={styles.sider} style={hidden}>
          <ContextMenuTrigger id="mnuImage" holdToDisplay={-1}>
            <div className={styles.siderHeader}>
              {title && (
                <EasyEdit
                  value={title}
                  type={Types.TEXT}
                  onSave={save}
                  saveButtonLabel="文號變更"
                  cancelButtonLabel="取消"
                />
              )}
            </div>
            <ImageList
              ref={ref => {
                this.refImageList = ref;
              }}
            />
          </ContextMenuTrigger>
          <ContextMenu id="mnuImage">
            <MenuItem data={{ type: 0 }} onClick={handleClick}>
              直式旋轉
            </MenuItem>
            <MenuItem data={{ type: 1 }} onClick={handleClick}>
              橫式旋轉
            </MenuItem>
            <MenuItem data={{ type: 2 }} onClick={handleClick}>
              向右轉90度
            </MenuItem>
            <MenuItem data={{ type: 3 }} onClick={handleClick}>
              旋轉180度
            </MenuItem>
            <MenuItem data={{ type: 4 }} onClick={handleClick}>
              向左轉90度
            </MenuItem>
            <MenuItem divider />
            <Popover placement="right" content={<GoPage onPage={this.onPage} />} trigger="click">
              <MenuItem>檢視…</MenuItem>
            </Popover>
            <MenuItem data={{ type: 'last' }} onClick={handleClick}>
              檢視最後一頁
            </MenuItem>
            <Popover placement="right" content={<GoPage onPage={this.onMove} />} trigger="click">
              <MenuItem>移動到…</MenuItem>
            </Popover>
          </ContextMenu>
        </Sider>
        <Content>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={this.toggleView}>
              {showThumbnailGrid ? 'Close Grid View' : 'Open Grid View'}
            </Button>
          </div>
          {showThumbnailGrid ? (
            <ThumbnailGrid 
              images={selectedItems} 
              onImageDoubleClick={this.handleImageDoubleClick}
            />
          ) : (
            <div>
              <div style={{ padding: '1pt' }}>
                <div>
                  <Button
                    style={buttonStyle}
                    icon="file-pdf"
                    title="轉pdf"
                    onClick={e =>
                      selected &&
                      dispatch({
                        type: 'imgData/downloadPdf',
                        payload: { docPath: selected.DocPath, attachKey, pdfName },
                      })
                    }
                  />
                  <Divider type="vertical" />
                  <span>
                    <Button style={buttonStyle} icon="backward" onClick={e => this.setPage(1)} />
                    <Button
                      style={buttonStyle}
                      icon="caret-left"
                      onClick={e => this.setPage(order - 1)}
                    />
                    <span style={{ marginLeft: '4pt', marginRight: '4pt' }}>
                      {order}/{count}
                    </span>
                    <Button
                      style={buttonStyle}
                      icon="caret-right"
                      onClick={e => this.setPage(order + 1)}
                    />
                    <Button style={buttonStyle} icon="forward" onClick={e => this.setPage(count)} />
                  </span>
                  <Divider type="vertical" />
                  <ButtonGroup>
                    <Button
                      style={buttonStyle}
                      icon="column-width"
                      onClick={e => this.setRatio('w')}
                      title="符合頁寬"
                    />
                    <Button
                      style={buttonStyle}
                      icon="column-height"
                      onClick={e => this.setRatio('h')}
                      title="符合頁高"
                    />
                    <InputNumber
                      value={imageRatio}
                      step={5}
                      min={10}
                      max={200}
                      onChange={this.setRatio}
                      formatter={v => `${v}%`}
                      parser={v => v.replace('%', '')}
                    />
                  </ButtonGroup>
                </div>
                <div>
                  {isCrop ? (
                    <>
                      <span>裁剪：</span>
                      <Button onClick={() => dispatch({ type: 'imgEditor/cropApply' })}>確定</Button>
                      <Button onClick={() => dispatch({ type: 'imgEditor/cropCancel' })}>取消</Button>
                    </>
                  ) : null}
                  {isDraw ? <DrawSettings /> : null}
                </div>
              </div>
              <div className={styles.canvasHeight}>
                <ImageEditor
                  cfg={{
                    cssMaxWidth: 9918,
                    cssMaxHeight: 7014,
                  }}
                  ref={elm => ref(elm)}
                />
              </div>
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { selected, selectedItem, selectedItems, attachKey } = state.imgData;
  const { isCrop, isDraw, imageRatio } = state.imgEditor;
  const { clickNext, clickPre } = state.UI;
  return {
    selected,
    selectedItem,
    selectedItems,
    isCrop,
    isDraw,
    clickNext,
    clickPre,
    attachKey,
    imageRatio,
  };
}

export default connect(mapStateToProps)(myContent);
