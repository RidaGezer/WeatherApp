import axios from "axios";

const API_KEY = '91f0e264bd7ce22ca6dcec191ba07cf3';

// Verkrijg het weer voor een stad (huidige dag + 5-daagse voorspelling)
export const getWeatherByCity = async (city) => {
  try {
    // Huidige weersomstandigheden ophalen
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const currentWeatherResponse = await axios.get(currentWeatherUrl);
    const currentWeather = currentWeatherResponse.data;

    // 5-daagse voorspelling ophalen
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    const forecastResponse = await axios.get(forecastUrl);

    console.log('Weerdata ontvangen:', forecastResponse.data); // 🔹 Debugging

    // 5-daagse voorspelling filteren (unieke dagen)
    const fiveDayForecast = [];
    const uniqueDates = new Set();

    forecastResponse.data.list.forEach((item) => {
      const forecastDate = new Date(item.dt * 1000).toDateString();
      if (!uniqueDates.has(forecastDate)) {
        uniqueDates.add(forecastDate);
        fiveDayForecast.push(item);
      }
    });

    console.log('Gefilterde voorspellingen:', fiveDayForecast); // 🔹 Debugging

    return { currentWeather, fiveDayForecast };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
