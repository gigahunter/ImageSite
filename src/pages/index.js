import React from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';

import Loader from '../components/Loader';
import Content from './components/Content';
import ImageViewer from './components/ImageViewer';
import Sider from './components/Sider';
import SearchTree from './components/SearchTree';

import styles from './index.css';

export function setData(items, selected) {
  const ret = [];
  if (!items) return ret;

  items.forEach(item => {
    const data = {};
    data.key = `${item.DocType}_${item.DocId}`;
    if (selected === item) ret.selectedKey = data.key;
    data.Title = item.Title;
    data.isTicked = item.isTicked;

    if (item.Items) {
      const len = item.Items.length;
      if (len > 0) data.Title += `(${len})`;
    }

    if (item.Attachs) {
      const ary = item.Attachs;
      const len = ary.length;
      if (len > 0) {
        const children = [];
        for (let i = 0; i < len; i++) {
          const att = ary[i];
          if (!att) {
            continue;
          }
          const key = att.Key;
          const items = att.Items;

          const cnt = items.length;
          const title = `${key}(${cnt})`;

          children.push({ Title: title, key: `${data.key}_${key}_A` });
        }

        data.children = children;
      }
    }

    ret.push(data);
  });

  return ret;
}

function setCount(item) {
  if (item.children && item.children.length > 0) {
    item.Title += `(${item.children.length})`;
  }
}

function defaultData(data) {
  const ret = [...data];
  ret[0].children.forEach(item => {
    item.isTicked = true;
  });
  return ret;
}

function getKeys(data) {
  const keys = [];
  keys.push(data[0].key);
  if (!data[0].children) return keys;
  data[0].children.forEach(item => {
    keys.push(item.key);
    if (item.children) {
      item.children.forEach(child => {
        keys.push(child.key);
      });
    }
  });
  return keys;
}

class IndexPage extends React.Component {
  render() {
    const {
      loading,
      location,
      supportScan,
      dispatch,
      defaultBeh,
      scanItems,
      downItems,
      selected,
    } = this.props;

    let selectedKey;
    if (location.query.route === 'documentBrowser') {
      return (
        <div>
          <Loader fullScreen={false} spinning={loading} />
          <Layout style={{ height: '100vh' }}>
            <ImageViewer />
          </Layout>
        </div>
      );
    } else {
      let data = [];
      if (supportScan) {
        data.push({ Title: '已掃描清單', key: 'M1' });
        data.push({ Title: '已下載清單', key: 'M2' });

        let children = setData(scanItems, selected);
        if (children.selectedKey) selectedKey = children.selectedKey;
        data[0].children = children;

        children = setData(downItems, selected);
        if (children.selectedKey) selectedKey = children.selectedKey;
        data[1].children = children;
        setCount(data[0]);
        setCount(data[1]);
      } else {
        data.push({ Title: '已下載清單', key: 'M2' });
        let children = setData(downItems, selected);
        selectedKey = children.selectedKey;
        data[0].children = children;
        setCount(data[0]);
      }

      if (defaultBeh && data[0].children.length !== 0) {
        // TMS: #0128464 來文掃描請預設勾選已掃描清單
        data = defaultData(data);
        const defaultkeys = getKeys(data);

        dispatch({
          type: 'UI/setValue',
          payload: { key: 'defaultBeh', value: false },
        });

        dispatch({
          type: 'imgData/tickedById',
          payload: defaultkeys,
        });
      }

      return (
        <div>
          <Loader fullScreen={false} spinning={loading} />
          <Layout style={{ height: '100vh' }}>
            <Sider supportScan={supportScan} />
            <Layout className={styles.content}>
              <Layout.Sider style={{ backgroundColor: 'lightgray' }} width="250px">
                <SearchTree
                  data={data}
                  selectedKey={selectedKey}
                  onClick={(e, key) => {
                    dispatch({
                      type: 'imgData/selectById',
                      payload: key,
                    });
                  }}
                  onSearch={v => {
                    /*
                      dispatch({
                        type: "imgData/download",
                        payload: v
                      });
                     */
                  }}
                  onCheck={checkedKeys => {
                    dispatch({
                      type: 'imgData/tickedById',
                      payload: checkedKeys,
                    });
                  }}
                />
              </Layout.Sider>
              <Content />
            </Layout>
          </Layout>
        </div>
      );
    }
  }
}

IndexPage.propTypes = {};

function mapStateToProps(state) {
  const { scanItems, downItems, selected } = state.imgData;
  const { defaultBeh } = state.UI;
  const loading =
    state.imgData.loading ||
    state.loading.models['imgData'] ||
    state.loading.effects['imgEditor/save'] ||
    state.loading.effects['scanSettings/scan'] ||
    state.loading.effects['scanSettings/scanTo'];
  const supportScan = state.scanSettings.supportScan;
  return { loading, supportScan, defaultBeh, scanItems, downItems, selected };
}

export default connect(mapStateToProps)(IndexPage);
