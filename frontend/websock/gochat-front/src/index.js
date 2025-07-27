import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import Layout from './pages/layout';
import Home from './pages/home'
import Auth from './pages/auth'
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './utils/usercontext';
import Dash from './pages/userdashboard'
import WSChat from './pages/wschat';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="auth" element={<Auth />} />
            <Route path="dash" element={<Dash />} />
            <Route path="ch/:hubId" element={<WSChat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
