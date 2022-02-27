import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import {update} from "../features/userSlice";
import {Modal} from "react-bootstrap"
import { Formik, Field} from 'formik';
import * as Yup from 'yup';
import moment from "moment";

import NavbarApp from './partial/NavbarApp';
import Table from './partial/Table'
import { DatePickerField } from './partial/FormCustom';

function Guru() {
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
 const [dataGuru, setDataGuru] = useState([]);
 const [modalGuru, setModalGuru] = useState({show:false, title:''});
 const [loadingForm, setLoadingForm] = useState(false);
 const [updateFormValue, setUpdateFormValue] = useState(null);
 const initialFormValue = { 
   name: '',
   nickname: '',
   gender:'',
   phone:'',
   address:'',
   join_date:null,
   info: '' 
  }

 // colum to table
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
       Cell: ({ row }) => (
        <>
        <span>{row.original.name}</span> <br/> <span className="badge rounded-pill bg-primary">{row.original.nickname}</span>
        </>
      )
     },
     {
      Header: 'Jk',
      Cell: ({ row }) => (
        <span>{row.original.gender==='m'?'Laki-Laki':'Perempuan'}</span>
      )
    },
     {
       Header: 'Telpon',
       accessor: 'phone',
     },
     {
       Header: 'Action',
       Cell: ({ row }) => (
         <div className="btn-group" role="group">
           <button type="button" className="btn btn-primary btn-sm" onClick={()=> updateGuru(row.original)}>Edit</button>
           <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteGuru(row.original)}>Hapus</button>
         </div>
       )
     }
   ],
   []
 );

 const handleClose = () => setModalGuru({...modalGuru,show:false});

 const getTeachers = async () => {
   try {
     const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'teachers',{
           headers: {
               Authorization: `Bearer ${tokenuser}`
           }
       });
     setDataGuru(response.data.data)
   } catch (error) {
       console.log(error)
   }
 }

 const deleteGuru = (item) => {
   //console.log(item);
   MySwal.fire({
     icon: "warning",
     title: "Konfirmasi",
     html: `Hapus data guru <b>${item.name}</b> ?`,
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
           await axiosJWT.delete(process.env.REACT_APP_LINK_API+'teacher/'+item.id,{
             headers: {
                 Authorization: `Bearer ${tokenuser}`
             }
         });
         getTeachers();
         return MySwal.fire({
           icon: "success",
           title: "Sukses",
           html: `Berhasil menghapus data guru!`,
         })
       } catch (error) {
           console.log('error delete guru ',error)
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
   name: Yup.string().required('Required'),
   nickname: Yup.string().required('Required'),
   gender: Yup.string().required('Required')
 }

 const formGuru = () => {
   setUpdateFormValue(null)
   setModalGuru({...modalGuru,title:'Tambah Data Guru', show:true, type:'create',id:''});
 }


 const updateGuru  = (item) => {
   setUpdateFormValue({
     name:item.name,
     nickname:item.nickname,
     info:item.info,
      gender:item.gender,
      phone:item.phone,
      address:item.address,
      join_date:(item.join_date!==null && item.join_date !== '')?new Date(moment(item.join_date,'YYYY-MM-DD').format('YYYY'),(moment(item.join_date,'YYYY-MM-DD').format('M')-1),moment(item.join_date,'YYYY-MM-DD').format('D')):null,
      
    })
   setModalGuru({...modalGuru,title:'Edit Data Guru', show:true, type:'update',id:item.id});
 }

 const simpanGuru= async (value) => {

   const {name,nickname,gender,phone,address,join_date,info} = value;
   const {type, id} = modalGuru;
   setLoadingForm(true);
   try {
     let response = null;
     if(type==='create') {
       response = await axiosJWT.post(process.env.REACT_APP_LINK_API+'teacher',{
         name,
         nickname,
         gender,
         phone,
         address,
         join_date:join_date!=null ? moment(join_date).format('YYYY-MM-DD'):null,
         info
       },
       {
           headers: {
               Authorization: `Bearer ${tokenuser}`
           }
       }
       );
     } else {
       response = await axiosJWT.put(process.env.REACT_APP_LINK_API+'teacher/'+id,{
        name,
        nickname,
        gender,
        phone,
        address,
        join_date:join_date!=null ? moment(join_date).format('YYYY-MM-DD'):null,
        info
       },
       {
           headers: {
               Authorization: `Bearer ${tokenuser}`
           }
       }
       );
     }
     setLoadingForm(false);
     setModalGuru({...modalGuru,show:false});
     getTeachers();
     return MySwal.fire({
       icon: "success",
       title: "Sukses",
       html: `${response.data.msg}`,
     })
   } catch (error) {
     console.log('error simpan guru',error);
   }
 }

 useEffect(()=> {
   getTeachers()
 },[])

 return (
     <>
       <NavbarApp/>
       <div className="container">
       <div className="card mt-5">
         <div className="card-header">
           Data Guru
         </div>
         <div className="card-body">
           <div className='m-3'>
             <div className="row">
               <div className="col-md-6 col-xs-12">
                 <button className='btn btn-success mb-2' onClick={()=> formGuru()}>Tambah Guru</button>
               </div>
               {/* <div className="col-md-4 offset-md-2 col-xs-12">
                 <input type="text" className='form-control mb-2' onChange={(e)=>changeSearch(e)} placeholder='Search here...'/>
               </div> */}
             </div>
             <Table columns={columns} data={dataGuru}/>
           </div>
         </div>
       </div>
       </div>

       {/* modal */}
       <Modal
       show={modalGuru.show}
       onHide={handleClose}
       backdrop="static"
       keyboard={false}
     >
       <Modal.Header closeButton>
         <Modal.Title>{modalGuru.title}</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         <Formik
             enableReinitialize={true}
             initialValues={updateFormValue || initialFormValue}
             validationSchema={Yup.object(validationSchema)}
             onSubmit={(values) => {
                 simpanGuru(values);
             }}
             >
                 {formik => (
                     <form onSubmit={formik.handleSubmit}>

                     <div className="mb-3">
                         <label className='form-label'>Nama <span className='text-danger'>*</span></label>
                         <input type="text" 
                         name="name" 
                         className={`form-control${(formik.errors.name && formik.touched.name)?" is-invalid":""}`}
                         {...formik.getFieldProps('name')}
                         />
                         {formik.errors.name && formik.touched.name ? <div className="invalid-feedback">{formik.errors.name}</div> : null}
                     </div>
                     <div className="mb-3">
                         <label className='form-label'>Nama Panggilan <span className='text-danger'>*</span></label>
                         <input type="text" 
                         name="nickname" 
                         className={`form-control${(formik.errors.nickname && formik.touched.nickname)?" is-invalid":""}`}
                         {...formik.getFieldProps('nickname')}
                         />
                         {formik.errors.nickname && formik.touched.nickname ? <div className="invalid-feedback">{formik.errors.nickname}</div> : null}
                     </div>
                     <div className="mb-3">
                         <label className='form-label'>Jenis Kelamin <span className='text-danger'>*</span></label>
                         <br/>
                         <div className="form-check form-check-inline">
                              <Field type="radio" name="gender" value="m" className="form-check-input" id="inlineRadio1" />
                              <label className="form-check-label" htmlFor="inlineRadio1">Laki-Laki</label>
                          </div>
                          <div className="form-check form-check-inline">
                              <Field type="radio" name="gender" value="f" className="form-check-input" id="inlineRadio2" />
                              <label className="form-check-label" htmlFor="inlineRadio2">Perempuan</label>
                          </div>
                          {formik.errors.gender && formik.touched.gender ? <div className="form-text text-danger">{formik.errors.gender}</div> : null}
                     </div>
                     <div className="mb-3">
                         <label className='form-label'>Telpon</label>
                         <input type="text" 
                         name="phone" 
                         className={`form-control${(formik.errors.phone && formik.touched.phone)?" is-invalid":""}`}
                         {...formik.getFieldProps('phone')}
                         />
                         {formik.errors.phone && formik.touched.phone ? <div className="invalid-feedback">{formik.errors.phone}</div> : null}
                     </div>
                     <div className="mb-3">
                         <label className='form-label'>Tanggal Mulai</label>
                         <DatePickerField name="join_date" />
                          {formik.errors.join_date && formik.touched.join_date ? <div className="form-text text-danger">{formik.errors.join_date}</div> : null}
                     </div>
                     <div className="mb-3">
                       <label className='form-label'>Alamat</label>
                       <textarea
                         name='address'
                         className='form-control'
                         rows={3}
                         {...formik.getFieldProps('address')}
                       >

                       </textarea>
                       </div>
                     <div className="mb-3">
                       <label className='form-label'>Info</label>
                       <textarea
                         name='info'
                         className='form-control'
                         rows={3}
                         {...formik.getFieldProps('info')}
                       >

                       </textarea>
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

export default Guru;
