let autoUpdateInterval = null;
let locationWatchId = null;
let isTrackingLocation = false;
let currentCity = null;
let currentWeatherData = null;
const UPDATE_INTERVAL = 5 * 60 * 1000;

// Tab Navigation
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected nav item
    const navItems = document.querySelectorAll('.bottom-nav-item');
    const tabIndex = ['today', 'metrics', 'radar', 'forecast'].indexOf(tabName);
    if (navItems[tabIndex]) {
        navItems[tabIndex].classList.add('active');
    }
    
    // Load content for specific tabs
    if (tabName === 'metrics' && currentWeatherData) {
        loadMetricsTab();
    } else if (tabName === 'forecast' && currentWeatherData) {
        loadForecast10DaysTab();
    }
}

// Load Metrics Tab Content
function loadMetricsTab() {
    const metricsContent = document.getElementById('metrics-content');
    if (!metricsContent || !currentWeatherData) return;

    const { main, wind, visibility } = currentWeatherData;
    
    const metrics = [
        { icon: 'thermometer', label: 'Temperatura', value: `${Math.round(main.temp)}°C` },
        { icon: 'droplets', label: 'Umidade', value: `${main.humidity}%` },
        { icon: 'wind', label: 'Vento', value: `${wind.speed} m/s` },
        { icon: 'eye', label: 'Visibilidade', value: `${(visibility / 1000).toFixed(1)} km` },
        { icon: 'gauge', label: 'Pressão', value: `${main.pressure} hPa` },
        { icon: 'thermometer-sun', label: 'Sensação', value: `${Math.round(main.feels_like)}°C` },
    ];

    metricsContent.innerHTML = metrics.map(metric => `
        <div class="telemetry-item">
            <i data-lucide="${metric.icon}" class="telemetry-icon"></i>
            <p class="telemetry-value">${metric.value}</p>
            <p class="telemetry-label">${metric.label}</p>
        </div>
    `).join('');
    
    // Initialize Lucide icons
    lucide.createIcons();
}

// Load 10 Days Forecast Tab Content
function loadForecast10DaysTab() {
    const forecastContent = document.getElementById('forecast-10-content');
    if (!forecastContent || !currentWeatherData) {
        forecastContent.innerHTML = '<p class="card-description">Carregue os dados climáticos primeiro.</p>';
        return;
    }

    // Get forecast data from the forecast section if available
    const forecastElement = document.getElementById('forecast');
    if (!forecastElement || forecastElement.style.display === 'none') {
        forecastContent.innerHTML = '<p class="card-description">Previsão não disponível. Busque o clima de uma cidade primeiro.</p>';
        return;
    }

    // Clone the forecast content
    forecastContent.innerHTML = forecastElement.innerHTML;
}

// Variáveis para gerenciamento de instalação PWA
let deferredPrompt;
let isInstalled = false;

// Detectar se o app já está instalado
window.addEventListener('load', () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Verificar se o app está em modo standalone (já instalado)
    if (window.navigator.standalone === true) {
        isInstalled = true;
    }
    
    // Para Android, verificar se foi instalado via Web App Install
    const hideInstallBtn = localStorage.getItem('climago-app-installed');
    if (hideInstallBtn === 'true' || isInstalled) {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
});

// Capturar o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (event) => {
    // Prevenir o prompt automático do navegador
    event.preventDefault();
    deferredPrompt = event;
    
    // Mostrar nosso botão de instalação customizado
    const installBtn = document.getElementById('install-btn');
    if (installBtn && !isInstalled) {
        installBtn.style.display = 'flex';
    }
});

// Função para instalar o app
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou a instalação do app');
                isInstalled = true;
                localStorage.setItem('climago-app-installed', 'true');
                
                // Ocultar o botão de instalação
                const installBtn = document.getElementById('install-btn');
                if (installBtn) {
                    installBtn.style.display = 'none';
                }
            } else {
                console.log('Usuário recusou a instalação do app');
            }
            deferredPrompt = null;
        });
    } else {
        alert('Este navegador não suporta a instalação de aplicativos web. Use um navegador moderno como Chrome, Edge ou Firefox no Android.');
    }
}

// Ocultar o botão quando o app é instalado
window.addEventListener('appinstalled', () => {
    console.log('App instalado com sucesso!');
    isInstalled = true;
    localStorage.setItem('climago-app-installed', 'true');
    
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});

function loadRecentSearches() {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
}

function saveRecentSearch(city) {
    const searches = loadRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== city.toLowerCase());
    filtered.unshift(city);
    const limited = filtered.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(limited));
    renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.getElementById('recentSearchesList');
    const searches = loadRecentSearches();

    if (!container) {
        return;
    }

    if (searches.length === 0) {
        container.innerHTML = '<p class="no-searches">Nenhuma busca recente</p>';
        return;
    }
    
    container.innerHTML = '';
    searches.forEach(city => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'recent-search-btn';
        button.textContent = city;
        button.setAttribute('aria-label', `Buscar clima para ${city}`);
        button.addEventListener('click', () => searchCity(city));
        container.appendChild(button);
    });
}

function searchCity(city) {
    document.getElementById('city').value = city;
    getWeather();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
}

function toggleAutoUpdate() {
    const checkbox = document.getElementById('autoUpdate');
    
    if (checkbox.checked && currentCity) {
        startAutoUpdate();
    } else {
        stopAutoUpdate();
    }
}

function startAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
    autoUpdateInterval = setInterval(() => {
        if (currentCity) {
            getWeather(true);
        }
    }, UPDATE_INTERVAL);
}

