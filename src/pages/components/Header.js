import React from "react";
import { Layout, Tabs } from "antd";
import Menu1 from "./menu/Menu1";
import Menu2 from "./menu/Menu2";
import Menu3 from "./menu/Menu3";

import styles from "./Header.less";

const { Header } = Layout;
const TabPane = Tabs.TabPane;

const myHeader = ({supportScan}) => {
  return (
    <Header className={styles.header}>
      <Tabs type="card" defaultActiveKey="2">
        {supportScan && (
        <TabPane tab="掃描設定" key="1">
          <Menu1 />
        </TabPane>)
        }
        <TabPane tab="常用" key="2">
          <Menu2 supportScan={supportScan} />
        </TabPane>
        <TabPane tab="影像編輯" key="3">
          <Menu3 />
        </TabPane>
      </Tabs>
    </Header>
  )
}

export default myHeader;
