import React from "react";
import "./styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          Krishi AI
        </a>
        <div className="navbar-links">
            <button>   <a href="/" className="nav-link">

Home
</a></button>
       
          <button>          <a href="#tools" className="nav-link">
            Tools
          </a></button>
          <button>          <a href="/about" className="nav-link">
            About Us
          </a></button>


         <button> <a href="/contact" className="nav-link">
            Contact
          </a></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;