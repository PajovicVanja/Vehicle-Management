// frontend/src/components/VehicleSearchB.js
import React, { useState } from "react";
import browsee from '@browsee/web-sdk';
import "../CSS/ReserveVehicle.css"; // Reuse existing styles
import "../CSS/VersionB.css"; // Import Version B specific styles

// Helper for consistent field styling - Defined OUTSIDE to prevent re-render focus loss
const SearchField = ({ label, children }) => (
  <div className="search-field-b">
    <span className="search-label-b">{label}</span>
    {children}
  </div>
);

function VehicleSearchB({ filters, setFilters, onClear }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const set = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="search-container-b">
      {/* Basic Filters: Name, Color */}
      <div className="search-grid-b">
        <SearchField label="Name">
          <input
            className="search-input-b"
            type="text"
            value={filters.name || ""}
            onChange={set("name")}
            placeholder="Search by name..."
          />
        </SearchField>

        <SearchField label="Color">
          <input
            className="search-input-b"
            type="text"
            value={filters.color || ""}
            onChange={set("color")}
            placeholder="e.g. Red, Blue..."
          />
        </SearchField>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
                type="button"
                className="clear-btn"
                onClick={onClear}
            >
                Clear
            </button>
            <button
                type="button"
                className="advanced-toggle-btn"
                onClick={() => {
                    const newState = !showAdvanced;
                    setShowAdvanced(newState);
                    if (browsee && typeof browsee.addEvent === 'function') {
                        browsee.addEvent('Advanced_Filters_Toggle', { state: newState ? 'opened' : 'closed' });
                    }
                }}
            >
                {showAdvanced ? "Hide Filters" : "More Filters"}
            </button>
        </div>
      </div>

      {/* Advanced Filters: Engine, Year Min/Max, HP Min/Max */}
      {showAdvanced && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}> 
           <div className="search-grid-b">
            <SearchField label="Engine">
              <input
                className="search-input-b"
                type="text"
                value={filters.engine || ""}
                onChange={set("engine")}
                placeholder="e.g. V8..."
              />
            </SearchField>

            <SearchField label="Year (Min)">
                <input
                className="search-input-b"
                type="number"
                inputMode="numeric"
                value={filters.yearMin || ""}
                onChange={set("yearMin")}
                placeholder="Min Year"
                />
            </SearchField>

            <SearchField label="Year (Max)">
                <input
                className="search-input-b"
                type="number"
                inputMode="numeric"
                value={filters.yearMax || ""}
                onChange={set("yearMax")}
                placeholder="Max Year"
                />
            </SearchField>

            <SearchField label="HorsePower (Min)">
                <input
                className="search-input-b"
                type="number"
                inputMode="numeric"
                value={filters.hpMin || ""}
                onChange={set("hpMin")}
                placeholder="Min HP"
                />
            </SearchField>

            <SearchField label="HorsePower (Max)">
                <input
                className="search-input-b"
                type="number"
                inputMode="numeric"
                value={filters.hpMax || ""}
                onChange={set("hpMax")}
                placeholder="Max HP"
                />
            </SearchField>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleSearchB;
