/**
 * Weather App - JavaScript DOM Assignment #11
 * 
 * Features:
 * - Fetch weather data from OpenWeather API
 * - Display city name, temperature, description, humidity
 * - Loading state management
 * - Error handling
 * - Enter key support
 * - LocalStorage for last searched city
 */

// ========================================
// Configuration
// ========================================

// OpenWeather API Configuration
// Get your free API key at: https://openweathermap.org/api
const API_CONFIG = {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    apiKey: 'YOUR_API_KEY_HERE', // Replace with your OpenWeather API key
    units: 'metric' // Use 'imperial' for Fahrenheit
};

// ========================================
// DOM Elements
// ========================================

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');

// ========================================
// State Management
// ========================================

let isLoading = false;

// ========================================
// Utility Functions
// ========================================

/**
 * Creates an HTML element with optional classes and attributes
 * @param {string} tag - HTML tag name
 * @param {Object} options - Optional classes, attributes, and content
 * @returns {HTMLElement}
 */
function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    
    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    return element;
}

/**
 * Clears all content from the weather result container
 */
function clearWeatherResult() {
    weatherResult.innerHTML = '';
}

/**
 * Shows loading state in the weather result container
 */
function showLoadingState() {
    isLoading = true;
    searchBtn.classList.add('loading');
    searchBtn.disabled = true;
    
    clearWeatherResult();
    
    const loadingContainer = createElement('div', { className: 'loading-state' });
    const spinner = createElement('div', { className: 'loading-spinner' });
    const loadingText = createElement('p', { 
        className: 'loading-text', 
        textContent: 'Loading weather data...' 
    });
    
    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);
    weatherResult.appendChild(loadingContainer);
}

/**
 * Hides loading state
 */
function hideLoadingState() {
    isLoading = false;
    searchBtn.classList.remove('loading');
    searchBtn.disabled = false;
}

/**
 * Shows error state in the weather result container
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
    hideLoadingState();
    clearWeatherResult();
    
    const errorContainer = createElement('div', { className: 'error-state' });
    
    // Error icon (SVG)
    const errorIcon = createElement('div', { className: 'error-icon' });
    errorIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    `;
    
    const errorMessage = createElement('p', { 
        className: 'error-message', 
        textContent: message 
    });
    
    const errorHint = createElement('p', { 
        className: 'error-hint', 
        textContent: 'Please check the city name and try again.' 
    });
    
    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorMessage);
    errorContainer.appendChild(errorHint);
    weatherResult.appendChild(errorContainer);
}

/**
 * Saves the last searched city to localStorage
 * @param {string} city - City name to save
 */
