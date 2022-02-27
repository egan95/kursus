import React,{useEffect, useState} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSelector, useDispatch} from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import parse from "html-react-parser"

import {update} from "../features/userSlice";
import NavbarApp from './partial/NavbarApp';
import Table from './partial/Table'

function Siswa() {
// get refresh token
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
  const [dataSiswa, setDataSiswa] = useState([]);
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
        Header: 'Kursus',
        Cell: ({ row }) => {
            let courseName = `-`;
            if(row.original.course_histories.length > 0){
              courseName = row.original.course_histories[0].course.name
              courseName += `<br> <span class="badge bg-primary">Level ${row.original.course_histories[0].level}</span>` 
            }
            return (<span>{parse(courseName)}</span>)
        }
      },
      {
        Header: 'Tanggal Daftar',
        accessor: 'join_date',
      },
      {
        Header: 'Orang tua',
        accessor: 'parent',
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div className="btn-group" role="group">
            <button type="button" className="btn btn-primary btn-sm" onClick={()=> updateSiswa(row.original)}>Edit</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteSiswa(row.original)}>Hapus</button>
          </div>
        )
      }
    ],
    []
  );
  
  const getStudents = async () => {
    try {
      const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'students',{
            headers: {
                Authorization: `Bearer ${tokenuser}`
            }
        });
      setDataSiswa(response.data.data)
    } catch (error) {
        console.log(error)
    }
  }

  const updateSiswa = (item) => {
    navigate('/siswa/update/'+item.id);
  }

  const deleteSiswa = (item) => {
    MySwal.fire({
      icon: "warning",
      title: "Konfirmasi",
      html: `Hapus data siswa <b>${item.name}</b> ?`,
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
            await axiosJWT.delete(process.env.REACT_APP_LINK_API+'students/'+item.id,{
              headers: {
                  Authorization: `Bearer ${tokenuser}`
              }
          });
          getStudents();
          return MySwal.fire({
            icon: "success",
            title: "Sukses",
            html: `Berhasil menghapus data siswa!`,
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

  useEffect(()=> {
    getStudents()
  },[])

  return (
      <>
        <NavbarApp/>
        <div className="container">
        <div className="card mt-5">
          <div className="card-header">
            Data Siswa
          </div>
          <div className="card-body">
            <div className='m-3'>
              <div className="row">
                <div className="col-md-6 col-xs-12">
                <Link to="/siswa/create" className="btn btn-success mb-2">Tambah Siswa</Link>
                </div>
              </div>
              <Table columns={columns} data={dataSiswa}/>
            </div>
          </div>
        </div>
        </div>
      </>
  );
}

export default Siswa;
