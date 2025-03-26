import axios from "axios";

const API_KEY = '91f0e264bd7ce22ca6dcec191ba07cf3';

// Verkrijg het weer voor een stad (huidige dag + 5-daagse voorspelling)
export const getWeatherByCity = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;

  try {
    const response = await axios.get(url, {
      params: {
        q: city,
        units: 'metric',
        appid: API_KEY,
      },
    });

    console.log('Weerdata ontvangen:', response.data); // 🔹 Check of er data binnenkomt

    // Verkrijg de huidige weersomstandigheden (eerste item in de lijst)
    const currentWeather = response.data.list[0];

    // Filter de voorspellingen voor de komende 5 dagen
    const fiveDayForecast = response.data.list.filter((item, index) => {
      const forecastDate = new Date(item.dt * 1000);
      return forecastDate.getHours() === 12; // Alleen de voorspellingen om 12:00 uur (middag)
    });

    return { currentWeather, fiveDayForecast };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
