# Los proyectos, uno por uno

Este archivo es la fuente de la sección Proyectos del portfolio. La tarjeta se escribe
**desde acá**, no al revés: primero se mira el código, se lo hace correr y se lo
documenta, y recién después se actualizan el texto, las etiquetas y las imágenes del
sitio.

El recorrido de cada proyecto, en orden:

1. **Docker** — un `Dockerfile` y un `docker-compose.yml` para poder levantarlo sin
   instalarle las herramientas a la máquina. Varios ya traen algo; se revisa antes de
   escribir uno.
2. **El front** — si lo tiene, qué se le puede mejorar y si conviene hacerlo.
3. **Resumen** — qué hace el proyecto, en prosa.
4. **Tecnologías** — leídas de los manifiestos y del código, no de memoria.
5. **Capturas** — se levanta y se fotografía. Van a
   `src/assets/media/projects/<id>/`.

El `id` de cada uno es el de `src/data/projects.js`, que es lo que ata este archivo con
el sitio.

## Dónde está cada uno

Todos los que hay viven en `~/Escritorio/project-porfolio/proyectos/`, uno por carpeta, y
**todos tienen su repositorio público** en la organización `Porfolio-Pacheco-Thiago`
(verificado contra la API de GitHub: los seis responden 200 sin credenciales). Dos de las
carpetas no se llaman como su tarjeta:

| carpeta | tarjeta (`id`) |
|---------|----------------|
| `assembly-game` | `zorro-ocas` |
| `machine-learning` | `predictive-models` |
| `cassandra-flight-app` | `cassandra-engine` |
| `vibe-trip` | `vibetrip` |
| `monopoly` | `monopoly` |
| `distributed-systems` | *todavía ninguna* |

## Estado

**Melodía y SpecForge quedan afuera de este recorrido.** Melodía no se documenta; SpecForge
se trata como un caso aparte, con su propio criterio.

| id | Proyecto | Código | Docker | Front | Resumen | Tecnologías | Capturas |
|----|----------|--------|--------|-------|---------|-------------|----------|
| `melodia` | Melodía | — no se hace | — | — | — | — | — |
| `vibetrip` | VibeTrip | ✅ `vibe-trip` | 🟡 uno por lado, sin compose raíz | 🔲 | 🔲 | 🔲 | 🔲 |
| `cassandra-engine` | Motor de Cassandra | ✅ `cassandra-flight-app` | ✅ compose + 5 Dockerfile | 🔲 | 🔲 | 🔲 | 🔲 |
| `specforge` | SpecForge | — caso aparte | — | — | — | — | — |
| `predictive-models` | Modelos Predictivos y Análisis con IA | ✅ `machine-learning` | 🔴 ninguno | 🔲 | 🔲 | 🔲 | ✅ portada animada |
| `monopoly` | Motor de Monopoly | ✅ `monopoly` | 🔴 ninguno | 🔲 | 🔲 | 🔲 | 🔲 |
| `zorro-ocas` | Zorro y Ocas (Assembly) | ✅ `assembly-game` | 🔴 ninguno | 🔲 | 🔲 | 🔲 | 🔲 |
| — | Money Laundering Analysis | ✅ `distributed-systems` | ✅ ~25 Dockerfile + Makefile | ✅ tablero nuevo | ✅ | ✅ | 🟡 una, faltan 3 |

**El primero terminado es el TP de distribuidos**, que además era el único sin front. Su
ficha completa está al final de este archivo.

### Los dos que no son lo que parecen

- **`distributed-systems` no tiene tarjeta.** Es un pipeline distribuido tolerante a
  fallos (RabbitMQ, cinco consultas analíticas en paralelo, detección de caídas con
  reinicio y checkpoints, entrega *exactly-once*) y es de los proyectos más grandes del
  conjunto. Hay que decidir si entra como una octava tarjeta.
