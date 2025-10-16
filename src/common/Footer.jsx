import React from "react";

const Footer = () => {
  return (
    <footer
      className="text-center text-white mt-5 p-4"
      style={{ backgroundColor: "#1B3C53" }}
    >
      <p className="mb-0">
        &copy; {new Date().getFullYear()} Expense Manager. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
