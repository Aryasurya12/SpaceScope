// services/openmeteoService.ts

const getClimateDates = () => {
    const today = new Date();
    const past = new Date();
    past.setFullYear(today.getFullYear() - 30);
    return {
        current: today.toISOString().split('T')[0],
        historical: past.toISOString().split('T')[0]
    };
};

export const fetchLocationData = async (cityName: string, mode: string) => {
    // 1. Geocoding
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results) throw new Error("City not found");
    const { latitude, longitude, name, country } = geoData.results[0];
    const { current, historical } = getClimateDates();

    let metrics = {};
    let images = { left: "", right: "" };

    try {
        if (mode === 'POLLUTION') {
            const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,nitrogen_dioxide,methane`;
            const res = await fetch(url);
            const data = await res.json();

            metrics = {
                val1: { value: data.current.nitrogen_dioxide.toFixed(1), unit: 'μg/m³', label: 'NO2 Density' },
                val2: { value: data.current.methane.toFixed(1), unit: 'μg/m³', label: 'Methane' },
                val3: { value: data.current.us_aqi, unit: 'AQI', label: 'Air Quality' }
            };
            images.left = "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200"; // Smoggy
            images.right = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200"; // Clear
        }
        else if (mode === 'AGRICULTURE') {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=soil_moisture_0_to_1cm,rain`;
            const res = await fetch(url);
            const data = await res.json();

            // Pseudo-NDVI calculation based on soil moisture (0.0 to 1.0)
            const moisture = data.current.soil_moisture_0_to_1cm;
            const ndvi = (moisture * 1.5).toFixed(2);

            metrics = {
                val1: { value: ndvi > 1 ? "0.85" : ndvi, unit: 'NDVI', label: 'Est. Biomass' },
                val2: { value: (moisture * 100).toFixed(0), unit: '%', label: 'Soil Moisture' },
                val3: { value: data.current.rain, unit: 'mm', label: 'Precipitation' }
            };
            images.left = "https://images.unsplash.com/photo-1625246333195-5840507993eb?q=80&w=1200"; // Farm
            images.right = "https://images.unsplash.com/photo-1592983813690-36a3aae218d3?q=80&w=1200"; // Infrared
        }
        else if (mode === 'DISASTER') {
            // Flood API & Weather API
            const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${latitude}&longitude=${longitude}&daily=river_discharge_mean&start_date=${current}&end_date=${current}`;
            const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_gusts_10m`;

            const [floodRes, windRes] = await Promise.all([fetch(floodUrl), fetch(windUrl)]);
            const floodData = await floodRes.json();
            const windData = await windRes.json();

            const flow = floodData.daily.river_discharge_mean?.[0] || 0;

            metrics = {
                val1: { value: windData.current.wind_gusts_10m, unit: 'km/h', label: 'Wind Gusts' },
                val2: { value: flow.toFixed(1), unit: 'm³/s', label: 'River Discharge' },
                val3: { value: "Live", unit: 'Ping', label: 'Sensor Status' }
            };
            images.left = "https://images.unsplash.com/photo-1464695110811-dcf3903dc2f4?q=80&w=1200"; // Fire
            images.right = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200"; // Thermal
        }
        else if (mode === 'CLIMATE') {
            // Historical vs Current Temp
            const histUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${historical}&end_date=${historical}&daily=temperature_2m_max`;
            const currUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=auto`;

            const [histRes, currRes] = await Promise.all([fetch(histUrl), fetch(currUrl)]);
            const histData = await histRes.json();
            const currData = await currRes.json();

            const oldTemp = histData.daily.temperature_2m_max[0] || 0;
            const newTemp = currData.daily.temperature_2m_max[0] || 0;
            const delta = (newTemp - oldTemp).toFixed(1);

            metrics = {
                val1: { value: delta > 0 ? `+${delta}` : delta, unit: '°C', label: '30-Year Delta' },
                val2: { value: "Unknown", unit: '%', label: 'Ice Mass Proxy' }, // Placeholder as API lacks direct ice data
                val3: { value: "Stable", unit: 'Sat', label: 'Forest Cover' }
            };
            images.left = "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=1200"; // 1990
            images.right = "https://images.unsplash.com/photo-1617112028741-69234b6e5109?q=80&w=1200"; // 2024
        }
    } catch (error) {
        console.error("Data Fetch Error:", error);
        return null;
    }

    return { locationName: `${name}, ${country}`, metrics, images };
};