- **`~/Escritorio/distribuidos-tp-money-laundering` es otra cosa.** (Quedó fuera de la
  mudanza a `project-porfolio/`.) Apunta a
  `ivan-maximoff/distribuidos-tp-money-laundering` y solo tiene una carpeta `docs/`; el
  proyecto de verdad, con el código y el informe, es el de `proyectos/`. No hay que
  documentar los dos.

### Docker, de un vistazo

- **Ya tienen y funciona:** `cassandra-flight-app` (un `docker-compose.yml` en la raíz y
  un `Dockerfile` por *crate*) y `distributed-systems` (un `Dockerfile` por servicio, un
  `generate_compose.py` que arma el `docker-compose.yaml` según `config.json`, y un
  `Makefile` con `up` / `down` / `logs`).
- **Tienen a medias:** `vibe-trip`, con un `Dockerfile` y un `docker-compose.yaml` en
  cada mitad pero **ninguno que levante las dos juntas**. Eso es lo que falta escribir.
- **No tienen nada:** `machine-learning` (notebooks: alcanza una imagen de Jupyter con el
  `requirements.txt` que ya está en `tp2/`), `assembly-game` (NASM de 64 bits: hace falta
  una imagen con el ensamblador y el enlazador) y `monopoly` (JavaFX de escritorio: es el
  caso incómodo, porque una app con ventana necesita exponer X11 al contenedor).

---

<!-- A partir de acá, una sección por proyecto, con este esqueleto:

## <Nombre> (`<id>`)

**Dónde está.** Ruta o repositorio.

### Docker
Qué había y qué se agregó. Cómo se levanta, textual.

### El front
Qué tiene hoy y qué se le puede mejorar. Si no tiene, decirlo.

### Resumen
Qué hace y por qué es interesante. Es el borrador del texto de la tarjeta.

### Tecnologías
De dónde salió cada una — el manifiesto, el import, el archivo de configuración.

### Capturas
Qué se fotografió y dónde quedó cada archivo.
-->

## Money Laundering Analysis (`distributed-systems`, todavía sin `id`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/distributed-systems` ·
<https://github.com/Porfolio-Pacheco-Thiago/distributed-systems> · commit `c4581c8`
(sin pushear: el repo se comparte con Matías Bartellone).

### El front

**No tenía, y ahora tiene.** Era el único proyecto grande sin nada que mirar: todo lo
interesante pasaba en `docker compose logs`. La parte que vale la pena mostrar es la
tolerancia a fallos, y estaba a la vista solo como color ANSI en el log del Medic
(`src/medic/status.py` ya dibujaba una tabla con 🟢🟡🔴).

Se le agregó un **tablero web** en `src/dashboard/` (2.300 líneas), que sirve en
`http://localhost:8080` y terminó siendo la consola desde la que se opera el sistema.

**La página es el DAG**: el mismo grafo del pipeline que la Figura 2 del informe (§3.1,
"Vista de escenarios"), caja por caja y arista por arista — cliente, extracción,
transformación, el split por moneda hacia las colas de cada query, los filtros de fecha,
las cinco columnas de queries y la cola de resultados que vuelve al session handler. Cada
caja que es un servicio contiene **sus instancias vivas**, verdes mientras laten y rojas
cuando dejan de hacerlo, así la topología y la salud son una sola imagen en vez de dos.

Encima de eso muestra qué medic tiene el liderazgo y —lo que de verdad muestra el punto
del proyecto— **cuántas veces se cayó cada nodo y cuánto tardó en volver**, con el
promedio y el peor caso de la corrida.

**Lo que se puede hacer desde ahí:**

- **Levantar y bajar el pipeline** con un botón. Para que eso no fuera circular —el
  tablero es un servicio del propio compose, así que tiene que estar corriendo antes de
  que alguien apriete el botón— el compose quedó partido en dos planos: control
  (`rabbitmq` + `dashboard`, se levantan a mano y quedan) y pipeline (los otros 54).
