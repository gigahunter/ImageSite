import React from "react";
import PropTypes from "prop-types";
import { Icon, InputNumber, Button } from "antd";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.step = props.step ? props.step : 1;
    this.state = {
      value: props.value ? props.value : 0
    };

    let postfix = this.props.postfix;
    if (!postfix) postfix = "";
    this.postfix = postfix;
  }

  up = () => {
    let v = this.value + this.step;
    const max = this.props.maxValue;
    if (max && max < v) v = max;

    this.value = v;
  };

  down = () => {
    let v = this.value - this.step;
    const min = this.props.minValue;
    if (min && min > v) v = min;

    this.value = v;
  };

  onChanged = v => {
    const old = this.value;
    if (old === v) return;

    this.value = v;
  };

  formatter = v => `${v}${this.postfix}`;
  parser = v => {
    if (this.postfix === "") return v;
    return v.replace(this.props.postfix, "");
  };

  get value() {
    return this.state.value;
  }

  set value(v) {
    if (this.value === v) return;

    const old = this.value;
    this.setState({ value: v });

    const func = this.props.onChange;
    if (func) func(old, v);
  }

  render() {
    const inputProps = {};
    const props = this.props;

    let value = props.value;
    if (value && this.state.value !== value) {
      this.setState({ value: value });
    } else {
      value = this.state.value;
    }

    let step = props.step;
    if (step && step !== this.step) {
      this.step = step;
    } else {
      step = this.step;
    }

    inputProps.formatter = this.formatter;
    inputProps.parser = this.parser;
    if (props.maxValue) inputProps.max = props.maxValue;
    if (props.minValue) inputProps.min = props.minValue;
    if (props.precision) inputProps.precision = props.precision;

    return (
      <div>
        <Button onClick={this.up}>
          <Icon type="plus" />
        </Button>
        <InputNumber
          {...inputProps}
          value={value}
          onChange={this.onChanged}
          step={step}
        />
        <Button onClick={this.down}>
          <Icon type="minus" />
        </Button>
      </div>
    );
  }
}

Counter.propTypes = {
  postfix: PropTypes.string,
  maxValue: PropTypes.number,
  minValue: PropTypes.number,
  value: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  precision: PropTypes.number
};

export default Counter;
