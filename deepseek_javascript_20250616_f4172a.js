// API Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

locationBtn.addEventListener('click', getLocationWeather);

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Functions
async function getWeatherData(city) {
    try {
        // Get current weather
        const currentResponse = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`);
        const currentData = await currentResponse.json();
        
        if (currentData.cod === '404') {
            alert('City not found. Please try again.');
            return;
        }
        
        // Get forecast
        const forecastResponse = await fetch(`${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentTemp.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Get daily forecasts (every 24 hours)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            </div>
            <div class="forecast-temp">
                <span>${Math.round(forecast.main.temp_max)}°</span>
                <span>${Math.round(forecast.main.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Get current weather
                    const currentResponse = await fetch(`${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                    const currentData = await currentResponse.json();
                    
                    // Get forecast
                    const forecastResponse = await fetch(`${FORECAST_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                    const forecastData = await forecastResponse.json();
                    
                    displayWeather(currentData);
                    displayForecast(forecastData);
                    searchInput.value = '';
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                    alert('Error fetching weather data. Please try again.');
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please enable location services or search manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please search manually.');
    }
}

// Initialize with default city
getWeatherData('London');