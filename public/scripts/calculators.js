// ========== PIPE VELOCITY CALCULATOR ==========

/**
 * Initialize the pipe velocity calculator
 * Calculates: V = Q / A, where A = π(D/2)²
 */
function initializePipeVelocityCalculator() {
  const elements = {
    diameter: document.getElementById("pipeDiameter"),
    flow: document.getElementById("pipeFlow"),
    velocity: document.getElementById("pipeVelocity"),
    diameterUnit: document.getElementById("pipeDiameterUnit"),
    flowUnit: document.getElementById("pipeFlowUnit"),
    velocityUnit: document.getElementById("pipeVelocityUnit")
  };

  // Check if all elements exist
  if (!Object.values(elements).every(el => el)) {
    console.warn("Pipe velocity calculator elements not found");
    return;
  }

  // Initialize oldUnit storage
  elements.diameterUnit.dataset.oldUnit = elements.diameterUnit.value;
  elements.flowUnit.dataset.oldUnit = elements.flowUnit.value;
  elements.velocityUnit.dataset.oldUnit = elements.velocityUnit.value;

  let isUpdating = false;

  /**
   * Convert value to SI units for calculations
   */
  function toSI(value, fromUnit, type) {
    const siUnits = { length: "m", flow: "m^3/s", velocity: "m/s" };
    try {
      return convertUnit(fromUnit, siUnits[type], value);
    } catch {
      return value;
    }
  }

  /**
   * Convert value from SI units to target unit
   */
  function fromSI(value, toUnit, type) {
    const siUnits = { length: "m", flow: "m^3/s", velocity: "m/s" };
    try {
      return convertUnit(siUnits[type], toUnit, value);
    } catch {
      return value;
    }
  }

  /**
   * Calculate velocity from diameter and flow
   * V = Q / A, where A = π(D/2)²
   */
  function updateVelocity() {
    if (isUpdating) return;
    isUpdating = true;

    const D_val = parseFloat(elements.diameter.value);
    const Q_val = parseFloat(elements.flow.value);

    if (Number.isFinite(D_val) && Number.isFinite(Q_val) && D_val > 0) {
      const D_m = toSI(D_val, elements.diameterUnit.value, "length");
      const Q_m3s = toSI(Q_val, elements.flowUnit.value, "flow");
      const area_m2 = Math.PI * Math.pow(D_m / 2, 2);
      const V_m_s = Q_m3s / area_m2;
      elements.velocity.value = fromSI(V_m_s, elements.velocityUnit.value, "velocity").toFixed(4);
    }

    isUpdating = false;
  }

  /**
   * Calculate diameter from velocity and flow
   * D = 2√(Q / (πV))
   */
  function updateDiameter() {
    if (isUpdating) return;
    isUpdating = true;

    const V_val = parseFloat(elements.velocity.value);
    const Q_val = parseFloat(elements.flow.value);

    if (Number.isFinite(V_val) && Number.isFinite(Q_val) && V_val > 0) {
      const V_m_s = toSI(V_val, elements.velocityUnit.value, "velocity");
      const Q_m3s = toSI(Q_val, elements.flowUnit.value, "flow");
      const area_m2 = Q_m3s / V_m_s;
      const D_m = 2 * Math.sqrt(area_m2 / Math.PI);
      elements.diameter.value = fromSI(D_m, elements.diameterUnit.value, "length").toFixed(4);
    }

    isUpdating = false;
  }

  /**
   * Calculate flow from diameter and velocity
   * Q = V × A, where A = π(D/2)²
   */
  function updateFlow() {
    if (isUpdating) return;
    isUpdating = true;

    const D_val = parseFloat(elements.diameter.value);
    const V_val = parseFloat(elements.velocity.value);

    if (Number.isFinite(D_val) && Number.isFinite(V_val) && D_val > 0) {
      const D_m = toSI(D_val, elements.diameterUnit.value, "length");
      const V_m_s = toSI(V_val, elements.velocityUnit.value, "velocity");
      const area_m2 = Math.PI * Math.pow(D_m / 2, 2);
      const Q_m3s = area_m2 * V_m_s;
      elements.flow.value = fromSI(Q_m3s, elements.flowUnit.value, "flow").toFixed(4);
    }

    isUpdating = false;
  }

  /**
   * Handle diameter unit change
   */
  function handleDiameterUnitChange() {
    const oldUnit = elements.diameterUnit.dataset.oldUnit || elements.diameterUnit.value;
    const value = parseFloat(elements.diameter.value);
    
    if (Number.isFinite(value)) {
      const value_m = toSI(value, oldUnit, "length");
      elements.diameter.value = fromSI(value_m, elements.diameterUnit.value, "length").toFixed(4);
      updateVelocity();
    }
    
    elements.diameterUnit.dataset.oldUnit = elements.diameterUnit.value;
  }

  /**
   * Handle flow unit change
   */
  function handleFlowUnitChange() {
    const oldUnit = elements.flowUnit.dataset.oldUnit || elements.flowUnit.value;
    const value = parseFloat(elements.flow.value);
    
    if (Number.isFinite(value)) {
      const value_m3s = toSI(value, oldUnit, "flow");
      elements.flow.value = fromSI(value_m3s, elements.flowUnit.value, "flow").toFixed(4);
      updateVelocity();
    }
    
    elements.flowUnit.dataset.oldUnit = elements.flowUnit.value;
  }

  /**
   * Handle velocity unit change
   */
  function handleVelocityUnitChange() {
    const oldUnit = elements.velocityUnit.dataset.oldUnit || elements.velocityUnit.value;
    const value = parseFloat(elements.velocity.value);
    
    if (Number.isFinite(value)) {
      const value_m_s = toSI(value, oldUnit, "velocity");
      elements.velocity.value = fromSI(value_m_s, elements.velocityUnit.value, "velocity").toFixed(4);
      updateDiameter();
    }
    
    elements.velocityUnit.dataset.oldUnit = elements.velocityUnit.value;
  }

  // Event listeners for value inputs
  elements.diameter.addEventListener("input", updateVelocity);
  elements.flow.addEventListener("input", updateVelocity);
  elements.velocity.addEventListener("input", updateDiameter);

  // Event listeners for unit changes
  elements.diameterUnit.addEventListener("change", handleDiameterUnitChange);
  elements.flowUnit.addEventListener("change", handleFlowUnitChange);
  elements.velocityUnit.addEventListener("change", handleVelocityUnitChange);

  // Initialize
  updateVelocity();
}

