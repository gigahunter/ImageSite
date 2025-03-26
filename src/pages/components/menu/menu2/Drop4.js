import { connect } from "dva";
import { Button, Input, Row, Col } from "antd";

import styles from "../Menu.less";

function Drop1({ dispatch }) {
  let value;
  const changed = e => {
    value = e.target.value;
  };

  return (
    <div className={styles.drop1}>
      <Row>
        <Col span={18}>
          <Input placeholder="請輸入文號" onChange={changed} />
        </Col>
        <Col span={6}>
          <Button
            onClick={e =>
              dispatch({
                type: "imgData/download",
                payload: value
              })
            }
          >
            確定
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  // const settings = state.scanSettings.scanSettings;
  return {};
})(Drop1);
