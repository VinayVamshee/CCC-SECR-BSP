import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import NavigationMenu from './Components/NavigationMenu';
import './Components/style.css';
import Contact from './Components/Contact';
import Notice from './Components/Notice';
import Books from './Components/Books';
import Gallery from './Components/Gallery';
import Videos from "./Components/Videos";
import { jwtDecode } from 'jwt-decode';
import Admin from "./Components/Admin";
import { Analytics } from '@vercel/analytics/react';


const ThemeStored = () => {
  const storedTheme = localStorage.getItem('Theme');
  return storedTheme ? JSON.parse(storedTheme) : 'light-theme';
};


function App() {

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
      }
    }
  };

  checkTokenExpiration();

  // eslint-disable-next-line
  const [Theme, setTheme] =  useState(() => ThemeStored());;
  useEffect(() => {
    localStorage.setItem('Theme', JSON.stringify(Theme))
  }, [Theme]);

  return (
    <div className={`App ${Theme}`}>
      <Router>
        <NavigationMenu />
  <Analytics />
        <Routes>
          <Route path='/' exact element={<Home />} />
          <Route path='/Contact' element={<Contact/>}/>
          <Route path='/Notice' element={<Notice/>}/>
          <Route path='/Books' element={<Books/>}/>
          <Route path='/Gallery' element={<Gallery/>}/>
          <Route path='/Videos' element={<Videos/>}/>
          <Route path='/Admin' element={<Admin/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
