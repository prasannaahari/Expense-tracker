import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#1B3C53' }}>
        <a className="navbar-brand ms-5 fs-3 navbar-font" style={{ color: '#F9F3EF' }} href="#">
          EXPENSE TRACKER
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: 'white' }}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end me-5" id="navbarNav">
          <ul className="navbar-nav text-center">
            <li className="nav-item my-2 my-lg-0 mx-lg-2">
              <button
                type="button"
                className="btn btn-outline-light navbar-font"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item my-2 my-lg-0 mx-lg-2">
              <button
                type="button"
                className="btn btn-outline-light navbar-font"
                onClick={() => navigate('/budget')}
              >
                Budget
              </button>
            </li>
            <li className="nav-item my-2 my-lg-0 mx-lg-2">
              <button
                type="button"
                className="btn btn-outline-light navbar-font"
                onClick={() => navigate('/report')}
              >
                Report
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
