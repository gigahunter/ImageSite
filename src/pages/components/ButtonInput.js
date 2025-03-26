import React from 'react';
import { Button, Input } from 'antd';

class ButtonInput extends React.PureComponent {
  state = {
    value: '',
  };

  changed = e => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { onClick, title } = this.props;

    return (
      <>
        <Button onClick={e => onClick && onClick(this.state.value)}>{title}</Button>
        <Input
          placeholder="請輸入文號"
          style={{ margin: '2pt', width: '100pt' }}
          onChange={this.changed}
        />
      </>
    );
  }
}

export default ButtonInput;
