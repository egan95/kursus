import React, {useState} from 'react';
import "../style/loginstyle.css"
import { Link,useNavigate } from "react-router-dom";
import axios from 'axios';
import { Formik} from 'formik';
import * as Yup from 'yup';
import parse from "html-react-parser"

function Register() {

    const [msgErr, setMsgErr] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);

    const navigate = useNavigate();

    const register = async (value) => {
        const {email, password, name, confPassword} = value;
        setLoadingForm(true)
        try {
            await axios.post(process.env.REACT_APP_LINK_API+"register",{
                name,email,password,confPassword
            });
            setLoadingForm(false)
            navigate('/login');
        } catch (error) {
            if(error.response) {
                let errString = '';
                if(Array.isArray(error.response.data.msg)) {
                    errString += '<ul>';
                    error.response.data.msg.map( item => errString += '<li>'+item.msg+'</li>' )
                    errString += '</ul>';
                    setMsgErr(errString)
                } else {
                    setMsgErr(error.response.data.msg)
                }
            }
            setLoadingForm(false)
        }
    }

    const showError= () => {
        if(msgErr.length>0) {
            return (
                <div className="alert alert-danger" role="alert">
                    {parse(msgErr)}
                </div>
            )
        } else {
            return '';
        }
    }

    const validationSchema = {
        email: Yup.string().email('Invalid email address').required('Required'),
        name: Yup.string().required('Required'),
        password: Yup.string()
         .min(6, 'Must min 6 characters')
         .required('Required'),
         confPassword: Yup.string()
         .oneOf([Yup.ref('password'), null], "Passwords don't match.")
         .required('Required'),
    }
  return (
      <div>
          <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="text-center text-dark mt-5">Register Form</h2>
                    <div className="text-center mb-5 text-dark">Made with bootstrap</div>
                    <div className="card my-5">
                    <Formik
                        initialValues={{ email: '', name:'', password: '',confPassword:'' }}
                        validationSchema={Yup.object(validationSchema)}
                        onSubmit={(values, { setSubmitting }) => {
                            register(values);
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
                                        className={`form-control${(formik.errors.name && formik.touched.name)?" is-invalid":""}`}
                                        name="name"
                                        placeholder="Name" 
                                        {...formik.getFieldProps('name')}
                                        />
                                        {formik.errors.name && formik.touched.name ? <div className="invalid-feedback">{formik.errors.name}</div> : null}
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" 
                                        className={`form-control${(formik.errors.email && formik.touched.email)?" is-invalid":""}`}
                                        name="email"
                                        placeholder="Email" 
                                        {...formik.getFieldProps('email')}
                                        />
                                        {formik.errors.email && formik.touched.email ? <div className="invalid-feedback">{formik.errors.email}</div> : null}
                                    </div>
                                    <div className="mb-3">
                                        <input 
                                        type="password" 
                                        className={`form-control${(formik.errors.password && formik.touched.password)?" is-invalid":""}`}
                                        name="password"
                                        placeholder="Password" 
                                        {...formik.getFieldProps('password')}
                                        />
                                        {formik.errors.password && formik.touched.password ? <div className="invalid-feedback">{formik.errors.password}</div> : null}
                                    </div>
                                    <div className="mb-3">
                                        <input 
                                        type="password" 
                                        className={`form-control${(formik.errors.confPassword && formik.touched.confPassword)?" is-invalid":""}`}
                                        name="confPassword"
                                        placeholder="Confirm Password" 
                                        {...formik.getFieldProps('confPassword')}
                                        />
                                        {formik.errors.confPassword && formik.touched.confPassword ? <div className="invalid-feedback">{formik.errors.confPassword}</div> : null}
                                    </div>
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-color px-5 mb-5 w-100" disabled={loadingForm}>{loadingForm ? 'Please Wait...':'Register'}</button></div>
                                    <div className="form-text text-center mb-5 text-dark">Already Have Account? <Link to="/login" className="text-dark fw-bold">Login Now</Link>
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

export default Register;
