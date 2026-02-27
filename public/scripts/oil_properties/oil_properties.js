    // Constants
const TEMP_RANGE = { min: -40, max: 100 };
const ANIMATION_DURATION = 300;
let currentTempUnit = 'K'; // Track current temperature display unit
let currentKinViscUnit = 'mm^2/s'; // Kinematic viscosity in mm²/s by default
let currentDensityUnit = 'kg/m^3'; // Density in kg/m³ by default
let currentDynViscUnit = 'Pa*s'; // Dynamic viscosity in Pa·s by default
const SELECTORS = {
  fluidSelect: '#fluidSelect',
  tempInput: '#tempInput',
  oilTitle: '#oilTitle',
  copyBtn: '#copyBtn',
  col2Sel: '#col2Sel',
  tempUnitSelect: '#tempUnitSelect',
  kinViscUnitSelect: '#kinViscUnitSelect',
  densityUnitSelect: '#densityUnitSelect',
  dynViscUnitSelect: '#dynViscUnitSelect',
  properties: '#properties',
  density: '#density',
  viscosityTableBody: '#viscosityTableBody',
  calculatedTableBody: '#calculatedTableBody'
};

// Helper functions
function addRowAnimation(row) {
  row.classList.add('updated');
  setTimeout(() => row.classList.remove('updated'), ANIMATION_DURATION);
}

function createTableRow(cells) {
  const tr = document.createElement('tr');
  tr.innerHTML = cells.map(cell => `<td>${cell}</td>`).join('');
  addRowAnimation(tr);
  return tr;
}

function safeQuerySelector(selector, context = document) {
  const element = context.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
}

function formatValue(value, decimals) {
  return Number.isFinite(value) ? value.toFixed(decimals) : 'N/A';
}

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await OilProps.loadFluidData();
    initializeFluidSelector();
    initializeTemperatureInput();
    initializeTemperatureUnitSelector();
    initializePropertyUnitSelectors();
    initializeCopyButton();
  } catch (error) {
    console.error('Failed to initialize oil properties:', error);
    showError('Failed to load fluid data. Please refresh the page.');
  }
});

function initializeFluidSelector() {
  const fluidSelect = safeQuerySelector(SELECTORS.fluidSelect);
  if (!fluidSelect) return;

  const fluids = OilProps.getFluidNames();
  const fragment = document.createDocumentFragment();
  
  fluids.forEach(fluidName => {
    const option = document.createElement("option");
    option.value = fluidName;
    option.textContent = fluidName;
    fragment.appendChild(option);
  });
  
  fluidSelect.appendChild(fragment);
  fluidSelect.addEventListener("change", handleFluidChange);
}

function initializeTemperatureInput() {
  const tempInput = safeQuerySelector(SELECTORS.tempInput);
  if (!tempInput) return;

  // Only allow numeric input (including decimal point and minus sign)
  tempInput.addEventListener("input", (event) => {
    let value = event.target.value;
    // Remove any non-numeric characters except decimal point and minus sign
    value = value.replace(/[^\d.\-]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Ensure minus sign only at the beginning
    if (value.indexOf('-') !== value.lastIndexOf('-')) {
      value = value.replace(/-/g, '');
      value = '-' + value;
    }
    if (value !== event.target.value) {
      event.target.value = value;
    }
    handleTemperatureChange();
  });

  tempInput.addEventListener("change", handleTemperatureChange);
}

function initializeTemperatureUnitSelector() {
  const tempUnitSelect = safeQuerySelector(SELECTORS.tempUnitSelect);
  if (!tempUnitSelect) return;

  tempUnitSelect.addEventListener("change", (event) => {
    currentTempUnit = event.target.value;
    
    // Rebuild the table with new unit
    const fluidSelect = safeQuerySelector(SELECTORS.fluidSelect);
    const tempInput = safeQuerySelector(SELECTORS.tempInput);
    const fluid = fluidSelect?.value;
    const temperature = tempInput?.value ? parseFloat(tempInput.value) : null;
    
    if (fluid) {
      buildCalculatedTable(fluid, temperature);
    }
  });
}

function initializePropertyUnitSelectors() {
  const kinViscSelect = safeQuerySelector(SELECTORS.kinViscUnitSelect);
  const densitySelect = safeQuerySelector(SELECTORS.densityUnitSelect);
  const dynViscSelect = safeQuerySelector(SELECTORS.dynViscUnitSelect);

  // Populate kinematic viscosity units
  if (kinViscSelect) {
    populateUnitSelect(kinViscSelect, 'kinematicViscosity', 'mm^2/s');
    kinViscSelect.addEventListener("change", (event) => {
      currentKinViscUnit = event.target.value;
      rebuildTableWithNewUnits();
    });
  }

  // Populate density units
  if (densitySelect) {
    populateUnitSelect(densitySelect, 'density', 'kg/m^3');
    densitySelect.addEventListener("change", (event) => {
      currentDensityUnit = event.target.value;
      rebuildTableWithNewUnits();
    });
  }

  // Populate dynamic viscosity units
  if (dynViscSelect) {
    populateUnitSelect(dynViscSelect, 'dynamicViscosity', 'Pa*s');
    dynViscSelect.addEventListener("change", (event) => {
      currentDynViscUnit = event.target.value;
      rebuildTableWithNewUnits();
    });
  }
}

function populateUnitSelect(selectElement, unitType, defaultUnit) {
  try {
    const availableUnits = getAvailableUnits(unitType);
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Add options from available units
    availableUnits.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit;
      option.textContent = formatUnitDisplay(unit);
      selectElement.appendChild(option);
    });
    
    // Set default unit if it exists in available units
    if (availableUnits.includes(defaultUnit)) {
      selectElement.value = defaultUnit;
    }
  } catch (error) {
    console.error(`Error populating units for ${unitType}:`, error);
  }
}

