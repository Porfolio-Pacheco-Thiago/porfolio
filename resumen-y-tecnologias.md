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

- **Backend** — Python 3.11 con **FastAPI**, **SQLAlchemy 2.0 asíncrono** (`asyncpg` para
  Postgres, `aiosqlite` para desarrollo) y **Alembic** para las migraciones. Autenticación
  con **JWT** (`pyjwt`) y hash de contraseñas con **passlib** sobre argon2/bcrypt. Validación
  con **Pydantic v2** y configuración con `pydantic-settings`. Mails de verificación con
  **fastapi-mail**. Subida de archivos con `python-multipart`, guardada en disco con límites
  propios: 5 MB por imagen, 100 MB y 2 minutos por video, tope por entidad.
- **Frontend** — **Next.js 15** con App Router y Turbopack, **React 19** y **TypeScript**.
  **Tailwind CSS v4** con **shadcn/ui** sobre casi treinta primitivas de **Radix**, más `cva`,
  `clsx` y `tailwind-merge`. Formularios con **react-hook-form**, fechas con **date-fns** y
  **react-day-picker**, carrusel con **Embla**. Mapas con **Leaflet** / **react-leaflet**.
  Gráficos con **ECharts**. Avisos con **sonner** y **react-hot-toast**, tema con
  **next-themes**, iconos de **Lucide**, métricas con **Vercel Analytics**.
- **Infraestructura y proceso** — **Docker** y Docker Compose por mitad, desplegado con
  **Dokploy** en un VPS contra **PostgreSQL**. **GitHub Actions** con tres *workflows*: tests
  de backend con pytest y cobertura a Codecov, build y lint del front, y una validación
  específica de migraciones que corre sola cuando el PR toca `alembic/versions/`. **50
  archivos de test** con pytest y `pytest-asyncio`; linting con **ruff** y **mypy** de un
  lado, **ESLint** y **Prettier** del otro. Trabajo por *pull request* contra `develop` con
  historias de usuario numeradas.

---

## Zorro y Ocas

**Resumen.** Juego de mesa para dos jugadores en la terminal, escrito **en assembly x86-64**
(NASM, sintaxis Intel) y enlazado contra libc. Un jugador lleva al zorro y el otro las 17
ocas, sobre un tablero de 7×7 con las cuatro esquinas de 2×2 recortadas: una cruz de 33
casillas. El zorro se mueve en las ocho direcciones y come saltando por encima de una oca,
como en las damas; las ocas solo van a los costados o para adelante, no retroceden y no
comen — su única arma es el número. Ganan las ocas si lo dejan sin movidas, y gana el zorro
si se come tantas que ya no pueden encerrarlo.

Lo que lo hace más que un ejercicio de sintaxis es que **las funciones respetan la
convención de llamada de System V AMD64**, y eso es lo que permite que un driver escrito en
C llame directamente a las rutinas de assembly y las verifique una por una. Las 55
verificaciones de `prueba.c` enlazan contra exactamente los mismos objetos que el juego —no
contra una copia— y cubren posición inicial, traducción de coordenadas, parsing de
direcciones, bordes del tablero, movimientos del zorro, captura, restricciones de las ocas y
detección de final de partida.

Conviven dos sistemas de coordenadas, y es una decisión y no un descuido: la **notación del
jugador** es `columna*10 + fila`, que es lo que se tipea (`D5`), y el **índice de tablero**
es `fila*7 + columna`, que deja recorrer el tablero en un solo bucle.

El tablero guarda un código por casilla (vacío, oca, zorro, pared), no el carácter: el glifo
se resuelve recién al imprimir, con una tabla de punteros. Esa indirección es lo que hace
posibles los emojis, porque uno ocupa cuatro bytes en UTF-8 y no entra en el byte de la
casilla. Hay además un **modo `--ascii`** de respaldo, para las terminales que no miden bien
el ancho de los emojis.

**Tecnologías.**

- **NASM** con sintaxis Intel, formato `elf64`; ocho módulos que se ensamblan por separado.
- **GCC** como enlazador, con `-no-pie`, contra **libc** — de ahí salen `printf`, `fgets`,
  `strcmp` y `fflush`.
- **Convención de llamada System V AMD64**: argumentos en `edi`/`esi`, retorno en `eax`,
  alineación de 16 bytes en los `call`. Es lo que hace posible el driver en C.
- **Reubicación por copia** para leer símbolos de datos de libc (`extern stdin`) bajo
  `-no-pie`.
- `%include` de un header de solo `%define` (`juego.inc`) para compartir constantes sin
  emitir símbolos duplicados.
- **Secuencias de escape ANSI** para limpiar la pantalla y colorear, en lugar de llamar a
  `system("clear")`.
