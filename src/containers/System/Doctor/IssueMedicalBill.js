import { useRef, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import "./IssueMedicalBill.scss";

import { toast } from "react-toastify";
import moment from "moment";
import localization from "moment/locale/vi"; //su dung chung cho cai mac dinh la tieng viet
import { CommonUtils } from "../../../utils";
import {
  getBookingById,
  postCreateInvoice,
} from "../../../services/userService";

import { useParams, useNavigate } from "react-router-domv6";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "react-loading-overlay";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

export default function IssueMedicalBill() {
  const [email, setEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [listServices, setListServices] = useState([]);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [token, setToken] = useState("");
  const [timeType, setTimeType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [reason, setReason] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [specialtyId, setSpecialtyId] = useState("");


  let navigate = useNavigate();

  let { bookingId } = useParams();

  const { isLoggedIn, userInfo, language } = useSelector((state) => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
  }));


  useEffect(() => {
    async function fetchData() {

      let patientInfo = await getBookingById(bookingId);
      console.log("patientInfo",patientInfo)
      if (
        patientInfo &&
        patientInfo.data &&
        patientInfo.data.patientName &&
        patientInfo.data.patientData.email
      ) {
        console.log("patientInfo", patientInfo);
        setEmail(patientInfo.data.patientData.email);
        setPatientName(patientInfo.data.patientName);
        setDoctorId(patientInfo.data.doctorId);
        setPatientId(patientInfo.data.patientId);
        setDate(patientInfo.data.date);
        setToken(patientInfo.data.token);
        setTimeType(patientInfo.data.timeType);
        let name =
          (userInfo.lastName ? userInfo.lastName : "") +
          " " +
          (userInfo.firstName ? userInfo.firstName : "");
        setDoctorName(name);
        setReason(patientInfo.data.patientReason);
        setSpecialtyId(patientInfo.data.doctorInfor.specialtyId)
      }
    }
    fetchData();
  }, []);

  const handleCreateInvoiceImage = () => {
    createInvoiceImage();
  };

  const createInvoiceImage = async () => {
    setIsShowLoading(true);

    let tempListService = [...listServices];

    if(language==="vi"){
      // tempListService.map((service,index)=>{
      //   service.amount=service.amount;
      //   return service;
      // })
    }

    let res = await postCreateInvoice({
      email: email,
      doctorId: doctorId,
      patientId: patientId,
      timeType: timeType,
      date: date,
      token: token,
      language: language,
      patientName: patientName,
      doctorName: doctorName,
      patientReason: reason,
      listServices:tempListService,
      totalAmount:language === "en" ? totalAmount : totalAmount,
      bookingId: bookingId,
      specialtyId: specialtyId
    });

    if (res && res.errCode === 0) {
      setIsShowLoading(false);
      if (language == "en") {
        toast.success("Create invoice succeed!");
      } else {
        toast.success("Tạo hóa đơn thành công!");
      }
    } else {
      setIsShowLoading(true);
      if (language == "en") {
        toast.error("Something wrongs...!");
      } else {
        toast.error("Lỗi!");
      }
    }
    setIsShowLoading(false);

    navigate("/admin-dashboard/doctor/manage-patient?date=" + date, {
      replace: true,
    });
  };

  const handleAddService = () => {
    let temp = [...listServices];

    temp = [...temp,
      { 
        name:"",
        amount:0
      }
    ]

    setListServices(temp);
  };

  const handleRemoveService = (index) => {
    let temp = [...listServices];

    temp.splice(index, 1);

    setListServices(temp);
  };

  const handleOnChangeNameService = (event, index) => {
    let temp = [...listServices];

    temp[index].name=event.target.value;

    setListServices(temp);
  };

  const handleOnChangeAmountService = (event, index) => {
    let temp = [...listServices];

    temp[index].amount=event.target.value;

    setListServices(temp);
  };

  const updateTotalAmountServices = () => {
    let tempServices = [...listServices];

    if(tempServices){
      let tempTotalAmount=0;

      tempServices.map((service,index)=>{
        tempTotalAmount=tempTotalAmount+parseInt(service.amount)
      })
  
      setTotalAmount(tempTotalAmount);
    }else{
      setTotalAmount(0);
    }
  };

  useEffect(() => {
    updateTotalAmountServices()
 }, [listServices]);
 
  return (
    <LoadingOverlay
      active={isShowLoading}
      spinner={<ClimbingBoxLoader color={"#86e7d4"} size={15} />}
    >
      <div className="row">
        <div class="col-12">
          <h5 className="">
            <FormattedMessage
              id={
                "admin.issue-medical-bill.issue-medical-bill"
              }
            />
          </h5>
        </div>
      </div>
      <div className="row">
        <div class="col-12">
          <div class="row">
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id={"admin.manage-drug.email-patient"} />
              </label>
              <input
                className="form-control"
                type="email"
                value={email}
                // onChange={(event) => handleOnChangeEmail(event)}
              />
            </div>
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id={"admin.manage-drug.name-patient"} />
              </label>
              <input
                className="form-control"
                type="text"
                value={patientName}
                // onChange={(event) => this.handleOnChangeEmail(event)}
              />
            </div>
            <div className="col-6 form-group">
              <label>
                <FormattedMessage
                  id={"admin.issue-medical-bill.invoice"}
                />
              </label>
            </div>
            <div className="col-6 form-group text-right">
              <i class="fa fa-plus-circle fs-24 pointer" aria-hidden="true" onClick={()=>handleAddService()}></i>
            </div>

            <div class="col-12">
              <div class="row">
                <div class="col-12 form-group">
                  <div class="row align-items-center text-center mb-10">
                      <div class="col-4">
                        <FormattedMessage
                          id={
                            "admin.issue-medical-bill.service"
                          }
                        />
                      </div>
                      <div class="col-1">
                      <FormattedMessage
              id={
                "admin.issue-medical-bill.amount-of-money"
              }
            />
                      </div>
                  </div>
                  {
                    listServices.map((service, index)=>{
                        return(
                            <div key={index} class="row  text-center mb-10">
                                <div class="col-4">
                                  <input type="text" value={service.name} class="form-control" placeholder="" onChange={(event) => handleOnChangeNameService(event, index)}/>
                                </div>
                                <div class="col-1">
                                  <input type="text" value={service.amount} class="form-control" placeholder="" onChange={(event) => handleOnChangeAmountService(event, index)}/>
                                </div>
                                <div class="col-1 d-flex align-items-center">
                                  <i class="fas fa-trash pointer text-red" onClick={()=>handleRemoveService(index)}></i>
                                </div>
                          </div>
                        );
                    })
                  }


                <div class="row  text-center mb-10">
                                <div class="col-4">
                                  <input type="text" value={language==="en" ? "Total Amount" : "Tổng tiền"} class="form-control" placeholder=""/>
                                </div>
                                <div class="col-1">
                                  <input type="text" value={totalAmount} class="form-control" placeholder="" />
                                </div>
                          </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleCreateInvoiceImage()}
        type="button"
        class="btn btn-primary"
      >
        <FormattedMessage id={"admin.manage-drug.btn-create"} />
      </button>
    </LoadingOverlay>
  );
  // }
}

// const mapStateToProps = (state) => {
//   return { language: state.app.language, genders: state.admin.genders };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {};
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(IssueMedicalBill);
