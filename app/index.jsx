import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
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
        setWeather(data.currentWeather);  // Current weather
        setForecast(data.fiveDayForecast);  // 5-day forecast
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
        setWeather(data.currentWeather);  // Current weather
        setForecast(data.fiveDayForecast);  // 5-day forecast
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

    // Current weather conditions
    const currentWeather = {
      temp: weather.main?.temp,
      description: weather.weather?.[0]?.description,
      temp_min: weather.main?.temp_min,
      temp_max: weather.main?.temp_max,
      wind: weather.wind?.speed,
    };

    // Check if data is complete
    if (!currentWeather.temp) {
      return <Text>Data is incomplete. Please try again later.</Text>;
    }

    const dailyForecasts = [];
    const currentDate = new Date().toDateString();

    // Filter the 5-day forecast
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
      <View style={styles.weatherContainer}>
        <Text style={styles.cityName}>{weather.name}</Text>

        {/* Current day */}
        <View style={styles.todayContainer}>
          <Text style={styles.todayTitle}>Today</Text>
          <Text>Temp: {currentWeather.temp}°C</Text>
          <Text>{currentWeather.description}</Text>
          <Text>Min Temp: {currentWeather.temp_min}°C</Text>
          <Text>Max Temp: {currentWeather.temp_max}°C</Text>
          <Text>Wind Speed: {currentWeather.wind} m/s</Text>
        </View>

        {/* 5-day forecast */}
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        <FlatList
          data={dailyForecasts}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.forecastItem}>
              <Text>{item.date}</Text>
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
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Search" onPress={handleSearch} />

      {loading && <ActivityIndicator size="large" color="blue" />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {renderWeatherData()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',  // Light background color
  },
  input: {
    borderWidth: 1,  // Light border
    borderColor: '#ddd',  // Light gray border
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  weatherContainer: {
    marginTop: 20,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',  // Darker text for readability
  },
  todayContainer: {
    marginTop: 10,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  forecastItem: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
