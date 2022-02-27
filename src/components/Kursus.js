import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import {update} from "../features/userSlice";
import {Modal} from "react-bootstrap"
import { Formik} from 'formik';
import * as Yup from 'yup';
import NavbarApp from './partial/NavbarApp';
import Table from './partial/Table'
import { CurrencyField } from './partial/FormCustom';

function Kursus() {

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
  const [dataKursus, setDataKursus] = useState([]);
  const [modalKursus, setModalKursus] = useState({show:false, title:''});
  const [loadingForm, setLoadingForm] = useState(false);
  const [updateFormValue, setUpdateFormValue] = useState(null);
  const initialFormValue = { name: '', info: '', price:'' }

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
        Header: 'Nama Kursus',
        accessor: 'name',
      },
      {
        Header: 'Biaya',
        accessor: 'price',
      },
      {
        Header: 'Info',
        accessor: 'info',
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div className="btn-group" role="group">
            <button type="button" className="btn btn-primary btn-sm" onClick={()=> updateKursus(row.original)}>Edit</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteKursus(row.original)}>Hapus</button>
          </div>
        )
      }
    ],
    []
  );

  const handleClose = () => setModalKursus({...modalKursus,show:false});

  const getCourse = async () => {
    try {
      const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'kursus',{
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        });
      setDataKursus(response.data.data)
    } catch (error) {
        console.log(error)
    }
  }

  const deleteKursus = (item) => {
    //console.log(item);
    MySwal.fire({
      icon: "warning",
      title: "Konfirmasi",
      html: `Hapus data kursus <b>${item.name}</b> ?`,
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
            await axiosJWT.delete(process.env.REACT_APP_LINK_API+'kursus/'+item.id,{
              headers: {
                  Authorization: `Bearer ${tokenuser}`
              }
          });
          getCourse();
          return MySwal.fire({
            icon: "success",
            title: "Sukses",
            html: `Berhasil menghapus data kursus!`,
          })
        } catch (error) {
            console.log('error delete kursus ',error)
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
    price: Yup.string().required('Required')
  }

  const formKursus = () => {
    setUpdateFormValue(null)
    setModalKursus({...modalKursus,title:'Tambah Data Kursus', show:true, type:'create',id:''});
  }


  const updateKursus  = (item) => {
    setUpdateFormValue({name:item.name,price:item.price,info:item.info})
    setModalKursus({...modalKursus,title:'Edit Data Kursus', show:true, type:'update',id:item.id});
  }

  const simpanKursus= async (value) => {

    const {name, info, price} = value;
    const {type, id} = modalKursus;
    setLoadingForm(true);
    try {
      let response = null;
      if(type==='create') {
        response = await axiosJWT.post(process.env.REACT_APP_LINK_API+'kursus',{
          name,info, price
        },
        {
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        }
        );
      } else {
        response = await axiosJWT.put(process.env.REACT_APP_LINK_API+'kursus/'+id,{
          name,info, price
        },
        {
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        }
        );
      }
      setLoadingForm(false);
      setModalKursus({...modalKursus,show:false});
      getCourse();
      return MySwal.fire({
        icon: "success",
        title: "Sukses",
        html: `${response.data.msg}`,
      })
    } catch (error) {
      console.log('error simpan kursus',error);
    }
  }

  useEffect(()=> {
    getCourse()
  },[])

  return (
      <>
        <NavbarApp/>
        <div className="container">
        <div className="card mt-5">
          <div className="card-header">
            Data Kursus
          </div>
          <div className="card-body">
            <div className='m-3'>
              <div className="row">
                <div className="col-md-6 col-xs-12">
                  <button className='btn btn-success mb-2' onClick={()=> formKursus()}>Tambah Kursus</button>
                </div>
                {/* <div className="col-md-4 offset-md-2 col-xs-12">
                  <input type="text" className='form-control mb-2' onChange={(e)=>changeSearch(e)} placeholder='Search here...'/>
                </div> */}
              </div>
              <Table columns={columns} data={dataKursus}/>
            </div>
          </div>
        </div>
        </div>

        {/* modal */}
        <Modal
        show={modalKursus.show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalKursus.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
              enableReinitialize={true}
              initialValues={updateFormValue || initialFormValue}
              validationSchema={Yup.object(validationSchema)}
              onSubmit={(values, { setSubmitting }) => {
                  simpanKursus(values);
              }}
              >
                  {formik => (
                      <form onSubmit={formik.handleSubmit}>

                      <div className="mb-3">
                          <label className='form-label'>Nama Kursus</label>
                          <input type="text" 
                          name="name" 
                          className={`form-control${(formik.errors.name && formik.touched.name)?" is-invalid":""}`}
                          {...formik.getFieldProps('name')}
                          />
                          {formik.errors.name && formik.touched.name ? <div className="invalid-feedback">{formik.errors.name}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Biaya</label>
                          <CurrencyField name="price" value={'0'} limit={0} />
                          {formik.errors.price && formik.touched.price ? <div className="form-text text-danger">{formik.errors.price}</div> : null}
                      </div>
                      <div className="mb-3">
                        <label className='form-label'>Deskripsi</label>
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

export default Kursus;
