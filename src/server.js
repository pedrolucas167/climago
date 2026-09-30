require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const path = require('path');
const app = express();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const getWeather = async (city) => {
    const cacheKey = city.toLowerCase();
    const cached = weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        
        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
        
        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getForecast = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getWeatherByCoords = async (lat, lon) => {
    const cacheKey = `${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getOneCall = async (lat, lon) => {
    const cacheKey = `onecall_${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt&exclude=minutely`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getAirPollution = async (lat, lon) => {
    const cacheKey = `air_${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getAirPollutionForecast = async (lat, lon) => {
    const cacheKey = `air_forecast_${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getUVIndex = async (lat, lon) => {
    const cacheKey = `uv_${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getGeocoding = async (city) => {
    const cacheKey = `geo_${city.toLowerCase()}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

const getReverseGeocoding = async (lat, lon) => {
    const cacheKey = `reverse_geo_${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { ...cached.data, cached: true };
    }

    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        weatherCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return { ...data, cached: false };
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

    if (!city || city.trim() === '') {
        return res.status(400).json({ error: 'Cidade não fornecida ou inválida' });
    }

    try {
        const weatherData = await getWeather(city);
        res.json(weatherData);
    } catch (error) {
        console.error('Erro na API:', error.message);
        res.status(500).json({ error: `Erro ao buscar dados do clima: ${error.message}` });
    }
});

app.get('/api/forecast', async (req, res) => {
    const city = req.query.city;

    if (!city || city.trim() === '') {
        return res.status(400).json({ error: 'Cidade não fornecida ou inválida' });
    }

    try {
        const forecastData = await getForecast(city);
        res.json(forecastData);
    } catch (error) {
        console.error('Erro na API de previsão:', error.message);
        res.status(500).json({ error: `Erro ao buscar previsão: ${error.message}` });
    }
});

app.get('/api/weather/coords', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const weatherData = await getWeatherByCoords(lat, lon);
        res.json(weatherData);
    } catch (error) {
        console.error('Erro na API de geolocalização:', error.message);
        res.status(500).json({ error: `Erro ao buscar dados do clima: ${error.message}` });
    }
});

app.post('/api/ai/weather-advice', async (req, res) => {
    const { weatherData, city } = req.body;

    if (!weatherData || !city) {
        return res.status(400).json({ error: 'Dados do clima ou cidade não fornecidos' });
    }

    try {
        const prompt = `Com base nos seguintes dados meteorológicos para ${city}, forneça recomendações práticas e concisas em português do Brasil:

Temperatura: ${weatherData.main.temp}°C
Sensação térmica: ${weatherData.main.feels_like}°C
Umidade: ${weatherData.main.humidity}%
Pressão: ${weatherData.main.pressure} hPa
Vento: ${weatherData.wind.speed} m/s
Condição: ${weatherData.weather[0].description}

Forneça recomendações sobre:
1. Vestuário adequado
2. Atividades recomendadas
3. Precauções necessárias
4. Dicas de saúde

Responda de forma direta e prática, sem introduções desnecessárias.`;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3-haiku',
            messages: [
                { role: 'system', content: 'Você é um assistente meteorológico especializado em fornecer recomendações práticas baseadas em dados do tempo.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const advice = response.data.choices[0].message.content;
        res.json({ advice });
    } catch (error) {
        console.error('Erro na API da OpenRouter:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 404) {
                console.error('ERRO CRÍTICO: O modelo anthropic/claude-3-haiku pode ter sido descontinuado ou renomeado no OpenRouter.');
                console.error('Ação necessária: Verificar modelos disponíveis em https://openrouter.ai/models e atualizar o código.');
                return res.status(500).json({
                    error: 'Erro ao obter recomendações de IA: Modelo não encontrado (404). O modelo pode ter sido descontinuado.',
                    details: 'Verifique https://openrouter.ai/models para modelos disponíveis e atualize o código.'
                });
            }
        }
        res.status(500).json({ error: `Erro ao obter recomendações de IA: ${error.message}` });
    }
});

app.post('/api/ai/extreme-phenomena', async (req, res) => {
    const { weatherData, forecastData, city } = req.body;

    if (!weatherData || !city) {
        return res.status(400).json({ error: 'Dados do clima ou cidade não fornecidos' });
    }

    try {
        const currentConditions = `
Cidade: ${city}
Temperatura atual: ${weatherData.main.temp}°C
Sensação térmica: ${weatherData.main.feels_like}°C
Umidade: ${weatherData.main.humidity}%
Pressão atmosférica: ${weatherData.main.pressure} hPa
Velocidade do vento: ${weatherData.wind.speed} m/s
Direção do vento: ${weatherData.wind.deg}°
Condição atual: ${weatherData.weather[0].description}
Código do clima: ${weatherData.weather[0].id}
Visibilidade: ${weatherData.visibility || 10000} metros
Nuvens: ${weatherData.clouds?.all || 0}%`;

        const forecastInfo = forecastData ? `
Previsão para as próximas horas:
${forecastData.list?.slice(0, 8).map(item => 
    `${new Date(item.dt * 1000).toLocaleTimeString('pt-BR')}: ${item.main.temp}°C, ${item.weather[0].description}, Vento: ${item.wind.speed} m/s, Pressão: ${item.main.pressure} hPa`
).join('\n') || 'Dados de previsão não disponíveis'}` : '';

        const prompt = `Como meteorologista especialista em fenômenos atmosféricos extremos, analise os seguintes dados e identifique qualquer fenômeno extremo ou perigoso:

${currentConditions}
${forecastInfo}

Identifique e descreva em português do Brasil:
1. **Nuvens Cumulonimbus**: Indicadores como desenvolvimento vertical intenso, base escura, topo em forma de bigorna
2. **Tempestades severas**: Raios, trovões, chuva intensa, granizo
3. **Furacões/Ciclones**: Baixa pressão atmosférica (<980 hPa), ventos fortes (>25 m/s), circulação organizada
4. **Tornados**: Rotação de ventos, pressão muito baixa, funnel clouds
5. **Frentes frias**: Mudança brusca de temperatura, aumento de pressão
6. **Ondas de calor**: Temperaturas extremamente altas para a região
7. **Nevoeiro denso**: Visibilidade <1000m, umidade alta
8. **Tempestades de areia**: Vento forte, baixa visibilidade, regiões áridas
9. **Precipitação extrema**: Chuva intensa em curto período
10. **Condições de gelo**: Temperaturas próximas ou abaixo de 0°C com umidade

Para cada fenômeno detectado, forneça:
- Nome do fenômeno
- Nível de perigo (BAIXO/MÉDIO/ALTO/EXTREMO)
- Descrição detalhada
- Recomendações de segurança

Se nenhum fenômeno extremo for detectado, informe que as condições estão normais.

Responda em formato JSON válido com esta estrutura:
{
  "phenomena": [
    {
      "name": "nome do fenômeno",
      "dangerLevel": "BAIXO|MÉDIO|ALTO|EXTREMO",
      "description": "descrição detalhada",
      "recommendations": ["recomendação1", "recomendação2"]
    }
  ],
  "summary": "resumo geral das condições"
}`;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3-haiku',
            messages: [
                { role: 'system', content: 'Você é um meteorologista especialista em fenômenos atmosféricos extremos. Responda sempre em formato JSON válido.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const phenomenaData = JSON.parse(jsonMatch[0]);
            res.json(phenomenaData);
        } else {
            res.json({
                phenomena: [],
                summary: aiResponse
            });
        }
    } catch (error) {
        console.error('Erro na API de detecção de fenômenos extremos:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 404) {
                console.error('ERRO CRÍTICO: O modelo anthropic/claude-3-haiku pode ter sido descontinuado ou renomeado no OpenRouter.');
                console.error('Ação necessária: Verificar modelos disponíveis em https://openrouter.ai/models e atualizar o código.');
                return res.status(500).json({
                    error: 'Erro ao analisar fenômenos extremos: Modelo não encontrado (404). O modelo pode ter sido descontinuado.',
                    details: 'Verifique https://openrouter.ai/models para modelos disponíveis e atualize o código.'
                });
            }
        }
        res.status(500).json({ error: `Erro ao analisar fenômenos extremos: ${error.message}` });
    }
});

app.get('/api/onecall', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const data = await getOneCall(lat, lon);
        res.json(data);
    } catch (error) {
        console.error('Erro na API One Call:', error.message);
        res.status(500).json({ error: `Erro ao buscar dados completos: ${error.message}` });
    }
});

app.get('/api/air-pollution', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const data = await getAirPollution(lat, lon);
        res.json(data);
    } catch (error) {
        console.error('Erro na API de poluição:', error.message);
        res.status(500).json({ error: `Erro ao buscar dados de poluição: ${error.message}` });
    }
});

