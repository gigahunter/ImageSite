import React from "react";
import { Row, Col, Slider, InputNumber } from "antd";
import { connect } from "dva";

class IntegerStep extends React.Component {
  onChange = value => {
    const event = this.props.onChange;
    if (event) event(value);
  };

  render() {
    const { value, min, max } = this.props;
    return (
      <Row>
        <Col span={4}>{this.props.title}</Col>
        <Col span={11}>
          <Slider min={min} max={max} onChange={this.onChange} value={value} />
        </Col>
        <Col span={2}>
          <InputNumber
            min={1}
            max={100}
            style={{ marginLeft: 8, width: 80 }}
            value={value}
            onChange={this.onChange}
          />
        </Col>
      </Row>
    );
  }
}

function Slider2({ dispatch, brightness, contrast, min, max }) {
  const changed = (v, type) => {
    const payload = {
      name: type,
      value: v
    };

    dispatch({
      type: "imgEditor/set",
      payload
    });
  };

  return (
    <div>
      <IntegerStep
        title="亮度"
        type="brightness"
        value={brightness}
        min={min}
        max={max}
        onChange={v => changed(v, "brightness")}
      />
      <IntegerStep
        title="對比"
        type="contrast"
        value={contrast}
        min={min}
        max={max}
        onChange={v => changed(v, "contrast")}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { brightness, contrast, min, max } = state.imgEditor;
  return {
    brightness,
    contrast,
    min,
    max
  };
}

export default connect(mapStateToProps)(Slider2);
