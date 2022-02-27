import React, {useState} from 'react';
import "../style/loginstyle.css"
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Formik} from 'formik';
import * as Yup from 'yup';
import jwt_decode from "jwt-decode";
import {useDispatch} from "react-redux";
import {update} from "../features/userSlice";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [msgErr, setMsgErr] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);


    const Auth = async (value) => {
        const {email, password} = value;
        setLoadingForm(true)
        try {
            const response = await axios.post(process.env.REACT_APP_LINK_API+"login",{
                email,password
            });

            const decoded = jwt_decode(response.data.token);
            dispatch(update({
            nameuser:decoded.name,
            emailuser:decoded.email,
            tokenexpire:decoded.exp,
            tokenuser:response.data.token
            }))

            setLoadingForm(false)
            navigate('/');
        } catch (error) {
            if(error.response) {
                setMsgErr(error.response.data.msg)
            }
            setLoadingForm(false)
        }
    }

    const showError= () => {
        if(msgErr.length>0) {
            return (
                <div className="alert alert-danger" role="alert">
                    {msgErr}
                </div>
            )
        } else {
            return '';
        }
    }

    const validationSchema = {
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string()
         .min(6, 'Must min 6 characters')
         .required('Required'),
    }

  return (
      <div>
          <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="text-center text-dark mt-5">Login Form</h2>
                    <div className="text-center mb-5 text-dark">Made with bootstrap</div>
                    <div className="card my-5">
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={Yup.object(validationSchema)}
                            onSubmit={(values, { setSubmitting }) => {
                                Auth(values);
                            }}
                            >
                                {formik => (
                                    <form onSubmit={formik.handleSubmit} className="card-body cardbody-color p-lg-5">
                                    {showError()}
                                    <div className="text-center">
                                    <img src="https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397__340.png" className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3"
                                        width="200px" alt="profile"/>
                                    </div>
            
                                    <div className="mb-3">
                                        <input type="text" 
                                        name="email" 
                                        id="email"
                                        className={`form-control${(formik.errors.email && formik.touched.email)?" is-invalid":""}`}
                                        placeholder="Email" 
                                        {...formik.getFieldProps('email')}
                                        />
                                        {formik.errors.email && formik.touched.email ? <div className="invalid-feedback">{formik.errors.email}</div> : null}
                                    </div>
                                    <div className="mb-3">
                                    <input type="password" 
                                    name="password" 
                                    id="password" 
                                    className={`form-control${(formik.errors.password && formik.touched.password)?" is-invalid":""}`} 
                                    placeholder="password" 
                                    {...formik.getFieldProps('password')}
                                    />
                                    {formik.errors.password && formik.touched.password ? <div className="invalid-feedback">{formik.errors.password}</div> : null}
                                    </div>
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-color px-5 mb-5 w-100" disabled={loadingForm}>{loadingForm ? 'Please Wait...':'Login'}</button></div>
                                    <div className="form-text text-center mb-5 text-dark">Not
                                    Registered? <Link to="/register" className="text-dark fw-bold">Create an
                                        Account</Link>
                                    </div>
                                </form>
                                )}
                        </Formik>
            
                    </div>

                </div>
            </div>
        </div>
      </div>
  )
}

export default Login;