// ========== CIRCLE AREA CALCULATOR ==========

/**
 * Initialize the circle area calculator
 * Calculates: A = π(D/2)²
 */
function initializeCircleAreaCalculator() {
  const elements = {
    diameter: document.getElementById("circleDiameter"),
    area: document.getElementById("circleArea"),
    diameterUnit: document.getElementById("circleDiameterUnit"),
    areaUnit: document.getElementById("circleAreaUnit")
  };

  // Check if all elements exist
  if (!Object.values(elements).every(el => el)) {
    console.warn("Circle area calculator elements not found");
    return;
  }

  // Initialize oldUnit storage
  elements.diameterUnit.dataset.oldUnit = elements.diameterUnit.value;
  elements.areaUnit.dataset.oldUnit = elements.areaUnit.value;

  /**
   * Calculate area from diameter
   * A = π(D/2)²
   */
  function updateArea() {
    const D_val = parseFloat(elements.diameter.value);
    if (!Number.isFinite(D_val)) return;

    try {
      // Convert diameter to meters
      const D_m = convertUnit(elements.diameterUnit.value, "m", D_val);
      
      // Calculate area in m²
      const A_m2 = Math.PI * Math.pow(D_m / 2, 2);
      
      // Convert to current area unit
      elements.area.value = convertUnit("m^2", elements.areaUnit.value, A_m2).toFixed(6);
    } catch (error) {
      console.error("Area calculation error:", error.message);
    }
  }

  /**
   * Calculate diameter from area
   * D = 2√(A/π)
   */
  function updateDiameter() {
    const A_val = parseFloat(elements.area.value);
    if (!Number.isFinite(A_val)) return;

    try {
      // Convert area to m²
      const A_m2 = convertUnit(elements.areaUnit.value, "m^2", A_val);
      
      // Calculate diameter in meters
      const D_m = 2 * Math.sqrt(A_m2 / Math.PI);
      
      // Convert to current diameter unit
      elements.diameter.value = convertUnit("m", elements.diameterUnit.value, D_m).toFixed(6);
    } catch (error) {
      console.error("Diameter calculation error:", error.message);
    }
  }

  /**
   * Handle diameter unit change
   */
  function handleDiameterUnitChange() {
    const oldUnit = elements.diameterUnit.dataset.oldUnit || elements.diameterUnit.value;
    const value = parseFloat(elements.diameter.value);
    
    if (Number.isFinite(value)) {
      try {
        // Convert diameter from old unit to new unit
        const D_m = convertUnit(oldUnit, "m", value);
        const D_new = convertUnit("m", elements.diameterUnit.value, D_m);
        elements.diameter.value = D_new.toFixed(6);
        
        // Update area to match new diameter
        updateArea();
      } catch (error) {
        console.error("Diameter unit change error:", error.message);
      }
    }
    
    elements.diameterUnit.dataset.oldUnit = elements.diameterUnit.value;
  }

  /**
   * Handle area unit change
   */
  function handleAreaUnitChange() {
    const oldUnit = elements.areaUnit.dataset.oldUnit || elements.areaUnit.value;
    const value = parseFloat(elements.area.value);
    
    if (Number.isFinite(value)) {
      try {
        // Convert area from old unit to new unit
        const A_m2 = convertUnit(oldUnit, "m^2", value);
        const A_new = convertUnit("m^2", elements.areaUnit.value, A_m2);
        elements.area.value = A_new.toFixed(6);
        
        // Update diameter to match new area
        updateDiameter();
      } catch (error) {
        console.error("Area unit change error:", error.message);
      }
    }
    
    elements.areaUnit.dataset.oldUnit = elements.areaUnit.value;
  }

  // Event listeners
  elements.diameter.addEventListener("input", updateArea);
  elements.area.addEventListener("input", updateDiameter);
  elements.diameterUnit.addEventListener("change", handleDiameterUnitChange);
  elements.areaUnit.addEventListener("change", handleAreaUnitChange);

  // Initialize
  updateArea();
}

