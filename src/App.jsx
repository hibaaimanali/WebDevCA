import { useState } from "react";
import "./App.css";

const CATEGORIES = [
  { label: "Underweight", max: 18.5,     color: "#185FA5", textColor: "#0C447C", bg: "#dbeafe", border: "#93c5fd", pill: "#2563eb", dot: "#3b82f6", icon: "🌊" },
  { label: "Normal weight", max: 25.0,   color: "#0F6E56", textColor: "#065f46", bg: "#d1fae5", border: "#6ee7b7", pill: "#059669", dot: "#10b981", icon: "✅" },
  { label: "Overweight", max: 30.0,      color: "#b45309", textColor: "#92400e", bg: "#fef3c7", border: "#fcd34d", pill: "#d97706", dot: "#f59e0b", icon: "⚠️" },
  { label: "Obese", max: Infinity,       color: "#b91c1c", textColor: "#7f1d1d", bg: "#fee2e2", border: "#fca5a5", pill: "#dc2626", dot: "#ef4444", icon: "🔴" },
];

function getCategory(bmi) {
  return CATEGORIES.find((c) => bmi < c.max);
}

function calcBMI(unit, weight, height) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h) return null;
  if (unit === "metric") {
    const hm = h / 100;
    return w / (hm * hm);
  }
  return (703 * w) / (h * h);
}

function validate(unit, weight, height) {
  const errors = {};
  const w = parseFloat(weight);
  const h = parseFloat(height);

  if (weight === "")        errors.weight = "Weight is required.";
  else if (isNaN(w) || w <= 0)                           errors.weight = "Enter a valid positive number.";
  else if (unit === "metric" && w > 650)                 errors.weight = "Enter a realistic weight (≤ 650 kg).";
  else if (unit === "imperial" && w > 1400)              errors.weight = "Enter a realistic weight (≤ 1400 lbs).";

  if (height === "")        errors.height = "Height is required.";
  else if (isNaN(h) || h <= 0)                           errors.height = "Enter a valid positive number.";
  else if (unit === "metric" && (h < 50 || h > 300))    errors.height = "Enter height between 50–300 cm.";
  else if (unit === "imperial" && (h < 20 || h > 120))  errors.height = "Enter height between 20–120 in.";

  return errors;
}

