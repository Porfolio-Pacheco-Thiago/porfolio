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

Todos los que hay viven en `~/Escritorio/proyectos/`, uno por carpeta, y **todos tienen
su repositorio público** en la organización `Porfolio-Pacheco-Thiago` (verificado contra
la API de GitHub: los seis responden 200 sin credenciales). Dos de las carpetas no se
llaman como su tarjeta:

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
| — | Money Laundering Analysis | ✅ `distributed-systems` | ✅ ~25 Dockerfile + Makefile | ✅ dashboard nuevo | 🔲 | 🔲 | 🔲 |

### Los dos que no son lo que parecen

- **`distributed-systems` no tiene tarjeta.** Es un pipeline distribuido tolerante a
  fallos (RabbitMQ, cinco consultas analíticas en paralelo, detección de caídas con
  reinicio y checkpoints, entrega *exactly-once*) y es de los proyectos más grandes del
  conjunto. Hay que decidir si entra como una octava tarjeta.
- **`~/Escritorio/distribuidos-tp-money-laundering` es otra cosa.** Apunta a
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

**Dónde está.** `~/Escritorio/proyectos/distributed-systems` ·
<https://github.com/Porfolio-Pacheco-Thiago/distributed-systems>

### El front

**No tenía, y ahora tiene.** Era el único proyecto grande sin nada que mirar: todo lo
interesante pasaba en `docker compose logs`. La parte que vale la pena mostrar es la
tolerancia a fallos, y estaba a la vista solo como color ANSI en el log del Medic
(`src/medic/status.py` ya dibujaba una tabla con 🟢🟡🔴).

Se le agregó un **tablero web** en `src/dashboard/`, que sirve en
`http://localhost:8080`.

**La página es el DAG**: el mismo grafo del pipeline que la Figura 2 del informe (§3.1,
"Vista de escenarios"), caja por caja y arista por arista — cliente, extracción,
transformación, el split por moneda hacia las colas de cada query, los filtros de fecha,
las cinco columnas de queries y la cola de resultados que vuelve al session handler. Cada
caja que es un servicio contiene **sus instancias vivas**, verdes mientras laten y rojas
cuando dejan de hacerlo, así la topología y la salud son una sola imagen en vez de dos.
Las cajas se acomodan con CSS y las aristas se rutean en SVG por encima, calculadas de las
posiciones medidas, así que el grafo se reacomoda con la ventana en lugar de ser una
imagen fija.

Encima de eso muestra qué medic tiene el liderazgo y —lo que de verdad muestra el punto
del proyecto— **cuántas veces se cayó cada nodo y cuánto tardó en volver**, con el
promedio y el peor caso de la corrida. Un botón mata un nodo al azar para poder ver la
reparación en vivo.

Los medics y el janitor **no están en el DAG** porque no mueven datos, así que van en una
franja aparte debajo en vez de inventarles un lugar en el grafo.

Lo importante del diseño es que es un **observador, no un componente**:

- Se engancha a las dos fanout que ya existían (`heartbeats` y `election_medic`) con colas
  anónimas y efímeras. No se cambió una sola línea del sistema para acomodarlo, y si el
  tablero no corre no queda ninguna cola llenándose.
- Nunca publica: en particular **no participa de la elección**, solo escucha quién ganó.
  Si participara, el tablero podría salir electo líder de los medics.
- **No está en la lista de vigilados**, así que matarlo no dispara ninguna reparación. Se
  agrega al compose después del bloque de medics justo para quedar fuera de `watched`.
- Quién está vivo sale de los latidos y del mismo umbral que usan los medics, nunca de
  preguntarle a Docker. La única llamada a Docker es el `docker kill` del botón de caos,
  con la misma lista de exclusiones que `tests/chaos/chaos_monkey.py` (nunca `rabbitmq`,
  `acceptor`, los `session_handler` ni el cliente).
- **Sin dependencias nuevas.** La biblioteca estándar sirve la página y empuja el estado
  por SSE, que para un flujo de una sola dirección es mejor que un websocket. El proyecto
  sigue teniendo una sola dependencia, `pika`.

Se apaga con `"dashboard": {"ENABLED": false}` en `config.json`.

Probado con 27 verificaciones sobre la máquina de estados y el servidor —transiciones,
conteo de caídas, tiempo de recuperación, SSE, 404 y la lista de exclusiones del caos—
más una corrida contra los 54 nodos reales del compose con caídas simuladas.

### Docker

Ya tenía lo suyo y bien: un `Dockerfile` por servicio (~25) y un `generate_compose.py`
que arma el `docker-compose.yaml` a partir de `config.json`, así que escalar una etapa es
cambiar un número. Se le agregó el servicio `dashboard` y se arreglaron dos cosas:

- El `Makefile` invocaba `docker compose` (el plugin), que **en esta máquina no está** —
  solo está el binario suelto `docker-compose`. Ahora detecta cuál existe.
- `make up` ahora regenera el compose antes de levantar e imprime la URL del tablero.

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

### Tecnologías

Leídas del código y de los manifiestos:

- **Python** — todo el sistema; única dependencia externa **pika** (cliente de AMQP).
- **RabbitMQ** como middleware orientado a mensajes: fanout para latidos y elección,
  colas con partición por hash para los datos.
- **Docker** y **Docker Compose**, con el compose generado por `generate_compose.py`.
- **Docker-in-Docker** para que el Medic reinicie contenedores caídos.
- **Algoritmo Bully** para elegir el líder entre los medics replicados.
- **Server-Sent Events** y `http.server` de la biblioteca estándar, para el tablero.
- **API de Frankfurter** para los tipos de cambio históricos, con caché en disco.
- Suites de test *end to end*, de distribución, de despliegue y de caos.

### Capturas

Pendientes: falta el dataset. Se necesita `HI-Small_Trans.csv` (IBM, Kaggle) en
`datasets/archive/`. Con eso, `make up` y fotografiar el tablero en tres momentos —todo
verde, un nodo en rojo, y el mismo nodo en ámbar con su "volvió en Ns"—.