- **Correr cualquier dataset.** Se descubren solos escaneando `datasets/*_Trans.csv`, cada
  botón muestra su tamaño, y cada uno lanza su propio cliente con `docker compose run`,
  que reusa la definición del servicio `client` en vez de duplicar red, montajes y
  entorno. Se pueden correr varios a la vez, que es lo que hace visible el aislamiento
  por `client_id`. `client_0` dejó de existir: un cliente es una corrida, no
  infraestructura.
- **Romper cosas**: matar un nodo al azar, o armar un chaos monkey continuo que mata uno
  cada N segundos. Los dos usan la misma política de exclusiones.
- **Ver los pipes moverse.** Cada arista se colorea de origen a destino mientras
  transporta datos, a una velocidad que sigue al caudal, y se apaga cuando deja de pasar.

Los medics y el janitor **no están en el DAG** porque no mueven datos, así que van en una
columna aparte en vez de inventarles un lugar en el grafo.

Lo importante del diseño es que, aun habiéndole agregado un plano de control, sigue
siendo un **observador y no un componente**:

- La salud sale de la fanout de latidos que ya existía y del mismo umbral que usan los
  medics, **nunca de preguntarle a Docker**.
- El caudal sale de las tasas por cola que el plugin de management ya publicaba. La
  alternativa era meter contadores en `WorkerBase`, y eso habría convertido al tablero en
  parte de lo que observa. **No se tocó una línea del sistema.**
- Nunca publica: en particular **no participa de la elección**, solo escucha quién ganó.
  Si participara, el tablero podría salir electo líder de los medics.
- **No está en la lista de vigilados**, así que matarlo no dispara ninguna reparación.
- Las únicas llamadas a Docker son el plano de control: levantar, bajar, correr y matar.
- **Sin dependencias nuevas.** La biblioteca estándar sirve la página y empuja el estado
  por SSE, que para un flujo de una sola dirección es mejor que un websocket. El proyecto
  sigue teniendo una sola dependencia, `pika`.

La página no scrollea: el DAG se dibuja a tamaño natural y entra por escala, y las
aristas se reparten en carriles para que ninguna se pise con otra.

Se apaga entero con `"dashboard": {"ENABLED": false}` en `config.json`.

**Probado con 173 verificaciones** en cinco suites (estado del clúster, orquestador,
lanzador de clientes, mapeo de caudal, chaos sostenido) más pruebas contra el clúster
real de 54 contenedores.

### Docker

Ya tenía lo suyo y bien: un `Dockerfile` por servicio (~25) y un `generate_compose.py`
que arma el `docker-compose.yaml` a partir de `config.json`, así que escalar una etapa es
cambiar un número. Se le agregó el servicio `dashboard` y se arreglaron dos cosas:

- El `Makefile` invocaba `docker compose` (el plugin), que **en esta máquina no está** —
  solo está el binario suelto `docker-compose`. Ahora detecta cuál existe.
- `make up` ahora regenera el compose antes de levantar e imprime la URL del tablero.

Arranque en dos pasos, por la partición en planos:

```bash
python3 generate_compose.py
docker-compose -p distributed-systems up -d rabbitmq dashboard
# abrir http://localhost:8080 y apretar "Levantar el sistema"
```

### Resumen

Pipeline distribuido y tolerante a fallos que ingiere extractos de transacciones
bancarias y calcula cinco consultas analíticas en paralelo sobre un clúster escalable
conectado por RabbitMQ. Está construido para seguir dando resultados **correctos y
exactamente una vez** aunque se le caigan nodos a mitad de corrida: los detecta por
latido, los reinicia solos y cada uno retoma desde su último checkpoint en vez de
reprocesar todo.

Las cinco consultas cubren filtrado, agregación por clave, estadística entre períodos,
matching de patrones sobre un grafo (*scatter-gather* con al menos cinco intermediarios) y
enriquecimiento con tipos de cambio históricos.

