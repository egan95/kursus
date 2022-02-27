import React from 'react';
import {Navbar, Container, Nav, NavDropdown} from "react-bootstrap"
import axios from 'axios';
import {useNavigate, Link, useLocation} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux";
import {update} from "../../features/userSlice";


function NavbarApp() {
  const {emailuser} = useSelector(state => state.user);

  const location = useLocation();

  //destructuring pathname from location
  const { pathname } = location;

  //Javascript split method to get the name of the path in array
  const splitLocation = pathname.split("/");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = async() => {
    try {
      await axios.get(process.env.REACT_APP_LINK_API+'logout');
      dispatch(update({
        nameuser:'',
        emailuser:'',
        tokenexpire:'',
        tokenuser:0
      }))
      navigate('/login');
    } catch (error) {
        console.log('error logout',error);
    }
  }
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
    <Container fluid>
      <Navbar.Brand href="/">Kursus</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Link to="/" className={`nav-link${splitLocation[1] === "" ? " active" : ""}`}>Home</Link>
          <Link to="/siswa" className={`nav-link${splitLocation[1] === "siswa" ? " active" : ""}`}>Siswa</Link>
          <Link to="/guru" className={`nav-link${splitLocation[1] === "guru" ? " active" : ""}`}>Guru</Link>
          <Link to="/jadwal" className={`nav-link${splitLocation[1] === "jadwal" ? " active" : ""}`}>Jadwal</Link>
          <Link to="/absen" className={`nav-link${splitLocation[1] === "absen" ? " active" : ""}`}>Absen</Link>
          <Link to="/pembayaran" className={`nav-link${splitLocation[1] === "pembayaran" ? " active" : ""}`}>Pembayaran</Link>
          <NavDropdown title="Master" id="basic-nav-dropdown">
            <Link to="/kursus" className={`dropdown-item${splitLocation[1] === "kursus" ? " active" : ""}`}>Kursus</Link>
          </NavDropdown>
          <Link to="/user" className={`nav-link${splitLocation[1] === "user" ? " active" : ""}`}>User</Link>
          
        </Nav>
        <Nav>
          <NavDropdown title={emailuser} id="basic-nav-dropdown" >
            <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  );
}

export default NavbarApp;
