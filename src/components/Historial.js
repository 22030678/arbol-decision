import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { useLocation } from "react-router-dom";

export default function Historial() {
  const [metricsList, setMetricsList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMetrics = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://bank-marketing-ml-mvc.onrender.com/api/metrics?page=${pageNumber}&limit=${limit}`
      );

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const res = await response.json();

      if (res && Array.isArray(res.items)) {
        setMetricsList(res.items);
        setTotalPages(res.pages || 1);
      } else if (Array.isArray(res)) {
        setMetricsList(res);
        setTotalPages(1);
      } else {
        setMetricsList([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error al obtener historial:", err);
      setError(err.message);
      setMetricsList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [limit]);

const location = useLocation();

useEffect(() => {
  fetchMetrics(page);
}, [page, location.state?.refresh, fetchMetrics]);

  const getColor = (metric, value) => {
    const thresholds = {
      accuracy: [0.8, 0.9],
      precision: [0.4, 0.7],
      recall: [0.5, 0.8],
      f1: [0.5, 0.8],
      roc_auc: [0.7, 0.9],
      average_precision: [0.5, 0.8],
    };

    const [low, high] = thresholds[metric] ?? [0, 1];
    if (value == null || Number.isNaN(Number(value))) return "";
    if (value >= high) return "metric-good";
    if (value >= low) return "metric-mid";
    return "metric-bad";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">HISTORIAL DE MÉTRICAS</h1>
          <p className="dashboard-description">
            Consulta las métricas de tus ejecuciones anteriores del modelo de decisión.
          </p>
        </div>
        <div className="header-buttons">
          <button className="view-history-btn" onClick={() => navigate("/")}>
            Dashboard
          </button>
          <button
            onClick={() => navigate("/formulario")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Formulario
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Cargando historial...</p>
      ) : error ? (
        <p className="text-center text-red-600">
          Error cargando historial: {error}
        </p>
      ) : (
        <>
          <div className="metrics-table-container">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Precisión</th>
                  <th>Recall</th>
                  <th>Exactitud</th>
                  <th>F1-Score</th>
                  <th>ROC AUC</th>
                  <th>Average Precision</th>
                </tr>
              </thead>
              <tbody>
                {metricsList.length > 0 ? (
                  metricsList.map((item) => {
                    const m = item.metrics ?? {};
                    return (
                      <tr key={item._id || item.run_id}>
                        <td>{new Date(item.ts).toLocaleString()}</td>
                        <td className={getColor("precision", m.precision)}>
                          {m.precision != null ? m.precision.toFixed(3) : "--"}
                        </td>
                        <td className={getColor("recall", m.recall)}>
                          {m.recall != null ? m.recall.toFixed(3) : "--"}
                        </td>
                        <td className={getColor("accuracy", m.accuracy)}>
                          {m.accuracy != null ? m.accuracy.toFixed(3) : "--"}
                        </td>
                        <td className={getColor("f1", m.f1)}>
                          {m.f1 != null ? m.f1.toFixed(3) : "--"}
                        </td>
                        <td className={getColor("roc_auc", m.roc_auc)}>
                          {m.roc_auc != null ? m.roc_auc.toFixed(3) : "--"}
                        </td>
                        <td className={getColor(
                          "average_precision",
                          m.average_precision
                        )}>
                          {m.average_precision != null
                            ? m.average_precision.toFixed(3)
                            : "--"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7">No hay datos para mostrar</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pagination"
            role="navigation"
            aria-label="Paginación del historial"
          >
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
