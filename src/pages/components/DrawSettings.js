import React from "react";
import { connect } from "dva";
import { Button, Radio, Slider, Row, Col } from "antd";

import styles from "./Content.less";

const RadioGroup = Radio.Group;

function DrawSettings({ dispatch, brush }) {
  return (
    <Row>
      <Col span={2} className={styles.cmdLabel}>
        顏色：
      </Col>
      <Col span={8} className={styles.cmd}>
        <RadioGroup
          defaultValue={brush.color}
          buttonStyle="solid"
          onChange={e => {
            dispatch({ type: "imgEditor/setBrushColor", payload: e.target.value });
          }}
        >
          <Radio
            value="white"
            style={{ color: "white", backgroundColor: "white" }}
          >
            白色
          </Radio>
          <Radio
            value="black"
            style={{ color: "black", backgroundColor: "black" }}
          >
            黑色
          </Radio>
        </RadioGroup>
      </Col>
      <Col span={2} className={styles.cmdLabel}>
        寬度：
      </Col>
      <Col span={6}>
        <Slider
          defaultValue={brush.width}
          onChange={v => {
            dispatch({ type: "imgEditor/setBrushWidth", payload: v });
          }}
        />
      </Col>
      <Col span={4}>
        <Button onClick={() => dispatch({ type: "imgEditor/stopMode" })}>
          關閉
        </Button>
      </Col>
    </Row>
  );
}

function mapStateToProps(state) {
  const { brush } = state.imgEditor;
  return { brush };
}

export default connect(mapStateToProps)(DrawSettings);