function saveLastSearchedCity(city) {
    try {
        localStorage.setItem('lastSearchedCity', city);
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

/**
 * Gets the last searched city from localStorage
 * @returns {string|null}
 */
function getLastSearchedCity() {
    try {
        return localStorage.getItem('lastSearchedCity');
    } catch (error) {
        console.warn('Could not read from localStorage:', error);
        return null;
    }
}

// ========================================
// Weather Data Functions
// ========================================

/**
 * Fetches weather data from OpenWeather API
 * @param {string} city - City name to search
 * @returns {Promise<Object>} Weather data
 */
async function fetchWeatherData(city) {
    const url = `${API_CONFIG.baseUrl}?q=${encodeURIComponent(city)}&appid=${API_CONFIG.apiKey}&units=${API_CONFIG.units}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found');
        } else if (response.status === 401) {
            throw new Error('Invalid API key');
        } else {
            throw new Error('Failed to fetch weather data');
        }
    }
    
    const data = await response.json();
    return data;
}

/**
 * Creates the weather icon URL based on icon code
 * @param {string} iconCode - OpenWeather icon code
 * @returns {string} Icon URL
 */
function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Displays weather data in the result container
 * @param {Object} data - Weather data from API
 */
function displayWeatherData(data) {
    hideLoadingState();
    clearWeatherResult();
    
    // Create weather card
    const weatherCard = createElement('div', { className: 'weather-card' });
    
    // Header with location
    const header = createElement('div', { className: 'weather-header' });
    
    const locationDiv = createElement('div', { className: 'weather-location' });
    const cityName = createElement('h2', { 
        className: 'city-name', 
        textContent: data.name 
    });
    const countryCode = createElement('span', { 
        className: 'country-code', 
        textContent: data.sys.country 
    });
    locationDiv.appendChild(cityName);
    locationDiv.appendChild(countryCode);
    
    // Weather icon
    const iconContainer = createElement('div', { className: 'weather-icon-container' });
    const iconImg = createElement('img', {
        className: 'weather-icon',
        attributes: {
            src: getWeatherIconUrl(data.weather[0].icon),
            alt: data.weather[0].description
        }
    });
    iconContainer.appendChild(iconImg);
    
    header.appendChild(locationDiv);
    header.appendChild(iconContainer);
    
    // Temperature section
    const mainSection = createElement('div', { className: 'weather-main' });
    const tempValue = Math.round(data.main.temp);
    const temperature = createElement('span', { 
        className: 'temperature', 
        textContent: tempValue 
    });
    const tempUnit = createElement('span', { 
        className: 'temperature-unit', 
        textContent: '°C' 
    });
    mainSection.appendChild(temperature);
    mainSection.appendChild(tempUnit);
    
    // Weather description
    const descriptionDiv = createElement('div', { className: 'weather-description' });
    const descDot = createElement('span', { className: 'description-dot' });
    const descText = createElement('span', { 
        className: 'description-text', 
        textContent: data.weather[0].description 
    });
    descriptionDiv.appendChild(descDot);
    descriptionDiv.appendChild(descText);
    
    // Weather details grid
    const detailsGrid = createElement('div', { className: 'weather-details' });
    
    // Humidity
    const humidityItem = createDetailItem(
        'Humidity',
        `${data.main.humidity}%`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>`
    );
    
    // Wind Speed
    const windItem = createDetailItem(
        'Wind Speed',
        `${data.wind.speed} m/s`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
        </svg>`
    );
    
    // Feels Like
    const feelsLikeItem = createDetailItem(
        'Feels Like',
        `${Math.round(data.main.feels_like)}°C`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>`
    );
    
    // Pressure
    const pressureItem = createDetailItem(
        'Pressure',
        `${data.main.pressure} hPa`,
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>`
    );
    
    detailsGrid.appendChild(humidityItem);
    detailsGrid.appendChild(windItem);
    detailsGrid.appendChild(feelsLikeItem);
    detailsGrid.appendChild(pressureItem);
    
    // Assemble card
    weatherCard.appendChild(header);
    weatherCard.appendChild(mainSection);
    weatherCard.appendChild(descriptionDiv);
    weatherCard.appendChild(detailsGrid);
    
    weatherResult.appendChild(weatherCard);
}

/**
 * Creates a detail item for the weather details grid
 * @param {string} label - Detail label
 * @param {string} value - Detail value
 * @param {string} iconSvg - SVG icon markup
 * @returns {HTMLElement}
 */
function createDetailItem(label, value, iconSvg) {
    const item = createElement('div', { className: 'detail-item' });
    
    const icon = createElement('div', { className: 'detail-icon' });
    icon.innerHTML = iconSvg;
    
    const labelEl = createElement('span', { 
        className: 'detail-label', 
        textContent: label 
    });
    
    const valueEl = createElement('span', { 
        className: 'detail-value', 
        textContent: value 
    });
    
    item.appendChild(icon);
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    
    return item;
}

// ========================================
// Main Search Function
// ========================================

/**
 * Main function to search and display weather
 */
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        cityInput.focus();
        return;
    }
    
    if (isLoading) return;
    
    showLoadingState();
    
    try {
        const weatherData = await fetchWeatherData(city);
        displayWeatherData(weatherData);
        saveLastSearchedCity(city);
    } catch (error) {
        console.error('Weather fetch error:', error);
        
        if (error.message === 'City not found') {
            showErrorState('City not found');
        } else if (error.message === 'Invalid API key') {
            showErrorState('API key error. Please check configuration.');
        } else {
            showErrorState('Something went wrong');
        }
    }
}

// ========================================
// Event Listeners
// ========================================

// Search button click
searchBtn.addEventListener('click', searchWeather);

// Enter key support
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchWeather();
    }
});

// ========================================
// Initialization
// ========================================

/**
 * Initializes the app on page load
 */
function initializeApp() {
    // Load last searched city from localStorage
    const lastCity = getLastSearchedCity();
    
    if (lastCity) {
        cityInput.value = lastCity;
        // Automatically fetch weather for the last searched city
        searchWeather();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);