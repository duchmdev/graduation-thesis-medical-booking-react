import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./BookingModal.scss";
import { Modal } from "reactstrap";
import ProfileDoctor from "../ProfileDoctor";
import _ from "lodash";
import DatePicker from "../../../../components/Input/DatePicker";
import * as actions from "../../../../store/actions";
import { LANGUAGES } from "../../../../utils";
import Select from "react-select";
import { postPatientBookAppointment } from "../../../../services/userService";
import { toast } from "react-toastify";
import moment from "moment";
import localization from "moment/locale/vi"; //su dung chung cho cai mac dinh la tieng viet
import LoadingOverlay from "react-loading-overlay";
import { css } from "@emotion/react";
import BounceLoader from "react-spinners/BounceLoader";
import { withRouter } from "react-router";


class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientName: "",
      phoneNumber: "",
      email: "",
      address: "",
      reason: "",
      birthday: "",
      selectedGender: "",
      doctorId: "",
      clinicId: "",
      genders: "",
      timeType: "",
      isShowLoading: false,
    };
  }

  async componentDidMount() {
    if (this.props.userInfo) {
      let user = this.props.userInfo;
      let language = this.props.language;

      this.setState({
        patientName: language==="en" ? user.firstName+" "+user.lastName : user.lastName+" "+user.firstName,
        phoneNumber: user.phonenumber,
        email:user.email,
        address:user.address,
        birthday: new Date(parseInt(user.birthday)),
        selectedGender: language==="vi" ? (user.gender==="M" ? {label: 'Nam', value: 'M'} : {label: 'Nữ', value: 'F'}) : (user.gender==="M" ? {label: 'Male', value: 'M'} : {label: 'Female', value: 'F'})
      })
    }

    this.props.getGenders();
  }

  buildDataGender = (data) => {
    let result = [];
    let language = this.props.language;

    if (data && data.length > 0) {
      data.map((item) => {
        let object = {};
        object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
        object.value = item.keyMap;
        result.push(object);
      });
    }
    return result;
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
      let language = this.props.language;
      let user = this.props.userInfo;

      this.setState({
        genders: this.buildDataGender(this.props.genders),
        selectedGender: language==="vi" ? (user.gender==="M" ? {label: 'Nam', value: 'M'} : {label: 'Nữ', value: 'F'}) : (user.gender==="M" ? {label: 'Male', value: 'M'} : {label: 'Female', value: 'F'})
      });
    }

    if (this.props.userInfo !== prevProps.userInfo) {
      if(this.props.userInfo){
          let user = this.props.userInfo;
          let language = this.props.language;

          this.setState({
            patientName: language==="en" ? user.firstName+" "+user.lastName : user.lastName+" "+user.firstName,
            phoneNumber: user.phonenumber,
            email:user.email,
            address:user.address,
            birthday: new Date(parseInt(user.birthday)),
            selectedGender: language==="vi" ? (user.gender==="M" ? {label: 'Nam', value: 'M'} : {label: 'Nữ', value: 'F'}) : (user.gender==="M" ? {label: 'Male', value: 'M'} : {label: 'Female', value: 'F'})
          })
      }
    }

    if (this.props.genders !== prevProps.genders) {
      this.setState({
        genders: this.buildDataGender(this.props.genders),
      });
    }
  
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
        console.log("this.props.dataTime",this.props.dataTime)
        let doctorId = this.props.dataTime.doctorId;
        let timeType = this.props.dataTime.timeType;
        let clinicId = this.props.dataTime.doctorData.Doctor_Infor.clinicId;
        this.setState({
          doctorId: doctorId,
          timeType: timeType,
          clinicId: clinicId
        });
      }
    }
  }

  handleOnChangeInput = (event, id) => {
    let valueInput = event.target.value;
    let stateCopy = { ...this.state };
    stateCopy[id] = valueInput;
    this.setState({
      ...stateCopy,
    });
  };

  handleOnChangeDatePicker = (date) => {
    this.setState({
      birthday: date[0],
    });
  };

  handleChangeSelect = (selectedOption) => {
    console.log("selectedOption",selectedOption)
    this.setState({ selectedGender: selectedOption });
  };

  buildTimeBooking = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let time =
        language === LANGUAGES.VI
          ? dataTime.timeTypeData.valueVi
          : dataTime.timeTypeData.valueEn;

      let date =
        language === LANGUAGES.VI
          ? moment.unix(+dataTime.date / 1000).format("dddd - DD/MM/YYYY")
          : moment
              .unix(+dataTime.date / 1000)
              .locale("en")
              .format("ddd - MM/DD/YYYY");
      return `${time} - ${date}`;
    }
    return "";
  };

  handleDoctorName = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let name =
        language === LANGUAGES.VI
          ? `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
          : `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`;

      return name;
    }
    return "";
  };
  handleConfirmBooking = async () => {
    // this.setState({ isShowLoading: true });
    let {language}=this.props;

    //validate input
    // !data.email || !data.doctorId || !data.timeType || !data.date
    let date = new Date(this.state.birthday).getTime();
    let timeString = this.buildTimeBooking(this.props.dataTime);
    let doctorName = this.handleDoctorName(this.props.dataTime);
    let clinicId = this.state.clinicId ? this.state.clinicId : (this.props.dataTime.doctorData.Doctor_Infor.clinicId ? this.props.dataTime.doctorData.Doctor_Infor.clinicId : null);

    let res = await postPatientBookAppointment({
      patientName: this.state.patientName,
      phoneNumber: this.state.phoneNumber,
      email: this.state.email,
      address: this.state.address,
      reason: this.state.reason,
      date: this.props.dataTime.date,
      birthday: date,
      selectedGender: this.state.selectedGender.value,
      doctorId: this.props.match.params.id,

      timeType: this.state.timeType,
      language: this.props.language,
      timeString: timeString,
      doctorName: doctorName,
      clinicId: clinicId
    });

    if(res && res.errCode === 0){
      if(language==="en"){
        toast.success("Book a new appointment successfully, please check your email for confirmation!");
      }else{
        toast.success("Đặt lịch khám thành công, hãy kiểm tra email của bạn để xác nhận!");
      }
      this.props.closeBookingClose();

      this.props.history.push(`/user/booking-history?date=${this.props.dataTime.date}`);
    }else if(res && res.errCode === 4){
      if(language==="en"){
        toast.warn("You have already booked an appointment at this time, please choose a different time slot!");
      }else{
        toast.warn("Bạn đã đặt lịch hẹn vào khung giờ này rồi, vui lòng chọn khung giờ khác!");
      }
      this.props.closeBookingClose();
    }else{
      if(language==="en"){
        toast.error("Error!");
      }else{
        toast.error("Lỗi rồi!");
      }
      this.props.closeBookingClose();
    }
  };
  render() {
    let { isOpenModal, closeBookingClose, dataTime } = this.props;

    let doctorId = dataTime && !_.isEmpty(dataTime) ? dataTime.doctorId : "";

    return (
      <LoadingOverlay
        active={this.state.isShowLoading}
        spinner={<BounceLoader color={"#86e7d4"} size={60} />}
      >
        <Modal
          isOpen={isOpenModal}
          className={"booking-modal-container"}
          size="lg"
          centered
        >
          <div className="booking-modal-content">
            <div className="booking-modal-header">
              <span className="left">
                <FormattedMessage id="patient.booking-modal.title" />
              </span>
              <span className="right" onClick={closeBookingClose}>
                <i className="fas fa-times"></i>
              </span>
            </div>
            <div className="booking-modal-body">
              {/* {JSON.stringify(dataTime)} */}
              <div className="doctor-infor">
                <ProfileDoctor
                  doctorId={doctorId}
                  isShowDescriptionDoctor={false}
                  dataTime={dataTime}
                  isShowLinkDetail={false}
                  isShowPrice={true}
                />
              </div>

              <div className="row">
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.patientName" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.patientName}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "patientName")
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.phoneNumber" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.phoneNumber}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "phoneNumber")
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.email" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.email}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "email")
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.address" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.address}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "address")
                    }
                  />
                </div>
                <div className="col-12 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.reason" />
                  </label>
                  <input
                    className="form-control"
                    value={this.state.reason}
                    onChange={(event) =>
                      this.handleOnChangeInput(event, "reason")
                    }
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.birthday" />
                  </label>
                  <DatePicker
                    onChange={this.handleOnChangeDatePicker}
                    className="form-control"
                    value={this.state.birthday}
                  />
                </div>
                <div className="col-6 form-group">
                  <label>
                    <FormattedMessage id="patient.booking-modal.gender" />
                  </label>
                  <Select
                    value={this.state.selectedGender}
                    onChange={this.handleChangeSelect}
                    options={this.state.genders}
                  />
                </div>
              </div>
            </div>
            <div className="booking-modal-footer">
              <button
                className="btn-booking-confirm"
                onClick={() => this.handleConfirmBooking()}
              >
                <FormattedMessage id="patient.booking-modal.btnConfirm" />
              </button>
              <button
                className="btn-booking-cancel"
                onClick={closeBookingClose}
              >
                <FormattedMessage id="patient.booking-modal.btnCancel" />
              </button>
            </div>
          </div>
        </Modal>
      </LoadingOverlay>
    );
  }
}

const mapStateToProps = (state) => {
  return { language: state.app.language, genders: state.admin.genders, isLoggedIn: state.user.isLoggedIn, userInfo: state.user.userInfo };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGenders: () => dispatch(actions.fetchGenderStart()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BookingModal));
