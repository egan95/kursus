import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import {Modal} from "react-bootstrap"
import { Formik} from 'formik';
import * as Yup from 'yup';
import {update} from "../features/userSlice";
import NavbarApp from './partial/NavbarApp';
import Table from './partial/Table'

function User() {

  // get refresh token
  const dispatch = useDispatch();
    const {tokenexpire,tokenuser} = useSelector(state => state.user);

    const axiosJWT = axios.create();
    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date();
        if((tokenexpire * 1000) < currentDate.getTime()) {
            const response = await axios.get(process.env.REACT_APP_LINK_API+'token');
            config.headers.Authorization = `Bearer ${response.data.token}`;
            const decoded = jwt_decode(response.data.token);
            dispatch(update({
                // username:decoded.username,
                nameuser:decoded.name,
                emailuser:decoded.email,
                tokenexpire:decoded.exp,
                tokenuser:response.data.token
            }))
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    })

    const MySwal = withReactContent(Swal)
    const [dataUser, setDataUser] = useState([]);
    const [modalUser, setModalUser] = useState({show:false, title:''});
    const [loadingForm, setLoadingForm] = useState(false);
    const [updateFormValue, setUpdateFormValue] = useState(null);
    const initialFormValue = { name: '', email: '', password: '', confPassword:'' };
    const [formikValidation, setFormikValidation] = useState({});

    const columns = React.useMemo(
      () => [
        {
          Header: 'No',
          Cell: ({ row }) => (
            <span>{row.index+1}</span>
          )
        },
        {
          Header: 'Nama',
          accessor: 'name',
        },
        {
          Header: 'Email',
          accessor: 'email',
        },
        {
          Header: 'Created',
          accessor: 'createdAt',
        },
        {
          Header: 'Action',
          Cell: ({ row }) => (
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-primary btn-sm" onClick={()=> updateUser(row.original)}>Edit</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteUser(row.original)}>Hapus</button>
            </div>
          )
        }
      ],
      []
    );

  const handleClose = () => setModalUser({...modalUser,show:false});

  const getUser = async () => {
    try {
      const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'users',{
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        });
      setDataUser(response.data.data)
    } catch (error) {
        console.log(error)
    }
  }
  
  const deleteUser = (item) => {
    MySwal.fire({
      icon: "warning",
      title: "Konfirmasi",
      html: `Hapus data user <b>${item.email}</b> ?`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Kembali',
      confirmButtonColor:"#dc3545",
      reverseButtons: true,
      allowOutsideClick:false,
      allowEscapeKey:false,
    }).then(async(value) => {
      if(value.isConfirmed) {
        try {
            await axiosJWT.delete(process.env.REACT_APP_LINK_API+'users/'+item.id,{
              headers: {
                  Authorization: `Bearer ${tokenuser}`
              }
          });
          getUser();
          return MySwal.fire({
            icon: "success",
            title: "Sukses",
            html: `Berhasil menghapus data user!`,
          })
        } catch (error) {
            console.log('error delete user ',error)
            return MySwal.fire({
              icon: "danger",
              title: "Error",
              html: `${error}`,
            })
        }
        
      }
      
    })
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

const validationSchemaUpdate = {
  email: Yup.string().email('Invalid email address').required('Required'),
  name: Yup.string().required('Required'),
  password: Yup.string()
   .min(6, 'Must min 6 characters'),
   confPassword: Yup.string()
   .oneOf([Yup.ref('password'), null], "Passwords don't match."),
}

  const formUser = () => {
    setFormikValidation(validationSchema)
    setUpdateFormValue(null)
    setModalUser({...modalUser,title:'Tambah Data User', show:true, type:'create',id:''});
  }


  const updateUser  = (item) => {
    setFormikValidation(validationSchemaUpdate)
    setUpdateFormValue({name:item.name, email:item.email, password:'', confPassword:'',oldEmail:item.email})
    setModalUser({...modalUser,title:'Edit Data User', show:true, type:'update',id:item.id});
  }

  const simpanUser= async (value) => {

    const {name, email, password, confPassword, oldEmail} = value;
    const {type, id} = modalUser;
    setLoadingForm(true);
    try {
      let response = null;
      if(type==='create') {
        response = await axiosJWT.post(process.env.REACT_APP_LINK_API+'register',{
          name,email,password,confPassword
        },
        {
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        }
        );
      } else {
        response = await axiosJWT.put(process.env.REACT_APP_LINK_API+'users/'+id,{
          name,email,password,confPassword,oldEmail
        },
        {
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        }
        );
      }
      setLoadingForm(false);
      setModalUser({...modalUser,show:false});
      getUser();
      return MySwal.fire({
        icon: "success",
        title: "Sukses",
        html: `${response.data.msg}`,
      })
    } catch (error) {
      setLoadingForm(false);
      console.log('error simpan user',error);
      let errString = '';
      if(Array.isArray(error.response.data.msg)) {
          errString += '<ul>';
          error.response.data.msg.map( item => errString += '<li>'+item.msg+'</li>' )
          errString += '</ul>';
          // setMsgErr(errString)
      } 
      // else {
      //     setMsgErr(error.response.data.msg)
      // }
      return MySwal.fire({
        icon: "error",
        html: `<div style="text-align : left">${errString}</div>`,
      })
    }
  }

//   const showError= () => {
//     if(msgErr.length>0) {
//         return (
//             <div className="alert alert-danger" role="alert">
//                 {parse(msgErr)}
//             </div>
//         )
//     } else {
//         return '';
//     }
// }

  useEffect(()=> {
    getUser()
  },[])

  return (
      <>
        <NavbarApp/>
        <div className="container">
        <div className="card mt-5">
          <div className="card-header">
            Data User
          </div>
          <div className="card-body">
            <div className='m-3'>
              <div className="row">
                <div className="col-md-6 col-xs-12">
                  <button className='btn btn-success mb-2' onClick={()=> formUser()}>Tambah User</button>
                </div>
                {/* <div className="col-md-4 offset-md-2 col-xs-12">
                  <input type="text" className='form-control mb-2' onChange={(e)=>changeSearch(e)} placeholder='Search here...'/>
                </div> */}
              </div>
              <Table columns={columns} data={dataUser}/>
            </div>
          </div>
        </div>
        </div>

        <Modal
        show={modalUser.show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalUser.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
              enableReinitialize={true}
              initialValues={updateFormValue || initialFormValue}
              validationSchema={Yup.object(formikValidation)}
              onSubmit={(values, { setSubmitting }) => {
                  simpanUser(values);
              }}
              >
                  {formik => (
                      <form onSubmit={formik.handleSubmit}>

                      <div className="mb-3">
                          <label className='form-label'>Nama</label>
                          <input type="text" 
                          name="name" 
                          className={`form-control${(formik.errors.name && formik.touched.name)?" is-invalid":""}`}
                          {...formik.getFieldProps('name')}
                          />
                          {formik.errors.name && formik.touched.name ? <div className="invalid-feedback">{formik.errors.name}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Email</label>
                          <input type="email" 
                          name="email" 
                          className={`form-control${(formik.errors.email && formik.touched.email)?" is-invalid":""}`}
                          {...formik.getFieldProps('email')}
                          />
                          {formik.errors.email && formik.touched.email ? <div className="invalid-feedback">{formik.errors.email}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Password</label>
                          <input type="password" 
                          name="password" 
                          className={`form-control${(formik.errors.password && formik.touched.password)?" is-invalid":""}`}
                          {...formik.getFieldProps('password')}
                          />
                          {formik.errors.password && formik.touched.password ? <div className="invalid-feedback">{formik.errors.password}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Konfirmasi Password</label>
                          <input type="password" 
                          name="confPassword" 
                          className={`form-control${(formik.errors.confPassword && formik.touched.confPassword)?" is-invalid":""}`}
                          {...formik.getFieldProps('confPassword')}
                          />
                          {formik.errors.confPassword && formik.touched.confPassword ? <div className="invalid-feedback">{formik.errors.confPassword}</div> : null}
                      </div>

                      <div className="float-end my-4">
                          <button type="button" className="btn btn-secondary m-1" onClick={()=>handleClose()}>Batal</button>
                          <button type="submit" className="btn btn-primary m-1" disabled={loadingForm}>{loadingForm ? 'Please Wait...':'Simpan'}</button>
                        </div>
                  </form>
                  )}
          </Formik>
        </Modal.Body>
      </Modal>
      </>
  );
}

export default User;
