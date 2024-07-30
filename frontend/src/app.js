// frontend/src/app.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import EmailPage from './emailPage'; // Import your HomePage component
import LoginPage from './loginPage'; // Import your LoginPage component


const App = () => {

  return (

    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/emails" element={<EmailPageWrapper />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>

  );
};

const EmailPageWrapper = (props) => {
  const queryParams = new URLSearchParams(window.location.search);
  const loggedIn = queryParams.get('loggedIn');

  return loggedIn ? <EmailPage /> : <Navigate to="/" />;
}

export default App;