function formatUnitDisplay(unit) {
  // Format unit strings for display (e.g., "mm^2/s" -> "mm²/s")
  const displayMap = {
    'm^2/s': 'm²/s',
    'mm^2/s': 'mm²/s',
    'cSt': 'cSt',
    'kg/m^3': 'kg/m³',
    'g/cm^3': 'g/cm³',
    'lb/ft^3': 'lb/ft³',
    'Pa*s': 'Pa·s',
    'Pa·s': 'Pa·s',
    'mPa*s': 'mPa·s',
    'cP': 'cP'
  };
  
  return displayMap[unit] || unit;
}

function rebuildTableWithNewUnits() {
  const fluidSelect = safeQuerySelector(SELECTORS.fluidSelect);
  const tempInput = safeQuerySelector(SELECTORS.tempInput);
  const fluid = fluidSelect?.value;
  const temperature = tempInput?.value ? parseFloat(tempInput.value) : null;
  
  if (fluid) {
    buildCalculatedTable(fluid, temperature);
  }
}

function handleFluidChange(event) {
  const fluid = event.target.value;
  if (!fluid) return;

  try {
    const tempInput = safeQuerySelector(SELECTORS.tempInput);
    const temperature = tempInput?.value ? parseFloat(tempInput.value) : null;
    
    buildTables(fluid, temperature);
    updateOilTitle(fluid, temperature);
  } catch (error) {
    console.error('Error building tables:', error);
    showError(`Failed to load properties for ${fluid}`);
  }
}

function handleTemperatureChange() {
  const fluidSelect = safeQuerySelector(SELECTORS.fluidSelect);
  const fluid = fluidSelect?.value;
  
  if (!fluid) return;
  
  const tempInput = safeQuerySelector(SELECTORS.tempInput);
  const temperature = tempInput?.value ? parseFloat(tempInput.value) : null;
  
  buildTables(fluid, temperature);
  updateOilTitle(fluid, temperature);
}

function updateOilTitle(fluidName, temperature) {
  const oilTitle = safeQuerySelector(SELECTORS.oilTitle);
  if (oilTitle) {
    let titleText = fluidName;
    if (temperature !== null && Number.isFinite(temperature)) {
      titleText += ` at ${temperature}°C`;
    }
    oilTitle.textContent = titleText;
    oilTitle.classList.remove("hidden");
  }
}

function initializeCopyButton() {
  const copyBtn = safeQuerySelector(SELECTORS.copyBtn);
  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    try {
      const colIdx = parseInt(safeQuerySelector(SELECTORS.col2Sel)?.value || "1", 10);
      const rows = document.querySelectorAll(`${SELECTORS.calculatedTableBody} tr`);
      
      const text = Array.from(rows)
        .map(row => {
          const cells = row.querySelectorAll("td");
          // colIdx is now 0-based: 0=temp, 1=kinVisc, 2=density, 3=dynVisc
          return `${cells[0]?.innerText || ''}\t${cells[colIdx]?.innerText || ''}`;
        })
        .join('\n');

      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      showError('Failed to copy to clipboard');
    }
  });
}

function buildTables(name, temperatureC = null) {
  const properties = safeQuerySelector(SELECTORS.properties);
  if (properties) {
    properties.classList.remove("hidden");
  }

  buildDensityDisplay(name);
  buildViscosityTable(name);
  buildCalculatedTable(name, temperatureC);
}

