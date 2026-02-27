// ========== CONVERSION FACTORS ==========
// All factors are relative to SI base units

/**
 * Length conversion factors (base unit: meter)
 */
const lengthFactors = {
  "m": 1,
  "cm": 0.01,
  "mm": 0.001,
  "in": 0.0254,
  "ft": 0.3048
};

/**
 * Area conversion factors (base unit: square meter)
 */
const areaFactors = {
  "m^2": 1,
  "cm^2": 0.0001,
  "mm^2": 1e-6,
  "in^2": 0.00064516,
  "ft^2": 0.092903
};

/**
 * Density conversion factors (base unit: kg/m³)
 */
const densityFactors = {
  "kg/m^3": 1,
  "g/cm^3": 1000,
  "lb/ft^3": 16.0185
};

/**
 * Kinematic viscosity conversion factors (base unit: m²/s)
 */
const kinViscFactors = {
  "m^2/s": 1,
  "mm^2/s": 1e-6,
  "cSt": 1e-6
};

/**
 * Dynamic viscosity conversion factors (base unit: Pa·s)
 */
const dynViscFactors = {
  "Pa*s": 1,
  "mPa*s": 1e-3,
  "cP": 1e-3
};

/**
 * Volume conversion factors (base unit: cubic meter)
 */
const volumeFactors = {
  "m^3": 1,
  "L": 0.001,
  "mL": 1e-6,
  "in^3": 1.6387e-5,
  "ft^3": 0.0283168,
  "gal(US)": 0.00378541,
  "gal(UK)": 0.00454609
};

/**
 * Flow rate conversion factors (base unit: m³/s)
 */
const flowFactors = {
  "m^3/s": 1,
  "L/s": 0.001,
  "L/min": 0.001 / 60,
  "gpm": 0.00378541 / 60,
  "gal/h": 0.00378541 / 3600,
  "ft^3/s": 0.0283168,
  "kg/s": 1,
  "lb/s": 0.453592
};

/**
 * Pressure conversion factors (base unit: Pascal)
 */
const pressureFactors = {
  "Pa": 1,
  "kPa": 1000,
  "MPa": 1e6,
  "GPa": 1e9,
  "bar": 100000,
  "psi": 6894.76,
  "atm": 101325
};

/**
 * Force conversion factors (base unit: Newton)
 */
const forceFactors = {
  "N": 1,
  "kN": 1000,
  "lbf": 4.44822,
  "kgf": 9.80665
};

/**
 * Temperature units (requires special conversion logic)
 */
const temperatureUnits = ["C", "F", "K"];

// ========== UNIT TYPE REGISTRY ==========
const unitTypeRegistry = {
  length: lengthFactors,
  area: areaFactors,
  density: densityFactors,
  kinematicViscosity: kinViscFactors,
  dynamicViscosity: dynViscFactors,
  volume: volumeFactors,
  flow: flowFactors,
  pressure: pressureFactors,
  force: forceFactors
};

// ========== HELPER FUNCTIONS ==========

/**
 * Normalize unit string for consistency
 * @private
 * @param {string} unit - Unit string to normalize
 * @returns {string} Normalized unit
 */
function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') {
    throw new Error('Unit must be a non-empty string');
  }
  
  // Temperature units are case-insensitive
  const upperUnit = unit.toUpperCase();
  if (["C", "F", "K"].includes(upperUnit)) {
    return upperUnit;
  }
  
  return unit;
}

/**
 * Convert temperature value to Kelvin
 * @private
 * @param {string} unit - Temperature unit (C, F, or K)
 * @param {number} value - Temperature value
 * @returns {number} Temperature in Kelvin
 */
function temperatureToKelvin(unit, value) {
  switch (unit) {
    case "K":
      return value;
    case "C":
      return value + 273.15;
    case "F":
      return (value - 32) * 5 / 9 + 273.15;
    default:
      throw new Error(`Unsupported temperature unit: ${unit}`);
  }
}

/**
 * Convert temperature value from Kelvin
 * @private
 * @param {string} unit - Temperature unit (C, F, or K)
 * @param {number} valueK - Temperature value in Kelvin
 * @returns {number} Temperature in target unit
 */
function temperatureFromKelvin(unit, valueK) {
  switch (unit) {
    case "K":
      return valueK;
    case "C":
      return valueK - 273.15;
    case "F":
      return (valueK - 273.15) * 9 / 5 + 32;
    default:
      throw new Error(`Unsupported temperature unit: ${unit}`);
  }
}

// ========== GET AVAILABLE UNITS ==========

/**
 * Get all available units for a specific unit type.
 * 
 * @param {string} unitType - Type of unit (e.g., "length", "temperature", "pressure")
 * @returns {string[]} Array of available units for the specified type
 * @throws {Error} If unit type is not supported
 * 
 * @example
 * getAvailableUnits("length") // Returns: ["m", "cm", "mm", "in", "ft"]
 * getAvailableUnits("temperature") // Returns: ["C", "F", "K"]
 */
