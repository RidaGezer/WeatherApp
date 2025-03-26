import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getWeatherByCity, getWeatherByCoords } from './api';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const data = await getWeatherByCoords(location.coords.latitude, location.coords.longitude);
      if (data) {
        setWeather(data.currentWeather);  // Huidig weer
        setForecast(data.fiveDayForecast);  // 5-daagse voorspelling
      } else {
        setError("Unable to fetch weather data.");
      }
    } catch (err) {
      setError("Failed to fetch weather data.");
      console.error("Error getting weather data by coords:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    setError(null); // Reset any previous errors
    try {
      const data = await getWeatherByCity(city);
      if (data) {
        setWeather(data.currentWeather);  // Huidig weer
        setForecast(data.fiveDayForecast);  // 5-daagse voorspelling
      } else {
        setError("Unable to fetch weather data.");
      }
    } catch (err) {
      setError("Failed to fetch weather data.");
      console.error("Error getting weather data by city:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderWeatherData = () => {
    if (!weather) {
      return <Text>No weather data available.</Text>;
    }

    // De huidige weersomstandigheden
    const currentWeather = {
      temp: weather.main?.temp,
      description: weather.weather?.[0]?.description,
      temp_min: weather.main?.temp_min,
      temp_max: weather.main?.temp_max,
      wind: weather.wind?.speed,
    };

    // Controleer of de gegevens compleet zijn
    if (!currentWeather.temp) {
      return <Text>Data is incomplete. Please try again later.</Text>;
    }

    const dailyForecasts = [];
    const currentDate = new Date().toDateString();

    // Filter de 5-daagse voorspelling
    for (let i = 0; i < forecast.length; i++) {
      const item = forecast[i];
      const forecastDate = new Date(item.dt * 1000).toDateString();

      if (dailyForecasts.length < 5 && !dailyForecasts.some((forecast) => forecast.date === forecastDate)) {
        dailyForecasts.push({
          date: forecastDate,
          temp: item.main?.temp,
          description: item.weather?.[0]?.description,
          temp_min: item.main?.temp_min,
          temp_max: item.main?.temp_max,
          wind: item.wind?.speed,
        });
      }
    }

    return (
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{weather.name}</Text>
        
        {/* Huidige dag */}
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 20 }}>Today</Text>
          <Text>Temp: {currentWeather.temp}°C</Text>
          <Text>{currentWeather.description}</Text>
          <Text>Min Temp: {currentWeather.temp_min}°C</Text>
          <Text>Max Temp: {currentWeather.temp_max}°C</Text>
          <Text>Wind Speed: {currentWeather.wind} m/s</Text>
        </View>

        {/* 5-daagse voorspelling */}
        <Text style={{ fontSize: 20, marginTop: 20, textAlign: 'center' }}>5-Day Forecast</Text>
        <FlatList
          data={dailyForecasts}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text style={{ fontSize: 18 }}>{item.date}</Text>
              <Text>Temp: {item.temp}°C</Text>
              <Text>{item.description}</Text>
              <Text>Min Temp: {item.temp_min}°C</Text>
              <Text>Max Temp: {item.temp_max}°C</Text>
              <Text>Wind Speed: {item.wind} m/s</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Search" onPress={handleSearch} />

      {loading && <ActivityIndicator size="large" color="blue" />}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {renderWeatherData()}
    </View>
  );
}
