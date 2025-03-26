import React from 'react';
import { connect } from 'dva';
import { Layout, Tabs } from 'antd';

import Menu1 from './menu/Menu1';
import Menu2 from './menu/Menu2';
import Menu3 from './menu/Menu3';

import styles from './Sider.less';

const { Sider } = Layout;
const { TabPane } = Tabs;

class mySider extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  render() {
    const { supportScan } = this.props;

    return (
      <Sider
        className={styles.sider}
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
        width="250px"
      >
        <Tabs type="card" defaultActiveKey="2">
          {supportScan && (
            <TabPane tab="掃描設定" key="1">
              <Menu1 />
            </TabPane>
          )}
          <TabPane tab="常用" key="2">
            <Menu2 supportScan={supportScan} />
          </TabPane>
          <TabPane tab="影像編輯" key="3">
            <Menu3 />
          </TabPane>
        </Tabs>
      </Sider>
    );
  }
}

function mapStateToProps(state) {
  const { scanItems, downItems } = state.imgData;
  const { defaultBeh } = state.UI;
  return {
    scanItems,
    downItems,
    defaultBeh,
  };
}

export default connect(mapStateToProps)(mySider);