function getAvailableUnits(unitType) {
  if (!unitType || typeof unitType !== 'string') {
    throw new Error('Unit type must be a non-empty string');
  }

  const normalizedType = unitType.toLowerCase().replace(/\s+/g, '');

  const unitTypeMap = {
    'length': lengthFactors,
    'area': areaFactors,
    'temperature': temperatureUnits,
    'density': densityFactors,
    'kinematicviscosity': kinViscFactors,
    'dynamicviscosity': dynViscFactors,
    'volume': volumeFactors,
    'flow': flowFactors,
    'flowrate': flowFactors,
    'pressure': pressureFactors,
    'force': forceFactors
  };

  const factorTable = unitTypeMap[normalizedType];
  
  if (!factorTable) {
    const availableTypes = Object.keys(unitTypeMap).join(', ');
    throw new Error(
      `Unsupported unit type "${unitType}". Available types: ${availableTypes}`
    );
  }

  return Array.isArray(factorTable) 
    ? [...factorTable] 
    : Object.keys(factorTable);
}

/**
 * Check if a unit is valid for a given unit type.
 * 
 * @param {string} unit - Unit to check
 * @param {string} unitType - Type of unit
 * @returns {boolean} True if unit is valid for the type
 * 
 * @example
 * isValidUnit("m", "length") // Returns: true
 * isValidUnit("kg", "length") // Returns: false
 */
function isValidUnit(unit, unitType) {
  try {
    const availableUnits = getAvailableUnits(unitType);
    const normalizedUnit = normalizeUnit(unit);
    return availableUnits.includes(normalizedUnit);
  } catch (error) {
    console.warn(`Unit validation error: ${error.message}`);
    return false;
  }
}

/**
 * Perform linear unit conversion using conversion factors
 * @private
 * @param {Object} factorTable - Conversion factor lookup table
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @param {number} value - Value to convert
 * @returns {number} Converted value
 */
function linearConversion(factorTable, fromUnit, toUnit, value) {
  if (!(fromUnit in factorTable)) {
    throw new Error(`Unknown unit: "${fromUnit}"`);
  }
  if (!(toUnit in factorTable)) {
    throw new Error(`Unknown unit: "${toUnit}"`);
  }
  
  return value * (factorTable[fromUnit] / factorTable[toUnit]);
}

// ========== MAIN CONVERSION FUNCTION ==========

/**
 * Convert a value from one unit to another.
 * Supports length, area, temperature, density, viscosity, volume, flow, pressure, and force.
 * 
 * @param {string} originalUnit - Source unit
 * @param {string} newUnit - Target unit
 * @param {number} value - Value to convert
 * @returns {number} Converted value, or NaN if input is invalid
 * @throws {Error} If units are unsupported or incompatible
 * 
 * @example
 * convertUnit("m", "ft", 1) // Returns: 3.28084
 * convertUnit("C", "F", 0) // Returns: 32
 * convertUnit("Pa", "psi", 1000) // Returns: 0.145038
 */
function convertUnit(originalUnit, newUnit, value) {
  // Validate input value
  if (typeof value !== "number" || !Number.isFinite(value)) {
    console.warn(`Invalid value for conversion: ${value}`);
    return NaN;
  }

  // Normalize unit strings
  let fromUnit, toUnit;
  try {
    fromUnit = normalizeUnit(originalUnit);
    toUnit = normalizeUnit(newUnit);
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  // Same unit - no conversion needed
  if (fromUnit === toUnit) {
    return value;
  }

  // Temperature conversion (special case)
  if (["C", "F", "K"].includes(fromUnit) && ["C", "F", "K"].includes(toUnit)) {
    try {
      return temperatureFromKelvin(toUnit, temperatureToKelvin(fromUnit, value));
    } catch (error) {
      console.error(`Temperature conversion error: ${error.message}`);
      throw error;
    }
  }

  // Try linear conversions for each unit type
  for (const [typeName, factorTable] of Object.entries(unitTypeRegistry)) {
    if (fromUnit in factorTable && toUnit in factorTable) {
      return linearConversion(factorTable, fromUnit, toUnit, value);
    }
  }

  // No matching conversion found
  throw new Error(`Unsupported conversion from "${originalUnit}" to "${newUnit}"`);
}

// ========== BROWSER EXPORTS ==========
if (typeof window !== "undefined") {
  window.convertUnit = convertUnit;
  window.getAvailableUnits = getAvailableUnits;
  window.isValidUnit = isValidUnit;
}

// ========== NODE.JS EXPORTS ==========
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    convertUnit,
    getAvailableUnits,
    isValidUnit,
    // Export constants for testing
    lengthFactors,
    areaFactors,
    densityFactors,
    kinViscFactors,
    dynViscFactors,
    volumeFactors,
    flowFactors,
    pressureFactors,
    forceFactors,
    temperatureUnits
  };
}
