import { connect } from "dva";
import { Row, Col } from "antd";

import styles from "../Menu.less";

function Drop3({ dispatch }) {
  const size1 = 4;
  const size2 = 20;

  return (
    <div className={styles.drop2M3}>
      <Row
        onClick={() =>
          dispatch({
            type: "imgEditor/grayScale"
          })
        }
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>轉灰階</Col>
      </Row>
      <Row
        onClick={() =>
          dispatch({
            type: "imgEditor/blackWhite"
          })
        }
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>轉黑白</Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  return {};
})(Drop3);
