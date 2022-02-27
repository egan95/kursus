import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { Table, Modal } from "react-bootstrap"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import moment from "moment"
import { ToastContainer, toast } from 'react-toastify';

import { TimePickerField, DatePickerFieldRange, SelectFieldCustom } from './partial/FormCustom';
import { update } from "../features/userSlice";
import NavbarApp from './partial/NavbarApp';
import { sortDayIndonesia, fullDayIndonesia } from "../lib/GlobalLib.js"

library.add(fas)


function Absen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tokenexpire, tokenuser } = useSelector(state => state.user);

  const MySwal = withReactContent(Swal)

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(async (config) => {
    const currentDate = new Date();
    if ((tokenexpire * 1000) < currentDate.getTime()) {
      const response = await axios.get(process.env.REACT_APP_LINK_API + 'token');
      config.headers.Authorization = `Bearer ${response.data.token}`;
      const decoded = jwt_decode(response.data.token);
      dispatch(update({
        // username:decoded.username,
        nameuser: decoded.name,
        emailuser: decoded.email,
        tokenexpire: decoded.exp,
        tokenuser: response.data.token
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
  const [dataSiswaAbsensi, setDataSiswaAbsensi] = useState({
    data:[],
    header:[]
  });
  
  const getStudents = async () => {
    try {
      const response = await axiosJWT.get(process.env.REACT_APP_LINK_API + 'students', {
        headers: {
          Authorization: `Bearer ${tokenuser}`
        }
      });
      let optionSiswa = [];
      response.data.data.map(item => optionSiswa.push({ value: item.id, label: item.name }))
      setDataSiswa(optionSiswa)
    } catch (error) {
      console.log(error)
    }
  }

  const searchAbsensi = async () => {
    if (dateRangeSchedule[0] === null || dateRangeSchedule[1] === null) {
      toast.error('Pilih tanggal absensi!', {
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
    
      const response = await axiosJWT.post(process.env.REACT_APP_LINK_API + 'student/absensi',
        {
          dateRangeSchedule, selectedSiswa
        },
        {
          headers: {
            Authorization: `Bearer ${tokenuser}`
          }
        });
      setDataSiswaAbsensi({
        ...dataSiswaAbsensi,
        data: response.data.data,
        header: response.data.header
      });

      
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=> {
    getStudents()
  },[])

  return (
    <>
      <NavbarApp />
      <div className="container">
        <div className="card mt-5">
          <div className="card-header">
            Data Absen
          </div>
          <div className="card-body">
            <div className="m-3">

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
                  <button className='btn btn-success' onClick={searchAbsensi}><FontAwesomeIcon icon="search" /> Cari Data</button>
                </div>
              </div>

              {/* 
                    Tabel hasil cari
              */}



              {/* 
                  End tabel hasil cari
              */}

            </div>
          </div>
        </div>
      </div>
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

export default Absen;