export default function BMICalculator() {
  const [unit, setUnit]       = useState("metric");
  const [weight, setWeight]   = useState("");
  const [height, setHeight]   = useState("");
  const [bmi, setBmi]         = useState(null);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const weightLabel       = unit === "metric" ? "Weight (kg)"  : "Weight (lbs)";
  const heightLabel       = unit === "metric" ? "Height (cm)"  : "Height (in)";
  const weightPlaceholder = unit === "metric" ? "e.g. 70"      : "e.g. 154";
  const heightPlaceholder = unit === "metric" ? "e.g. 175"     : "e.g. 69";

  const handleUnitSwitch = (newUnit) => {
    setUnit(newUnit);
    setWeight(""); setHeight(""); setBmi(null); setErrors({}); setTouched({});
  };

  const handleCalculate = () => {
    setTouched({ weight: true, height: true });
    const errs = validate(unit, weight, height);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { setBmi(null); return; }
    setBmi(calcBMI(unit, weight, height));
  };

  const handleReset = () => {
    setWeight(""); setHeight(""); setBmi(null); setErrors({}); setTouched({});
  };

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
    if (touched.weight) {
      const errs = validate(unit, e.target.value, height);
      setErrors((prev) => ({ ...prev, weight: errs.weight }));
    }
  };

  const handleHeightChange = (e) => {
    setHeight(e.target.value);
    if (touched.height) {
      const errs = validate(unit, weight, e.target.value);
      setErrors((prev) => ({ ...prev, height: errs.height }));
    }
  };

  const category     = bmi ? getCategory(bmi) : null;
  const gaugePercent = bmi ? Math.min(Math.max(((bmi - 10) / 35) * 100, 2), 100) : 0;

  return (
    <div className="bmi-wrapper">

      {/* Header */}
      <div className="bmi-header">
        <div className="bmi-header-icon">⚖️</div>
        <h1>BMI Calculator</h1>
        <p>Body Mass Index · WHO standard categories</p>
      </div>

      {/* Unit toggle */}
      <div className="bmi-toggle">
        {["metric", "imperial"].map((u) => (
          <button
            key={u}
            onClick={() => handleUnitSwitch(u)}
            className={`bmi-toggle-btn${unit === u ? " active" : ""}`}
          >
            {u === "metric" ? "🌍 Metric (kg / cm)" : "🇺🇸 Imperial (lbs / in)"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="bmi-fields">
        {[
          {
            field: "weight",
            label: weightLabel,
            placeholder: weightPlaceholder,
            value: weight,
            onChange: handleWeightChange,
            onBlur: () => {
              setTouched((p) => ({ ...p, weight: true }));
              const e = validate(unit, weight, height);
              setErrors((p) => ({ ...p, weight: e.weight }));
            },
          },
          {
            field: "height",
            label: heightLabel,
            placeholder: heightPlaceholder,
            value: height,
            onChange: handleHeightChange,
            onBlur: () => {
              setTouched((p) => ({ ...p, height: true }));
              const e = validate(unit, weight, height);
              setErrors((p) => ({ ...p, height: e.height }));
            },
          },
        ].map(({ field, label, placeholder, value, onChange, onBlur }) => (
          <div key={field} className="bmi-field">
            <label htmlFor={field}>{label}</label>
            <input
              id={field}
              type="number"
              min="0"
              step="0.1"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              className={errors[field] ? "error" : ""}
            />
            {errors[field] && (
              <p className="bmi-error-msg">⚠️ {errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="bmi-actions">
        <button className="bmi-btn-calculate" onClick={handleCalculate}>
          Calculate BMI
        </button>
        <button className="bmi-btn-reset" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Result card */}
      {bmi && category && (
        <div
          className="bmi-result"
          style={{ borderColor: category.border, background: category.bg }}
        >
          <div className="bmi-result-top">
            <div>
              <div className="bmi-result-sublabel" style={{ color: category.textColor }}>
                Your BMI
              </div>
              <div className="bmi-result-score" style={{ color: category.color }}>
                {bmi.toFixed(1)}
              </div>
            </div>
            <div className="bmi-result-pill" style={{ background: category.pill }}>
              {category.icon} {category.label}
            </div>
          </div>

          {/* Gauge */}
          <div className="bmi-gauge-track">
            <div className="bmi-gauge-fill" />
            {[24, 43, 57].map((p) => (
              <div key={p} className="bmi-gauge-divider" style={{ left: `${p}%` }} />
            ))}
            <div
              className="bmi-gauge-indicator"
              style={{
                left: `calc(${gaugePercent}% - 7px)`,
                borderColor: category.color,
                boxShadow: `0 0 0 2px ${category.bg}`,
              }}
            />
          </div>
          <div className="bmi-gauge-labels">
            <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45+</span>
          </div>
        </div>
      )}

      {/* WHO reference table */}
      <div>
        <p className="bmi-table-heading">WHO Categories</p>
        <div className="bmi-table">
          {CATEGORIES.map((c) => {
            const isActive = bmi && getCategory(bmi).label === c.label;
            return (
              <div
                key={c.label}
                className={`bmi-table-row${isActive ? " active" : ""}`}
                style={isActive ? { "--row-bg": c.bg, "--row-border": c.border } : {}}
              >
                <div className="bmi-table-row-left">
                  <div className="bmi-dot" style={{ background: c.dot }} />
                  <span className="bmi-table-row-label">{c.label}</span>
                </div>
                <span
                  className="bmi-range-badge"
                  style={isActive
                    ? { color: c.pill, borderColor: c.border }
                    : { color: c.pill }
                  }
                >
                  {c.label === "Underweight"   ? "< 18.5"
                  : c.label === "Normal weight" ? "18.5 – 24.9"
                  : c.label === "Overweight"    ? "25.0 – 29.9"
                  :                              "≥ 30.0"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}