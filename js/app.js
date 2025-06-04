// Modern JavaScript with ES6+ features
'use strict';

// Constants
const CONFIG = {
    DEFAULT_LOCATION: {
        lat: 1.2494,
        lng: 103.8303
    }
};

// Mock weather data for demo
const MOCK_WEATHER = {
    current: {
        temp_c: 31,
        condition: { text: 'Partly cloudy', icon: '🌤️' },
        wind_kph: 20,
        humidity: 75
    },
    forecast: {
        forecastday: [{
            date: new Date().toLocaleDateString(),
            day: {
                maxtemp_c: 32,
                mintemp_c: 26,
                condition: { text: 'Afternoon thunderstorm', icon: '⛈️' },
                humidity: 80,
                uv: 11
            }
        }]
    }
};

// State management using a simple store
class Store {
    constructor() {
        this.state = {
            currentLocation: null,
            weather: null,
            events: [],
            userProfile: null
        };
        this.listeners = new Set();
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const store = new Store();

// Weather Service
class WeatherService {
    static async getWeatherForLocation(lat, lng) {
        // Using mock data instead of API
        return MOCK_WEATHER;
    }
}

// Map functionality
class MapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
    }

    async initMap() {
        try {
            const mapContainer = document.getElementById('cleanup-map');
            if (!mapContainer) return;
            
            // Set a fixed height for the map container
            mapContainer.style.height = '400px';
            
            // Initialize Leaflet map
            this.map = L.map('cleanup-map').setView([CONFIG.DEFAULT_LOCATION.lat, CONFIG.DEFAULT_LOCATION.lng], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);            // Add markers for Singapore beach cleanup locations
            L.marker([1.2494, 103.8303]) // Siloso Beach
                .bindPopup('Beach Cleanup Event<br>June 15, 2025 - 8 AM<br>Siloso Beach, Sentosa')
                .addTo(this.map);
            
            L.marker([1.2485, 103.8245]) // Palawan Beach
                .bindPopup('Beach Cleanup Event<br>June 22, 2025 - 8 AM<br>Palawan Beach, Sentosa')
                .addTo(this.map);
                
            L.marker([1.2463, 103.8293]) // Tanjong Beach
                .bindPopup('Beach Cleanup Event<br>June 29, 2025 - 8 AM<br>Tanjong Beach, Sentosa')
                .addTo(this.map);

            this.addEventListeners();
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    }

    addEventListeners() {
        if (!this.map) return;
        this.map.on('click', (e) => {
            console.log('Map clicked at:', e.latlng);
        });
    }
}

// UI Components
class UI {
    static async updateWeatherDisplay(weatherData) {
        const weatherContainer = document.querySelector('.weather-container');
        if (!weatherData) {
            weatherContainer.innerHTML = '<p>Weather data unavailable</p>';
            return;
        }

        const { current, forecast } = weatherData;        weatherContainer.innerHTML = `
            <div class="weather-current">
                <h3>Current Weather at Sentosa</h3>
                <p>${current.temp_c}°C ${current.condition.icon}</p>
                <p>${current.condition.text}</p>
                <p>Wind: ${current.wind_kph} km/h</p>
                <p>Humidity: ${current.humidity}%</p>
            </div>
            <div class="weather-forecast">
                <h3>Today's Forecast</h3>
                <p>Temperature: ${forecast.forecastday[0].day.mintemp_c}°C - ${forecast.forecastday[0].day.maxtemp_c}°C</p>
                <p>${forecast.forecastday[0].day.condition.text} ${forecast.forecastday[0].day.condition.icon}</p>
                <p>UV Index: ${forecast.forecastday[0].day.uv} (High)</p>
                <p class="weather-tips">🌞 Don't forget sunscreen and water!</p>
            </div>
        `;
    }

    static showLoader() {
        // Add loading indicator
    }

    static hideLoader() {
        // Remove loading indicator
    }
}

// Event handlers
function setupEventListeners() {
    const modal = document.getElementById('joinModal');
    const closeButton = document.querySelector('.close-button');
    const joinForm = document.getElementById('joinForm');

    document.querySelector('.cta-button')?.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    joinForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            eventDate: document.getElementById('eventDate').value
        };
        
        // Store the registration
        const events = JSON.parse(localStorage.getItem('beachCleanupEvents') || '[]');
        events.push(formData);
        localStorage.setItem('beachCleanupEvents', JSON.stringify(events));
        
        // Show success message and close modal
        alert('Thanks for joining! We\'ll send you an email with the details.');
        modal.style.display = 'none';
        joinForm.reset();
    });

    // Implement smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Initialize application
async function initApp() {
    setupEventListeners();
    const mapManager = new MapManager();
    await mapManager.initMap();

    // Get user's location (with permission)
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                store.setState({ currentLocation: { lat: latitude, lng: longitude } });
                const weatherData = await WeatherService.getWeatherForLocation(latitude, longitude);
                store.setState({ weather: weatherData });
                UI.updateWeatherDisplay(weatherData);
            },
            error => {
                console.error('Geolocation error:', error);
                // Fall back to default location
                store.setState({ currentLocation: CONFIG.DEFAULT_LOCATION });
            }
        );
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