function buildDensityDisplay(name) {
  const density15 = OilProps.getDensityAtTemp(name, 288.15); // 15°C in Kelvin
  const densityEl = safeQuerySelector(SELECTORS.density);
  
  if (densityEl) {
    densityEl.textContent = formatValue(density15, 2);
  }
}

function buildViscosityTable(name) {
  const tbody = safeQuerySelector(SELECTORS.viscosityTableBody);
  if (!tbody) return;

  tbody.innerHTML = "";
  const viscosityData = fluidData[name]?.["Kinematic Viscosity Limits"];
  
  if (!viscosityData || !Array.isArray(viscosityData)) {
    tbody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  viscosityData.forEach(row => {
    const tr = createTableRow([
      row.temperature,
      row.kinematicViscosity.toFixed(3)
    ]);
    fragment.appendChild(tr);
  });
  
  tbody.appendChild(fragment);
}

function buildCalculatedTable(name, temperatureC) {
  const tbody = safeQuerySelector(SELECTORS.calculatedTableBody);
  if (!tbody) return;

  tbody.innerHTML = "";
  const fragment = document.createDocumentFragment();

  // Determine temperature range
  let temperatures = [];
  if (temperatureC !== null && Number.isFinite(temperatureC)) {
    // Single temperature
    temperatures = [temperatureC];
  } else {
    // Full range
    for (let tC = TEMP_RANGE.min; tC <= TEMP_RANGE.max; tC++) {
      temperatures.push(tC);
    }
  }

  temperatures.forEach(tC => {
    const tK = tC + 273.15;
    const density_kgm3 = OilProps.getDensityAtTemp(name, tK);
    const kinVisc_mm2s = OilProps.getKinViscAtTemp(name, tK);
    const dynVisc_Pas = OilProps.getDynViscAtTemp(name, tK);

    // Convert temperature to selected unit
    let displayTemp;
    if (currentTempUnit === 'K') {
      displayTemp = tK.toFixed(2);
    } else if (currentTempUnit === 'C') {
      displayTemp = tC.toString();
    } else if (currentTempUnit === 'F') {
      const tF = convertUnit('C', 'F', tC);
      displayTemp = tF.toFixed(2);
    }

    // Convert kinematic viscosity to selected unit (mm²/s is the base)
    let displayKinVisc;
    if (currentKinViscUnit === 'mm^2/s') {
      displayKinVisc = formatValue(kinVisc_mm2s, 3);
    } else if (currentKinViscUnit === 'm^2/s') {
      const converted = convertUnit('mm^2/s', 'm^2/s', kinVisc_mm2s);
      displayKinVisc = formatValue(converted, 6);
    } else if (currentKinViscUnit === 'cSt') {
      const converted = convertUnit('mm^2/s', 'cSt', kinVisc_mm2s);
      displayKinVisc = formatValue(converted, 3);
    }

    // Convert density to selected unit (kg/m³ is the base)
    let displayDensity;
    if (currentDensityUnit === 'kg/m^3') {
      displayDensity = formatValue(density_kgm3, 2);
    } else if (currentDensityUnit === 'g/cm^3') {
      const converted = convertUnit('kg/m^3', 'g/cm^3', density_kgm3);
      displayDensity = formatValue(converted, 4);
    } else if (currentDensityUnit === 'lb/ft^3') {
      const converted = convertUnit('kg/m^3', 'lb/ft^3', density_kgm3);
      displayDensity = formatValue(converted, 2);
    }

    // Convert dynamic viscosity to selected unit (Pa·s is the base)
    let displayDynVisc;
    if (currentDynViscUnit === 'Pa*s') {
      displayDynVisc = formatValue(dynVisc_Pas, 6);
    } else if (currentDynViscUnit === 'mPa*s') {
      const converted = convertUnit('Pa*s', 'mPa*s', dynVisc_Pas);
      displayDynVisc = formatValue(converted, 3);
    } else if (currentDynViscUnit === 'cP') {
      const converted = convertUnit('Pa*s', 'cP', dynVisc_Pas);
      displayDynVisc = formatValue(converted, 3);
    }

    const tr = createTableRow([
      displayTemp,
      displayKinVisc,
      displayDensity,
      displayDynVisc
    ]);
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

// Utility functions for user feedback
function showError(message) {
  alert(`Error: ${message}`); // Replace with a better toast/notification system
}

function showSuccess(message) {
  alert(message); // Replace with a better toast/notification system
}
