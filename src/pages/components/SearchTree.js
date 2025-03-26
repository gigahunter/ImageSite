import React from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';
import Search from '../../components/SearchDL';

const TreeNode = Tree.TreeNode;

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

const generateList = (data, list) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    list.push(node);
    if (node.children) {
      generateList(node.children, list);
    }
  }
};

class SearchTree extends React.Component {
  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
  };

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onChange = e => {
    const { data } = this.props;
    let { dataList } = this;
    if (!dataList) {
      dataList = [];
      generateList(data, dataList);
      this.dataList = dataList;
    }

    const value = e.target.value;
    const map = dataList.map(item => {
      if (value && item.Title.toUpperCase().indexOf(value.toUpperCase()) > -1) {
        return getParentKey(item.key, data);
      }
      return null;
    });

    const expandedKeys = map.filter((item, i, self) => item && self.indexOf(item) === i);

    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  onCheck = checkedKeys => {
    this.props.onCheck(checkedKeys);
  };

  render() {
    const { searchValue, autoExpandParent } = this.state;
    let { expandedKeys } = this.state;
    const { selectedKey } = this.props;

    const treeProps = {};
    if (selectedKey) {
      if (!expandedKeys || expandedKeys.length === 0 || expandedKeys.indexOf(selectedKey) < 0) {
        this.setState({
          expandedKeys: [selectedKey],
        });
        return null;
      }

      treeProps.defaultSelectedKeys = [selectedKey];
    }

    const checkedKeys = [];
    const loop = data =>
      data.map(item => {
        let { key, Title, isTicked, children } = item;
        if (!key) key = item.DocId;
        const index = Title.toUpperCase().indexOf(searchValue ? searchValue.toUpperCase() : null);
        // const cnt =
        // children && children.length > 0 ? `(${children.length})` : "";
        if (index >= 0) {
          const sLen = searchValue.length;
          const beforeStr = Title.substr(0, index);
          const afterStr = Title.substr(index + sLen);
          Title = (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{Title.substr(index, sLen)}</span>
              {afterStr}
            </span>
          );
        } else {
          Title = <span>{Title}</span>;
        }

        if (isTicked) {
          checkedKeys.push(key);
        }

        let isDoc = true;
        const isAttach = key.substring(key.length - 2) === '_A';
        if (isAttach) {
          isDoc = false;
        } else {
          const isTick = false;
          if (isTick) {
            checkedKeys.push(key);
          }
        }

        if (children) {
          return (
            <TreeNode checkable={isDoc} key={key} title={Title}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode checkable={isDoc} key={key} title={Title} />;
      });

    return (
      <div>
        <div>
          <Search
            style={{ marginBottom: 8 }}
            placeholder="Search"
            onChange={this.onChange}
            onSearch={value => {
              this.props.onSearch(value);
            }}
          />
        </div>
        <Tree
          checkable
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={this.onCheck}
          checkedKeys={checkedKeys}
          onClick={(e, node) => this.props.onClick(e, node.props.eventKey)}
          {...treeProps}
        >
          {loop(this.props.data)}
        </Tree>
      </div>
    );
  }
}

SearchTree.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object), // {key, Title, children}
  selectedKey: PropTypes.string,
  onClick: PropTypes.func,
  onSearch: PropTypes.func,
};

export default SearchTree;
