import React, { useState } from "react";
import axios from "axios";

function CurrencyConverter() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    amount: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currencyCodes = ["USD", "EUR", "GBP", "GHS", "JPY", "CAD", "BSD"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.amount) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (formData.amount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ✅ Ruta relativa - funciona en dev y producción
      const response = await axios.post("/api/convert", {
        from: formData.from,
        to: formData.to,
        amount: parseFloat(formData.amount)
      });
      
      console.log("✅ Respuesta:", response.data);
      setResult(response.data);
      
    } catch (error) {
      console.error("❌ Error:", error);
      
      if (error.response) {
        setError(
          error.response.data?.message || 
          error.response.data?.details ||
          `Error: ${error.response.status}`
        );
      } else if (error.request) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(error.message || "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Global Currency Converter</h1>
        <p>Real-time currency conversions worldwide</p>
      </section>
      
      <section className="converter">
        <form onSubmit={handleSubmit}>
          <select
            name="from"
            value={formData.from}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <option value="">Select From Currency</option>
            {currencyCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          
          <select
            name="to"
            value={formData.to}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <option value="">Select To Currency</option>
            {currencyCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          
          <input
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            type="number"
            disabled={loading}
            required
            min="0.01"
            step="0.01"
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Converting..." : "Convert"}
          </button>
        </form>
        
        {result && (
          <div className="result">
            <p>
              {result.amount} {result.base} = {result.convertedAmount} {result.target}
            </p>
            <p>Rate: 1 {result.base} = {result.conversionRate} {result.target}</p>
          </div>
        )}
        
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}

export default CurrencyConverter;