- `section .note.GNU-stack` para que el enlazador no marque la pila como ejecutable.
- **C** para el driver de las 55 pruebas, y **Docker** multietapa (build, pruebas, juego).

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

**Resumen.** Dos trabajos prácticos que, entre los dos, recorren el ciclo completo de un
problema de datos —de la exploración cruda a un modelo entregado a una competencia— sobre
cinco datasets que no se parecen entre sí.

El **TP1** son cuatro ejercicios, uno por familia de problema:

| | Problema | Dataset | Qué se hizo |
|---|---|---|---|
| EJ1 | Análisis exploratorio | 10,7 M de viajes en taxi de Nueva York + el *shapefile* de las zonas | Limpieza, variables derivadas (duración, hora pico, zona de subida y bajada) y análisis geográfico con mapas |
| EJ2 | Clasificación binaria | 145 460 días de observaciones meteorológicas en Australia | Predecir si llueve al día siguiente |
| EJ3 | Regresión | 35 172 alojamientos de Airbnb en Buenos Aires, 79 columnas | Predecir el precio |
| EJ4 | Clustering | 750 canciones de Spotify con sus atributos de audio | Agrupar por *energy*, *valence*, *danceability* e *instrumentalness* |

Lo que más se trabajó no fueron los modelos sino lo de antes: imputación de faltantes,
detección de *outliers* multivariados con **Isolation Forest** —en el ejercicio de Airbnb se
corre por subgrupos y se marca como atípico global solo lo que dos de tres subgrupos
coinciden en marcar—, agrupamiento de categorías de alta cardinalidad por precio promedio, y
selección de variables cruzando tres métodos de importancia sobre particiones disjuntas para
que no se contaminen entre sí.

En la predicción de lluvia gana **XGBoost** (accuracy 0,855 y AUC 0,803 en test) sobre Random
Forest, que consigue más *recall* de la clase minoritaria pero a costa de precisión y de
mucho más cómputo. En el precio de Airbnb, XGBoost otra vez (R² 0,79 y 13 % de error
relativo) contra 0,67 de Random Forest y 0,58 de la regresión lineal, aunque la regresión
entrena en 2 segundos y Random Forest tarda 240. En el clustering quedan tres grupos
estables, separados sobre todo por *instrumentalness* y por el eje energía/valencia.

El **TP2** es una competencia de **Kaggle**: clasificar el sentimiento de 50 000 críticas de
cine **en español**, con 8 599 reseñas de test a predecir. Acá el trabajo grueso es el
preprocesamiento del texto, una cadena de diez pasos —normalizar puntuación, sacar etiquetas
HTML, convertir emojis a palabras, colapsar letras repetidas, quitar *stopwords*, **manejar
la negación** (que en análisis de sentimiento es justamente lo que no se puede tirar), pasar
números escritos a cifras, *stemming* y lematización—. Sobre esa base se entrenan cinco
modelos y se los ensambla:

| Modelo | Accuracy en el *hold-out* |
|---|---|
| Stacking (los cuatro + meta-modelo de regresión logística) | **0,91** |
| Regresión logística sobre TF-IDF | 0,90 (F1 macro en validación cruzada) |
| Naive Bayes multinomial | 0,88 |
| Red neuronal en Keras (Embedding + LSTM bidireccional) | 0,85 |
| XGBoost | 0,80 |
| Random Forest | 0,75 |

El resultado que más llama la atención es que **el modelo más simple queda segundo**: una
regresión logística sobre TF-IDF con bigramas empata prácticamente con el ensamble por
*stacking* de cuatro modelos y le saca cinco puntos a la red neuronal, que tarda órdenes de
magnitud más en entrenar. Es la clase de conclusión que justifica haber probado las seis.

**Tecnologías.**

- **Base** — **Python** en **Jupyter Notebook**, con **pandas** y **NumPy** para los datos,
  **Matplotlib** y **seaborn** para los gráficos, y **joblib** para serializar los modelos y
  paralelizar búsquedas.
- **Modelado clásico** — **scikit-learn** es el esqueleto de todo: `DecisionTreeClassifier`,
  `RandomForestClassifier` y `RandomForestRegressor`, `LinearRegression`,
  `LogisticRegression`, `MultinomialNB`, `KMeans`, `IsolationForest`, `KNNImputer`,
  `NearestNeighbors` y `PCA`. **XGBoost** para clasificación y regresión. Búsqueda de
  hiperparámetros con `RandomizedSearchCV` sobre `StratifiedKFold`, y ensambles con
  `VotingClassifier` y `StackingClassifier`. Preprocesamiento con `OneHotEncoder`,
  `LabelEncoder`, `MultiLabelBinarizer`, `StandardScaler`, `MinMaxScaler` y `RobustScaler`;
  selección de variables con `RFE`. Desbalanceo de clases con **SMOTE** de
  **imbalanced-learn**.
