import React from "react";
import { connect } from "dva";
import { Layout } from "antd";

import Loader from "../../components/Loader";
import Content from "../components/Content";

class IndexPage extends React.Component {e

  render() {
    const { loading, location } = this.props;
    // location.query.docId
  
    return (
      <div>
        <Loader fullScreen={false} spinning={loading} />
        <Layout style={{ height: "100vh" }}>
          <Content />
        </Layout>
      </div>
    );
  }
}

IndexPage.propTypes = {};

function mapStateToProps(state) {
  const loading = state.imgData.loading || state.loading.models["imgData"];
  return { loading };
}

export default connect(mapStateToProps)(IndexPage);
