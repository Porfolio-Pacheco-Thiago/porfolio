# Proyectos: resumen y tecnologías

Versión corta de `resum-projects.md`, para usar como texto de las tarjetas. Solo qué es cada
proyecto y con qué está hecho.

---

## Money Laundering Analysis

**Resumen.** Pipeline distribuido y tolerante a fallos que ingiere extractos de
transacciones bancarias y calcula cinco consultas analíticas en paralelo sobre un clúster
escalable conectado por RabbitMQ. Está construido para seguir dando resultados **correctos
y exactamente una vez** aunque se le caigan nodos a mitad de corrida: los detecta por
latido, los reinicia solos y cada uno retoma desde su último checkpoint en vez de
reprocesar todo.

Las cinco consultas cubren filtrado, agregación por clave, estadística entre períodos,
matching de patrones sobre un grafo (*scatter-gather* con al menos cinco intermediarios) y
enriquecimiento con tipos de cambio históricos.

*Cómo es tolerante a fallos.* Asume caídas limpias —un nodo muere de golpe— y las sobrevive
en cuatro pasos encadenados: cada nodo late a un fanout y un Medic lo da por muerto si deja
de latir (detección a nivel aplicación, nunca preguntándole a Docker); los Medics están
replicados y eligen líder por **Bully**, así solo uno repara y no hay tres reinicios del
mismo nodo; los workers hacen **checkpoint atómico** de su estado, así volver no es
reprocesar desde cero; y como se confirma cada mensaje recién después de hacer durable su
efecto, un crash siempre redeliverea y el destinatario descarta lo repetido por número de
secuencia — entrega *al menos una vez*, resultado *exactamente una vez*.

*Cómo escala.* Cada etapa es un grupo de N instancias declarado en `config.json`, así que
escalar es cambiar un número. El reparto no es por turnos sino **por hash de una clave de
negocio**, con lo que cada worker es dueño de un pedazo disjunto del problema y acumula sus
parciales sin coordinarse. Y nada espera al archivo completo: el cliente sube por pedazos y
cada etapa emite mientras consume.

Las dos propiedades salen del mismo diseño: **el particionado por clave es lo que hace
barata la tolerancia a fallos**, porque el estado de cada worker es chico y solo suyo, y el
que muere necesita su propio checkpoint y nada más.

**Tecnologías.**

- **Python** — todo el sistema; única dependencia externa **pika** (cliente de AMQP).
- **RabbitMQ** como middleware orientado a mensajes: fanout para latidos y elección, colas
  con partición por hash para los datos, y el **plugin de management**, del que el tablero
  lee el caudal por cola.
- **Docker** y **Docker Compose**, con el compose generado por `generate_compose.py`.
- **Docker-in-Docker** para que el Medic reinicie contenedores caídos y para el plano de
  control del tablero.
- **Algoritmo Bully** para elegir el líder entre los medics replicados.
- **Server-Sent Events**, `http.server` y **SVG** de la biblioteca estándar y del navegador,
  para el tablero. Sin framework y sin dependencias nuevas.
- **API de Frankfurter** para los tipos de cambio históricos, con caché en disco.
- Suites de test *end to end*, de distribución, de despliegue y de caos.

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

**Resumen.** Una **base de datos distribuida al estilo Cassandra escrita en Rust desde
cero**, y una aplicación de seguimiento de vuelos que la usa como si fuera Cassandra de
verdad.

No usa ninguna librería de Cassandra. Están implementados a mano el protocolo binario CQL
—`STARTUP`, `AUTHENTICATE`, `QUERY`, `PREPARE`, `EXECUTE`, `BATCH`, `REGISTER`—, el lexer y
el parser de CQL, el motor de queries, el particionado por token, la replicación, el
gossip, el hinted handoff y el read repair. Son **18.400 líneas solo en el nodo**,
repartidas en 150 archivos.

*Cómo se arma el clúster.* Un nodo entra conectándose al *seed listener* del primer seed,
que le manda la lista de nodos y le asigna una posición y un rango de tokens. De ahí en
adelante cada nodo hace **gossip** una vez por segundo con otro nodo al azar, así que todos
convergen a la misma vista sin que nadie coordine. Cada nodo usa siete puertos consecutivos:
clientes, delegación de queries, data access, metadata, gossip, seed listener y hinted
handoff.

*Qué pasa cuando un nodo se cae.* Las queries que le tocaban se guardan como **hints** y se
le entregan cuando vuelve; los rangos se recalculan y los datos se redistribuyen fila por
fila entre los que quedan. Salir del clúster con `exit` no es lo mismo que matar el
contenedor: el nodo reparte sus datos antes de irse. Y cuando una lectura con consistencia
fuerte devuelve réplicas que no coinciden, el **read repair** las compara y arregla la que
quedó vieja.

*Para qué sirve todo eso.* La aplicación de vuelos es el caso de uso que lo justifica: el
estado del vuelo se lee con **consistencia fuerte** (QUORUM) y el seguimiento —posición,
altitud, velocidad, combustible— con **consistencia débil** (ONE), que son dos caminos
distintos por dentro de la base. El simulador mueve los aviones por fases —despegue,
crucero, descenso— calculando la distancia restante con la fórmula de Haversine, y escribe
las posiciones desde varias conexiones en paralelo contra nodos distintos.

Toda la comunicación cliente–nodo va por **TLS**, con validación de la IP contra el
certificado. Las contraseñas se guardan hasheadas con argon2.

**Tecnologías.**

- **Rust**, en un workspace de cinco *crates*: `node` (18.400 líneas), `flight_app` (3.300),
  `simulator` (2.100), `test-client` (800) y `node_handler` (130).
- **rustls** para el TLS de las dos puntas, con certificado autofirmado y validación por IP;
  **openssl** para cifrar el tráfico entre nodos; **argon2** para las contraseñas.
- **murmur3** para el hash del particionado por token, que es lo que decide qué nodo es
  dueño de cada fila.
- **serde** con `serde_json`, `serde_yaml` y `rmp-serde` para la metadata, la configuración y
  los mensajes entre nodos.
- **egui / eframe** y **walkers** para la aplicación gráfica, con tiles de **Mapbox** (estilo
  `NavigationNight`) y respaldo en **OpenStreetMap** cuando no hay token.
- **termion** para el monitor del clúster, que pinta los nodos por estado.
- **Docker** y Docker Compose, con red de subred fija y rangos separados para las IPs
  estáticas y las dinámicas.
- **GitHub Actions** con build, tests y `clippy` bajo `-Dwarnings`.

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
