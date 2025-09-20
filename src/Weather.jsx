import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Droplets, Thermometer, MapPin, Search, Loader2, AlertCircle } from 'lucide-react';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const getCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
      }
      
      return data.results[0];
    } catch (error) {
      throw new Error('Unable to find city coordinates');
    }
  };

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError('');
    
    try {
      const location = await getCoordinates(cityName);
      
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      
      const weatherData = await weatherResponse.json();
      
      setWeatherData({
        location: {
          name: location.name,
          country: location.country,
          timezone: location.timezone
        },
        current: weatherData.current,
        daily: weatherData.daily,
        hourly: weatherData.hourly
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      fetchWeatherData(searchInput.trim());
    }
  };

  const getWeatherIcon = (code, size = 24) => {
    const iconProps = { size };
    
    if (code >= 0 && code <= 1) return <Sun {...iconProps} className="weather-icon-sun" />;
    if (code >= 2 && code <= 3) return <Cloud {...iconProps} className="weather-icon-cloud" />;
    if (code >= 45 && code <= 48) return <Cloud {...iconProps} className="weather-icon-fog" />;
    if (code >= 51 && code <= 67) return <CloudRain {...iconProps} className="weather-icon-rain" />;
    if (code >= 71 && code <= 86) return <CloudSnow {...iconProps} className="weather-icon-snow" />;
    if (code >= 95 && code <= 99) return <CloudRain {...iconProps} className="weather-icon-storm" />;
    
    return <Cloud {...iconProps} className="weather-icon-cloud" />;
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      66: 'Light freezing rain', 67: 'Heavy freezing rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
      82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    
    return descriptions[code] || 'Unknown';
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="weather-container">
      <div className="weather-max-width">
        <div className="weather-header">
          <h1 className="weather-title">Weather Now</h1>
          <p className="weather-subtitle">Perfect weather insights for outdoor enthusiasts</p>
        </div>

        <div className="weather-search-container">
          <div className="weather-search-wrapper">
            <div className="weather-input-wrapper">
              <Search className="weather-search-icon" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Enter city name..."
                className="weather-input"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="weather-button"
            >
              {loading ? <Loader2 className="weather-spinner" size={20} /> : <Search size={20} />}
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="weather-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="weather-loading">
            <Loader2 className="weather-spinner" color="white" size={48} />
            <p className="weather-loading-text">Loading weather data...</p>
          </div>
        )}

        {weatherData && !loading && (
          <div className="weather-grid">
            <div className="weather-card">
              <div className="weather-location-header">
                <MapPin size={20} />
                <h2 className="weather-location-title">
                  {weatherData.location.name}, {weatherData.location.country}
                </h2>
              </div>
              
              <div className="weather-temp-section">
                <div>
                  <div className="weather-temperature">
                    {Math.round(weatherData.current.temperature_2m)}°C
                  </div>
                  <div className="weather-condition-wrapper">
                    {getWeatherIcon(weatherData.current.weather_code, 24)}
                    <span className="weather-condition-text">
                      {getWeatherDescription(weatherData.current.weather_code)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="weather-time-text">
                Feels like {Math.round(weatherData.current.apparent_temperature)}°C • {currentTime}
              </div>
            </div>

            <div className="weather-card">
              <h3 className="weather-details-title">Weather Details</h3>
              <div className="weather-details-grid">
                <div className="weather-detail-item">
                  <Droplets className="weather-icon-detail" size={20} />
                  <div>
                    <div className="weather-detail-label">Humidity</div>
                    <div className="weather-detail-value">{weatherData.current.relative_humidity_2m}%</div>
                  </div>
                </div>
                
                <div className="weather-detail-item">
                  <Wind className="weather-icon-detail" size={20} />
                  <div>
                    <div className="weather-detail-label">Wind Speed</div>
                    <div className="weather-detail-value">{Math.round(weatherData.current.wind_speed_10m)} km/h</div>
                  </div>
                </div>
                
                <div className="weather-detail-item">
                  <Eye className="weather-icon-detail" size={20} />
                  <div>
                    <div className="weather-detail-label">Visibility</div>
                    <div className="weather-detail-value">{Math.round(weatherData.current.visibility / 1000)} km</div>
                  </div>
                </div>
                
                <div className="weather-detail-item">
                  <Thermometer className="weather-icon-detail" size={20} />
                  <div>
                    <div className="weather-detail-label">Feels Like</div>
                    <div className="weather-detail-value">{Math.round(weatherData.current.apparent_temperature)}°C</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="weather-card weather-forecast-card">
              <h3 className="weather-details-title">7-Day Forecast</h3>
              <div className="weather-forecast-grid">
                {weatherData.daily.time.slice(0, 7).map((date, index) => {
                  const dayName = new Date(date).toLocaleDateString('en', { weekday: 'short' });
                  const isToday = index === 0;
                  
                  return (
                    <div key={date} className="weather-forecast-item">
                      <div className="weather-forecast-day">
                        {isToday ? 'Today' : dayName}
                      </div>
                      <div className="weather-forecast-icon">
                        {getWeatherIcon(weatherData.daily.weather_code[index], 20)}
                      </div>
                      <div className="weather-forecast-temp">
                        <div className="weather-forecast-temp-high">
                          {Math.round(weatherData.daily.temperature_2m_max[index])}°
                        </div>
                        <div className="weather-forecast-temp-low">
                          {Math.round(weatherData.daily.temperature_2m_min[index])}°
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="weather-card weather-forecast-card">
              <h3 className="weather-details-title">24-Hour Forecast</h3>
              <div className="weather-hourly-container">
                {weatherData.hourly.time.slice(0, 24).map((time, index) => {
                  const hour = new Date(time).toLocaleTimeString([], { hour: '2-digit' });
                  const isNow = index === 0;
                  
                  return (
                    <div key={time} className="weather-hourly-item">
                      <div className="weather-hourly-time">
                        {isNow ? 'Now' : hour}
                      </div>
                      <div className="weather-hourly-icon">
                        {getWeatherIcon(weatherData.hourly.weather_code[index], 16)}
                      </div>
                      <div className="weather-hourly-temp">
                        {Math.round(weatherData.hourly.temperature_2m[index])}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="weather-footer">
          Built for outdoor enthusiasts
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;