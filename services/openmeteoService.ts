// services/openmeteoService.ts

const getDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const past = new Date();
    past.setFullYear(past.getFullYear() - 30);
    const historical = past.toISOString().split('T')[0];
    return { today, historical };
};

export const fetchLocationData = async (cityName: string, mode: string) => {
    try {
        // 1. Geocode
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("City not found");
        const { latitude, longitude, name, country } = geoData.results[0];
        const { today, historical } = getDates();

        let metrics = {};
        // Default placeholders
        let images = { left: "", right: "" };

        // 2. Fetch Real Data & Assign "Hyperspectral" Image Pairs
        if (mode === 'POLLUTION') {
            const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,nitrogen_dioxide,methane`);
            const data = await res.json();

            metrics = {
                val1: { value: data.current.nitrogen_dioxide.toFixed(1), unit: 'μg/m³', label: 'NO2 Density' },
                val2: { value: data.current.methane.toFixed(1), unit: 'μg/m³', label: 'Methane' },
                val3: { value: data.current.us_aqi, unit: 'AQI', label: 'Air Quality' }
            };
            // Left: Visible Smog | Right: NO2 Heatmap (Simulated)
            images.left = "https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=1200";
            images.right = "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1200";
        }
        else if (mode === 'AGRICULTURE') {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=soil_moisture_0_to_1cm,rain`);
            const data = await res.json();

            const moisture = data.current.soil_moisture_0_to_1cm || 0;

            metrics = {
                val1: { value: (moisture * 100).toFixed(0), unit: '%', label: 'Soil Moisture' },
                val2: { value: (moisture * 1.5).toFixed(2), unit: 'NDVI', label: 'Biomass Index' },
                val3: { value: data.current.rain, unit: 'mm', label: 'Precipitation' }
            };
            // Left: Natural Field | Right: NDVI Infrared (False Color)
            images.left = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200";
            images.right = "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1200"; // Infrared style
        }
        else if (mode === 'DISASTER') {
            const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${latitude}&longitude=${longitude}&daily=river_discharge_mean&start_date=${today}&end_date=${today}`;
            const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_gusts_10m`;

            const [floodRes, windRes] = await Promise.all([fetch(floodUrl), fetch(windUrl)]);
            const floodData = await floodRes.json();
            const windData = await windRes.json();

            const flow = floodData.daily?.river_discharge_mean?.[0] ?? 0;

            metrics = {
                val1: { value: windData.current.wind_gusts_10m, unit: 'km/h', label: 'Wind Gusts' },
                val2: { value: flow.toFixed(1), unit: 'm³/s', label: 'River Discharge' },
                val3: { value: "Live", unit: 'Ping', label: 'Sensor Status' }
            };
            // Left: Visible Smoke | Right: Thermal/Lava view
            images.left = "https://images.unsplash.com/photo-1602989981846-993d07e68223?q=80&w=1200";
            images.right = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200"; // Thermal
        }
        else if (mode === 'CLIMATE') {
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
                val2: { value: delta > 1 ? "-2.4%" : "Stable", unit: 'Vol', label: 'Ice Mass Proxy' },
                val3: { value: "Stable", unit: 'Sat', label: 'Forest Cover' }
            };
            // Left: Healthy Ice (1990) | Right: Melted/Cracked (2024)
            images.left = "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=1200";
            images.right = "https://images.unsplash.com/photo-1617112028741-69234b6e5109?q=80&w=1200";
        }

        return { locationName: `${name}, ${country}`, metrics, images };

    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
};