# ClimaGo

![image](https://github.com/user-attachments/assets/0adc087f-3f31-40e9-a77b-1f2317c3caa7)

ClimaGo é um observatório meteorológico mobile-first para acompanhar o clima em tempo real com uma experiência visual inspirada no conceito **Aetheris Atmospheric Design System**. A interface combina glassmorphism atmosférico, telemetria de alta legibilidade e navegação por áreas para transformar dados meteorológicos em uma leitura rápida e sensorial.

O produto está disponível em produção em [climago-five.vercel.app](https://climago-five.vercel.app).

## 🚀 Funcionalidades

### Áreas da interface
- **☀️ Hoje**: Dashboard principal com temperatura atual, sensação térmica, mínimas e máximas, umidade, vento, status do radar e nowcasting de chuva.
- **📈 Métricas**: Instrumentação atmosférica com cards para temperatura, umidade, vento, visibilidade, pressão e sensação térmica, além de indicadores de conforto e qualidade do ar.
- **📡 Radar**: Mapa meteorológico visual com sweep animado, células de precipitação, localização atual e filtros de precipitação, nuvens e vento.
- **📅 10 Dias**: Perspectiva estendida com amplitude térmica, probabilidade de chuva e efemérides do ciclo solar.

### Dados e recursos meteorológicos
- **🌡️ Clima em tempo real**: Consulta por cidade ou coordenadas com indicação de dados em cache.
- **🔄 Atualização automática**: Atualização opcional dos dados a cada 5 minutos.
- **⏱️ Previsão horária**: Faixa horizontal com as próximas horas e probabilidade de precipitação.
- **📍 Geolocalização**: Uso da localização atual e rastreamento contínuo autorizado pelo usuário.
- **🌬️ Qualidade do ar**: AQI e principais poluentes atmosféricos.
- **☀️ Índice UV**: Intensidade atual e recomendações de proteção.
- **🌍 Fenômenos extremos**: Análise com IA para identificar condições meteorológicas de risco.

### Funcionalidades Avançadas
- **🤖 Recomendações de IA**: Análise inteligente dos dados climáticos com sugestões personalizadas de vestuário, atividades e precauções
- **📊 Exportação de dados**: Exporte dados climáticos em PDF, CSV ou JSON
- **🗺️ Mapa de calor**: Visualização interativa de dados climáticos com cores baseadas em intensidade
- **📴 Modo offline**: Funcionamento offline com service worker e cache inteligente
- **⚙️ Configurações**: Personalize unidades (métrico/imperial), idioma e notificações
- **🔔 Alertas**: Notificações push para fenômenos climáticos perigosos

### Performance, UX e identidade visual
- **💾 Cache inteligente**: Sistema de cache no servidor para reduzir chamadas à API e melhorar performance
- **📜 Histórico de buscas**: Armazenamento local das 5 últimas cidades pesquisadas
- **🎨 Aetheris UI**: Tema escuro atmosférico com superfícies translúcidas, bordas especulares, gradientes radiais e animações de telemetria
- **📱 Mobile-first**: Shell otimizado para telas de celular, com navegação inferior persistente e conteúdo adaptado para tablets e desktop
- **🔤 Tipografia de telemetria**: Plus Jakarta Sans para leituras principais e Inter para dados auxiliares
- **🎨 Paleta meteorológica**: Electric Cyan para estado normal, Storm Indigo para pressão, Solar Amber para índices solares, Breeze Emerald para condições estáveis e Thermal Crimson para alertas
- **⚡ Lazy loading**: Otimização de imagens para carregamento mais rápido
- **📱 PWA**: Progressive Web App instalável para experiência nativa
- **♿ Acessibilidade**: Suporte a leitores de tela e navegação por teclado
- **🛡️ Tratamento de erros**: Feedback claro para entradas inválidas ou falhas na API

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js**: Ambiente de execução no servidor
- **Express**: Framework web para o servidor
- **Axios**: Para requisições HTTP à OpenWeatherMap e OpenRouter
- **Dotenv**: Gerenciamento de variáveis de ambiente
- **Morgan**: Logging de requisições HTTP

### Frontend
- **HTML5/CSS3**: Interface responsiva baseada no Aetheris Atmospheric Design System
- **JavaScript (ES6+)**: Lógica do frontend com funcionalidades avançadas
- **Service Worker**: Para modo offline e cache
- **PWA Manifest**: Para instalação como aplicativo nativo

### Direção visual

A interface segue uma linguagem de **Atmospheric Glassmorphism with Precision Telemetry**:

- Canvas escuro em tons `#0f131d` e `#0a0e18`, inspirado em observação noturna e instrumentação aeronáutica.
- Cards de telemetria com transparência, `backdrop-filter`, bordas finas e sombras profundas.
- Hierarquia mobile-first: leitura atual, previsão horária, métricas, radar e previsão estendida.
- Valores principais em alto contraste e unidades/identificadores em labels compactos com espaçamento ampliado.
- Componentes ativos usam brilho ciano e estados de risco usam âmbar ou crimson sem poluir a leitura.

### APIs Externas
- **OpenWeatherMap API**: Fonte dos dados de clima, previsão, qualidade do ar e UV
- **OpenRouter API**: Serviço de IA para gerar recomendações personalizadas e detecção de fenômenos

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão 14 ou superior recomendada)
- Uma chave de API da [OpenWeatherMap](https://openweathermap.org/)
- Uma chave de API da [OpenRouter](https://openrouter.ai/) (opcional, para funcionalidades de IA)

## 🔧 Instalação

Siga os passos abaixo para rodar o ClimaGo localmente:

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/pedrolucas167/ClimaGo.git
   cd ClimaGo
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do projeto:
     ```bash
     OPENWEATHER_API_KEY=sua_chave_aqui
     OPENROUTER_API_KEY=sua_chave_aqui
     PORT=3000
     ```

4. **Inicie o servidor**:
   ```bash
   npm start
   ```

5. **Acesse o aplicativo**:
   Abra seu navegador e acesse `http://localhost:3000`

## 📖 Uso

### Fluxo principal
- **Buscar clima por cidade**: Digite o nome da cidade e clique em "Buscar" ou pressione Enter
- **Sugestões automáticas**: O campo de busca oferece sugestões das cidades mais populares
- **Geolocalização**: Use o botão de localização para consultar a estação mais próxima
- **Navegação**: Alterne entre Hoje, Métricas, Radar e 10 Dias pela barra inferior
- **Atualização**: O status da estação e do radar indica quando os dados estão sincronizados ou em cache

### Funcionalidades Avançadas
- **Atualização automática**: Ative a atualização automática para consultar os dados a cada 5 minutos
- **Previsão do tempo**: A previsão horária aparece no dashboard e a previsão estendida na aba "10 Dias"
- **Recomendações de IA**: Clique no botão "🤖 Recomendações" para receber sugestões personalizadas
- **Fenômenos extremos**: Clique no botão "🌍 Fenômenos Extremos" para análise de condições perigosas
- **Exportar dados**: Use o botão "📊 Exportar" para baixar dados em PDF, CSV ou JSON
- **Mapa de calor**: Clique em "🗺️ Mapa" para visualizar representação visual dos dados
- **Modo offline**: Ative o modo offline para usar dados em cache sem conexão
- **Configurações**: Acesse "⚙️ Config" para personalizar unidades, idioma e notificações

### Histórico
- **Buscas recentes**: As 5 últimas cidades pesquisadas ficam disponíveis como botões para acesso rápido

## 🌐 API Endpoints

### Clima
- `GET /api/weather?city=<cidade>` - Retorna o clima atual de uma cidade
- `GET /api/weather/coords?lat=<lat>&lon=<lon>` - Retorna o clima atual por coordenadas
- `GET /api/forecast?city=<cidade>` - Retorna a previsão do tempo para 5 dias
- `GET /api/onecall?lat=<lat>&lon=<lon>` - Retorna dados completos incluindo previsão horária

### Qualidade do Ar e UV
- `GET /api/air-pollution?lat=<lat>&lon=<lon>` - Retorna dados de qualidade do ar atual
- `GET /api/air-pollution/forecast?lat=<lat>&lon=<lon>` - Retorna previsão de qualidade do ar
- `GET /api/uv-index?lat=<lat>&lon=<lon>` - Retorna índice UV atual

### Geocoding
- `GET /api/geocoding?city=<cidade>` - Retorna coordenadas de uma cidade
- `GET /api/reverse-geocoding?lat=<lat>&lon=<lon>` - Retorna nome da cidade por coordenadas

### Inteligência Artificial
- `POST /api/ai/weather-advice` - Retorna recomendações personalizadas baseadas nos dados climáticos
- `POST /api/ai/extreme-phenomena` - Analisa dados para detectar fenômenos atmosféricos extremos

Para documentação detalhada da API, consulte [API.md](API.md).

## 📁 Estrutura do Projeto

```
ClimaGo/
├── src/
│   └── server.js              # Servidor Express com endpoints da API
├── public/
│   ├── index.html             # Interface principal
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker para modo offline
│   ├── js/
│   │   └── client.js          # Lógica do frontend
│   └── css/
│       └── styles.css         # Estilos da interface
├── package.json               # Dependências do projeto
├── vercel.json                # Configuração de deploy na Vercel
├── .env.example               # Exemplo de configuração de variáveis de ambiente
├── README.md                  # Documentação do projeto
└── API.md                     # Documentação da API
```

## 🚀 Deploy

### Vercel
O projeto está configurado para deploy na Vercel por meio de `vercel.json`. Para publicar:

```bash
vercel deploy --prod
```

Configure `OPENWEATHER_API_KEY` e, opcionalmente, `OPENROUTER_API_KEY` nas variáveis de ambiente do projeto. O deploy de produção atual é [climago-five.vercel.app](https://climago-five.vercel.app).

### Outros Plataformas
Para deploy em outras plataformas, certifique-se de:
1. Configurar as variáveis de ambiente no provedor
2. Usar Node.js 14 ou superior
3. Configurar a porta conforme a variável de ambiente `PORT`

## 🔒 Privacidade

- O ClimaGo coleta dados de localização apenas quando você autoriza
- Esses dados são usados exclusivamente para fornecer informações meteorológicas precisas
- Não armazenamos seus dados pessoais em nossos servidores
- O histórico de buscas é armazenado localmente no seu navegador
- As notificações são controladas pelo usuário e podem ser desativadas a qualquer momento

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 👤 Autor

Desenvolvido por [Pedro Lucas](https://github.com/pedrolucas167)

## 🙏 Agradecimentos

- [OpenWeatherMap](https://openweathermap.org/) pelos dados meteorológicos
- [OpenRouter](https://openrouter.ai/) pelo acesso a modelos de IA
- Comunidade open source pelas ferramentas e bibliotecas utilizadas
