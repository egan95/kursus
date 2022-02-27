import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import "bootstrap/dist/css/bootstrap.css";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { store } from "./app/store";
import { Provider } from 'react-redux';

axios.defaults.withCredentials = true;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <App />
    </Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

