import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { API_BASE_URL } from "../config";

export default function Formulario() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    job: "",
    marital: "",
    education: "",
    default: "",
    balance: "",
    housing: "",
    loan: "",
    contact: "",
    day: "",
    month: "",
    duration: "",
    campaign: "",
    pdays: "",
    previous: "",
    poutcome: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      age: Number(formData.age),
      job: formData.job,
      marital: formData.marital,
      education: formData.education,
      default: formData.default,
      balance: Number(formData.balance),
      housing: formData.housing,
      loan: formData.loan,
      contact: formData.contact,
      day: Number(formData.day),
      month: formData.month,
      duration: Number(formData.duration),
      campaign: Number(formData.campaign),
      pdays: Number(formData.pdays),
      previous: Number(formData.previous),
      poutcome: formData.poutcome,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en predicción:", errorData);
        throw new Error("Error en la predicción. Revisa los campos.");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);
      setResult(data);

      // 🔹 Registrar resultado en historial, pero SIN redirigir todavía
      await fetch(`${API_BASE_URL}/api/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ts: new Date().toISOString(),
          metrics: data.metrics || {},
        }),
      });

      console.log("✅ Métrica registrada en historial");
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">FORMULARIO DE PREDICCIÓN</h1>
          <p className="dashboard-description">
            Ingresa los datos solicitados para predecir si el solicitante es
            apto para recibir el crédito.
          </p>
        </div>
        <div className="header-buttons">
          <button className="primary-button" onClick={() => navigate("/")}>
            Dashboard
          </button>
          <button
            className="primary-button"
            onClick={() => navigate("/historial")}
          >
            Historial
          </button>
        </div>
      </header>

      {/* Formulario */}
      <form className="formulario" onSubmit={handleSubmit}>
        {/* 🔹 Todos los campos quedan igual que antes */}
        {/* Edad */}
        <div className="form-group">
          <label>Edad:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        {/* Ocupación */}
        <div className="form-group">
          <label>Ocupación:</label>
          <select
            name="job"
            value={formData.job}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="admin.">Administrativo</option>
            <option value="blue-collar">Obrero</option>
            <option value="entrepreneur">Emprendedor</option>
            <option value="housemaid">Empleado doméstico</option>
            <option value="management">Gerente</option>
            <option value="retired">Jubilado</option>
            <option value="self-employed">Trabajador independiente</option>
            <option value="services">Servicios</option>
            <option value="student">Estudiante</option>
            <option value="technician">Técnico</option>
            <option value="unemployed">Desempleado</option>
            <option value="unknown">Desconocido</option>
          </select>
        </div>

        {/* Estado civil */}
        <div className="form-group">
          <label>Estado civil:</label>
          <select
            name="marital"
            value={formData.marital}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="single">Soltero(a)</option>
            <option value="married">Casado(a)</option>
            <option value="divorced">Divorciado(a)</option>
          </select>
        </div>

        {/* Educación */}
        <div className="form-group">
          <label>Nivel educativo:</label>
          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="primary">Primaria</option>
            <option value="secondary">Secundaria</option>
            <option value="tertiary">Universidad</option>
            <option value="unknown">Desconocido</option>
          </select>
        </div>

        {/* Tiene deuda en mora */}
        <div className="form-group">
          <label>¿Tiene deudas en mora?</label>
          <select
            name="default"
            value={formData.default}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Balance */}
        <div className="form-group">
          <label>Saldo promedio anual (en euros):</label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            required
          />
        </div>

        {/* Crédito hipotecario */}
        <div className="form-group">
          <label>¿Tiene crédito hipotecario?</label>
          <select
            name="housing"
            value={formData.housing}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Préstamo personal */}
        <div className="form-group">
          <label>¿Tiene préstamo personal?</label>
          <select
            name="loan"
            value={formData.loan}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Medio de contacto */}
        <div className="form-group">
          <label>Medio de contacto:</label>
          <select
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="cellular">Celular</option>
            <option value="telephone">Teléfono fijo</option>
            <option value="unknown">Desconocido</option>
          </select>
        </div>

        {/* Día de contacto */}
        <div className="form-group">
          <label>Día del último contacto:</label>
          <input
            type="number"
            name="day"
            value={formData.day}
            onChange={handleChange}
            required
          />
        </div>

        {/* Mes de contacto */}
        <div className="form-group">
          <label>Mes del último contacto:</label>
          <select
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            {[
              "jan",
              "feb",
              "mar",
              "apr",
              "may",
              "jun",
              "jul",
              "aug",
              "sep",
              "oct",
              "nov",
              "dec",
            ].map((m) => (
              <option key={m} value={m}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Duración */}
        <div className="form-group">
          <label>Duración de la llamada (segundos):</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>

        {/* Campaña */}
        <div className="form-group">
          <label>Número de contactos durante la campaña actual:</label>
          <input
            type="number"
            name="campaign"
            value={formData.campaign}
            onChange={handleChange}
            required
          />
        </div>

        {/* Días previos */}
        <div className="form-group">
          <label>Días desde el último contacto previo:</label>
          <input
            type="number"
            name="pdays"
            value={formData.pdays}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contactos previos */}
        <div className="form-group">
          <label>Número de contactos anteriores:</label>
          <input
            type="number"
            name="previous"
            value={formData.previous}
            onChange={handleChange}
            required
          />
        </div>

        {/* Resultado anterior */}
        <div className="form-group">
          <label>Resultado de la campaña anterior:</label>
          <select
            name="poutcome"
            value={formData.poutcome}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una opción</option>
            <option value="success">Éxito</option>
            <option value="failure">Fracaso</option>
            <option value="other">Otro</option>
            <option value="unknown">Desconocido</option>
          </select>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Calculando..." : "Predecir"}
        </button>
      </form>

      {/* Resultados */}
      {error && <p className="error-message">❌ {error}</p>}

      {result && (
        <div className="resultado mt-6">
          <h2 className="text-xl font-bold mb-2 text-blue-800">
            Resultado de la Predicción
          </h2>
          <div
            className={`p-4 rounded-2xl shadow-md border ${
              result.Prediction === "yes"
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            }`}
          >
            <p className="text-lg font-semibold">
              {result.Prediction === "yes"
                ? "✅ Candidato para préstamo"
                : "❌ No candidato para préstamo"}
            </p>

            {result.Probability_yes !== undefined && (
              <p className="text-gray-700 mt-2">
                Probabilidad de aceptación:{" "}
                <span className="font-bold text-blue-700">
                  {(result.Probability_yes * 100).toFixed(2)}%
                </span>
              </p>
            )}

            {result.Modelo && (
              <p className="text-sm text-gray-600 mt-1 italic">
                Modelo utilizado: {result.Modelo}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
