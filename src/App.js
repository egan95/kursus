
import {useEffect, useState} from 'react';
import axios from 'axios';
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";

import { Route, Routes, useNavigate, useLocation} from "react-router-dom"
import jwt_decode from "jwt-decode";
import {useDispatch} from "react-redux";
import {update} from "./features/userSlice";
import Siswa from './components/Siswa';
import Guru from './components/Guru';
import Jadwal from './components/Jadwal';
import Kursus from './components/Kursus';
import User from './components/User';
import SiswaForm from './components/SiswaForm';
import SiswaFormUpdate from './components/SiswaFormUpdate';
import Absen from './components/Absen';
import Pembayaran from './components/Pembayaran';


function App() {
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(()=> {
    if(location) {
      if(location.pathname !== '/register' && location.pathname !== '/login') {
        refreshToken();  
      } else {
        setChecking(false)
      }
    }      
},[]);

const refreshToken = async () => {
    try {
        const response = await axios.get(process.env.REACT_APP_LINK_API+'token');
        const decoded = jwt_decode(response.data.token);
        dispatch(update({
          // username:decoded.username,
          nameuser:decoded.name,
          emailuser:decoded.email,
          tokenexpire:decoded.exp,
          tokenuser:response.data.token
        }))
        setChecking(false)
    } catch (error) {
        setChecking(false)
        if(error.response) {
            navigate('/login');
        }
        navigate('/login');
    }
}
  return (
    <div>
      {!checking &&
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/siswa" element={<Siswa />} />
          <Route path="/siswa/create" element={<SiswaForm />} />
          <Route path="/siswa/update/:id" element={<SiswaFormUpdate />} />
          <Route path="/guru" element={<Guru />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/absen" element={<Absen />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/kursus" element={<Kursus />} />
          <Route path="/user" element={<User />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
    } 
    </div>
  );
}

export default App;
