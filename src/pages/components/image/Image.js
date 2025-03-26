import React from "react";
import PropTypes from "prop-types";
import { DragSource, DropTarget } from "react-dnd";
import { Icon } from "antd";

import { colors } from "../../../constants";
import ItemTypes from "../ItemTypes";

import styles from "./Image.less";

const getItemStyle = (isDragging, isSelected) => ({
  userSelect: "none",

  opacity: isDragging ? 0.5 : 1,
  background: isDragging ? colors.grey.light : colors.white,
  borderColor: isSelected ? colors.green : colors.grey.light
});

class Image extends React.Component {
  state = {
    checked: this.props.item ? this.props.item.checked : false
  };

  resetCheck(checked) {
    this.setState({
      checked: checked
    });
  }

  render() {
    const {
      item,
      isDragging,
      connectDragSource,
      connectDropTarget,
      isSelected
    } = this.props;

    const cssStyle = {
      visibility: item.checked ? "visible" : "hidden"
    };

    return (
      connectDragSource &&
      connectDropTarget &&
      connectDragSource(
        connectDropTarget(
          <div
            className={styles.image}
            style={getItemStyle(isDragging, isSelected)}
          >
            <Icon
              type="check-circle"
              style={cssStyle}
              theme="outlined"
              className={styles.icon}
            />
            <img
              src={item.Thumbnail}
              alt={item.FileId}
              onClick={e => {
                if (e.ctrlKey) {
                  const check = this.props.onCheck;
                  if (check) check(item, this);
                } else {
                  const click = this.props.onClick;
                  if (click) click(item);
                }
              }}
            />
          </div>
        )
      )
    );
  }
}

Image.propTypes = {
  item: PropTypes.object,
  moveTo: PropTypes.func,
  find: PropTypes.func,
  onClick: PropTypes.func,
  onCheck: PropTypes.func
};

// drag and drop...

const dropTarget = {
  canDrop() {
    return false;
  },

  hover(props, monitor) {
    const { id: draggedId } = monitor.getItem();
    const { FileId: overId } = props.item;

    if (draggedId !== overId) {
      const { index: overIndex } = props.find(overId);
      props.moveTo(draggedId, overIndex);
    }
  }
};

const dragSource = {
  beginDrag(props) {
    const id = props.item.FileId;
    return {
      id: id,
      originalIndex: props.find(id).index
    };
  },

  endDrag(props, monitor) {
    const { id, originalIndex } = monitor.getItem();
    const didDrop = monitor.didDrop();

    if (!didDrop) {
      props.moveTo(id, originalIndex);
    }
  }
};

export default DropTarget(ItemTypes.IMAGE, dropTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(
  DragSource(ItemTypes.IMAGE, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(Image)
);
