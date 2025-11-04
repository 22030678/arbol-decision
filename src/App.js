// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Historial from "./components/Historial";
import Formulario from "./components/Formulario";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Dashboard />} />

        {/* Página del historial */}
        <Route path="/historial" element={<Historial />} />

        {/* Página del formulario */}
        <Route path="/formulario" element={<Formulario />} /> 
      </Routes>
    </Router>
  );
}

export default App;
