import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { LANGUAGES, USER_ROLE } from "../utils";

class Home extends Component {
  render() {
    const { isLoggedIn, userInfo } = this.props;
    // let linkToRedirect =
    //   isLoggedIn && userInfo.roleId !== USER_ROLE.PATIENT
    //     ? "/admin-dashboard"
    //     : "/home";

    // return <Redirect to={linkToRedirect} />;

    console.log("userInfo",userInfo);

    let linkToRedirect='/';
    if(isLoggedIn){
        switch (userInfo.roleId) {
          case USER_ROLE.ADMIN:
            linkToRedirect='/admin-dashboard/app'
            break;
          case USER_ROLE.DOCTOR:
            linkToRedirect='/admin-dashboard/doctor'
            break;
          case USER_ROLE.EMPLOYEE:
            linkToRedirect='/admin-dashboard/employee'
            break;
          case USER_ROLE.PATIENT:
            linkToRedirect='/home'
            break;
          default:
            linkToRedirect='/home'
        } 
    }

    // let linkToRedirect =
    //   isLoggedIn && userInfo.roleId !== USER_ROLE.PATIENT
    //     ? "/"
    //     : "/home";

  return <Redirect to={linkToRedirect} />;
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
