import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import {Table, Modal} from "react-bootstrap"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import moment from "moment"
import { ToastContainer, toast } from 'react-toastify';

import { TimePickerField, DatePickerFieldRange, SelectFieldCustom } from './partial/FormCustom';
import {update} from "../features/userSlice";
import NavbarApp from './partial/NavbarApp';
import {sortDayIndonesia, fullDayIndonesia} from "../lib/GlobalLib.js"
// import Table from './partial/Table'

library.add(fas)

function Jadwal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {tokenexpire,tokenuser} = useSelector(state => state.user);

  const MySwal = withReactContent(Swal)

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

  const [dateRangeSchedule, setDateRangeSchedule] = useState([null, null]);
  const [dataSiswa, setDataSiswa] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState([]);
  const [dataSiswaSchedule, setDataSiswaSchedule] = useState({
    data:[],
    header:[]
  });
  const [modalDetail, setModalDetail] = useState({
      show:false,
      title: 'Detail Jadwal', 
      schedule:{
        schedule:[]
      }
  })

  const [jadwalPengganti, setJadwalPengganti] = useState(
    {
      addJadwalGanti : false,
      radioJadwalGanti: null,
      start_time:null,
      end_time: null,
      siswa:null
    }
  )


  const handleClose = () => setModalDetail({...modalDetail,show:false});

  const getStudents = async () => {
    try {
      const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'students',{
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        });
        let optionSiswa=[];
        response.data.data.map(item => optionSiswa.push({value:item.id, label:item.name}))
      setDataSiswa(optionSiswa)
    } catch (error) {
        console.log(error)
    }
  }

  const searchSchedule = async () => {
    //console.log(dateRangeSchedule)
    // console.log(selectedSiswa)

    if (dateRangeSchedule[0] === null || dateRangeSchedule[1] === null) {
      toast.error('Pilih tanggal jadwal!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      return false;
    }


    try {
      const response = await axiosJWT.post(process.env.REACT_APP_LINK_API + 'student/schedule',
        {
          dateRangeSchedule, selectedSiswa
        },
        {
          headers: {
            Authorization: `Bearer ${tokenuser}`
          }
        });
      setDataSiswaSchedule({
        ...dataSiswaSchedule,
        data: response.data.data,
        header: response.data.header
      });
    } catch (error) {
      console.log(error)
    }

  }

  const detailSchedule= (siswa, name, schedule) => {
    //console.log(siswa)

    let addJadwalGanti = false
    let radJadwalGanti = null;
    let startTime = null;
    let endTime = null;
    const scheduleDef = schedule.schedule.find(s => s.type==='default')
    const scheduleAdd = schedule.schedule.find(s => s.id)
    if(scheduleAdd!==undefined) {
      if (scheduleAdd.start_time!==null && scheduleAdd.end_time!==null) {
        radJadwalGanti = 'gantiJadwal';
        startTime = new Date(schedule.date+' '+scheduleAdd.start_time)
        endTime = new Date(schedule.date+' '+scheduleAdd.end_time)
      } else {
        radJadwalGanti = 'libur';

      }
    }

    setJadwalPengganti({...jadwalPengganti,
        addJadwalGanti,
        start_time:startTime,
        end_time:endTime,
        radioJadwalGanti:radJadwalGanti,
        siswa:siswa
      })

    setModalDetail({
      ...modalDetail,
      show: true,
      title: `Detail Jadwal <b>${name}</b>`,
      schedule: schedule,
      scheduleDef: scheduleDef,
      scheduleAdd: scheduleAdd,
    }
    )
  }

  const addJadwalGanti = (e, date) => {
    const checked = e.target.checked;
    if (checked) {
      setJadwalPengganti({ ...jadwalPengganti, addJadwalGanti: true })
    } else {
      setJadwalPengganti({ ...jadwalPengganti, addJadwalGanti: false })
    }
  }

  const radioJadwalGanti = (e,date) => {
    setJadwalPengganti({...jadwalPengganti,radioJadwalGanti:e.target.value})
  }

  const setTimeJadwalGanti=(time,key)=> {
    console.log(key,time);
    if(key==='start_time') {
      setJadwalPengganti({...jadwalPengganti,start_time:time})
    } else {
      setJadwalPengganti({...jadwalPengganti,end_time:time})
    }
   
  }

  const simpanJadwalGanti = () => {
    //console.log(jadwalPengganti);
    //console.log(modalDetail)
    const param = {
      addJadwalGanti: jadwalPengganti.addJadwalGanti,
      radioJadwalGanti: jadwalPengganti.radioJadwalGanti,
      end_time: jadwalPengganti.end_time !== null ? moment(jadwalPengganti.end_time).format('HH:mm') : null,
      start_time: jadwalPengganti.start_time !== null ? moment(jadwalPengganti.start_time).format('HH:mm') : null,
      siswaId: jadwalPengganti.siswa.id,
      date: modalDetail.schedule.date,
      scheduleAdd: modalDetail.scheduleAdd
    }
    console.log(param)

    MySwal.fire({
      icon: "warning",
      title: "Konfirmasi",
      html: `Yakin ingin menyimpan jadwal?`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Kembali',
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async (value) => {
      if (value.isConfirmed) {
        try {
          await axiosJWT.post(process.env.REACT_APP_LINK_API + 'student/set-schedule',
            {
              ...param
            },
            {
              headers: {
                Authorization: `Bearer ${tokenuser}`
              }
            });
          searchSchedule();
          setModalDetail({ ...modalDetail, show: false });
          toast.success('Jadwal berhasil diupdate.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
          });
          // return MySwal.fire({
          //   icon: "success",
          //   title: "Sukses",
          //   html: `Jadwal berhasil diupdate.`,
          // })
          // .then((value) => {
          //   setModalDetail({...modalDetail,show:false});
          // })
        } catch (error) {
          console.log('error set jadwal ', error)
          return MySwal.fire({
            icon: "error",
            title: "Error",
            html: `${error}`,
          })
        }

      }

    })

    //console.log(param)
  }

  useEffect(()=> {
    getStudents()
  },[])


  return (
      <>
        <NavbarApp/>
        <div className="container">
        <div className="card mt-5">
          <div className="card-header">
            Data Jadwal Kursus
          </div>
          <div className="card-body">
            <div className='m-3'>
              <div className="row">
                <div className="col-md-4 col-xs-12 mb-3">
                  <label className='form-label'>Pilih range tanggal <span className='text-danger'>*</span></label>
                  <DatePickerFieldRange name="dateRangeSchedule"
                  onChange={(update) => setDateRangeSchedule(update)}
                  value={dateRangeSchedule}
                  />
                </div>
                <div className="col-md-4 col-xs-12 mb-3">
                  <label className='form-label'>Siswa (optional)</label>
                  <SelectFieldCustom
                    name="selectSiswa"
                    option={dataSiswa}
                    multi={true}
                    search={true}
                    defaultVal={null}
                    onChange={(val) => {
                      setSelectedSiswa(val)
                    }}
                  />
                </div>
                <div className="col-xs-12 mb-3">
                  <button className='btn btn-success' onClick={searchSchedule}><FontAwesomeIcon icon="search" /> Cari</button>
                </div>
              </div>
              {/* table hasil cari*/}

              <Table responsive striped bordered style={{'fontSize':'13px'}}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Siswa</th>
                    {
                       dataSiswaSchedule.header.map((item,indexTh) => {
                        return (
                          <th className='text-center align-middle' key={'th_'+indexTh}>{sortDayIndonesia(moment(item,'YYYY-MM-DD').format('d'))}[{moment(item,'YYYY-MM-DD').format('DD/MM')}]</th>
                        )
                     })
                    }
                  </tr>
                </thead>
                <tbody>
                    {
                      dataSiswaSchedule.data.map((item,index) => {
                        return (
                          <tr key={'tr_'+index}>
                            <td>{index+1}</td>
                            <td>
                              <a href={"/siswa/update/"+item.id} target="_blank" rel="noreferrer">{item.name}</a>
                              {
                                item.student_schedule_defaults.find(ssd => ssd.status==='double_schedule_default') === undefined ?
                                item.student_schedule_defaults.map((val,indexVal) => {
                                  return <><br/><span key={'span_'+indexVal} className="badge bg-primary">{sortDayIndonesia(val.day)}: {moment(val.start_time,'HH:mm:ss').format('HH:mm')} - {moment(val.end_time,'HH:mm:ss').format('HH:mm')}</span></>;
                                })
                                :
                                <><br/><span className='badge bg-primary'> *Double Histories</span></>
                              }
                            </td>
                            {
                                item.studentSchedule.map((itemTd,indexTd) => {
                
                                  return (
                                    <td onClick={()=>detailSchedule(item,item.name,itemTd)} style={{'cursor':'pointer'}} className='text-center align-middle' key={'td_'+indexTd}>
                                      {
                                        (itemTd.schedule.length > 0)?
                                        (
                                          (itemTd.schedule[0].hasOwnProperty('id')) ?
                                          (
                                            (itemTd.schedule[0].start_time===null || itemTd.schedule[0].end_time===null) ?
                                            "*[set]"
                                            :
                                            "*["+moment(itemTd.schedule[0].start_time,'HH:mm:ss').format('HH:mm') +' - '+ moment(itemTd.schedule[0].end_time,'HH:mm:ss').format('HH:mm')+"]"
                                          )
                                          :
                                          moment(itemTd.schedule[0].start_time,'HH:mm:ss').format('HH:mm') +' - '+ moment(itemTd.schedule[0].end_time,'HH:mm:ss').format('HH:mm')
                                        )
                                        :
                                        "[set]"
                                      }
                                    </td>
                                  )
                              })
                              }
                          </tr>
                        )
                      })
                    }
                </tbody>
                </Table>
              {/* ENd table hasil cari */}
            </div>
          </div>
        </div>
        </div>

        {/* modal */}
        <Modal
        show={modalDetail.show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{parse(modalDetail.title)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12">
              <div className="text-center">
                    <h3>{fullDayIndonesia(moment(modalDetail.schedule.date,'YYYY-MM-DD').format('d'))}, {moment(modalDetail.schedule.date).format('DD-MM-YYYY')}</h3>
                    {
                      modalDetail.schedule.schedule.length > 0 ?
                        (
                          (modalDetail.schedule.schedule[0].start_time===null || modalDetail.schedule.schedule[0].end_time===null) ?
                          <h3>*Jadwal dirubah menjadi libur*</h3>
                          :
                          <h3>{moment(modalDetail.schedule.schedule[0].start_time,'HH:mm:ss').format('HH:mm')} - {moment(modalDetail.schedule.schedule[0].end_time,'HH:mm:ss').format('HH:mm')}</h3>
                        )
                      :
                      <>
                        <div className="alert alert-success" role="alert">
                          Jadwal masih kosong!
                        </div>
                      </>
                    }
                    <div className="card my-4">
                      <div className="card-header">
                        Jadwal Default
                      </div>
                      <div className="card-body py-3 px-2">
                      {
                        modalDetail.scheduleDef === undefined ?
                          <>
                            <div className="alert alert-warning" role="alert">
                              Jadwal default tidak ada untuk tanggal dipilih!
                            </div>
                          </>
                        :
                          <>
                            <div className="alert alert-success" role="alert">
                              Jadwal default dipilih adalah <br/>
                              <h3>{moment(modalDetail.scheduleDef.start_time,'HH:mm:ss').format('HH:mm')} - {moment(modalDetail.scheduleDef.end_time,'HH:mm:ss').format('HH:mm')}</h3>
                            </div>
                          </>

                      }
                      </div>
                    </div>

                    <div className="card my-4">
                      <div className="card-header">
                        Jadwal Pengganti
                      </div>
                      <div className="card-body py-3 px-2 text-start">
                      {
                        modalDetail.scheduleDef === undefined && modalDetail.scheduleAdd === undefined ?
                          (
                            <div className="form-check">
                              <input className="form-check-input" 
                              type="checkbox" 
                              name='isInsertScheduleHistories' 
                              value="1" id="flexCheckDefault" 
                              onChange={(val) => {
                                addJadwalGanti(val,modalDetail.schedule.date)
                              }}
                              />
                              <label className="form-check-label" htmlFor="flexCheckDefault">
                                  Input jadwal ganti <span></span>
                              </label>
                            </div>
                          )
                          :
                          (
                            <>
                            { modalDetail.scheduleDef !== undefined &&
                            <div className="form-check">
                              <input className="form-check-input" 
                              type="radio" 
                              value="libur" 
                              name="radioJadwalGanti"
                              id="jadwalLibur"
                              checked={jadwalPengganti.radioJadwalGanti==='libur'} 
                              onChange={(val) => {
                                radioJadwalGanti(val,modalDetail.schedule.date)
                              }}
                              />
                              <label className="form-check-label" htmlFor="jadwalLibur">
                                  Ubah menjadi libur<span></span>
                              </label>
                            </div>
                            }
                          { modalDetail.scheduleAdd !== undefined &&
                            <div className="form-check">
                              <input className="form-check-input" 
                              type="radio" 
                              value="hapusJadwalGanti" 
                              name="radioJadwalGanti"
                              id="hapusJadwalGanti"
                              checked={jadwalPengganti.radioJadwalGanti==='hapusJadwalGanti'} 
                              onChange={(val) => {
                                radioJadwalGanti(val,modalDetail.schedule.date)
                              }}
                              />
                              <label className="form-check-label" htmlFor="hapusJadwalGanti">
                                  Hapus jadwal ganti<span></span>
                              </label>
                            </div>
                            }
                          
                          <div className="form-check">
                              <input className="form-check-input" 
                              type="radio" 
                              value="gantiJadwal" 
                              name="radioJadwalGanti"
                              id="jadwalGanti"
                              checked={jadwalPengganti.radioJadwalGanti==='gantiJadwal'} 
                              onChange={(val) => {
                                radioJadwalGanti(val,modalDetail.schedule.date)
                              }}
                              />
                              <label className="form-check-label" htmlFor="jadwalGanti">
                                  Input/update jadwal ganti <span></span>
                              </label>
                            </div>
                          </>
                          )
                        }

                        {/* uttuk input jam */}
                        {
                          jadwalPengganti.addJadwalGanti || jadwalPengganti.radioJadwalGanti==='gantiJadwal' ?
                          (
                            <div className="row my-3">
                              <div className="col-md-6">
                              <TimePickerField 
                                    name="jadwalPenggantiStartTime" 
                                    label="Jam Mulai" 
                                    className="form-control form-control-sm" 
                                    onChange={(time)=> setTimeJadwalGanti(time,'start_time')}
                                    value={jadwalPengganti.start_time}
                                    />
                              </div>
                              <div className="col-md-6">
                              <TimePickerField 
                                    name="jadwalPenggantiEndTime" 
                                    label="Jam Selesai" 
                                    className="form-control form-control-sm" 
                                    onChange={(time)=> setTimeJadwalGanti(time,'end_time')}
                                    value={jadwalPengganti.end_time}
                                    />
                              </div>
                            </div>
                          )
                          :
                          (
                            <div></div>
                          )
                        }

                      </div>

                    </div>
                    
              </div>
            </div>
          </div>
          <div className="float-end my-4">
              <button type="button" className="btn btn-secondary m-1" onClick={()=>handleClose()}>Keluar</button>
              <button type="button" className="btn btn-primary m-1" onClick={()=>simpanJadwalGanti()}>Simpan</button>
            </div>
        </Modal.Body>
      </Modal>
      <ToastContainer
        position="top-right"
        theme="colored"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        />
      </>
  );
}

export default Jadwal;
