import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { Formik, Field} from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import moment from "moment";

import { DatePickerField, DatePickerFieldCustom, TimePickerField } from './partial/FormCustom';
import {update} from "../features/userSlice";
import NavbarApp from './partial/NavbarApp';
import SiswaFormKursus from './SiswaFormKursus';

library.add(fas)

function SiswaFormUpdate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
    const { id } = useParams();
    const [loadingForm, setLoadingForm] = useState(false);
    const [dataStudent, setDataStudent] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [checkDay, setCheckDay] = useState([]);

    const [scheduleHistoryId,setScheduleHistoryId] = useState(0);
    const [insertScheduleHistories,setInsertScheduleHistories] = useState(false);
    const [dateScheduleHistories, setDateScheduleHistories] = useState(null);
    const [dataScheduleHistories, setDataScheduleHistories] = useState([]);

    const initialFormValue = { 
        name: '',
        nickname: '',
        gender: '',
        dob:'',
        place_birth:'',
        address:'',
        parent:'',
        phone:'',
        join_date:'',
        info:'',
        photo:'',
      }
    
    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
    };

    const validationSchema = {
        name: Yup.string().required('Required'),
        nickname: Yup.string().required('Required'),
        address: Yup.string().required('Required'),
        parent: Yup.string().required('Required'),
        phone: Yup.string().required('Required'),
        gender: Yup.string().required('Required'),
        join_date: Yup.date('Silahkan pilih tanggal daftar').required('Required').nullable(),
      }

    
      const backForm = () => {
        MySwal.fire({
          icon: "warning",
          title: "Konfirmasi",
          html: `Kembali ke halaman list siswa ?`,
          showCancelButton: true,
          confirmButtonText: 'Ya, Kembali',
          cancelButtonText: 'Batal',
          reverseButtons: true,
        }).then(async(value) => {
          if(value.isConfirmed) {
            navigate('/siswa')
          }
          
        })
      }

      const simpanSiswa = async ({...value}) => {
        var formData = new FormData();
        Object.keys(value).forEach(key => {
          if(typeof value[key] === 'object' && value[key] !== null && value[key].hasOwnProperty('value')) {
            return formData.append(key, value[key].value)
          } else {
            if(key==='dob' || key==='join_date') {
              value[key] = (value[key]!==null && value[key]!=='')?moment(value[key]).format('YYYY-MM-DD'):value[key];
            }
            return formData.append(key, value[key])
          }
        });
        formData.append("image", selectedImage);
        formData.append("checkDay", JSON.stringify(checkDay));
        formData.append("insertScheduleHistories", insertScheduleHistories);
        formData.append("dateScheduleHistories", dateScheduleHistories!==null?moment(dateScheduleHistories).format('YYYY-MM-DD'):"");
        formData.append("scheduleHistoryId", scheduleHistoryId);

        setLoadingForm(true);
        try {
          let response = null;
            response = await axiosJWT.put(process.env.REACT_APP_LINK_API+'student/'+id,formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${tokenuser}`
                }
            }
            );
          setLoadingForm(false);
          return MySwal.fire({
            icon: "success",
            title: "Sukses",
            html: `${response.data.msg}`,
            allowOutsideClick:false,
            allowEscapeKey:false,
          })
          .then((value) => {
              navigate('/siswa')
          })
        } catch (error) {
          console.log('error simpan update kursus',error);
        }
      }

      const getStudent = async () => {
          
        try {
          const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'student/'+id,{
                headers: {
                    Authorization: `Bearer ${tokenuser}`
                }
            });
            if(response.data.data==null) {
                navigate('/siswa')
            }
            //console.log(response.data.data)
            let data_student= response.data.data;
          setDataStudent({...data_student,
            dob:(data_student.dob!==null && data_student.dob!=='') ? new Date(moment(data_student.dob,'YYYY-MM-DD').format('YYYY'),(moment(data_student.dob,'YYYY-MM-DD').format('M')-1),moment(data_student.dob,'YYYY-MM-DD').format('D')):null,
            join_date:new Date(moment(data_student.join_date,'YYYY-MM-DD').format('YYYY'),(moment(data_student.join_date,'YYYY-MM-DD').format('M')-1),moment(data_student.join_date,'YYYY-MM-DD').format('D')),
            photo: data_student.photo===''?null:data_student.photo
        })

        var newCheckDay = []
        // console.log(data_student.scheduleDef)
        setDataScheduleHistories(data_student.student_schedule_histories);
        if(data_student.student_schedule_histories.length>0){
          setScheduleHistoryId(data_student.student_schedule_histories[0].id)
          // console.log(data_student.student_schedule_histories[0].student_schedule_defaults);
          data_student.student_schedule_histories[0].student_schedule_defaults.map(item => {
              var startTime = item.start_time.split(':');
              var endTime = item.end_time.split(':');
              newCheckDay.push({
                  day:item.day,
                  start_time:new Date(2022,0,1,startTime[0],startTime[1],startTime[2]),
                  end_time:new Date(2022,0,1,endTime[0],endTime[1],endTime[2])
              })
          })
        }

        setCheckDay(newCheckDay);
        } catch (error) {
            console.log(error)
        }
      }

      const changeCheckDay= (e) => {
        const checked = e.target.checked;
        if(checked) {
          //console.log(e.target.value)
          let newDay = {
            day: e.target.value,
            start_time:null,
            end_time:null
          }
          setCheckDay([...checkDay,newDay])
          
        } else {
          setCheckDay(checkDay.filter(item=> item.day!==e.target.value))
        }
      }
    
      const checkTime=(time, type, day)=> {
        var arrDay = [...checkDay];
        var index = arrDay.findIndex(item=>item.day===day);
        
        if(type==='start_time') {
          arrDay[index].start_time = time
        } else {
          arrDay[index].end_time = time
        }
        setCheckDay(arrDay)
      }
    
      const changeScheduleHistories= (e) => {
        const checked = e.target.checked;
        setInsertScheduleHistories(checked)
        if(checked) {
    
        } else {

        }
      }

    useEffect(()=> {
        getStudent();
    },[])

  return (
      <>
      <NavbarApp/>
      <div className="container-fluid">
          <div className="row mt-5">
            <div className="col-md-12 col-xs-12">
                <button className="btn btn-info btn-sm mb-2" onClick={()=>backForm()}><FontAwesomeIcon icon="angle-double-left" /> List Siswa</button>
            </div>
                {/* card 1 */}
              <div className="col-md-6 col-xs-12">
                  
                    <div className="card">
                        <div className="card-header">
                            Update Profil Siswa
                        </div>
                        <div className="card-body pb-3">
                            {/* start form */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={dataStudent || initialFormValue}
                                validationSchema={Yup.object(validationSchema)}
                                onSubmit={(values) => {
                                    simpanSiswa(values);
                                }}
                                >
                                    {formik => (
                                        <form onSubmit={formik.handleSubmit}>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Nama Siswa <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <input type="text" 
                                            name="name" 
                                            className={`form-control${(formik.errors.name && formik.touched.name)?" is-invalid":""}`}
                                            {...formik.getFieldProps('name')}
                                            />
                                            {formik.errors.name && formik.touched.name ? <div className="invalid-feedback">{formik.errors.name}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Nama Panggilan <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <input type="text" 
                                            name="nickname" 
                                            className={`form-control${(formik.errors.nickname && formik.touched.nickname)?" is-invalid":""}`}
                                            {...formik.getFieldProps('nickname')}
                                            />
                                            {formik.errors.nickname && formik.touched.nickname ? <div className="invalid-feedback">{formik.errors.nickname}</div> : null}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Tempat Lahir</label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <input type="text" 
                                            name="place_birth" 
                                            className={`form-control${(formik.errors.place_birth && formik.touched.place_birth)?" is-invalid":""}`}
                                            {...formik.getFieldProps('place_birth')}
                                            />
                                            {formik.errors.place_birth && formik.touched.place_birth ? <div className="invalid-feedback">{formik.errors.place_birth}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Tanggal Lahir</label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <DatePickerField name="dob" />
                                            {formik.errors.dob && formik.touched.dob ? <div className="invalid-feedback">{formik.errors.dob}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Jenis Kelamin <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <div className="form-check form-check-inline">
                                                {/* <input className="form-check-input"  type="radio" name="gender" id="inlineRadio1" value="m" {...formik.getFieldProps('gender')}/> */}
                                                <Field type="radio" name="gender" value="m" className="form-check-input" id="inlineRadio1" />
                                                <label className="form-check-label" htmlFor="inlineRadio1">Laki-Laki</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                {/* <input className="form-check-input" type="radio" name="gender" id="inlineRadio2" value="f" {...formik.getFieldProps('gender')}/> */}
                                                <Field type="radio" name="gender" value="f" className="form-check-input" id="inlineRadio2" />
                                                <label className="form-check-label" htmlFor="inlineRadio2">Perempuan</label>
                                            </div>
                                            {formik.errors.gender && formik.touched.gender ? <div className="form-text text-danger">{formik.errors.gender}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Nama Orang Tua <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <input type="text" 
                                            name="parent" 
                                            className={`form-control${(formik.errors.parent && formik.touched.parent)?" is-invalid":""}`}
                                            {...formik.getFieldProps('parent')}
                                            />
                                            {formik.errors.parent && formik.touched.parent ? <div className="invalid-feedback">{formik.errors.parent}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>No HP <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <input type="text" 
                                            name="phone" 
                                            className={`form-control${(formik.errors.phone && formik.touched.phone)?" is-invalid":""}`}
                                            {...formik.getFieldProps('phone')}
                                            />
                                            {formik.errors.phone && formik.touched.phone ? <div className="invalid-feedback">{formik.errors.phone}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Tanggal Daftar <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <DatePickerField name="join_date" />
                                            {formik.errors.join_date && formik.touched.join_date ? <div className="form-text text-danger">{formik.errors.join_date}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Alamat <span className='text-danger'>*</span></label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <textarea
                                                name='address'
                                                className={`form-control${(formik.errors.address && formik.touched.address)?" is-invalid":""}`}
                                                rows={3}
                                                {...formik.getFieldProps('address')}
                                            >

                                            </textarea>
                                            {formik.errors.address && formik.touched.address ? <div className="invalid-feedback">{formik.errors.address}</div> : null}
                                            </div>
                                        </div>
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Info</label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
                                            <textarea
                                            name='info'
                                            className='form-control'
                                            rows={3}
                                            {...formik.getFieldProps('info')}
                                            >

                                            </textarea>
                                            </div>
                                        </div>
                                        {/* section schedule default */}
          <div className="card mb-3">
              <div className="card-body">
                                        <div className="mb-3 g-3 row">
                            <div className="col-md-4 col-xs-12">
                              <label className='col-form-label float-end'>Jadwal Default</label>
                            </div>
                              <div className="col-md-8 col-xs-12">
                                <div className="row">
                                  <div className="col-xs-12">
                                    <table>
                                      <tbody>
                                      <tr>
                                        <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input"
                                                name="scheduleHari" 
                                                value="0" 
                                                id="minggu"
                                                checked={(checkDay.find(item => item.day==='0'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                              />
                                              <label className="form-check-label" htmlFor="minggu">
                                                Minggu
                                              </label>
                                            </div>
                                        </td>
                                        { (checkDay.find(item => item.day==='0') !== undefined ) &&
                                        <>
                                        <td>
                                              <TimePickerField 
                                              name="scheduleTime.start_time" 
                                              label="Jam Mulai" 
                                              className="form-control form-control-sm" 
                                              onChange={(time)=> checkTime(time,'start_time','0')}
                                              value={checkDay.find(item => item.day==='0').start_time}
                                              />
                                          </td>
                                        <td>
                                              <TimePickerField 
                                              name="scheduleTime.end_time" 
                                              label="Jam Akhir" 
                                              className="form-control form-control-sm" 
                                              onChange={(time)=> checkTime(time,'end_time','0')}
                                              value={checkDay.find(item => item.day==='0').end_time}
                                              />
                                        </td>
                                        </>
                                        }
                                            
                                      </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input
                                                type="checkbox"
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="1" 
                                                id="senin"
                                                checked={(checkDay.find(item => item.day==='1'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                                />
                                              <label className="form-check-label" htmlFor="senin">
                                                Senin
                                              </label>
                                            </div>
                                            </td>
                                            { (checkDay.find(item => item.day==='1') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','1')}
                                                  value={checkDay.find(item => item.day==='1').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','1')}
                                                  value={checkDay.find(item => item.day==='1').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                          </tr>
                                        </tbody>
                                      </table>
                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="2" 
                                                id="selasa"
                                                checked={(checkDay.find(item => item.day==='2'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                                />
                                              <label className="form-check-label" htmlFor="selasa">
                                                Selasa
                                              </label>
                                            </div>
                                          </td>
                                          { (checkDay.find(item => item.day==='2') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','2')}
                                                  value={checkDay.find(item => item.day==='2').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','2')}
                                                  value={checkDay.find(item => item.day==='2').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                        </tr>
                                      </tbody>
                                    </table>

                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="3" 
                                                id="rabu"
                                                checked={(checkDay.find(item => item.day==='3'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                                />
                                              <label className="form-check-label" htmlFor="rabu">
                                                Rabu
                                              </label>
                                            </div>
                                            </td>
                                            { (checkDay.find(item => item.day==='3') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','3')}
                                                  value={checkDay.find(item => item.day==='3').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','3')}
                                                  value={checkDay.find(item => item.day==='3').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                          </tr>
                                        </tbody>
                                      </table>

                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="4" 
                                                id="kamis"
                                                checked={(checkDay.find(item => item.day==='4'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                                />
                                              <label className="form-check-label" htmlFor="kamis">
                                                Kamis
                                              </label>
                                            </div>
                                          </td>
                                          { (checkDay.find(item => item.day==='4') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','4')}
                                                  value={checkDay.find(item => item.day==='4').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','4')}
                                                  value={checkDay.find(item => item.day==='4').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                        </tr>
                                      </tbody>
                                    </table>

                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="5" 
                                                id="jumat"
                                                checked={(checkDay.find(item => item.day==='5'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}
                                                />
                                              <label className="form-check-label" htmlFor="jumat">
                                                Jumat
                                              </label>
                                            </div>
                                          </td>
                                          { (checkDay.find(item => item.day==='5') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','5')}
                                                  value={checkDay.find(item => item.day==='5').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','5')}
                                                  value={checkDay.find(item => item.day==='5').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                        </tr>
                                      </tbody>
                                    </table>

                                  </div>
                                  <div className="col-xs-12">
                                    <table>
                                        <tbody>
                                        <tr>
                                          <td>
                                            <div className="form-check">
                                              <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                name="scheduleHari" 
                                                value="6" 
                                                id="sabtu"
                                                checked={(checkDay.find(item => item.day==='6'))?true:false}
                                                onChange={(val) => {
                                                  changeCheckDay(val)
                                                }}/>
                                              <label className="form-check-label" htmlFor="sabtu">
                                                Sabtu
                                              </label>
                                            </div>
                                          </td>
                                          { (checkDay.find(item => item.day==='6') !== undefined ) &&
                                            <>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.start_time" 
                                                  label="Jam Mulai" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'start_time','6')}
                                                  value={checkDay.find(item => item.day==='6').start_time}
                                                  />
                                              </td>
                                            <td>
                                                  <TimePickerField 
                                                  name="scheduleTime.end_time" 
                                                  label="Jam Akhir" 
                                                  className="form-control form-control-sm" 
                                                  onChange={(time)=> checkTime(time,'end_time','6')}
                                                  value={checkDay.find(item => item.day==='6').end_time}
                                                  />
                                            </td>
                                            </>
                                            }
                                        </tr>
                                        </tbody>
                                      </table>

                                  </div>

                              </div>
                            </div>
                        </div>

                        {/* checklist untuk menyimpan history jadwal default */}
                        <div className="mb-2 mt-2 g-3 row">
                          <div className="col-md-4 col-xs-12"></div>
                          <div className="col-md-8 col-xs-12">
                            <div className="form-check">
                              <input className="form-check-input" 
                              type="checkbox" 
                              name='isInsertScheduleHistories' 
                              value="1" id="flexCheckDefault" 
                              onChange={(val) => {
                                changeScheduleHistories(val)
                              }}
                              />
                              <label className="form-check-label" htmlFor="flexCheckDefault">
                                  Simpan perubahan jadwal default juga? <span></span>
                              </label>
                            </div>
                            {
                              insertScheduleHistories && 
                                  <DatePickerFieldCustom 
                                    name="dateScheduleHistories"
                                    value={dateScheduleHistories}
                                    placeholder="Pilih Tanggal" 
                                    onChange={(e)=> setDateScheduleHistories(e)} 
                                    />

                            }
                          </div>
                        </div>
                        {/*  */}

                        {/* untuk menampilkan history */}
                        {
                          dataScheduleHistories.length>0 &&
                          <table className='table'>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Tanggal Mulai</th>
                                <th>info</th>
                                <th>created</th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                              dataScheduleHistories.map((shItem,shIndex) => {
                                return (
                                  <tr key={shIndex}>
                                    <td>{shIndex+1}</td>
                                    <td>{shItem.date_start}</td>
                                    <td>{shItem.info}</td>
                                    <td>{shItem.createdAt}</td>
                                  </tr>
                                )
                              })
                              }
                            </tbody>
                          </table>
                          } 
                        {/* untuk untuk menampilkan history */}
                </div>
          </div>
                                        {/* END section schedule default */}
                                        <div className="mb-3 g-3 row">
                                            <div className="col-md-4 col-xs-12">
                                            <label className='col-form-label float-end'>Foto Siswa</label>
                                            </div>
                                            <div className="col-md-8 col-xs-12">
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
                                                            style={{width:"80%"}}
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
                                                    style={{width:"80%"}}
                                                />
                                                <div className="d-grid gap-2">
                                                <button onClick={removeSelectedImage} className="btn btn-danger btn-block">
                                                    Hapus Gambar
                                                </button>
                                                </div>
                                                </div>
                                            )}

                                            </div>
                                        </div>
                                        <div className="text-center my-4">
                                            <button type="button" className="btn btn-secondary m-1" onClick={()=>backForm()}>Kembali</button>
                                            <button type="submit" className="btn btn-primary m-1" disabled={loadingForm}>{loadingForm ? 'Please Wait...':'Simpan'}</button>
                                        </div>
                                    </form>
                                    )}
                            </Formik>
                            {/* end form */}
                        </div>
                    </div>
                    
              </div>
              {/* end card 1 */}
              {/* card 1 */}
              <div className="col-md-6 col-xs-12">
                  
                    <div className="card">
                        <div className="card-header">
                            Data Kursus Siswa
                        </div>
                        <div className="card-body pb-3">
                            <SiswaFormKursus idProps={id}/>
                        </div>
                    </div>
                    
              </div>
              {/* end card 1 */}
          </div>
    </div>
      </>
  );
}

export default SiswaFormUpdate;
