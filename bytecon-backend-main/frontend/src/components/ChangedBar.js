import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

import { ReactComponent as HouseIcon } from './house.svg';
import { ReactComponent as CalendarIcon } from './calendar.svg';
import { ReactComponent as PersonCircleIcon } from './person-circle.svg';
import { ReactComponent as CalendarPlusFillIcon } from './calendar-plus-fill.svg';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';

const Sidebar = () => {
  const [isNavVisible, setNavVisibility] = useState(true);
  const [activeLink, setActiveLink] = useState(null);

  const toggleNavbar = () => {
    setNavVisibility(!isNavVisible);
  };

  const handleLinkClick = (index) => {
    setActiveLink(index);
  };

  const links = [
    { name: 'Home', icon: <HouseIcon />, path:"/main"},
    { name: 'Calendar', icon: <CalendarIcon />, path:"/calendar" },
    { name: 'Profile', icon: <PersonCircleIcon />, path:"/profile" },
    { name: 'Create New Event', icon: <CalendarPlusFillIcon />, path:"/new-event" },
    { name: 'My Events', icon: <CalendarIcon/>, path: "/my-events"}
  ];

  const handleLogout = () => {
    if (Cookies.get('token')) {
      Cookies.remove('token'); 
    }

    if (Cookies.get('id')) {
      Cookies.remove('id');
    }
  }
  return (
    <div data-testid="sidebar" className="sidebar-container">
      <div id="body-pd" className={`body ${isNavVisible ? 'body-pd' : ''}`}>
        <div className={`l-navbar ${isNavVisible ? 'show' : ''}`} id="nav-bar">
          <nav className="nav">
            <div>
              <a id="title" className="nav_logo" style={{fontFamily: 'ArchivoBlack-Regular',}}>
                <span className="nav_logo-name" style={{ fontSize: '40px', letterSpacing: '3.5px', marginLeft: '-2px'}}>
                {isNavVisible ? 'BYTECON' : 'B'}
                    </span>
                </a>
              <div className="nav_list">
                {links.map((link, index) => (
                  <a
                    href={link.path}
                    key={link.name}
                    className={`nav_link ${activeLink === index ? 'active' : ''}`}
                    onClick={() => handleLinkClick(index)}
                  >
                    {link.icon}
                    {isNavVisible && <span className="nav_name">{link.name}</span>}
                  </a>
                ))}
              </div>
            </div>
            <a href="/home" className="nav_link" onClick={handleLogout}>
              <LogoutIcon className='nav_icon' />
              <span className="nav_name">Signout</span>
            </a>
          </nav>
        </div>
      </div>
      <button className={`btn btn-primary header_toggle ${isNavVisible ? 'l-2' : ''}`} onClick={toggleNavbar}>
        <i className={`bi ${isNavVisible ? 'bi-x' : 'bi-list'}`} id="header-toggle"></i>
      </button>
    </div>
  );
};

export default Sidebar;
