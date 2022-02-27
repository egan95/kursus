import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Formik, Field} from 'formik';
import * as Yup from 'yup';
import moment from "moment";
import jwt_decode from "jwt-decode";
import {useSelector, useDispatch} from "react-redux";
import parse from "html-react-parser"
import {Modal} from "react-bootstrap"

import {update} from "../features/userSlice";
import { DatePickerField, SelectField } from './partial/FormCustom';
import Table from './partial/Table'


function SiswaFormKursus({...props}) {
    const dispatch = useDispatch();

    const idStudent = props.idProps;
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
    const [formValueUpdate, setFormValueUpdate] = useState(null);
    const [dataKursus, setDataKursus] = useState([]);
    const [dataSiswaKursus, setDataSiswaKursus] = useState([]);
    const [modalSiswaKursus, setModalSiswaKursus] = useState({show:false, title:''});
    const [loadingForm, setLoadingForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const columns = [
          {
            Header: 'Kursus',
            Cell: ({ row }) => {
                let courseName = `-`;
                if(row.original.course){
                  courseName = row.original.course.name
                  courseName += `<br> <span class="badge bg-primary">Level ${row.original.level}</span>` 
                }
                return (<span>{parse(courseName)}</span>)
            }
          },
          {
            Header: 'Status',
            Cell: ({ row }) => (
              <span>{row.original.status==='active'?'Aktif':(row.original.status==='finish'?'Selesai':'Tidak Aktif')}</span>
            )
          },
          {
            Header: 'Tanggal',
            accessor: 'date',
          },
          {
            Header: 'Action',
            Cell: ({ row }) => (
                
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-primary btn-sm" onClick={()=> updateSiswaKursus(row.original)}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteSiswaKursus(row.original)}>Hapus</button>
              </div>
            )
          }
        ];

    const initialFormValue = { 
        courseId: '',
        level: '',
        date: '',
        info:'',
        status:'',
        photo:null,
      }
    
    const validationSchema = {
        courseId: Yup.object().required('Required').nullable(),
        level: Yup.object().required('Required').nullable(),
        date: Yup.date('Silahkan pilih tanggal daftar').required('Required').nullable(),
        status: Yup.object().required('Required').nullable()
      }

    const dataLevel = [
        {value:1,label:'1'},
        {value:2,label:'2'},
        {value:3,label:'3'},
        {value:4,label:'4'},
        {value:5,label:'5'},
        {value:6,label:'6'},
        {value:7,label:'7'},
      ]
    
      const dataStatus = [
        {value:'active',label:'Aktif'},
        {value:'finish',label:'Lulus'},
        {value:'not_active',label:'Tidak Aktif'}
      ]
      const handleClose = () => setModalSiswaKursus({...modalSiswaKursus,show:false});

      const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          setSelectedImage(e.target.files[0]);
        }
      };

      const removeSelectedImage = () => {
        setSelectedImage(null);
      };

      const getCourses = async () => {
        try {
          const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'kursus',{
                headers: {
                    Authorization: `Bearer ${tokenuser}`
                }
            });
            let optionKursus=[];
            response.data.data.map(item => optionKursus.push({value:item.id, label:item.name}))
          setDataKursus(optionKursus)
        } catch (error) {
            console.log(error)
        }
      }

      const getStudentCourseHistories = async () => {
        try {
          const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'student/course-histories/'+idStudent,{
                headers: {
                    Authorization: `Bearer ${tokenuser}`
                }
            });
          setDataSiswaKursus(response.data.data)
        } catch (error) {
            console.log(error)
        }
      }

    const formSiswaKursus = () => {
        setFormValueUpdate(null)
        setSelectedImage(null);
        setModalSiswaKursus({...modalSiswaKursus,title:'Tambah Data Kursus Siswa', show:true, type:'create',id:''});
    }
    
    const simpanSiswaKursus = async (value) => {
      // console.log(value);
      // console.log(selectedImage)
      var formData = new FormData();
      Object.keys(value).forEach(key => {
        if(typeof value[key] === 'object' && value[key] !== null && value[key].hasOwnProperty('value')) {
          return formData.append(key, value[key].value)
        } else {
          if(key==='date') {
            value[key] =  moment(value[key]).format('YYYY-MM-DD')
          }
          return formData.append(key, value[key])
        }
      });
      formData.append("studentId",idStudent);
      formData.append("image", selectedImage);
      //formData.append("dataA","sdsd")
    //   for (var key of formData.keys()) {
    //     console.log(key);
    //  }
        const {type, id} = modalSiswaKursus;
        setLoadingForm(true);
        try {
            let response = null;
            if(type==='create') {
                response = await axiosJWT.post(process.env.REACT_APP_LINK_API+'student/course-history',formData,
                {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${tokenuser}`
                    }
                }
                );
            } else {
                response = await axiosJWT.put(process.env.REACT_APP_LINK_API+'student/course-history/'+id,formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${tokenuser}`
                    }
                }
                );
            }
            setLoadingForm(false);
            setModalSiswaKursus({...modalSiswaKursus,show:false});
            getStudentCourseHistories();
            return MySwal.fire({
                icon: "success",
                title: "Sukses",
                html: `${response.data.msg}`,
            })
        } catch (error) {
            setLoadingForm(false);
            console.log('error simpan kursus siswa',error);
            return MySwal.fire({
                icon: "warning",
                html: `${error.response}`,
            })
        }
    }

    const updateSiswaKursus = (item) => {
      //console.log(item)
        setSelectedImage(null);
        setFormValueUpdate({
            courseId: dataKursus.find(val => val.value===item.courseId),
            level: dataLevel.find(val => val.value===item.level),
            date: new Date(moment(item.date,'YYYY-MM-DD').format('YYYY'),(moment(item.date,'YYYY-MM-DD').format('M')-1),moment(item.date,'YYYY-MM-DD').format('D')),
            info: item.info,
            status: dataStatus.find(val => val.value===item.status),
            photo: item.photo===''?null:item.photo,
        })
        setModalSiswaKursus({...modalSiswaKursus,title:'Edit Data Kursus Siswa', show:true, type:'update',id:item.id});
    }

    const deleteSiswaKursus = (item) => {
        MySwal.fire({
            icon: "warning",
            title: "Konfirmasi",
            html: `Hapus data kursus Siswa <b>${item.course.name} Level ${item.level}</b> ?`,
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
                  await axiosJWT.delete(process.env.REACT_APP_LINK_API+'student/course-history/'+item.id,{
                    headers: {
                        Authorization: `Bearer ${tokenuser}`
                    }
                });
                getStudentCourseHistories();
                return MySwal.fire({
                  icon: "success",
                  title: "Sukses",
                  html: `Berhasil menghapus data kursus siswa!`,
                })
              } catch (error) {
                  console.log('error delete kursus siswa ',error)
                  return MySwal.fire({
                    icon: "danger",
                    title: "Error",
                    html: `${error}`,
                  })
              }
              
            }
            
          })
    }

    useEffect(()=> {
        getStudentCourseHistories();
        getCourses();
    },[])
  

  return (
      <>
            <div className="row">
                <div className="col-md-6 col-xs-12">
                    <button className='btn btn-success mb-2' onClick={()=> formSiswaKursus()}>Tambah Kursus</button>
                </div>
            </div>
            <Table columns={columns} data={dataSiswaKursus}/>

            {/* modal */}
        <Modal
        show={modalSiswaKursus.show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalSiswaKursus.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
              enableReinitialize={true}
              initialValues={formValueUpdate || initialFormValue}
              validationSchema={Yup.object(validationSchema)}
              onSubmit={(values) => {
                  simpanSiswaKursus(values);
              }}
              >
                  {formik => (
                      
                      <form onSubmit={formik.handleSubmit}>
                      <div className="mb-3">
                          <label className='form-label'>Nama Kursus <span className='text-danger'>*</span></label>
                          <SelectField 
                            name="courseId" 
                            value={dataKursus}
                            multi={false}
                            search={false}
                            defaultVal={{}}
                            />
                            {formik.errors.courseId && formik.touched.courseId ? <div className="form-text text-danger">{formik.errors.courseId}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Level <span className='text-danger'>*</span></label>
                          <SelectField 
                            name="level" 
                            value={dataLevel}
                            multi={false}
                            search={false}
                            defaultVal={{}}
                            />
                            {formik.errors.level && formik.touched.level ? <div className="form-text text-danger">{formik.errors.level}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Mulai Kursus <span className='text-danger'>*</span></label>
                          <DatePickerField name="date" />
                            {formik.errors.date && formik.touched.date ? <div className="form-text text-danger">{formik.errors.date}</div> : null}
                      </div>
                      <div className="mb-3">
                          <label className='form-label'>Status <span className='text-danger'>*</span></label>
                          <SelectField 
                            name="status" 
                            value={dataStatus}
                            multi={false}
                            search={false}
                            defaultVal={{}}
                            />
                            {formik.errors.status && formik.touched.status ? <div className="form-text text-danger">{formik.errors.status}</div> : null}
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
                      <div className="mb-3">
                        <label className='form-label'>Foto</label>
                        <input
                          accept="image/*"
                          type="file"
                          onChange={imageChange}
                          className="form-control"
                        />

                         { (selectedImage === null && formik.initialValues.photo!==null && formik.initialValues.photo!=="") &&
                              <div className='my-2'>
                                <figure className="figure">
                                  <figcaption className="figure-caption text-center">Gambar saat ini</figcaption>
                                  <img
                                    src={process.env.REACT_APP_LINK_API+'images/'+formik.initialValues.photo}
                                    className="img img-fluid img-thumbnail"
                                    alt="Thumb"
                                  />
                                  
                                  </figure>
                              </div>

                         }
                      
                        {selectedImage && (
                                <div className='my-2'>
                                  <img
                                    src={URL.createObjectURL(selectedImage)}
                                    className="img img-fluid img-thumbnail"
                                    alt="Thumb"
                                  />
                                  <div className="d-grid gap-2">
                                  <button onClick={removeSelectedImage} className="btn btn-danger btn-block">
                                    Hapus Gambar
                                  </button>
                                  </div>
                                </div>
                              )}

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

export default SiswaFormKursus;
