import axios from "axios"
import jwt_decode from "jwt-decode";
import {useDispatch, useSelector} from "react-redux";
import {update} from "../../features/userSlice";


// export const AxiosConfig = async (config) => {
//         const dispatch = useDispatch();
//         const {tokenexpire} = useSelector(state => state.user);
//         const currentDate = new Date();
//         if((tokenexpire * 1000) < currentDate.getTime()) {
//             const response = await axios.get(process.env.REACT_APP_LINK_API+'token');
//             config.headers.Authorization = `Bearer ${response.data.token}`;
//             const decoded = jwt_decode(response.data.token);
//             dispatch(update({
//                 // username:decoded.username,
//                 nameuser:decoded.name,
//                 emailuser:decoded.email,
//                 tokenexpire:decoded.exp,
//                 tokenuser:response.data.token
//               }))
//         }
//         return config;
//     }


const AxiosJWT = axios.create();
AxiosJWT.interceptors.request.use(async (config) => {
    console.log(config);
            /*
            const dispatch = useDispatch();
             const {tokenexpire} = useSelector(state => state.user);

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
            */
            
            return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
)


/*
const AxiosJWT = () => {
    const axiosJWT = axios.create();
    console.log(axiosJWT)
    const dispatch = useDispatch();
    const {tokenexpire} = useSelector(state => state.user);
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
    
}
*/

export {AxiosJWT}
