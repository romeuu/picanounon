# 🎣 PicanOuNon (.gal)

**PicanOuNon** é unha aplicación web moderna deseñada para predicir en tempo real as condicións de pesca costeira e deportiva nas Rías e cantís de Galicia. A plataforma cruza predicións oceanográficas e meteorolóxicas con táboas astronómicas de mareas para ofrecer unha puntuación horaria intuitiva (0–100) e alertas de seguridade para os pescadores.

---

## 🚀 Tecnoloxías Principais

- **Frontend:** Angular 22 (Arquitectura Standalone, Signals e New Control Flow).
- **Compoñentes UI:** Tailwind CSS.
- **Estilos:** SCSS modular e deseño adaptable (_mobile-first_).
- **Fontes de Datos Oficiais:**
  - **MeteoGalicia:** Endpoint aberto de mareógrafos oficiais galegos (picos de preamar, baixamar e coeficientes).
  - **Open-Meteo Marine API:** Altura de vaga, período de onda, mar de fondo e vento horario por coordenadas xeográficas.

---

## 📁 Estrutura do Proxecto

- `src/app/core/data/ports.json`: Catálogo xeográfico de portos e mareógrafos galegos.
- `src/app/core/models/`: Interfaces TypeScript (`Port`, `MeteoGalicia`, `Forecast`).
- `src/app/core/services/`: Servizos de datos (`PortService`, `TideService`, `MarineWeatherService`, `ScoringService`, `ForecastFacadeService`).
- `src/app/features/dashboard/components/`: Compoñentes visuais (`CurrentVerdict`, `HourlyTimeline`, `PortSelector`).
- `src/app/features/dashboard/pages/`: Páxina principal `DashboardPage`.
- `src/app/shared/pipes/`: Pipes compartidos (`ScoreColorPipe`).
