export interface WeatherData {
    temp_c: number;
    condition: { text: string };
    wind_kph: number;
    humidity: number;
    uv: number;
    air_quality: {
        pm2_5: number;
        pm10: number;
    };
}

const WEATHER_API_KEY = "517bc5305422452d82c75013260602";

export const fetchWeatherByCoords = async (lat: string, lon: string): Promise<WeatherData | null> => {
    try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather service offline");
        const data = await res.json();

        return {
            temp_c: data.current.temp_c,
            condition: { text: data.current.condition.text },
            wind_kph: data.current.wind_kph,
            humidity: data.current.humidity,
            uv: data.current.uv,
            air_quality: {
                pm2_5: data.current.air_quality.pm2_5,
                pm10: data.current.air_quality.pm10
            }
        };
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        return null;
    }
};
