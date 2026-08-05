# Proyectos: resumen y tecnologías

Versión corta de `resum-projects.md`, para usar como texto de las tarjetas. Solo qué es cada
proyecto y con qué está hecho.

---

## Money Laundering Analysis

**Resumen.** Sistema de análisis de transacciones bancarias orientado a detectar lavado de
dinero. Toma extractos con millones de operaciones y responde cinco preguntas analíticas
sobre ellos: filtra, agrupa, compara períodos, busca patrones de dinero moviéndose entre
cuentas encadenadas y convierte montos a una moneda común.

Es un **sistema distribuido**: en vez de una sola máquina procesando todo, el trabajo se
reparte entre decenas de nodos que corren a la vez, y crece agregando más. Lo que lo
define es que está pensado para **seguir funcionando aunque se le caigan nodos en plena
corrida** — los detecta, los levanta solos y retoma desde donde estaban, sin repetir ni
perder resultados. Corriendo sobre cinco millones de transacciones, resuelve las cinco
consultas en poco más de un minuto.

**Tecnologías.** Python, con RabbitMQ como sistema de mensajería entre los nodos. Docker y
Docker Compose para desplegar el clúster, y Docker-in-Docker para que el sistema pueda
reiniciar sus propios contenedores. Tablero de monitoreo en vivo hecho con Server-Sent
Events y SVG, sin frameworks. API de Frankfurter para los tipos de cambio históricos.
Suites de test end-to-end, de distribución, de despliegue y de caos.

---

## VibeTrip

*De este proyecto se documentan solo las tecnologías: es un trabajo de equipo de seis
personas.*

**Tecnologías.**

*Backend* — Python 3.11 con FastAPI, SQLAlchemy 2.0 asíncrono sobre PostgreSQL y Alembic
para las migraciones. Autenticación con JWT y contraseñas hasheadas con argon2/bcrypt.
Validación con Pydantic v2. Mails de verificación con fastapi-mail. Subida de imágenes y
video con límites propios.

*Frontend* — Next.js 15 con App Router, React 19 y TypeScript. Tailwind CSS v4 con
shadcn/ui sobre primitivas de Radix. Formularios con react-hook-form, mapas con Leaflet,
gráficos con ECharts, carrusel con Embla, iconos de Lucide.

*Infraestructura* — Docker y Docker Compose, desplegado con Dokploy en un VPS. GitHub
Actions con tres workflows: tests de backend, build y lint del front, y validación de
migraciones. 50 archivos de test con pytest; ruff y mypy de un lado, ESLint y Prettier del
otro.

---

## Zorro y Ocas

**Resumen.** Juego de mesa para dos jugadores que se juega en la terminal, versión del
clásico del zorro y las ocas. Un jugador lleva al zorro y el otro las diecisiete ocas sobre
un tablero en forma de cruz. El zorro se mueve en las ocho direcciones y come saltando por
encima de una oca, como en las damas; las ocas solo avanzan o van a los costados, no
retroceden y no comen — su única arma es el número. Ganan las ocas si lo dejan sin movidas,
y gana el zorro si se come tantas que ya no pueden encerrarlo.

Lo particular es que está escrito **enteramente en assembly**, el lenguaje más cercano al
procesador que existe, donde no hay estructuras de control ni tipos: se trabaja
directamente con los registros de la máquina.

**Tecnologías.** Assembly x86-64 con NASM, sintaxis Intel, enlazado con GCC contra la
biblioteca estándar de C. Un banco de 55 pruebas automatizadas escrito en C, que llama
directamente a las rutinas de assembly. Colores y dibujo por secuencias de escape ANSI, con
emojis y un modo de respaldo en ASCII. Docker multietapa.

---

## Motor de Cassandra

**Resumen.** Dos cosas que van juntas: una **base de datos distribuida escrita desde cero**,
que replica el funcionamiento de Apache Cassandra, y una **aplicación de seguimiento de
vuelos en vivo** que la usa como si fuera la base real.

La base guarda la información repartida entre varios nodos y copiada en más de uno, de modo
que ninguno tenga todo y ninguno sea imprescindible: se le pueden agregar nodos, se le
pueden apagar, y sigue respondiendo. No se apoya en ninguna biblioteca de Cassandra — el
lenguaje de consultas, el protocolo de comunicación y todo el mecanismo de reparto y copia
están hechos a mano.

La aplicación es la que le da sentido: muestra un mapa mundial con los aviones moviéndose
en tiempo real, se hace clic en un aeropuerto para ver sus vuelos y en un vuelo para
seguirlo con su posición, altitud, velocidad y combustible.

**Tecnologías.** Rust, en un proyecto de cinco módulos que suman más de 24.000 líneas.
Comunicación cifrada con TLS y contraseñas hasheadas con argon2. Interfaz gráfica con
egui/eframe y mapas de Mapbox, con respaldo en OpenStreetMap. Monitor del clúster en
terminal con termion. Docker y Docker Compose para levantar los nodos. GitHub Actions con
build, tests y linter.

---

## Modelos Predictivos y Análisis con IA

**Resumen.** Dos trabajos de ciencia de datos que recorren el ciclo completo: limpiar los
datos, entenderlos y entrenar modelos que predigan algo.

El primero son cuatro problemas sobre datasets reales — un análisis geográfico de once
millones de viajes en taxi de Nueva York, predecir si va a llover mañana a partir de
observaciones meteorológicas de Australia, estimar el precio de un alojamiento de Airbnb en
Buenos Aires, y agrupar canciones de Spotify por sus características de audio.

El segundo es una competencia de **análisis de sentimiento**: dado el texto de una reseña de
película escrita en español, decidir si es positiva o negativa. Se probaron desde modelos
clásicos hasta redes neuronales, y se combinaron entre sí; el mejor acertó el 91 % de las
reseñas que nunca había visto.

**Tecnologías.** Python en Jupyter Notebook, con pandas y NumPy para los datos y Matplotlib
y seaborn para los gráficos. scikit-learn como base de todo el modelado (árboles, random
forest, regresiones, naive bayes, k-means) y XGBoost. Procesamiento de texto en español con
NLTK y spaCy. Redes neuronales con TensorFlow/Keras. GeoPandas para los datos geográficos, y
statsmodels para el análisis estadístico.

---

## Motor de Monopoly

**Resumen.** Juego de simulación de escritorio para dos a cuatro jugadores: una copia del
clásico juego de mesa Monopoly, con su tablero, sus barrios, sus propiedades, la cárcel, los
alquileres, las hipotecas y las construcciones. Se juega en una ventana, tirando los dados
por turnos.

Está construido con **programación orientada a objetos**, y esa es la parte interesante:
cada pieza del juego —el tablero, las casillas, el banco, los jugadores— es un objeto con
su propia responsabilidad, y el resultado es que **el juego se puede reconfigurar sin tocar
el código**. La cantidad de casillas, los precios, los alquileres, el dinero inicial, los
personajes que se pueden elegir: todo eso es configuración, y el tablero se redibuja solo
para acomodarse.

Tiene además reglas propias que el equipo decidió agregar, como un estado de crisis para el
jugador que cae en una casilla que no puede pagar, que lo obliga a vender o hipotecar antes
de poder declararse en quiebra.

**Tecnologías.** Java 17 con JavaFX para la interfaz, con las vistas descritas en FXML y los
estilos en una hoja CSS. Maven para la compilación. Docker, con la ventana del juego
saliendo por X11 hacia el escritorio del anfitrión.