// ========== REYNOLDS NUMBER CALCULATOR ==========

/**
 * Initialize Reynolds number calculator
 * Re = (ρVD) / μ
 */
function initializeReynoldsCalculator() {
  const elements = {
    density: document.getElementById("reDensity"),
    velocity: document.getElementById("reVelocity"),
    diameter: document.getElementById("reDiameter"),
    dynVisc: document.getElementById("reDynVisc"),
    reynolds: document.getElementById("reValue"),
    densityUnit: document.getElementById("reDensityUnit"),
    velocityUnit: document.getElementById("reVelocityUnit"),
    diameterUnit: document.getElementById("reDiameterUnit"),
    dynViscUnit: document.getElementById("reDynViscUnit")
  };

  // Check if all elements exist
  if (!Object.values(elements).every(el => el)) {
    console.warn("Reynolds calculator elements not found");
    return;
  }

  /**
   * Calculate Reynolds number
   * Re = (ρVD) / μ
   */
  function calculateReynolds() {
    const rho_val = parseFloat(elements.density.value);
    const V_val = parseFloat(elements.velocity.value);
    const D_val = parseFloat(elements.diameter.value);
    const mu_val = parseFloat(elements.dynVisc.value);

    if (!Number.isFinite(rho_val) || !Number.isFinite(V_val) || 
        !Number.isFinite(D_val) || !Number.isFinite(mu_val)) {
      elements.reynolds.value = "";
      return;
    }

    if (mu_val === 0) {
      elements.reynolds.value = "∞";
      return;
    }

    try {
      // Convert all to SI units
      const rho_SI = convertUnit(elements.densityUnit.value, "kg/m^3", rho_val);
      const V_SI = convertUnit(elements.velocityUnit.value, "m/s", V_val);
      const D_SI = convertUnit(elements.diameterUnit.value, "m", D_val);
      const mu_SI = convertUnit(elements.dynViscUnit.value, "Pa·s", mu_val);

      // Calculate Reynolds number (dimensionless)
      const Re = (rho_SI * V_SI * D_SI) / mu_SI;
      
      elements.reynolds.value = Re.toFixed(0);
    } catch (error) {
      console.error("Reynolds calculation error:", error.message);
      elements.reynolds.value = "Error";
    }
  }

  // Event listeners
  [elements.density, elements.velocity, elements.diameter, elements.dynVisc].forEach(el => {
    el.addEventListener("input", calculateReynolds);
  });

  [elements.densityUnit, elements.velocityUnit, elements.diameterUnit, elements.dynViscUnit].forEach(el => {
    el.addEventListener("change", calculateReynolds);
  });

  // Initialize
  calculateReynolds();
}

// ========== INITIALIZATION ==========

// Wait for DOM and convertUnit to be available
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalculators);
} else {
  initializeCalculators();
}

function initializeCalculators() {
  // Wait a bit for convertUnit to be loaded from unit_converter.js
  setTimeout(() => {
    if (typeof convertUnit === 'undefined') {
      console.error('convertUnit function not found. Make sure unit_converter.js is loaded first.');
      return;
    }

    initializePipeVelocityCalculator();
    initializeCircleAreaCalculator();
    initializeReynoldsCalculator();
  }, 100);
}

// ========== BROWSER EXPORTS ==========
if (typeof window !== "undefined") {
  window.initializePipeVelocityCalculator = initializePipeVelocityCalculator;
  window.initializeCircleAreaCalculator = initializeCircleAreaCalculator;
  window.initializeReynoldsCalculator = initializeReynoldsCalculator;
}
