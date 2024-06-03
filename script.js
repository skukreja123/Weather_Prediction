document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const cityInput = document.getElementById('city-input');
    const currentWeatherSection = document.getElementById('current-weather');
    const forecastSection = document.getElementById('forecast');
    const previousForecastSection = document.getElementById('previous-forecast');

    searchButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default form submission
        const city = cityInput.value.trim(); // Trim the input value
        if (city) {
            fetchWeatherData(city);
        } else {
            alert('Please enter a valid city name');
        }
    });

    function fetchWeatherData(city) {
        const currentWeatherUrl = `http://localhost:3000/weather/current?city=${city}`;
        const forecastUrl = `http://localhost:3000/weather/forecast?city=${city}`;

        Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
            .then(responses => {
                return Promise.all(responses.map(res => {
                    if (!res.ok) {
                        return res.json().then(err => {
                            throw new Error(err.message || 'Network response was not ok');
                        });
                    }
                    return res.json();
                }));
            })
            .then(data => {
                displayCurrentWeather(data[0]);
                displayForecast(data[1], city);
                localStorage.setItem('lastCity', city);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert(`Error fetching weather data: ${error.message}`);
            });
    }

    function displayCurrentWeather(data) {
        const { name, main, wind, weather } = data;
        currentWeatherSection.innerHTML = `
            <h2>Current Weather in ${name}</h2>
            <p>Temperature: ${main.temp}°C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind Speed: ${wind.speed} m/s</p>
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
        `;
    }

    function displayForecast(data, city) {
        const lastCity = localStorage.getItem('lastCity');
        if (city !== lastCity) {
            previousForecastSection.innerHTML = forecastSection.innerHTML; 
        }
        
        forecastSection.innerHTML = '<h2>5-Day Forecast Weather</h2>'; 
        
        const forecastList = data.list.filter((item, index) => index % 8 === 0);
        forecastList.forEach(forecast => {
            const date = new Date(forecast.dt_txt).toDateString();
            forecastSection.innerHTML += `
                <div class="forecast-item">
                    <p>${date}</p>
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>${forecast.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                </div>
            `;
        });
    }

    // Load last searched city from local storage
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        fetchWeatherData(lastCity);
    }
});