function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

function getLocation() {
    if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador');
        return;
    }
    
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByCoords(latitude, longitude);
        },
        (error) => {
            console.error('Erro de geolocalização:', error);
            handleGeolocationError(error);
            loadingElement.style.display = 'none';
        }
    );
}

function startLocationTracking() {
    if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador');
        return;
    }

    if (isTrackingLocation) {
        stopLocationTracking();
        return;
    }

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    locationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const accuracy = position.coords.accuracy;
            
            console.log(`Localização atualizada: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (precisão: ${accuracy.toFixed(0)}m)`);
            
            await getWeatherByCoords(latitude, longitude);
            updateLocationTrackingUI(true);
        },
        (error) => {
            console.error('Erro no rastreamento de localização:', error);
            handleGeolocationError(error);
            stopLocationTracking();
        },
        options
    );

    isTrackingLocation = true;
    updateLocationTrackingUI(true);
}

function stopLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
    isTrackingLocation = false;
    updateLocationTrackingUI(false);
}

function handleGeolocationError(error) {
    let message = 'Erro ao obter localização.';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada. Por favor, habilite a geolocalização nas configurações do navegador.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Informações de localização indisponíveis.';
            break;
        case error.TIMEOUT:
            message = 'Tempo esgotado ao obter localização.';
            break;
        default:
            message = 'Erro desconhecido ao obter localização.';
    }
    
    alert(message);
}

function updateLocationTrackingUI(isTracking) {
    const geoBtn = document.querySelector('.geo-btn');
    const locationStatus = document.getElementById('location-status');
    
    if (geoBtn) {
        geoBtn.classList.toggle('is-tracking', isTracking);
        geoBtn.setAttribute('aria-pressed', String(isTracking));

        if (isTracking) {
            geoBtn.innerHTML = '🛑';
            geoBtn.title = 'Parar rastreamento de localização';
            geoBtn.setAttribute('aria-label', 'Parar rastreamento de localização');
            geoBtn.setAttribute('data-tooltip', 'Parar rastreamento de localização');
        } else {
            geoBtn.innerHTML = '📍';
            geoBtn.title = 'Iniciar rastreamento de localização';
            geoBtn.setAttribute('aria-label', 'Iniciar rastreamento de localização');
            geoBtn.setAttribute('data-tooltip', 'Iniciar rastreamento de localização');
        }
    }
    
    if (locationStatus) {
        locationStatus.style.display = isTracking ? 'flex' : 'none';
    }
}

