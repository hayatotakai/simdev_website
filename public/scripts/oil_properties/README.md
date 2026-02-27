# Method for Calculating Oil Properties

A JavaScript library for calculating fluid properties **(density, dynamic viscosity, and kinematic viscosity)** at various temperatures using industry-standard methods.

## Overview

This module provides functions to interpolate the physical properties of hydraulic fluids and oils at different temperatures given the dynamic viscosity attwo temperatures and the density at 15°C. It uses:
- **Density:** Linear thermal expansion
- **Kinematic viscosity:** Walther equation
- **Dynamic viscosity:** Derived from Density and Kinematic Viscosity

### Mathematical Background

#### 1. Density Calculation

The density at any temperature is calculated using linear thermal expansion:

$$\rho(T) = \rho_{15°C} \times (1 - \alpha \times (T - T_{ref}))$$

Where:
- $\rho(T)$ = Density at temperature T (kg/m³)
- $\rho_{15°C}$ = Reference density at 15°C (288.15 K)
- $\alpha$ = Thermal expansion coefficient (0.00065 K⁻¹)
- $T_{ref}$ = Reference temperature (288.15 K)
- $T$ = Target temperature (K)

#### 2. Kinematic Viscosity - Walther Equation

The Walther equation is the ASTM standard for interpolating kinematic viscosity across temperatures:

$$\log_{10}(\log_{10}(\nu + 0.8)) = m \times \log_{10}(T) + n$$

Where:
- $\nu$ = Kinematic viscosity (mm²/s)
- $T$ = Temperature (K)
- $m, n$ = Constants calculated from two reference points

**Derivation of constants:**

Given two reference points $(T_1, \nu_1)$ and $(T_2, \nu_2)$:

$$W_1 = \log_{10}(\log_{10}(\nu_1 + 0.8))$$
$$W_2 = \log_{10}(\log_{10}(\nu_2 + 0.8))$$

$$m = \frac{W_2 - W_1}{\log_{10}(T_2) - \log_{10}(T_1)}$$

$$n = W_1 - m \times \log_{10}(T_1)$$

**To find viscosity at target temperature:**

$$h = m \times \log_{10}(T) + n$$

$$\nu(T) = 10^{10^h} - 0.8$$

#### 3. Dynamic Viscosity

Dynamic viscosity is calculated from kinematic viscosity and density:

$$\mu = \nu \times \rho \times 10^{-6}$$

Where:
- $\mu$ = Dynamic viscosity (Pa·s)
- $\nu$ = Kinematic viscosity (mm²/s)
- $\rho$ = Density (kg/m³)
- $10^{-6}$ = Conversion factor from mm²/s to m²/s

## Script

### Constants

```javascript
DENSITY_COEFFICIENT = 0.00065  // Thermal expansion coefficient (K⁻¹)
REFERENCE_TEMP_K = 288.15      // Reference temperature: 15°C (K)
WALTHER_CONSTANT = 0.8         // Walther equation constant
WALTHER_ERROR_THRESHOLD = 5    // Acceptable error percentage
DEBUG_MODE = false             // Enable/disable verbose logging
```

### API Reference

#### `loadFluidData()`

**Type:** `async function`

**Description:** Loads fluid property data from JSON file. Handles both browser (fetch) and Node.js (fs) environments. Implements promise caching to prevent race conditions.

**Returns:** `Promise<void>`

**Example:**
```javascript
await OilProps.loadFluidData();
```

---

#### `getDensityAtTemp(name, tK)`

**Description:** Calculates the density of a fluid at a specified temperature using linear thermal expansion approximation.

**Parameters:**
- `name` (string) - Fluid name (e.g., "ISO VG 32")
- `tK` (number) - Temperature in Kelvin

**Returns:** `number` - Density in kg/m³, or NaN if fluid not found

**Equation:** $\rho(T) = \rho_{15°C} \times (1 - 0.00065 \times (T - 288.15))$

**Example:**
```javascript
const density = OilProps.getDensityAtTemp("ISO VG 32", 313.15);
// Returns: ~850.34 kg/m³
```

---

#### `getKinViscAtTemp(name, tK)`

**Description:** Calculates kinematic viscosity using the Walther equation, which interpolates between two known viscosity-temperature reference points. This is the ASTM standard method for viscosity interpolation.

**Parameters:**
- `name` (string) - Fluid name
- `tK` (number) - Temperature in Kelvin

**Returns:** `number` - Kinematic viscosity in mm²/s (cSt), or NaN if data unavailable

**Method:** 
1. Retrieves two reference viscosity-temperature points
2. Applies Walther transform to both points
3. Calculates linear relationship parameters (m, n)
4. Interpolates viscosity at target temperature
5. Validates accuracy against reference points

**Example:**
```javascript
const kinVisc = OilProps.getKinViscAtTemp("ISO VG 32", 313.15);
// Returns: ~23.5 mm²/s
```

---

#### `getDynViscAtTemp(name, tK)`

**Description:** Calculates dynamic (absolute) viscosity from kinematic viscosity and density.