- **Texto y PNL** — **NLTK** (tokenizador, *stopwords* en español, `SnowballStemmer`) y
  **spaCy** con el modelo `es_core_news_md` para lematización. Vectorización con
  `TfidfVectorizer` y `CountVectorizer`. **emoji** para convertir emojis a texto.
- **Redes neuronales** — **TensorFlow / Keras**: `Embedding`, `LSTM` bidireccional, `Dense`,
  `Dropout`, `Attention` y `GlobalMaxPool1D`, con regularización `l2`, optimizador `Adam` y
  *callbacks* `EarlyStopping`, `ReduceLROnPlateau` y `ModelCheckpoint`.
- **Datos geográficos y estadística** — **GeoPandas** para el *shapefile* de las zonas de
  taxi de Nueva York, **pyarrow** para leer los viajes en Parquet, **statsmodels** y
  **networkx** en el análisis exploratorio.

---

## Motor de Monopoly

**Resumen.** Juego de simulación de escritorio para dos a cuatro jugadores: una copia del
clásico juego de mesa Monopoly, con su tablero, sus barrios, la cárcel, los alquileres, las
hipotecas y las construcciones. Son unas 2.900 líneas repartidas en 52 clases con separación
estricta de **modelo, vista y controlador**: el modelo no sabe que la vista existe, y esa es
la decisión que sostiene todo lo demás.

Lo que lo hace más que una copia del juego de mesa es que **el tablero es configuración, no
código**. `Config.java` describe la partida entera —las 36 casillas, los precios, los
alquileres, los barrios, cuánto sale construir, el dinero inicial, los turnos de cárcel, la
fianza— y el resto del programa la lee. La lista por defecto son 22 propiedades, 4
estaciones, 4 multas, 2 loterías y las cuatro esquinas, armada de modo que **SALIDA, CÁRCEL,
PASO e IR A CÁRCEL caen justo en las esquinas** cuando la vista reparte las casillas de a
ocho por lado. Se puede cambiar la cantidad de casillas y el tablero se redibuja solo, con
las esquinas donde toque; hasta los personajes son configuración, porque cada
`ColorJugador` es el nombre de un `.png`.

Las reglas propias que el grupo decidió:

- Para salir de prisión sin pagar la fianza hay que sacar **los dos dados iguales**.
- Vender una construcción devuelve **la mitad** de lo que costó, y lo mismo vale para
  hipotecar y deshipotecar.
- **Las estaciones también se pueden hipotecar**, no solo las propiedades.
- Se agregó un estado **CRISIS**: el jugador cayó en una casilla que lo obliga a pagar más
  de lo que tiene. Mientras esté en crisis solo puede hipotecar o vender hasta juntar el
  monto; si no llega, lo único que le queda es declararse en quiebra.

Del lado del diseño hay dos abstracciones que se aprovechan. `Casilla` es una interfaz con
una sola operación, `accionar`, de manera que **agregar un tipo de casilla nuevo no obliga a
tocar nada del motor**: el jugador cae, la casilla sabe qué hacerle. Y las acciones del turno
están divididas en tres etapas (inicio, casilla, fin), cada una con su *calculadora* que lee
el estado del juego y devuelve qué puede hacer el jugador ahora — el controlador arma un
botón por cada acción que le devuelven, sin saber cuáles son. Es un *abstract factory*, y es
lo que hace que la botonera cambie sola según el momento del turno.

**Tecnologías.**

- **Java 17** con **módulos de JPMS**: hay un `module-info.java` de verdad, que exporta
  `org.monopoly` y abre `org.monopoly.controller` a `javafx.fxml` para que la inyección de
  `@FXML` funcione bajo el sistema de módulos.
- **JavaFX 17.0.6**, `javafx.controls` y `javafx.fxml`.
- **FXML** para cinco vistas (`escena-inicio`, `vistaMonopoly`, `tablero`, `casilla`,
  `propiedades`), cargadas con `FXMLLoader`.
- **CSS de JavaFX** (`estilos.css`): colores como *looked-up colors*, y `:hover` /
  `:pressed` / `:focused` para los estados.
- **Maven** con `maven-compiler-plugin` y **`javafx-maven-plugin`**, del que se usan
  `javafx:run` para desarrollo y **`javafx:jlink`** para armar el runtime del contenedor.
- **Docker** multietapa y **X11** para sacar la ventana afuera del contenedor.
