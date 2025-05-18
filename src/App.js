import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  WbSunny as SunnyIcon, 
  Cloud as CloudIcon, 
  Water as RainIcon,
  Air as WindIcon,
  LocationOn as LocationIcon,
  WaterDrop as HumidityIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

const API_KEY = '8e5554608376d80ec40e70c1a2c3b547';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const WeatherCard = styled(Card)({
  maxWidth: 600,
  margin: '20px auto',
  padding: '20px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
});

const WeatherIcon = styled('div')({
  fontSize: '4rem',
  margin: '20px 0',
});

// Common city name corrections
const CITY_CORRECTIONS = {
  'los vegas': 'Las Vegas',
  'new york city': 'New York',
  'san francisco': 'San Francisco',
  'mumbai': 'Mumbai',
  'delhi': 'Delhi',
  'bangalore': 'Bengaluru'
};

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedCity, setSuggestedCity] = useState('');

  useEffect(() => {
    fetchWeather('London');
  }, []);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    setSuggestedCity('');
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: 'metric',
        },
      });
      setWeather(response.data);
    } catch (err) {
      const normalizedCity = cityName.toLowerCase().trim();
      
      // Check if we have a correction for this city
      if (CITY_CORRECTIONS[normalizedCity]) {
        setSuggestedCity(CITY_CORRECTIONS[normalizedCity]);
        setError(`Did you mean ${CITY_CORRECTIONS[normalizedCity]}?`);
      } else {
        setError('City not found. Please check the spelling and try again.');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    const normalizedCity = city.toLowerCase().trim();
    const correctedCity = CITY_CORRECTIONS[normalizedCity] || city;
    
    if (correctedCity !== city) {
      setCity(correctedCity);
    }
    
    fetchWeather(correctedCity);
  };

  const handleSuggestionClick = () => {
    setCity(suggestedCity);
    fetchWeather(suggestedCity);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return <SunnyIcon style={{ color: '#FFD700', fontSize: 'inherit' }} />;
      case 'Clouds':
        return <CloudIcon style={{ color: '#808080', fontSize: 'inherit' }} />;
      case 'Rain':
        return <RainIcon style={{ color: '#4682B4', fontSize: 'inherit' }} />;
      default:
        return <SunnyIcon style={{ color: '#FFD700', fontSize: 'inherit' }} />;
    }
  };

  return (
    <Container>
      <Typography variant="h3" component="h1" align="center" gutterBottom style={{ marginTop: '20px' }}>
        Weather App
      </Typography>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Enter city name"
              variant="outlined"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., London, New York"
              error={!!error}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={loading}
              style={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Weather'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {error && (
        <Box textAlign="center" mb={2}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          {suggestedCity && (
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleSuggestionClick}
            >
              Search for {suggestedCity} instead
            </Button>
          )}
        </Box>
      )}

      {weather && (
        <WeatherCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <LocationIcon color="primary" />
              <Typography variant="h4" component="h2">
                {weather.name}, {weather.sys.country}
              </Typography>
            </Box>
            
            <WeatherIcon>
              {getWeatherIcon(weather.weather[0].main)}
            </WeatherIcon>
            
            <Typography variant="h2" component="div" gutterBottom>
              {Math.round(weather.main.temp)}°C
            </Typography>
            
            <Typography variant="h5" component="div" color="textSecondary" gutterBottom>
              {weather.weather[0].description}
            </Typography>
            
            <Grid container spacing={2} mt={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center">
                  <HumidityIcon style={{ marginRight: '8px' }} />
                  <Typography>Humidity: {weather.main.humidity}%</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center">
                  <WindIcon style={{ marginRight: '8px' }} />
                  <Typography>Wind: {weather.wind.speed} m/s</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography>Feels like: {Math.round(weather.main.feels_like)}°C</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Pressure: {weather.main.pressure} hPa</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </WeatherCard>
      )}
    </Container>
  );
};

export default WeatherApp;