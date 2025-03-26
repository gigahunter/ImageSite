import React, { PureComponent } from 'react';
import { Layout, Divider, Button, InputNumber } from 'antd';
import { connect } from 'dva';

import ImageList from './image';
import ImageEditor from '../../components/ImageEditor';
import consts from '../../components/ImageEditor/consts';
import { setData } from '../index';

import styles from './Content.less';

const { Sider, Content } = Layout;
const { UNDO_STACK_CHANGED, REDO_STACK_CHANGED } = consts.eventNames;

const ButtonGroup = Button.Group;

const buttonStyle = {
  border: 'none',
};

class ImageViewer extends PureComponent {
  getImageList = () => {
    if (!this.refImageList) return null;
    return this.refImageList.getWrappedInstance();
  };

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

  render() {
    const {
      dispatch,
      selected,
      selectedItem,
      selectedItems,
      downItems,
      imageRatio,
      attachKey,
    } = this.props;

    const unRedoCheck = size => {
      dispatch({ type: 'imgEditor/updateInfo', payload: {} });
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
      dispatch({ type: 'imgEditor/loadImage', payload: { dispatch } });
    };

    let data = setData(downItems);
    let attach = null;
    if (data && data.length > 0) {
      data = data[0];
      attach = data.children;
      if (attach && attach.length === 0) attach = null;
    }

    const title = selected ? selected.Title : '';
    const order = selectedItem ? selectedItem.Order + 1 : 0;
    const count = selectedItems ? selectedItems.length : 0;
    const pdfName = title + (attachKey ? '_' + attachKey : '');
    return (
      <Layout className={styles.content}>
        <Sider className={styles.sider}>
          <div className={styles.siderHeader}>
            <div>文號：{title}</div>
            {attach && (
              <ButtonGroup>
                <Button
                  icon="file"
                  key={data.key}
                  title={data.Title}
                  onClick={e =>
                    dispatch({
                      type: 'imgData/selectById',
                      payload: data.key,
                    })
                  }
                />
                {attach.map(a => (
                  <Button
                    key={a.key}
                    title={a.Title}
                    icon="paper-clip"
                    onClick={e =>
                      dispatch({
                        type: 'imgData/selectById',
                        payload: a.key,
                      })
                    }
                  />
                ))}
              </ButtonGroup>
            )}
          </div>
          <ImageList
            readonly
            ref={ref => {
              this.refImageList = ref;
            }}
          />
        </Sider>
        <Content>
          <div style={{ padding: '1pt' }}>
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
          <div className={styles.canvasHeight}>
            <ImageEditor
              cfg={{
                cssMaxWidth: 9918,
                cssMaxHeight: 7014,
              }}
              ref={elm => ref(elm)}
            />
          </div>
        </Content>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { selected, selectedItem, selectedItems, downItems, attachKey } = state.imgData;
  const { imageRatio } = state.imgEditor;
  return { selected, selectedItem, selectedItems, downItems, imageRatio, attachKey };
}

export default connect(mapStateToProps)(ImageViewer);
