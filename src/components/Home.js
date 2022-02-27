import React, {useState, useEffect} from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
// import {useNavigate} from "react-router-dom";
import NavbarApp from './partial/NavbarApp';
import {useSelector, useDispatch} from "react-redux";
import {update} from "../features/userSlice";
// import {AxiosJWT} from "./partial/AxiosInterceptors"

function Home() {
    const dispatch = useDispatch();
    const {nameuser, emailuser, tokenuser,tokenexpire} = useSelector(state => state.user);

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
    const getUsers = async () => {
        //console.log(axiosJWT)
        try {
            const response = await axiosJWT.get(process.env.REACT_APP_LINK_API+'users',{
                headers: {
                    Authorization: `Bearer ${tokenuser}`
                }
            })
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

  return (
      <div>
          <NavbarApp />
          <h1>Hello {nameuser}</h1>
          <p>{emailuser}</p>

          <button className='btn btn-primary' onClick={getUsers}>Get User</button>
      </div>
  )
}

export default Home;