**Parameters:**
- `name` (string) - Fluid name
- `tK` (number) - Temperature in Kelvin

**Returns:** `number` - Dynamic viscosity in Pa·s, or NaN if data unavailable

**Equation:** $\mu = \nu \times \rho \times 10^{-6}$

**Example:**
```javascript
const dynVisc = OilProps.getDynViscAtTemp("ISO VG 32", 313.15);
// Returns: ~0.02 Pa·s
```

---

#### `getFluidNames()`

**Description:** Retrieves a sorted list of all available fluid names in the dataset.

**Returns:** `string[]` - Array of fluid names, sorted alphabetically

**Example:**
```javascript
const fluids = OilProps.getFluidNames();
// Returns: ["ISO VG 10", "ISO VG 15", "ISO VG 32", ...]
```

---

### Helper Functions (Private)

#### `calculateWaltherTransform(viscosity)`
Applies the Walther transformation: $W = \log_{10}(\log_{10}(\nu + 0.8))$

#### `inverseWaltherTransform(h)`
Reverses the Walther transformation: $\nu = 10^{10^h} - 0.8$

#### `validateWaltherTransform(name, T1, V1, T2, V2, m, n)`
Validates the accuracy of the Walther transformation by checking if it reproduces the original reference points within acceptable error threshold (5%).

### Usage Examples

#### Browser Usage

```html
<script src="getOilProperties.js"></script>
<script>
  // Load data first
  await OilProps.loadFluidData();
  
  // Get available fluids
  const fluids = OilProps.getFluidNames();
  console.log(fluids);
  
  // Calculate properties at 40°C (313.15 K)
  const temp = 313.15;
  const fluid = "ISO VG 32";
  
  const density = OilProps.getDensityAtTemp(fluid, temp);
  const kinVisc = OilProps.getKinViscAtTemp(fluid, temp);
  const dynVisc = OilProps.getDynViscAtTemp(fluid, temp);
  
  console.log(`Fluid: ${fluid} at ${temp - 273.15}°C`);
  console.log(`Density: ${density.toFixed(2)} kg/m³`);
  console.log(`Kinematic Viscosity: ${kinVisc.toFixed(3)} mm²/s`);
  console.log(`Dynamic Viscosity: ${dynVisc.toFixed(6)} Pa·s`);
</script>
```

#### Node.js Usage

```javascript
const OilProps = require('./getOilProperties.js');

(async () => {
  // Load fluid data
  await OilProps.loadFluidData();
  
  // Calculate properties
  const fluid = "ISO VG 46";
  const tempC = 60; // °C
  const tempK = tempC + 273.15;
  
  const properties = {
    density: OilProps.getDensityAtTemp(fluid, tempK),
    kinematicViscosity: OilProps.getKinViscAtTemp(fluid, tempK),
    dynamicViscosity: OilProps.getDynViscAtTemp(fluid, tempK)
  };
  
  console.log(properties);
})();
```

#### Command Line Interface

```bash
# Basic usage
node getOilProperties.js "ISO VG 32" 313.15

# Output:
# Fluid: ISO VG 32
# Temperature: 313.15 K (40.00 °C)
# Density: 850.34 kg/m³
# Kinematic Viscosity: 23.456 mm²/s
# Dynamic Viscosity: 0.019945 Pa·s
```

### Data Format

The fluid data JSON should follow this structure:

```json
{
  "ISO VG 32": {
    "DensityAt15C": 865.0,
    "Kinematic Viscosity Limits": [
      {
        "temperature": 313.15,
        "kinematicViscosity": 28.8
      },
      {
        "temperature": 373.15,
        "kinematicViscosity": 5.4
      }
    ]
  }
}
```

### Error Handling

The module includes comprehensive error handling:

- **Invalid temperature:** Returns NaN and logs warning
- **Missing fluid:** Returns NaN with optional debug warning
- **Insufficient viscosity data:** Returns NaN (requires at least 2 reference points)
- **Invalid data values:** Returns NaN with warning
- **Data loading failure:** Throws error with descriptive message

### Validation

The Walther transform validation ensures accuracy by:
1. Checking if the calculated viscosity matches reference points
2. Warning if error exceeds 5% threshold
3. Providing detailed debug output when `DEBUG_MODE = true`

### Performance Optimizations

- **Promise caching:** Prevents multiple simultaneous data loads
- **Lazy loading:** Data loads only when needed
- **Efficient sorting:** Fluid names sorted once on retrieval

### Standards & References

- **ASTM D341:** Standard Practice for Viscosity-Temperature Charts for Liquid Petroleum Products
- **ISO 3448:** Industrial liquid lubricants — ISO viscosity classification
- **Thermal expansion coefficient:** Based on typical mineral oil properties

### Debug Mode

Enable detailed logging by setting:

```javascript
DEBUG_MODE = true
```

This provides:
- Data loading confirmation
- Walther transform parameters
- Validation results for reference points
- Missing data warnings

### License

This module is part of the hydraulic filtration website project.

### Version

Current version: 1.0.0
Last updated: February 2026
Author: Hayato Takai
Contact: hayato.takai@hydacusa.com
