import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Dashboard() {
  const [metricsData, setMetricsData] = useState(null);
  const navigate = useNavigate();

  const rocRef = useRef(null);
  const prRef = useRef(null);

  // 🔹 Cargar métricas desde la API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metrics`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setMetricsData(data.items[0]);
        }
      })
      .catch((err) => console.error("Error al cargar métricas:", err));
  }, []);

  // 🔹 Renderizar gráficas (ROC y Precision-Recall)
  useEffect(() => {
    if (!metricsData) return;

    // --- Curva ROC ---
    const rocCtx = rocRef.current.getContext("2d");
    if (rocCtx.chart) rocCtx.chart.destroy();
    rocCtx.chart = new Chart(rocCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 11 }, (_, i) => i / 10),
        datasets: [
          {
            label: "ROC Curve",
            data: [
              { x: 0, y: 0 },
              { x: 0.1, y: 0.4 },
              { x: 0.2, y: 0.6 },
              { x: 0.4, y: 0.75 },
              { x: 0.6, y: 0.85 },
              { x: 1, y: 1 },
            ],
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: "False Positive Rate" } },
          y: { title: { display: true, text: "True Positive Rate" } },
        },
      },
    });

    // --- Curva Precision-Recall ---
    const prCtx = prRef.current.getContext("2d");
    if (prCtx.chart) prCtx.chart.destroy();
    prCtx.chart = new Chart(prCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 11 }, (_, i) => i / 10),
        datasets: [
          {
            label: "Precision-Recall Curve",
            data: [
              { x: 1, y: metricsData.metrics.precision },
              { x: metricsData.metrics.recall, y: metricsData.metrics.precision },
              { x: 0, y: 0 },
            ],
            borderColor: "#16a34a",
            backgroundColor: "rgba(22,163,74,0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: "Recall" } },
          y: { title: { display: true, text: "Precision" } },
        },
      },
    });
  }, [metricsData]);

  if (!metricsData) {
    return <div className="text-center mt-10">Cargando métricas...</div>;
  }

  const { model_version, metrics } = metricsData;

  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <h1>ÁRBOL DE DECISIONES</h1>
          <p>
            Análisis de rendimiento del modelo de Machine Learning. 
            Versión: {model_version}
          </p>
        </div>
        <div className="header-buttons">
        <button onClick={() => navigate("/historial")}>Historial</button>
        <button onClick={() => navigate("/formulario")} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"> Formulario </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Precisión</h3>
          <div className="metric-value">
            {(metrics.precision * 100).toFixed(2)}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Proporción de predicciones positivas correctas
          </p>
        </div>
        <div className="metric-card">
          <h3>Recall</h3>
          <div className="metric-value">
            {(metrics.recall * 100).toFixed(2)}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Proporción de casos positivos identificados
          </p>
        </div>
        <div className="metric-card">
          <h3>Accuracy</h3>
          <div className="metric-value">
            {(metrics.accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Proporción total de predicciones correctas
          </p>
        </div>
        <div className="metric-card">
          <h3>F1-Score</h3>
          <div className="metric-value">{metrics.f1.toFixed(3)}</div>
          <p className="text-sm text-gray-500 mt-1">
            Media armónica entre precisión y recall
          </p>
        </div>
      </div>

      {/* Matriz de confusión */}
        <div className="confusion-matrix">
          <h2 className="section-title">Matriz de Confusión</h2>
          <div className="matrix-grid">
            <div className="matrix-card">
              <span className="matrix-value">{metrics.confusion_matrix[0][0]}</span>
              <span className="matrix-label">TN</span>
            </div>
            <div className="matrix-card">              
              <span className="matrix-value">{metrics.confusion_matrix[0][1]}</span>
              <span className="matrix-label">FP</span>
            </div>
            <div className="matrix-card">              
              <span className="matrix-value">{metrics.confusion_matrix[1][0]}</span>
              <span className="matrix-label">FN</span>
            </div>
            <div className="matrix-card">              
              <span className="matrix-value">{metrics.confusion_matrix[1][1]}</span>
              <span className="matrix-label">TP</span>
            </div>
          </div>
        </div>

      {/* Gráficas */}
      <div className="chart-section">
        <div className="chart-card">
          <h2>Curva ROC</h2>
          <canvas ref={rocRef}></canvas>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Área bajo la curva: {metrics.roc_auc.toFixed(3)}
          </p>
        </div>

        <div className="chart-card">
          <h2>Curva Precision-Recall</h2>
          <canvas ref={prRef}></canvas>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Media de precisión promedio: {metrics.average_precision.toFixed(3)}
          </p>
        </div>
      </div>

      {/* === Resumen de Rendimiento === */}
      <div className="confusion-matrix">
        <h2>Resumen de rendimiento</h2>
      <section className="metrics-grid">
        <div className="metric-card">
          <h3>AUC-ROC</h3>
          <p className="metric-value">{metrics.roc_auc.toFixed(3)}</p>
          Área bajo curva ROC
        </div>
        <div className="metric-card">
          <h3>Average Precision</h3>
          <p className="metric-value">{metrics.average_precision.toFixed(3)}</p>
          Área bajo curva PR
        </div>
        <div className="metric-card">
          <h3>Threshold Óptimo</h3>
          <p className="metric-value">
            {metrics.thresholds?.best_f1
              ? metrics.thresholds.best_f1.toFixed(2)
              : "--"}
          </p>
          Umbral con mejor balance entre precisión y recall
        </div>
      </section>
      </div>
    </div>
  );
}