**Cómo es tolerante a fallos.** Asume caídas limpias —un nodo muere de golpe— y las
sobrevive en cuatro pasos encadenados: cada nodo late a un fanout y un Medic lo da por
muerto si deja de latir (detección a nivel aplicación, nunca preguntándole a Docker); los
Medics están replicados y eligen líder por Bully, así solo uno repara y no hay tres
reinicios del mismo nodo; los workers hacen checkpoint atómico de su estado, así volver no
es reprocesar desde cero; y como se confirma cada mensaje recién después de hacer durable
su efecto, un crash siempre redeliverea y el destinatario descarta lo repetido por número
de secuencia — entrega *al menos una vez*, resultado *exactamente una vez*.

**Cómo escala.** Cada etapa es un grupo de N instancias declarado en `config.json`, así
que escalar es cambiar un número. El reparto no es por turnos sino **por hash de una clave
de negocio**, con lo que cada worker es dueño de un pedazo disjunto del problema y acumula
sus parciales sin coordinarse. Y nada espera al archivo completo: el cliente sube por
pedazos y cada etapa emite mientras consume.

Las dos propiedades salen del mismo diseño: **el particionado por clave es lo que hace
barata la tolerancia a fallos**, porque el estado de cada worker es chico y solo suyo, y
el que muere necesita su propio checkpoint y nada más.

Lo que conviene decir de entrada: hay nodos fuera del modelo (`rabbitmq`, el `acceptor` y
los `session_handler`), la recuperación depende de Docker porque el Medic hace
`docker restart`, y las tablas de deduplicación crecen por cliente.

### Tecnologías

Leídas del código y de los manifiestos:

- **Python** — todo el sistema; única dependencia externa **pika** (cliente de AMQP).
- **RabbitMQ** como middleware orientado a mensajes: fanout para latidos y elección,
  colas con partición por hash para los datos, y el **plugin de management** —ya venía
  activo en la imagen— del que el tablero lee el caudal por cola.
- **Docker** y **Docker Compose**, con el compose generado por `generate_compose.py`.
- **Docker-in-Docker** para que el Medic reinicie contenedores caídos y para el plano de
  control del tablero.
- **Algoritmo Bully** para elegir el líder entre los medics replicados.
- **Server-Sent Events**, `http.server` y **SVG** de la biblioteca estándar y del
  navegador, para el tablero. Sin framework y sin dependencias nuevas.
- **API de Frankfurter** para los tipos de cambio históricos, con caché en disco.
- Suites de test *end to end*, de distribución, de despliegue y de caos.

### Capturas

`~/Escritorio/project-porfolio/tablero-dag.jpg` — el tablero con el clúster real de 54
nodos: el DAG completo, la consola a la izquierda y medics/janitor a la derecha.

Faltan, para la tarjeta, tres momentos que ya se sabe reproducir: un nodo en rojo, el
mismo en ámbar con su "volvió en N s", y los pipes coloreados con una corrida encima. Se
sacan levantando el sistema, lanzando `HI-Small` y armando el chaos.

### Para la demo

El guion que más rinde, en orden: levantar el sistema, lanzar un dataset, mostrar los
pipes moviéndose, y **matar al medic líder** — se ve la re-elección de Bully, el nodo
vuelve solo en unos segundos y el resultado final sigue siendo correcto.

Números medidos en este equipo (4 núcleos, 15 GB), útiles para no improvisar: una corrida
de `HI-Small` son 5.078.345 transacciones y las cinco queries se resuelven en poco más de
un minuto (246.017 / 11.763 / 493.976 / 2 / 6.562 resultados). El chaos armado a 12 s mató
9 nodos seguidos con una recuperación media de 2,3 s y el pipeline nunca dejó de operar.
Con los 54 contenedores arriba el load average ronda 3, y durante el build sube a 8.

Dos cosas que conviene saber antes de la demo: **construir las ~25 imágenes desde cero
lleva varios minutos**, así que hay que levantarlo con tiempo; y con el clúster cargado el
*healthcheck* de RabbitMQ puede fallar por falta de CPU aunque el broker esté sano, lo que
bloquea cualquier `up` que dependa de `service_healthy` — se sortea con `--no-deps`.
