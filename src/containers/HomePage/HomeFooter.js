import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";

class HomeFooter extends Component {
  render() {
    return (
      <div style={{
        background: "#007bff"
      }}>
          <div class="center py-16" style={{
              margin: "0 100px",
            }}>
            <div className="row justify-content-between align-items-center">
                <div className="col-6">  <p className="text-white">
                  &copy; <FormattedMessage id="homepage.footer-infor" />
                </p></div>
                <div className="col-4"></div>
            </div>
          </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