app.get('/api/air-pollution/forecast', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const data = await getAirPollutionForecast(lat, lon);
        res.json(data);
    } catch (error) {
        console.error('Erro na API de previsão de poluição:', error.message);
        res.status(500).json({ error: `Erro ao buscar previsão de poluição: ${error.message}` });
    }
});

app.get('/api/uv-index', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const data = await getUVIndex(lat, lon);
        res.json(data);
    } catch (error) {
        console.error('Erro na API de UV:', error.message);
        res.status(500).json({ error: `Erro ao buscar índice UV: ${error.message}` });
    }
});

app.get('/api/geocoding', async (req, res) => {
    const { city } = req.query;

    if (!city || city.trim() === '') {
        return res.status(400).json({ error: 'Cidade não fornecida' });
    }

    try {
        const data = await getGeocoding(city);
        res.json(data);
    } catch (error) {
        console.error('Erro na API de geocoding:', error.message);
        res.status(500).json({ error: `Erro ao buscar localização: ${error.message}` });
    }
});

app.get('/api/reverse-geocoding', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas não fornecidas' });
    }

    try {
        const data = await getReverseGeocoding(lat, lon);
        res.json(data);
    } catch (error) {
        console.error('Erro na API de geocoding reverso:', error.message);
        res.status(500).json({ error: `Erro ao buscar nome da cidade: ${error.message}` });
    }
});

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            weatherCache.delete(key);
        }
    }
}, 5 * 60 * 1000);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