async function getWeatherByCoords(lat, lon) {
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');

    try {
        const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao buscar dados meteorológicos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        currentCity = data.name;
        currentWeatherData = data;
        document.getElementById('city').value = data.name;
        displayWeather(data);
        saveRecentSearch(data.name);

        const forecastData = await getForecast(data.name);
        
        // Display next day forecast
        if (forecastData) {
            displayNextDayForecast(forecastData);
        }

        const results = await Promise.all([
            getAirQuality(lat, lon),
            getUVIndex(lat, lon),
            getHourlyForecast(lat, lon)
        ]);
        const airQualityData = results[0];
        const uvData = results[1];

        // Evaluate tennis conditions
        evaluateTennisConditions(data, uvData, airQualityData);

    } catch (error) {
        console.error('Erro ao obter clima:', error);
        weatherElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao buscar dados. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

async function getForecast(city) {
    const forecastElement = document.getElementById('forecast');

    try {
        const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar previsão');
        }

        const data = await response.json();
        displayForecast(data);
        return data;

    } catch (error) {
        console.error('Erro ao obter previsão:', error);
        return null;
    }
}

async function getAirQuality(lat, lon) {
    const airQualityElement = document.getElementById('air-quality');

    try {
        const response = await fetch(`/api/air-pollution?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar qualidade do ar');
        }

        const data = await response.json();
        displayAirQuality(data);
        return data;

    } catch (error) {
        console.error('Erro ao obter qualidade do ar:', error);
        return null;
    }
}

async function getUVIndex(lat, lon) {
    const uvElement = document.getElementById('uv-index');

    try {
        const response = await fetch(`/api/uv-index?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar índice UV');
        }

        const data = await response.json();
        displayUVIndex(data);
        return data;

    } catch (error) {
        console.error('Erro ao obter índice UV:', error);
        return null;
    }
}

async function getHourlyForecast(lat, lon) {
    const hourlyElement = document.getElementById('hourly-forecast');

    try {
        const response = await fetch(`/api/onecall?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar previsão horária');
        }

        const data = await response.json();
        displayHourlyForecast(data);

    } catch (error) {
        console.error('Erro ao obter previsão horária:', error);
    }
}

async function getExtremePhenomena(weatherData, forecastData) {
    const phenomenaElement = document.getElementById('extreme-phenomena');

    try {
        const response = await fetch('/api/ai/extreme-phenomena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: weatherData,
                forecastData: forecastData,
                city: currentCity
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao analisar fenômenos extremos');
        }

        const data = await response.json();
        displayExtremePhenomena(data);

    } catch (error) {
        console.error('Erro ao obter análise de fenômenos extremos:', error);
    }
}

function displayForecast(data) {
    const forecastElement = document.getElementById('forecast');
    const forecast10Element = document.getElementById('forecast-10-content');
    
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 10);
    
    const htmlContent = `<div class="forecast-container"><h3>Previsão atual</h3><p class="muted-text">Dados sincronizados com a estação local.</p></div>`;
    const listContent = dailyForecasts.map((day, index) => {
        const date = new Date(day.dt * 1000);
        const label = index === 0 ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'long' });
        const icon = day.weather[0].main.toLowerCase().includes('rain') ? 'rainy' : day.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' : 'sunny';
        return `<article class="forecast-item ${index === 0 ? 'today' : ''}">
            <div class="day">${label}<span class="date">${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>
            <div class="condition"><span class="material-symbols-outlined">${icon}</span>${Math.round(day.pop * 100)}%</div>
            <div class="temps"><span>${Math.round(day.main.temp_min)}°</span><i class="range"></i><strong>${Math.round(day.main.temp_max)}°</strong></div>
        </article>`;
    }).join('');
    
    forecastElement.innerHTML = htmlContent;
    forecastElement.style.display = 'block';
    if (forecast10Element) forecast10Element.innerHTML = listContent || '<p class="muted-text">Previsão indisponível.</p>';
}

function displayNextDayForecast(data) {
    const nextDayElement = document.getElementById('next-day-forecast');
    
    // Get the first forecast item for tomorrow (around 12:00)
    const tomorrowForecast = data.list.find(item => {
        const date = new Date(item.dt * 1000);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.getDate() === tomorrow.getDate() && 
               date.getMonth() === tomorrow.getMonth() && 
               date.getFullYear() === tomorrow.getFullYear() &&
               item.dt_txt.includes('12:00:00');
    });
    
    if (!tomorrowForecast) {
        // Fallback to first forecast item if 12:00 not found
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fallbackForecast = data.list.find(item => {
            const date = new Date(item.dt * 1000);
            return date.getDate() === tomorrow.getDate() && 
                   date.getMonth() === tomorrow.getMonth() && 
                   date.getFullYear() === tomorrow.getFullYear();
        });
        
        if (!fallbackForecast) {
            return;
        }
        
        displayNextDayData(fallbackForecast);
        return;
    }
    
    displayNextDayData(tomorrowForecast);
}

function displayNextDayData(forecastData) {
    const nextDayElement = document.getElementById('next-day-forecast');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const htmlContent = `
        <div class="next-day-container">
            <div class="panel-heading">
                <div>
                    <p class="panel-kicker">Amanhã</p>
                    <h3 id="next-day-heading">${tomorrow.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                </div>
            </div>
            <div class="next-day-content">
                <div class="next-day-main">
                    <img src="https://openweathermap.org/img/wn/${forecastData.weather[0].icon}@2x.png"
                         alt="${forecastData.weather[0].description}"
                         class="next-day-icon"
                         loading="lazy"
                         width="80"
                         height="80">
                    <div class="next-day-temp">
                        <span class="next-day-temp-value">${Math.round(forecastData.main.temp)}°C</span>
                        <p class="next-day-desc">${forecastData.weather[0].description}</p>
                    </div>
                </div>
                <div class="next-day-details">
                    <div class="next-day-detail">
                        <span class="detail-label">Sensação</span>
                        <span class="detail-value">${Math.round(forecastData.main.feels_like)}°C</span>
                    </div>
                    <div class="next-day-detail">
                        <span class="detail-label">Umidade</span>
                        <span class="detail-value">${forecastData.main.humidity}%</span>
                    </div>
                    <div class="next-day-detail">
                        <span class="detail-label">Vento</span>
                        <span class="detail-value">${forecastData.wind.speed} m/s</span>
                    </div>
                    <div class="next-day-detail">
                        <span class="detail-label">Min/Max</span>
                        <span class="detail-value">${Math.round(forecastData.main.temp_min)}° / ${Math.round(forecastData.main.temp_max)}°</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    nextDayElement.innerHTML = htmlContent;
    nextDayElement.style.display = 'block';
}

async function getWeather(isAutoUpdate = false) {
    const cityInput = document.getElementById('city');
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');
    const city = cityInput.value.trim();

    if (!city) {
        alert('Por favor, digite o nome de uma cidade.');
        return;
    }

    loadingElement.style.display = 'block';

    if (!isAutoUpdate) {
        weatherElement.innerHTML = '';
        forecastElement.style.display = 'none';
        document.getElementById('next-day-forecast').style.display = 'none';
        document.getElementById('air-quality').style.display = 'none';
        document.getElementById('uv-index').style.display = 'none';
        document.getElementById('hourly-forecast').style.display = 'none';
        document.getElementById('extreme-phenomena').style.display = 'none';
        document.getElementById('tennis-conditions').style.display = 'none';
    }

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao buscar dados meteorológicos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        currentCity = city;
        currentWeatherData = data;
        displayWeather(data);

        if (!isAutoUpdate) {
            saveRecentSearch(city);
            const forecastData = await getForecast(city);
            
            // Display next day forecast
            if (forecastData) {
                displayNextDayForecast(forecastData);
            }

            let airQualityData = null;
            let uvData = null;

            if (data.coord) {
                const results = await Promise.all([
                    getAirQuality(data.coord.lat, data.coord.lon),
                    getUVIndex(data.coord.lat, data.coord.lon),
                    getHourlyForecast(data.coord.lat, data.coord.lon)
                ]);
                airQualityData = results[0];
                uvData = results[1];
            }

            // Evaluate tennis conditions
            evaluateTennisConditions(data, uvData, airQualityData);

            const checkbox = document.getElementById('autoUpdate');
            if (checkbox.checked) {
                startAutoUpdate();
            }
        }

    } catch (error) {
        console.error('Erro ao obter clima:', error);
        weatherElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao buscar dados. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

function displayWeather(data) {
    const weatherElement = document.getElementById('weather');
    const { name, sys, main, weather, wind, cached } = data;
    const description = weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);
    const windKmh = Math.round(wind.speed * 3.6);
    const icon = weather[0].main.toLowerCase().includes('rain') ? 'rainy' : weather[0].main.toLowerCase().includes('cloud') ? 'partly_cloudy_day' : 'sunny';
    document.getElementById('location-name').textContent = `${name}, ${sys.country}`;
    document.getElementById('station-name').textContent = cached ? 'DADOS EM CACHE · ESTAÇÃO LOCAL' : 'RADAR ONLINE · ESTAÇÃO LOCAL';
    weatherElement.innerHTML = `
        <div class="status-pill"><span class="material-symbols-outlined">${icon}</span> RADAR ATIVO · AO VIVO</div>
        <div class="hero-temperature">${Math.round(main.temp)}<sup>°</sup><span class="hero-weather-icon material-symbols-outlined">${icon}</span></div>
        <h2>${description}</h2><p class="muted-text">Sensação de ${Math.round(main.feels_like)}°</p>
        <div class="hero-range"><span>↑ Máx: ${Math.round(main.temp_max)}°</span><i></i><span>↓ Mín: ${Math.round(main.temp_min)}°</span></div>
        <div class="metric-strip"><div><span>SENSAÇÃO</span><strong>${Math.round(main.feels_like)}°</strong></div><div><span>UMIDADE</span><strong>${main.humidity}%</strong></div><div><span>VENTO</span><strong>${windKmh} km/h</strong></div></div>`;
}

async function getAIAdvice() {
    if (!currentWeatherData || !currentCity) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }

    const aiElement = document.getElementById('ai-advice');
    const loadingElement = document.getElementById('loading');
    
    aiElement.style.display = 'block';
    aiElement.innerHTML = '<p class="loading">Gerando recomendações com IA...</p>';
    loadingElement.style.display = 'block';

    try {
        const response = await fetch('/api/ai/weather-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: currentWeatherData,
                city: currentCity
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao obter recomendações.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        
        aiElement.innerHTML = `
            <div class="ai-advice-container">
                <h3>🤖 Recomendações da IA</h3>
                <div class="ai-advice-content">${data.advice.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao obter recomendações:', error);
        aiElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao obter recomendações. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

async function analyzeExtremePhenomena() {
    if (!currentWeatherData || !currentCity) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }

    const phenomenaElement = document.getElementById('extreme-phenomena');
    const loadingElement = document.getElementById('loading');
    const phenomenaBtn = document.querySelector('.phenomena-btn');
    
    // Show loading state
    phenomenaElement.style.display = 'block';
    phenomenaElement.innerHTML = `
        <div class="phenomena-container">
            <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
            <p class="loading">Analisando condições atmosféricas com IA...</p>
        </div>
    `;
    loadingElement.style.display = 'block';
    
    // Disable button during analysis
    if (phenomenaBtn) {
        phenomenaBtn.disabled = true;
        phenomenaBtn.innerHTML = '🔄 Analisando...';
    }

    try {
        // Get forecast data if not already available
        let forecastData = null;
        if (currentWeatherData.coord) {
            try {
                const forecastResponse = await fetch(`/api/forecast?city=${encodeURIComponent(currentCity)}`);
                if (forecastResponse.ok) {
                    forecastData = await forecastResponse.json();
                }
            } catch (error) {
                console.error('Erro ao obter previsão:', error);
            }
        }

        const response = await fetch('/api/ai/extreme-phenomena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: currentWeatherData,
                forecastData: forecastData,
                city: currentCity
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao analisar fenômenos extremos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        displayExtremePhenomena(data);
        
        // Scroll to phenomena section
        phenomenaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Erro ao analisar fenômenos extremos:', error);
        phenomenaElement.innerHTML = `
            <div class="phenomena-container">
                <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
                <p class="error-message">
                    ${error.message || 'Erro inesperado ao analisar fenômenos. Por favor, tente novamente mais tarde.'}
                </p>
            </div>
        `;
    } finally {
        loadingElement.style.display = 'none';
        
        // Re-enable button
        if (phenomenaBtn) {
            phenomenaBtn.disabled = false;
            phenomenaBtn.innerHTML = '🌍 Fenômenos Extremos';
        }
    }
}

function displayAirQuality(data) {
    const airQualityElement = document.getElementById('air-quality');

    if (!data.list || data.list.length === 0) {
        return;
    }

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const aqiLevels = {
        1: { label: 'Bom', color: '#4fd1c5', description: 'Qualidade do ar satisfatória' },
        2: { label: 'Moderado', color: '#f6e05e', description: 'Qualidade do ar aceitável' },
        3: { label: 'Ruim para grupos sensíveis', color: '#ed8936', description: 'Pode afetar pessoas sensíveis' },
        4: { label: 'Ruim', color: '#f56565', description: 'Pode afetar toda a população' },
        5: { label: 'Muito Ruim', color: '#c53030', description: 'Alerta de saúde' }
    };

    const level = aqiLevels[aqi] || aqiLevels[1];

    const htmlContent = `
        <div class="air-quality-container">
            <h3>🌬️ Qualidade do Ar</h3>
            <div class="aqi-display">
                <div class="aqi-badge" style="background-color: ${level.color}">
                    <span class="aqi-value">${aqi}</span>
                    <span class="aqi-label">${level.label}</span>
                </div>
                <p class="aqi-description">${level.description}</p>
            </div>
            <div class="pollutants-grid">
                <div class="pollutant-item">
                    <span class="pollutant-name">PM2.5</span>
                    <span class="pollutant-value">${components.pm2_5} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">PM10</span>
                    <span class="pollutant-value">${components.pm10} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">O₃</span>
                    <span class="pollutant-value">${components.o3} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">NO₂</span>
                    <span class="pollutant-value">${components.no2} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">SO₂</span>
                    <span class="pollutant-value">${components.so2} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">CO</span>
                    <span class="pollutant-value">${components.co} µg/m³</span>
                </div>
            </div>
        </div>
    `;

    airQualityElement.innerHTML = htmlContent;
    airQualityElement.style.display = 'block';
}

function displayUVIndex(data) {
    const uvElement = document.getElementById('uv-index');

    if (!data.value) {
        return;
    }

    const uv = data.value;

    const uvLevels = {
        low: { max: 2.9, label: 'Baixo', color: '#4fd1c5', protection: 'Sem proteção necessária' },
        moderate: { max: 5.9, label: 'Moderado', color: '#f6e05e', protection: 'Use proteção em horários de pico' },
        high: { max: 7.9, label: 'Alto', color: '#ed8936', protection: 'Use protetor solar e chapéu' },
        veryHigh: { max: 10.9, label: 'Muito Alto', color: '#f56565', protection: 'Proteção extra necessária' },
        extreme: { max: Infinity, label: 'Extremo', color: '#c53030', protection: 'Evite exposição solar' }
    };

    let level = uvLevels.low;
    for (const [key, value] of Object.entries(uvLevels)) {
        if (uv <= value.max) {
            level = value;
            break;
        }
    }

    const htmlContent = `
        <div class="uv-container">
            <h3>☀️ Índice UV</h3>
            <div class="uv-display">
                <div class="uv-badge" style="background-color: ${level.color}">
                    <span class="uv-value">${uv.toFixed(1)}</span>
                    <span class="uv-label">${level.label}</span>
                </div>
                <p class="uv-protection">${level.protection}</p>
            </div>
        </div>
    `;

    uvElement.innerHTML = htmlContent;
    uvElement.style.display = 'block';
}

function displayHourlyForecast(data) {
    const hourlyElement = document.getElementById('hourly-forecast');

    if (!data.hourly || data.hourly.length === 0) {
        return;
    }

    const next24Hours = data.hourly.slice(0, 8);

    const htmlContent = next24Hours.map((hour, index) => {
        const icon = hour.weather[0].main.toLowerCase().includes('rain') ? 'rainy' : hour.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' : 'sunny';
        return `<article class="hourly-item"><p>${index === 0 ? 'Agora' : new Date(hour.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p><span class="material-symbols-outlined">${icon}</span><strong>${Math.round(hour.temp)}°</strong><p>💧 ${Math.round(hour.pop * 100)}%</p></article>`;
    }).join('');

    hourlyElement.innerHTML = htmlContent;
    hourlyElement.style.display = 'block';
}

function displayExtremePhenomena(data) {
    const phenomenaElement = document.getElementById('extreme-phenomena');

    if (!data.phenomena || data.phenomena.length === 0) {
        phenomenaElement.innerHTML = `
            <div class="phenomena-container">
                <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
                <p class="phenomena-summary">${data.summary || 'Nenhum fenômeno extremo detectado no momento.'}</p>
            </div>
        `;
        phenomenaElement.style.display = 'block';
        return;
    }

    const dangerColors = {
        'BAIXO': '#4fd1c5',
        'MÉDIO': '#f6e05e',
        'ALTO': '#ed8936',
        'EXTREMO': '#c53030'
    };

    // Check for high danger phenomena and trigger alerts
    const highDangerPhenomena = data.phenomena.filter(p =>
        p.dangerLevel === 'ALTO' || p.dangerLevel === 'EXTREMO'
    );

    if (highDangerPhenomena.length > 0) {
        triggerDangerAlert(highDangerPhenomena);
    }

    const htmlContent = `
        <div class="phenomena-container">
            <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
            <p class="phenomena-summary">${data.summary}</p>
            <div class="phenomena-grid">
                ${data.phenomena.map(phenomenon => `
                    <div class="phenomenon-card ${phenomenon.dangerLevel === 'ALTO' || phenomenon.dangerLevel === 'EXTREMO' ? 'phenomenon-card--dangerous' : ''}" style="border-left: 4px solid ${dangerColors[phenomenon.dangerLevel] || '#4fd1c5'}">
                        <div class="phenomenon-header">
                            <h4 class="phenomenon-name">${phenomenon.name}</h4>
                            <span class="phenomenon-danger" style="background-color: ${dangerColors[phenomenon.dangerLevel] || '#4fd1c5'}">${phenomenon.dangerLevel}</span>
                        </div>
                        <p class="phenomenon-description">${phenomenon.description}</p>
                        <div class="phenomenon-recommendations">
                            <p class="recommendations-title">🛡️ Recomendações:</p>
                            <ul class="recommendations-list">
                                ${phenomenon.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    phenomenaElement.innerHTML = htmlContent;
    phenomenaElement.style.display = 'block';
}

function evaluateTennisConditions(weatherData, uvData, airQualityData) {
    const tennisElement = document.getElementById('tennis-conditions');

    if (!weatherData || !weatherData.main) {
        return;
    }

    const temp = weatherData.main.temp;
    const feelsLike = weatherData.main.feels_like;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind ? weatherData.wind.speed : 0;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherDescription = weatherData.weather[0].description.toLowerCase();

    // UV data
    const uvIndex = uvData && uvData.value ? uvData.value : 0;

    // Air quality data
    const aqi = airQualityData && airQualityData.list && airQualityData.list.length > 0
        ? airQualityData.list[0].main.aqi : 1;

    // Evaluate conditions
    let score = 100;
    let factors = [];
    let recommendations = [];

    // Temperature evaluation (ideal: 15-28°C)
    if (temp < 10) {
        score -= 30;
        factors.push({ name: 'Temperatura baixa', status: 'ruim', impact: -30 });
        recommendations.push('Use roupas térmicas e aqueça-se bem antes de jogar');
    } else if (temp >= 10 && temp < 15) {
        score -= 15;
        factors.push({ name: 'Temperatura fresca', status: 'regular', impact: -15 });
        recommendations.push('Use roupas leves mas quentes, faça aquecimento prolongado');
    } else if (temp >= 15 && temp <= 28) {
        factors.push({ name: 'Temperatura ideal', status: 'ótimo', impact: 0 });
    } else if (temp > 28 && temp <= 32) {
        score -= 10;
        factors.push({ name: 'Temperatura alta', status: 'regular', impact: -10 });
        recommendations.push('Mantenha-se hidratado, faça pausas frequentes, evite horários de pico');
    } else {
        score -= 35;
        factors.push({ name: 'Temperatura muito alta', status: 'ruim', impact: -35 });
        recommendations.push('Evite jogar nestas condições, risco de insolação e exaustão');
    }

    // Humidity evaluation (ideal: 40-60%)
    if (humidity < 30) {
        score -= 10;
        factors.push({ name: 'Umidade baixa', status: 'regular', impact: -10 });
        recommendations.push('Hidrate-se mais, use protetor labial');
    } else if (humidity >= 30 && humidity <= 60) {
        factors.push({ name: 'Umidade ideal', status: 'ótimo', impact: 0 });
    } else if (humidity > 60 && humidity <= 80) {
        score -= 15;
        factors.push({ name: 'Umidade alta', status: 'regular', impact: -15 });
        recommendations.push('Use roupas leves e respiráveis, mantenha-se hidratado');
    } else {
        score -= 25;
        factors.push({ name: 'Umidade muito alta', status: 'ruim', impact: -25 });
        recommendations.push('Evite jogar, desconforto excessivo e risco de desidratação');
    }

    // Wind evaluation (ideal: 0-15 km/h)
    const windKmh = windSpeed * 3.6;
    if (windKmh < 15) {
        factors.push({ name: 'Vento calmo', status: 'ótimo', impact: 0 });
    } else if (windKmh >= 15 && windKmh < 25) {
        score -= 10;
        factors.push({ name: 'Vento moderado', status: 'regular', impact: -10 });
        recommendations.push('Ajuste sua técnica para compensar o vento');
    } else if (windKmh >= 25 && windKmh < 35) {
        score -= 25;
        factors.push({ name: 'Vento forte', status: 'ruim', impact: -25 });
        recommendations.push('Vento forte afeta a bola, considere remarcar');
    } else {
        score -= 40;
        factors.push({ name: 'Vento muito forte', status: 'ruim', impact: -40 });
        recommendations.push('Não recomendado jogar com vento desta intensidade');
    }

    // Weather condition evaluation
    if (weatherCondition.includes('rain') || weatherDescription.includes('chuva')) {
        score -= 50;
        factors.push({ name: 'Chuva', status: 'ruim', impact: -50 });
        recommendations.push('Não jogue na chuva - risco de escorregões e danos à quadra');
    } else if (weatherCondition.includes('storm') || weatherDescription.includes('tempestade')) {
        score -= 100;
        factors.push({ name: 'Tempestade', status: 'perigoso', impact: -100 });
        recommendations.push('PERIGO: Não jogue em tempestade - risco de raios');
    } else if (weatherCondition.includes('snow') || weatherDescription.includes('neve')) {
        score -= 60;
        factors.push({ name: 'Neve', status: 'ruim', impact: -60 });
        recommendations.push('Condições impróprias para tênis');
    } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
        factors.push({ name: 'Céu limpo', status: 'ótimo', impact: 0 });
    } else if (weatherCondition.includes('cloud')) {
        factors.push({ name: 'Nublado', status: 'bom', impact: 0 });
    }

    // UV evaluation
    if (uvIndex > 0 && uvIndex <= 2) {
        factors.push({ name: 'UV baixo', status: 'ótimo', impact: 0 });
    } else if (uvIndex > 2 && uvIndex <= 5) {
        factors.push({ name: 'UV moderado', status: 'bom', impact: 0 });
        recommendations.push('Use protetor solar FPS 30+');
    } else if (uvIndex > 5 && uvIndex <= 7) {
        score -= 10;
        factors.push({ name: 'UV alto', status: 'regular', impact: -10 });
        recommendations.push('Use protetor solar FPS 50+, chapéu e óculos');
    } else if (uvIndex > 7 && uvIndex <= 10) {
        score -= 20;
        factors.push({ name: 'UV muito alto', status: 'ruim', impact: -20 });
        recommendations.push('Proteção máxima necessária, evite horários de pico (10h-16h)');
    } else if (uvIndex > 10) {
        score -= 30;
        factors.push({ name: 'UV extremo', status: 'ruim', impact: -30 });
        recommendations.push('Evite exposição solar, proteção essencial');
    }

    // Air quality evaluation
    if (aqi === 1) {
        factors.push({ name: 'Qualidade do ar excelente', status: 'ótimo', impact: 0 });
    } else if (aqi === 2) {
        factors.push({ name: 'Qualidade do ar boa', status: 'bom', impact: 0 });
    } else if (aqi === 3) {
        score -= 10;
        factors.push({ name: 'Qualidade do ar moderada', status: 'regular', impact: -10 });
        recommendations.push('Pessoas sensíveis devem reduzir esforço intenso');
    } else if (aqi === 4) {
        score -= 25;
        factors.push({ name: 'Qualidade do ar ruim', status: 'ruim', impact: -25 });
        recommendations.push('Evite exercícios intensos ao ar livre');
    } else if (aqi === 5) {
        score -= 40;
        factors.push({ name: 'Qualidade do ar muito ruim', status: 'ruim', impact: -40 });
        recommendations.push('Não recomendado atividades ao ar livre');
    }

    // Determine overall rating
    let rating, ratingColor, ratingIcon;
    if (score >= 80) {
        rating = 'Excelente';
        ratingColor = '#10b981';
        ratingIcon = '🎾';
    } else if (score >= 60) {
        rating = 'Bom';
        ratingColor = '#4fd1c5';
        ratingIcon = '👍';
    } else if (score >= 40) {
        rating = 'Regular';
        ratingColor = '#f6e05e';
        ratingIcon = '⚠️';
    } else if (score >= 20) {
        rating = 'Ruim';
        ratingColor = '#ed8936';
        ratingIcon = '👎';
    } else {
        rating = 'Não recomendado';
        ratingColor = '#ef4444';
        ratingIcon = '🚫';
    }

    const htmlContent = `
        <div class="tennis-container">
            <h3>🎾 Condições para Tênis</h3>
            <div class="tennis-rating">
                <div class="tennis-badge" style="background-color: ${ratingColor}">
                    <span class="tennis-icon">${ratingIcon}</span>
                    <span class="tennis-rating-text">${rating}</span>
                </div>
                <p class="tennis-score">Pontuação: ${Math.max(0, score)}/100</p>
            </div>
            <div class="tennis-factors">
                <p class="factors-title">Fatores avaliados:</p>
                <div class="factors-grid">
                    ${factors.map(factor => `
                        <div class="factor-item factor-item--${factor.status}">
                            <span class="factor-name">${factor.name}</span>
                            <span class="factor-status">${factor.status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${recommendations.length > 0 ? `
                <div class="tennis-recommendations">
                    <p class="recommendations-title">💡 Recomendações:</p>
                    <ul class="recommendations-list">
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    tennisElement.innerHTML = htmlContent;
    tennisElement.style.display = 'block';
}

function triggerDangerAlert(phenomena) {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        phenomena.forEach(phenomenon => {
            new Notification(`⚠️ Alerta de Perigo: ${phenomenon.name}`, {
                body: `${phenomenon.description}\n\nNível: ${phenomenon.dangerLevel}`,
                icon: '/favicon.ico',
                tag: 'weather-danger'
            });
        });
    }

    // Add visual alert banner
    const alertBanner = document.createElement('div');
    alertBanner.className = 'danger-alert-banner';
    alertBanner.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">⚠️</span>
            <div class="alert-message">
                <strong>Alerta de Fenômenos Perigosos</strong>
                <p>${phenomena.map(p => p.name).join(', ')} detectados em ${currentCity}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(alertBanner);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (alertBanner.parentElement) {
            alertBanner.remove();
        }
    }, 10000);

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecentSearches();
    initializeModals();
    checkOfflineStatus();
});

// Modal Functions
function initializeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function showExportModal() {
    if (!currentWeatherData) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }
    document.getElementById('export-modal').classList.add('active');
}

function showHeatmapModal() {
    if (!currentWeatherData) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }
    document.getElementById('heatmap-modal').classList.add('active');
    renderHeatmap();
}

function showSettingsModal() {
    document.getElementById('settings-modal').classList.add('active');
}

function showAboutModal() {
    document.getElementById('about-modal').classList.add('active');
}

function showPrivacyModal() {
    document.getElementById('privacy-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Export Functions
function exportData(format) {
    if (!currentWeatherData || !currentCity) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        closeModal('export-modal');
        return;
    }

    const data = {
        city: currentCity,
        timestamp: new Date().toISOString(),
        weather: currentWeatherData,
        forecast: document.getElementById('forecast').style.display !== 'none' ? 'Available' : 'Not loaded'
    };

    switch(format) {
        case 'pdf':
            exportToPDF(data);
            break;
        case 'csv':
            exportToCSV(data);
            break;
        case 'json':
            exportToJSON(data);
            break;
    }
    
    closeModal('export-modal');
}

function exportToJSON(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clima-${data.city.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToCSV(data) {
    const weather = data.weather;
    const csvContent = [
        ['Campo', 'Valor'],
        ['Cidade', data.city],
        ['Data/Hora', data.timestamp],
        ['Temperatura', `${weather.main.temp}°C`],
        ['Sensação Térmica', `${weather.main.feels_like}°C`],
        ['Umidade', `${weather.main.humidity}%`],
        ['Pressão', `${weather.main.pressure} hPa`],
        ['Vento', `${weather.wind.speed} m/s`],
        ['Condição', weather.weather[0].description],
        ['Visibilidade', `${weather.visibility}m`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clima-${data.city.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToPDF(data) {
    // Simple HTML-based PDF export using window.print
    const printWindow = window.open('', '_blank');
    const weather = data.weather;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório Climático - ${data.city}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
                .header { margin-bottom: 30px; }
                .data-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #555; }
                .value { color: #333; }
                .footer { margin-top: 40px; color: #888; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🌤️ Relatório Climático</h1>
                <p><strong>Cidade:</strong> ${data.city}</p>
                <p><strong>Data:</strong> ${new Date(data.timestamp).toLocaleString('pt-BR')}</p>
            </div>
            <div class="data-row">
                <span class="label">Temperatura:</span>
                <span class="value">${weather.main.temp}°C</span>
            </div>
            <div class="data-row">
                <span class="label">Sensação Térmica:</span>
                <span class="value">${weather.main.feels_like}°C</span>
            </div>
            <div class="data-row">
                <span class="label">Condição:</span>
                <span class="value">${weather.weather[0].description}</span>
            </div>
            <div class="data-row">
                <span class="label">Umidade:</span>
                <span class="value">${weather.main.humidity}%</span>
            </div>
            <div class="data-row">
                <span class="label">Pressão:</span>
                <span class="value">${weather.main.pressure} hPa</span>
            </div>
            <div class="data-row">
                <span class="label">Vento:</span>
                <span class="value">${weather.wind.speed} m/s</span>
            </div>
            <div class="data-row">
                <span class="label">Visibilidade:</span>
                <span class="value">${weather.visibility}m</span>
            </div>
            <div class="footer">
                <p>Gerado por ClimaGo - ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Heatmap Function
function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!currentWeatherData) {
        container.innerHTML = '<p class="heatmap-placeholder">Selecione uma cidade para visualizar o mapa de calor</p>';
        return;
    }

    // Simple visual heatmap representation
    const temp = currentWeatherData.main.temp;
    const humidity = currentWeatherData.main.humidity;
    
    container.innerHTML = `
        <div class="heatmap-visual">
            <div class="heatmap-title">Mapa de Calor - ${currentCity}</div>
            <div class="heatmap-grid">
                <div class="heatmap-cell" style="background: ${getTempColor(temp)}">
                    <span class="heatmap-label">Temperatura</span>
                    <span class="heatmap-value">${temp}°C</span>
                </div>
                <div class="heatmap-cell" style="background: ${getHumidityColor(humidity)}">
                    <span class="heatmap-label">Umidade</span>
                    <span class="heatmap-value">${humidity}%</span>
                </div>
                <div class="heatmap-cell" style="background: ${getWindColor(currentWeatherData.wind.speed)}">
                    <span class="heatmap-label">Vento</span>
                    <span class="heatmap-value">${currentWeatherData.wind.speed} m/s</span>
                </div>
                <div class="heatmap-cell" style="background: ${getPressureColor(currentWeatherData.main.pressure)}">
                    <span class="heatmap-label">Pressão</span>
                    <span class="heatmap-value">${currentWeatherData.main.pressure} hPa</span>
                </div>
            </div>
            <div class="heatmap-legend">
                <span>Frio/Baixo</span>
                <div class="legend-gradient"></div>
                <span>Quente/Alto</span>
            </div>
        </div>
    `;
}

function getTempColor(temp) {
    // Color gradient from blue (cold) to red (hot)
    if (temp < 10) return 'rgba(59, 130, 246, 0.8)';
    if (temp < 20) return 'rgba(16, 185, 129, 0.8)';
    if (temp < 30) return 'rgba(245, 158, 11, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
}

function getHumidityColor(humidity) {
    if (humidity < 30) return 'rgba(245, 158, 11, 0.8)';
    if (humidity < 60) return 'rgba(16, 185, 129, 0.8)';
    return 'rgba(59, 130, 246, 0.8)';
}

function getWindColor(speed) {
    if (speed < 5) return 'rgba(16, 185, 129, 0.8)';
    if (speed < 15) return 'rgba(245, 158, 11, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
}

function getPressureColor(pressure) {
    if (pressure < 1000) return 'rgba(239, 68, 68, 0.8)';
    if (pressure < 1020) return 'rgba(16, 185, 129, 0.8)';
    return 'rgba(59, 130, 246, 0.8)';
}

// Offline Mode
let isOfflineMode = false;

function toggleOfflineMode() {
    isOfflineMode = !isOfflineMode;
    const btn = event.target.closest('.quick-action-btn');
    
    if (isOfflineMode) {
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        btn.querySelector('span:first-child').textContent = '📴';
        alert('Modo offline ativado. Dados serão carregados do cache quando disponível.');
    } else {
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.querySelector('span:first-child').textContent = '📴';
        alert('Modo offline desativado. Dados serão atualizados em tempo real.');
    }
}

function checkOfflineStatus() {
    window.addEventListener('online', () => {
        console.log('Conexão restaurada');
        if (isOfflineMode) {
            toggleOfflineMode();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('Conexão perdida');
        if (!isOfflineMode) {
            toggleOfflineMode();
        }
    });
}

// Settings Functions
function toggleNotifications() {
    const checkbox = document.getElementById('notifications');
    
    if (checkbox.checked) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    alert('Notificações ativadas!');
                } else {
                    checkbox.checked = false;
                    alert('Permissão de notificação negada.');
                }
            });
        } else {
            checkbox.checked = false;
            alert('Seu navegador não suporta notificações.');
        }
    }
}
