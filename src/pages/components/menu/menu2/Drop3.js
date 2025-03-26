import React from "react";
import { connect } from "dva";
import { Button } from "antd";

import FileUpload2 from "../../FileUpload2";
import styles from "../Menu.less";

class Drop3 extends React.Component {
  render() {
    const { dispatch } = this.props;
    return (
      <div className={styles.drop2M2}>
        <div className={"ant-btn " + styles.buttonW} style={{ paddingTop: "5px" }}>
          <FileUpload2 />
        </div>
        <br />
        <Button
          className={styles.buttonW}
          onClick={e =>
            dispatch({
              type: "scanSettings/scanTo"
            })
          }
        >
          從掃描器插入新頁
        </Button>
      </div>
    );
  }
}

export default connect(state => {
  // const settings = state.scanSettings.scanSettings;
  return {};
})(Drop3);
