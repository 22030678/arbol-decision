import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Dashboard() {
  const [metricsList, setMetricsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const rocRef = useRef(null);
  const prRef = useRef(null);
  const rocChart = useRef(null);
  const prChart = useRef(null);

  // ✅ Normaliza matriz de confusión
  const normalizeMatrix = (cm) => {
    if (!cm) return [[0, 0], [0, 0]];
    if (Array.isArray(cm) && Array.isArray(cm[0])) {
      return [
        [cm[0][0] ?? 0, cm[0][1] ?? 0],
        [cm[1]?.[0] ?? 0, cm[1]?.[1] ?? 0],
      ];
    }
    if (typeof cm === "object") {
      const tn = cm.tn ?? cm[0] ?? 0;
      const fp = cm.fp ?? cm[1] ?? 0;
      const fn = cm.fn ?? cm[2] ?? 0;
      const tp = cm.tp ?? cm[3] ?? 0;
      return [[tn, fp], [fn, tp]];
    }
    return [[0, 0], [0, 0]];
  };

  // ✅ Carga de métricas
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/metrics/latest`);
        if (!res.ok) throw new Error("Error en /latest");
        const data = await res.json();
        if (Array.isArray(data)) setMetricsList(data);
        else if (data.items) setMetricsList(data.items);
        else setMetricsList([data]);
      } catch {
        try {
            const fallback = await fetch(`${API_BASE_URL}/api/metrics`);
            const fdata = await fallback.json();
            setMetricsList(Array.isArray(fdata) ? fdata : fdata.items ?? [fdata]);
        } catch (e) {
            console.error("Error cargando métricas:", e);
            setMetricsList([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ Gráficas ROC y PR con limpieza
  useEffect(() => {
    if (!metricsList.length) return;
    const metrics = metricsList[0].metrics ?? metricsList[0];

    // 🔹 Limpiar gráficos previos
    if (rocChart.current) rocChart.current.destroy();
    if (prChart.current) prChart.current.destroy();

    // 🔹 ROC Curve
    const rocCtx = rocRef.current?.getContext("2d");
    if (rocCtx) {
      rocChart.current = new Chart(rocCtx, {
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
          plugins: { legend: { display: false } },
          scales: {
            x: { title: { display: true, text: "False Positive Rate" } },
            y: { title: { display: true, text: "True Positive Rate" } },
          },
        },
      });
    }

    // 🔹 Precision-Recall Curve
    const prCtx = prRef.current?.getContext("2d");
    if (prCtx) {
      prChart.current = new Chart(prCtx, {
        type: "line",
        data: {
          labels: Array.from({ length: 11 }, (_, i) => i / 10),
          datasets: [
            {
              label: "Precision-Recall",
              data: [
                { x: 1, y: metrics.precision ?? 0 },
                { x: metrics.recall ?? 0, y: metrics.precision ?? 0 },
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
          plugins: { legend: { display: false } },
          scales: {
            x: { title: { display: true, text: "Recall" } },
            y: { title: { display: true, text: "Precision" } },
          },
        },
      });
    }

    // 🔹 Limpieza al desmontar
    return () => {
      if (rocChart.current) rocChart.current.destroy();
      if (prChart.current) prChart.current.destroy();
    };
  }, [metricsList]);

  if (loading)
    return <div className="text-center mt-10">Cargando métricas...</div>;
  if (!metricsList.length)
    return (
      <div className="text-center mt-10">
        No hay métricas disponibles
      </div>
    );

  // Usa el primer item (el más reciente) para el dashboard
  const current = metricsList[0];
  const metrics = current.metrics ?? current;
  const matrix = normalizeMatrix(metrics.confusion_matrix);

  return (
    <div className="dashboard-container">
      {/* 🌟 Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">ÁRBOL DE DECISIONES</h1>
          <p className="dashboard-description">
            Análisis de rendimiento del modelo de Machine Learning.
          </p>
        </div>
        <div className="header-buttons">
          <button onClick={() => navigate("/historial")}>
            Historial
          </button>
          <button
            onClick={() => navigate("/formulario")}
            className="primary-button"
          >
            Formulario
          </button>
        </div>
      </div>

      {/* 📋 Tarjetas de métricas (SEPARADAS) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Precisión</h3>
          <div className="metric-value">
            {metrics.precision ? (metrics.precision * 100).toFixed(2) + "%" : "--"}
          </div>
          <p>Proporción de predicciones positivas correctas</p>
        </div>

        <div className="metric-card">
          <h3>Recall</h3>
          <div className="metric-value">
            {metrics.recall ? (metrics.recall * 100).toFixed(2) + "%" : "--"}
          </div>
          <p>Proporción de casos positivos identificados</p>
        </div>

        <div className="metric-card">
          <h3>Accuracy</h3>
          <div className="metric-value">
            {metrics.accuracy ? (metrics.accuracy * 100).toFixed(2) + "%" : "--"}
          </div>
          <p>Proporción total de predicciones correctas</p>
        </div>

        <div className="metric-card">
          <h3>F1-Score</h3>
          <div className="metric-value">
            {metrics.f1 ? metrics.f1.toFixed(3) : "--"}
          </div>
          <p>Media armónica entre precisión y recall</p>
        </div>
      </div>

      {/* 🔢 Matriz de confusión */}
      <div className="confusion-matrix">
        <h2>Matriz de Confusión</h2>
        <div className="matrix-grid">
          <div className="matrix-card">
            <h3>TN</h3>
            <div className="matrix-value">{matrix[0][0]}</div>
          </div>
          <div className="matrix-card">
            <h3>FP</h3>
            <div className="matrix-value">{matrix[0][1]}</div>
          </div>
          <div className="matrix-card">
            <h3>FN</h3>
            <div className="matrix-value">{matrix[1][0]}</div>
          </div>
          <div className="matrix-card">
            <h3>TP</h3>
            <div className="matrix-value">{matrix[1][1]}</div>
          </div>
        </div>
      </div>


      {/* Gráficas */}
      <div className="chart-section">
        <div className="chart-card">
          <h2>Curva ROC</h2>
          <canvas ref={rocRef}></canvas>
        </div>
        <div className="chart-card">
          <h2>Curva Precision-Recall</h2>
          <canvas ref={prRef}></canvas>
        </div>
      </div>

      {/* Resumen de Rendimiento */}
      <div className="performance-summary">
        <h2>Resumen de Rendimiento</h2>
        <div className="metrics-grid" style={{ marginBottom: 0 }}>

          <div className="metric-card">
            <h3>ROC AUC</h3>
            <div className="metric-value">
              {metrics.roc_auc ? metrics.roc_auc.toFixed(6) : "--"}
            </div>
            <p>Área bajo curva ROC</p>
          </div>

          <div className="metric-card">
            <h3>Average Precision</h3>
            <div className="metric-value">
              {metrics.average_precision
                ? metrics.average_precision.toFixed(6)
                : "--"}
            </div>
            <p>Área bajo curva PR</p>
          </div>

          <div className="metric-card">
            <h3>Decision Threshold</h3>
            <div className="metric-value">
              {metrics.decision_threshold
                ? metrics.decision_threshold.toFixed(6)
                : "--"}
            </div>
            <p>Umbral con mejor balance entre precisión y recall</p>
          </div>

        </div>
      </div>
      
    </div>
  );
}