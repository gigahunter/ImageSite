import { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { DragDropContext, DropTarget } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";

import ItemTypes from "../ItemTypes";
import Image from "./Image";

import styles from "./Image.less";

class Container extends Component {
  state = {
    images: this.props.images,
    selectedId: this.props.selectedId
  };

  fid2Img = [];

  scrollTo(fid) {
    const elm = ReactDOM.findDOMNode(this.fid2Img[fid]);
    if (elm) elm.scrollIntoView();
  }

  render() {
    const { connectDropTarget } = this.props;
    let { images, selectedId } = this.state;

    if (!this.updating) {
      if (
        images !== this.props.images ||
        selectedId !== this.props.selectedId
      ) {
        images = this.props.images;
        selectedId = this.props.selectedId;
        this.setState({
          images,
          selectedId
        });
      }
    } else this.updating = false;

    if (!images || images.length === 0)
      return <div className={styles.container}>No Image!</div>;

    return (
      connectDropTarget &&
      connectDropTarget(
        <div className={styles.container}>
          {images.map(image => (
            <Image
              key={image.FileId}
              item={image}
              moveTo={this.moveTo}
              find={this.find}
              onClick={this.click}
              onCheck={this.props.onCheck}
              isSelected={selectedId === image.FileId}
              ref={ref => {
                this.fid2Img[image.FileId] = ref;
              }}
            />
          ))}
        </div>
      )
    );
  }

  click = item => {
    const { onClick } = this.props;
    if (onClick) onClick(item, this.state.images);
  };

  find = id => {
    const { images } = this.state;
    const index = images.findIndex(img => img.FileId === id);

    if (index < 0) return null;

    return {
      image: images[index],
      index
    };
  };

  moveTo = (id, atIndex) => {
    const { image, index } = this.find(id);
    if (!image) return;
    let after = "0";
    if (atIndex > 0) {
      after = this.state.images[atIndex - 1].FileId;
    }

    if (after === id) return;

    const func = this.props.reorder;
    if (func) {
      func(after, id);
    }

    this.updating = true;
    this.setState(
      update(this.state, {
        images: {
          $splice: [[index, 1], [atIndex, 0, image]]
        }
      })
    );
  };
}

Container.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.string,
  reorder: PropTypes.func,
  onClick: PropTypes.func,
  onCheck: PropTypes.func
};

// all OK?
const myTarget = {};

export default DragDropContext(HTML5Backend)(
  DropTarget(ItemTypes.IMAGE, myTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  }))(Container)
);
