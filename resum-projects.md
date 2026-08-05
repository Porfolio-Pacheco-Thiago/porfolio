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
| `vibetrip` | VibeTrip | ✅ `vibe-trip` | 🟡 uno por lado, sin compose raíz | ✅ ya tiene, no se toca | — solo tecnologías | ✅ | — solo tecnologías |
| `cassandra-engine` | Motor de Cassandra | ✅ `cassandra-flight-app` | ✅ compose + 5 Dockerfile + script | ✅ rediseñado | ✅ | ✅ | 🟡 cuatro, faltan copiar |
| `specforge` | SpecForge | — caso aparte | — | — | — | — | — |
| `predictive-models` | Modelos Predictivos y Análisis con IA | ✅ `machine-learning` | 🔴 ninguno, a decidir | — no aplica, son notebooks | ✅ | ✅ | ✅ portada animada |
| `monopoly` | Motor de Monopoly | ✅ `monopoly` | ✅ compose + Dockerfile 2 etapas (jlink + X11) | ✅ rehecho sobre una hoja de estilos | ✅ | ✅ | 🔴 ninguna todavía |
| `zorro-ocas` | Zorro y Ocas (Assembly) | ✅ `assembly-game` | ✅ compose + Dockerfile 3 etapas | ✅ emojis + modo ascii | ✅ | ✅ | ✅ cuatro, sin commitear |
| — | Money Laundering Analysis | ✅ `distributed-systems` | ✅ ~25 Dockerfile + Makefile | ✅ tablero nuevo | ✅ | ✅ | 🟡 una, faltan 3 |

**El primero terminado es el TP de distribuidos**, que además era el único sin front. Las
fichas van al final de este archivo, en el orden en que se fueron cerrando: distribuidos,
VibeTrip, Zorro y Ocas, el motor de Cassandra, los modelos predictivos y Monopoly.

**De VibeTrip se documentan solo las tecnologías**, por decisión de Thiago: es un trabajo
de equipo de seis y el resto no se publica.

**De `machine-learning` se documentan el resumen y las tecnologías**, y no lleva front: son
seis *notebooks* de Jupyter y lo que hay para mostrar ya está adentro, en sus gráficos y
matrices de confusión.

**Ya no queda ninguno sin empezar.** Lo que falta de acá en adelante son capturas y el
texto de las tarjetas del sitio, no fichas.

**Dos de los cerrados no compilaban ni corrían cuando se los abrió**, y por motivos
distintos que vale la pena separar. Zorro y Ocas nunca había funcionado: el último commit
del original admite el error en su propio título. El motor de Cassandra sí había
funcionado, y se rompió solo con el paso del tiempo — se venció el certificado, las
dependencias transitivas se actualizaron más allá del toolchain instalado, y dos carreras
de arranque que siempre estuvieron ahí empezaron a perderse.

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

- **Ya tenía y funcionaba:** `distributed-systems` (un `Dockerfile` por servicio, un
  `generate_compose.py` que arma el `docker-compose.yaml` según `config.json`, y un
  `Makefile` con `up` / `down` / `logs`).
- **Ya tenía y no arrancaba:** `cassandra-flight-app` (un `docker-compose.yml` en la raíz y
  un `Dockerfile` por *crate*). El *healthcheck* usaba un comando que no existe en la
  imagen y las IPs fijas chocaban con las dinámicas; está contado en su ficha.
- **Tienen a medias:** `vibe-trip`, con un `Dockerfile` y un `docker-compose.yaml` en
  cada mitad pero **ninguno que levante las dos juntas**. Eso es lo que falta escribir.
- **No tiene nada:** `machine-learning` (notebooks: alcanza una imagen de Jupyter, pero el
  `requirements.txt` de `tp2/` está incompleto y hay 273 MB de datasets versionados que no
  conviene copiar adentro de la imagen — está en su ficha).
- **Se les escribió:** `assembly-game`, con un `Dockerfile` de tres etapas (build, pruebas,
  juego) y un compose; y `monopoly`, con uno de dos etapas que arma el runtime con `jlink` y
  saca la ventana por X11.

Sobre las apps con ventana, los dos casos terminaron distinto y por buenos motivos.
`flight_app` quedó **fuera** de Docker: además de la ventana necesita la placa de video y
salida a internet para bajar los *tiles* del mapa. `monopoly` quedó **adentro**, porque no
necesita ninguna de las dos cosas — le alcanza con montar el socket de X11 en solo lectura y
un `xhost +local:docker`.

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

---

## VibeTrip (`vibetrip`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/vibe-trip` ·
<https://github.com/Porfolio-Pacheco-Thiago/vibe-trip>

**De este proyecto se documentan solo las tecnologías.** No se toca el código —las
capturas ya están sacadas— y el resto de la ficha queda afuera por decisión de Thiago.

### Tecnologías

Leídas de `pyproject.toml`, `package.json` y el código.

**Backend** — Python 3.11 con **FastAPI**, **SQLAlchemy 2.0 asíncrono** (`asyncpg` para
Postgres, `aiosqlite` para desarrollo) y **Alembic** para las migraciones. Autenticación con
**JWT** (`pyjwt`) y hash de contraseñas con **passlib** sobre argon2/bcrypt. Validación con
**Pydantic v2** y configuración con `pydantic-settings`. Mails de verificación con
**fastapi-mail**. Subida de archivos con `python-multipart`, guardada en disco con límites
propios: 5 MB por imagen, 100 MB y 2 minutos por video, tope por entidad.

**Frontend** — **Next.js 15** con App Router y Turbopack, **React 19** y **TypeScript**.
**Tailwind CSS v4** con **shadcn/ui** sobre casi treinta primitivas de **Radix**, más `cva`,
`clsx` y `tailwind-merge`. Formularios con **react-hook-form**, fechas con **date-fns** y
**react-day-picker**, carrusel con **Embla**. Mapas con **Leaflet** / **react-leaflet**.
Gráficos con **ECharts** (y **Recharts** convive en las dependencias). Avisos con **sonner**
y **react-hot-toast**, tema con **next-themes**, iconos de **Lucide**, métricas con
**Vercel Analytics**.

**Infra y proceso** — **Docker** y Docker Compose por mitad, desplegado con **Dokploy** en
un VPS contra **PostgreSQL**. **GitHub Actions** con tres *workflows*: tests de backend con
pytest y cobertura a Codecov, build y lint del front, y una validación específica de
migraciones que corre sola cuando el PR toca `alembic/versions/`. **50 archivos de test**
con pytest y `pytest-asyncio`; linting con **ruff** y **mypy** de un lado, **ESLint** y
**Prettier** del otro. Trabajo por *pull request* contra `develop` con historias de usuario
numeradas.

---

## Zorro y Ocas (`zorro-ocas`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/assembly-game` ·
<https://github.com/Porfolio-Pacheco-Thiago/assembly-game> · commit `cdf74bf`.

**No compilaba.** El commit anterior se llama, textualmente, *"Arreglo actualizar tablero,
falta un erro por tamaño de registros"* — y ese error estaba efectivamente ahí, en
`tablero.asm`, moviendo un registro de 8 bits a uno de 32. Detrás había más: rutinas sin
`ret` que caían en la siguiente, macros nunca definidos que NASM leía como etiquetas,
saltos que hacían inalcanzable el cierre del bucle, y `moverOca` que calculaba el
movimiento y no lo escribía. **El juego nunca había funcionado.** Se reescribió entero,
manteniendo la notación de coordenadas y el esquema de teclas del planteo original.

### Docker

**No tenía nada.** Ahora hay un `Dockerfile` de tres etapas y un `docker-compose.yaml`:

- `build` — Debian con `nasm` y `gcc`, ensambla los ocho módulos y enlaza con `-no-pie`.
- `pruebas` — compila el driver en C contra los mismos `.o` que usa el juego.
- `juego` — Debian slim, sin compilador y sin fuentes tipográficas: los emojis los dibuja
  la terminal del anfitrión, acá dentro solo se escriben bytes UTF-8.

```bash
docker-compose run --rm juego            # jugar
docker-compose run --rm juego --ascii    # si la terminal no mide bien los emojis
docker-compose run --rm pruebas          # las 55 verificaciones
```

Va con `run` y no con `up` porque el juego es interactivo y necesita una terminal propia.

### El front

Es una terminal, y ahí estaba casi todo por hacer.

**Emojis.** El tablero guarda un código por casilla (vacío, oca, zorro, pared), no el
carácter: el glifo se resuelve recién al imprimir, con una tabla de punteros. Esa
indirección es lo que los hace posibles, porque un emoji ocupa cuatro bytes en UTF-8 y no
entra en el byte de la casilla.

**El problema interesante fue el ancho.** Todos los glifos tienen que medir lo mismo o las
filas no alinean, y el ancho no lo decide el programa sino la tabla que tenga la terminal.
La regla práctica resultó ser la antigüedad del emoji: el ganso 🪿 es de Unicode 15.0
(2022) y en la terminal de VS Code sale a una columna, mientras que el zorro 🦊 (Unicode
9.0, 2016) sale a dos — el tablero quedaba escalonado. Se cambió por el pato 🦆, del mismo
Unicode 9.0 que el zorro. Queda documentado en `prints.asm` para que nadie lo rompa
después.

Además hay un **modo `--ascii`** de respaldo: un carácter más un espacio miden dos columnas
en cualquier terminal, y el color ANSI no ocupa ninguna.

**El texto se acomodó al tablero.** Las reglas ocupaban 78 columnas debajo de un tablero de
17, que quedaba desbalanceado; se movieron al costado, una línea por fila. Alinean solas,
porque cada fila imprime siempre siete glifos.

```
   🦊  El Zorro y las Ocas  🦆

   A B C D E F G
1      🦆🦆🦆         q w e    Zorro: los ocho lados.
2      🦆🦆🦆         a . d    Come saltando una oca,
3  🦆🦆🦆🦆🦆🦆🦆     z x c    como en las damas.
4  🦆⬜⬜⬜⬜⬜🦆
5  🦆⬜⬜🦊⬜⬜🦆              Ocas: solo a, d o x.
6      ⬜⬜⬜                  No retroceden ni comen.
7      ⬜⬜⬜                  'f' termina la partida.
```

### Resumen

Juego de mesa para dos jugadores en la terminal, escrito **en assembly x86-64** (NASM,
sintaxis Intel) y enlazado contra libc. Un jugador lleva al zorro y el otro las 17 ocas,
sobre un tablero de 7×7 con las cuatro esquinas de 2×2 recortadas: una cruz de 33 casillas.
El zorro se mueve en las ocho direcciones y come saltando por encima de una oca, como en
las damas; las ocas solo van a los costados o para adelante, no retroceden y no comen — su
única arma es el número. Ganan las ocas si lo dejan sin movidas, y gana el zorro si se come
tantas que ya no pueden encerrarlo.

Lo que lo hace más que un ejercicio de sintaxis es que **las funciones respetan la
convención de llamada de System V AMD64**, y eso es lo que permite que un driver escrito en
C llame directamente a las rutinas de assembly y las verifique una por una. Las 55
verificaciones de `prueba.c` enlazan contra exactamente los mismos objetos que el juego —
no contra una copia— y cubren posición inicial, traducción de coordenadas, parsing de
direcciones, bordes del tablero, movimientos del zorro, captura, restricciones de las ocas
y detección de final de partida. Encontraron dos cosas: un error mío en un caso de prueba y
un bug real, `inicializarTablero` armaba el tablero pero no reseteaba los contadores ni el
turno.

Conviven dos sistemas de coordenadas, y es una decisión y no un descuido: la **notación del
jugador** es `columna*10 + fila`, que es lo que se tipea (`D5`), y el **índice de tablero**
es `fila*7 + columna`, que deja recorrer el tablero en un solo bucle.

### Tecnologías

Leídas del código y de `Comandos.txt`:

- **NASM** con sintaxis Intel, formato `elf64`; ocho módulos que se ensamblan por separado.
- **GCC** como enlazador, con `-no-pie`, contra **libc** — de ahí salen `printf`, `fgets`,
  `strcmp` y `fflush`.
- **Convención de llamada System V AMD64**: argumentos en `edi`/`esi`, retorno en `eax`,
  alineación de 16 bytes en los `call`. Es lo que hace posible el driver en C.
- **Reubicación por copia** para leer símbolos de datos de libc (`extern stdin`) bajo
  `-no-pie`.
- `%include` de un header de solo `%define` (`juego.inc`) para compartir constantes sin
  emitir símbolos duplicados — el original mezclaba includes con ensamblado por separado y
  terminaba duplicando código entre objetos.
- **Secuencias de escape ANSI** para limpiar la pantalla y colorear, en lugar de llamar a
  `system("clear")`.
- `section .note.GNU-stack` para que el enlazador no marque la pila como ejecutable.
- **C** para el driver de pruebas, y **Docker** multietapa.

### Capturas

**Ya están**, cuatro, en `src/assets/media/projects/zorro-ocas/` (las sacó Thiago; falta
commitearlas). Son una partida seguida, que es la mejor forma de contar el juego sin
explicarlo:

- `1.jpeg` — la posición inicial: las 17 ocas arriba, el zorro en D5, `Ocas 17 · Comidas 0`.
- `2.jpeg` y `3.jpeg` — las ocas empiezan a bajar y se abre un hueco en C3.
- `4.jpeg` — **el zorro comió**: está en C3 y el marcador pasó a `Ocas 16 · Comidas 1`.

Se ve bien lo que importa: los emojis alineados, las reglas al costado en vez de debajo, y
el contador cambiando.

Si alguna vez hacen falta dos más: el mismo tablero en `--ascii`, para mostrar el respaldo
cuando la terminal no mide bien los emojis, y la salida de
`docker-compose run --rm pruebas` con las 55 líneas en verde.

---

## Motor de Cassandra (`cassandra-engine`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/cassandra-flight-app` ·
<https://github.com/Porfolio-Pacheco-Thiago/cassandra-flight-app> · commits `24a4143` y
`f68e26f`. Repositorio heredado del grupo (con Matías Bartellone e Iván Maximoff).

**Estaba roto por el paso del tiempo, no por el código.** El clúster no arrancaba, ningún
cliente podía conectarse y el proyecto no compilaba. Nada de eso era una regresión: el
certificado se venció, las dependencias transitivas se actualizaron más allá del toolchain,
y dos carreras de arranque que siempre habían estado ahí empezaron a perderse.

### Docker

**Ya tenía**: un `docker-compose.yml` en la raíz y un `Dockerfile` por *crate*. Levantaba
un clúster multi-nodo escalable con `--scale node=N`. Pero no arrancaba, por dos cosas:

- El *healthcheck* del primer seed usaba `nc`, **que no viene en la imagen de rust**.
  Fallaba siempre, el contenedor quedaba `unhealthy` y `docker-compose up` moría con
  *"dependency failed to start"*. Ahora la sonda va por bash contra `/dev/tcp` y apunta al
  9090, que el nodo abre último — es la señal correcta de que terminó de arrancar.
- Docker reparte las IPs dinámicas desde el principio de la subred, así que un nodo
  escalado **se quedaba con la `.3`** antes de que arrancara el segundo seed, que la tiene
  fija, y el `up` moría con *"Address already in use"*. Se separó con
  `ip_range: 192.168.100.16/28`.

Se le agregaron los clientes como servicios detrás de un *profile*, para que `up` levante
solo el clúster, y un script que hace todo el recorrido solo:

```bash
./scripts/simulacion.sh
```

Levanta el clúster, **espera a que los nodos entren de verdad** —cuenta los que están
`Active` en el metadata, no un `sleep` a ojo—, carga la base si no lo está, pone los
aviones a volar y abre la aplicación. Al cerrar la ventana corta el simulador.

### El front

Es una aplicación de escritorio: un mapa mundial con los aviones moviéndose en vivo, hecha
con **egui** y **walkers** sobre tiles de Mapbox. Va por fuera de Docker porque necesita
ventana, placa de video y salida a internet.

**Cuatro cosas estaban mal, y una salía cara:**

- Cada avión **releía el PNG del disco y creaba una textura nueva en cada cuadro**. Con
  veinte vuelos en pantalla eran veinte lecturas de archivo sesenta veces por segundo. Y la
  ruta era relativa al directorio de ejecución, así que desde otro lado no había aviones.
  Ahora se dibujan con polígonos, coloreados por estado y apuntando al destino.
- El marcador de aeropuerto era **el emoji de una escuela pintado de negro sobre un mapa
  oscuro**. Ahora se dibuja, y no depende de la fuente del sistema.
- Los cartelitos del mapa pintaban el texto de negro sobre una caja negra.
- Los recuadros flotantes se anclan contra la pantalla y no contra el mapa, así que
  **quedaban encima del panel lateral**.

**El rediseño.** La aplicación arrancaba con el tema claro por defecto de egui pegado a un
mapa oscuro, y la pantalla se partía al medio. Ahora la paleta es de la misma familia fría
que los tiles, con un acento ámbar que es el complementario del azul del mapa: un avión o
una fila seleccionada se despegan del fondo sin subir la saturación.

El panel pasó a tres vistas con jerarquía: **aeropuertos** con buscador y filas clickeables
—antes solo se podía elegir acertándole al ícono en el mapa—, **vuelos** con código,
destino y pastilla de estado, y **ficha del vuelo** con barra de progreso del recorrido y de
combustible, que cambia de color cuando baja. Más referencia de colores, estados vacíos, y
el vuelo seleccionado con halo y su curva al destino.

La aplicación acepta nodo, usuario, contraseña y aeropuerto por línea de comandos; sin
argumentos pregunta como antes.

### Resumen

Una **base de datos distribuida al estilo Cassandra escrita en Rust desde cero**, y una
aplicación de seguimiento de vuelos que la usa como si fuera Cassandra de verdad.

No usa ninguna librería de Cassandra. Están implementados a mano el protocolo binario CQL
—`STARTUP`, `AUTHENTICATE`, `QUERY`, `PREPARE`, `EXECUTE`, `BATCH`, `REGISTER`—, el lexer y
el parser de CQL, el motor de queries, el particionado por token, la replicación, el
gossip, el hinted handoff y el read repair. Son **18.400 líneas solo en el nodo**, repartidas
en 150 archivos.

**Cómo se arma el clúster.** Un nodo entra conectándose al *seed listener* del primer seed,
que le manda la lista de nodos y le asigna una posición y un rango de tokens. De ahí en
adelante cada nodo hace gossip una vez por segundo con otro nodo al azar, así que todos
convergen a la misma vista sin que nadie coordine. Cada nodo usa siete puertos consecutivos:
clientes, delegación de queries, data access, metadata, gossip, seed listener y hinted
handoff.

**Qué pasa cuando un nodo se cae.** Las queries que le tocaban se guardan como *hints* y se
le entregan cuando vuelve; los rangos se recalculan y los datos se redistribuyen fila por
fila entre los que quedan. Salir del clúster con `exit` no es lo mismo que matar el
contenedor: el nodo reparte sus datos antes de irse. Y cuando una lectura con consistencia
fuerte devuelve réplicas que no coinciden, el **read repair** las compara y arregla la que
quedó vieja.

**Para qué sirve todo eso.** La aplicación de vuelos es el caso de uso que lo justifica: el
estado del vuelo se lee con **consistencia fuerte** (QUORUM) y el seguimiento —posición,
altitud, velocidad, combustible— con **consistencia débil** (ONE), que son dos caminos
distintos por dentro de la base. El simulador mueve los aviones por fases —despegue,
crucero, descenso— calculando la distancia restante con la fórmula de Haversine, y escribe
las posiciones desde varias conexiones en paralelo contra nodos distintos.

Toda la comunicación cliente–nodo va por **TLS**, con validación de la IP contra el
certificado. Las contraseñas se guardan hasheadas con argon2.

### Tecnologías

Leídas de los `Cargo.toml` y del código:

- **Rust**, en un workspace de cinco *crates*: `node` (18.400 líneas), `flight_app`
  (3.300), `simulator` (2.100), `test-client` (800) y `node_handler` (130).
- **rustls** para el TLS de las dos puntas, con certificado autofirmado y validación por
  IP; **openssl** para cifrar el tráfico entre nodos; **argon2** para las contraseñas.
- **murmur3** para el hash del particionado por token, que es lo que decide qué nodo es
  dueño de cada fila.
- **serde** con `serde_json`, `serde_yaml` y `rmp-serde` para la metadata, la configuración
  y los mensajes entre nodos.
- **egui / eframe** y **walkers** para la aplicación gráfica, con tiles de **Mapbox**
  (estilo `NavigationNight`) y respaldo en **OpenStreetMap** cuando no hay token.
- **termion** para el monitor del clúster, que pinta los nodos por estado.
- **Docker** y Docker Compose, con red de subred fija y rangos separados para las IPs
  estáticas y las dinámicas.
- **GitHub Actions** con build, tests y `clippy` bajo `-Dwarnings`.

### Capturas

Cuatro, en `capturas/` del propio repositorio. **Faltan copiar** a
`src/assets/media/projects/cassandra-engine/`.

- `0-antes.png` — cómo se veía antes del rediseño, útil como comparación.
- `1-aeropuertos.png` — la lista de aeropuertos con el buscador y el mapa mundial.
- `2-vuelos.png` — los vuelos de Ezeiza, con los aviones coloreados por estado en vuelo.
- `3-detalle-vuelo.png` — la ficha de un vuelo, con el progreso del recorrido.

Falta una del **monitor del clúster** (`docker-compose logs -f monitor`), que es la que
muestra que abajo hay cuatro nodos y no una base y ya.

### Para la demo

`./scripts/simulacion.sh` y listo. El paso por defecto está calibrado para que **la tanda
entera dure alrededor de un minuto** —medido: 63 y 64 segundos, de los cuales unos 59 son
de vuelo—, que es lo que entra en una grabación. Con `-p 0.2` son dos minutos y medio, y con
`-p 0.05` casi diez.

Entre tomas, `--recargar` resetea los vuelos a Ezeiza.

Lo que más rinde mostrar, en orden: el monitor con los cuatro nodos activos, la aplicación
con los aviones saliendo, y un vuelo seleccionado con su curva al destino y el progreso
avanzando.

### Dos cosas pendientes que no son de código

- **El token de Mapbox estaba escrito dentro de `flight_app.rs`**, en un repositorio
  público. GitHub bloqueó el push por eso. Se sacó del código —ahora sale de `MAPBOX_TOKEN`
  o de un archivo que no se versiona—, pero **sigue en el historial**: conviene revocarlo
  desde la cuenta de Mapbox, que es la de Iván.
- La `private_key.pem` del certificado autofirmado está versionada en los cuatro *crates*.
  Para un certificado de demo no es grave, pero queda raro en un portfolio.

---

## Modelos Predictivos y Análisis con IA (`predictive-models`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/machine-learning` ·
<https://github.com/Porfolio-Pacheco-Thiago/machine-learning> · commit `8e22b44`
(26 de junio de 2025).

**De este proyecto se documentan el resumen y las tecnologías.** No tiene front ni tiene
sentido escribirle uno: son seis *notebooks* de Jupyter, y lo que hay para mostrar son los
gráficos y las matrices de confusión que ya están adentro. Forzar una interfaz encima sería
inventarle una capa que el proyecto no tiene.

### Resumen

Los dos trabajos prácticos de **Ciencia de Datos (TA047R, FIUBA, 1°C 2025)**, hechos en
grupo de cuatro. Entre los dos recorren el ciclo completo de un problema de datos —de la
exploración cruda a un modelo entregado a una competencia— sobre cinco datasets que no se
parecen entre sí.

El **TP1** son cuatro ejercicios, uno por familia de problema:

| | Problema | Dataset | Qué se hizo |
|---|---|---|---|
| EJ1 | Análisis exploratorio | 10,7 M de viajes en taxi de Nueva York (abril–junio 2024) + el *shapefile* de las zonas | Limpieza, variables derivadas (duración, hora pico, zona de subida y bajada) y análisis geográfico con mapas |
| EJ2 | Clasificación binaria | 145 460 días de observaciones meteorológicas en Australia | Predecir si llueve al día siguiente |
| EJ3 | Regresión | 35 172 alojamientos de Airbnb en Buenos Aires, 79 columnas | Predecir el precio |
| EJ4 | Clustering | 750 canciones de Spotify con sus atributos de audio | Agrupar por *energy*, *valence*, *danceability* e *instrumentalness* |

Lo que más se trabajó no fueron los modelos sino lo de antes: imputación de faltantes,
detección de *outliers* multivariados con **Isolation Forest** —en el ejercicio de Airbnb
se corre por subgrupos (capacidad, disponibilidad, ingresos) y se marca como atípico global
solo lo que dos de tres subgrupos coinciden en marcar—, agrupamiento de categorías de alta
cardinalidad por precio promedio, y selección de variables cruzando tres métodos de
importancia sobre particiones disjuntas para que no se contaminen entre sí.

Resultados del TP1: en la predicción de lluvia gana **XGBoost** (accuracy 0,855 y AUC 0,803
en test) sobre Random Forest, que consigue más *recall* de la clase minoritaria pero a costa
de precisión y de mucho más cómputo. En el precio de Airbnb, XGBoost otra vez (R² 0,79 y
13 % de error relativo) contra 0,67 de Random Forest y 0,58 de la regresión lineal, aunque
la regresión entrena en 2 segundos y Random Forest tarda 240. En el clustering quedan tres
grupos estables, separados sobre todo por *instrumentalness* y por el eje energía/valencia.

El **TP2** es una competencia de **Kaggle**: clasificar el sentimiento de 50 000 críticas de
cine **en español**, con 8 599 reseñas de test a predecir. Acá el trabajo grueso es el
preprocesamiento de texto, que es una cadena de diez pasos —normalizar puntuación, sacar
etiquetas HTML, convertir emojis a palabras, colapsar letras repetidas, quitar *stopwords*,
**manejar la negación** (que en análisis de sentimiento es justamente lo que no se puede
tirar), pasar números escritos a cifras, *stemming* y lematización con spaCy—. Sobre esa
base se entrenan cinco modelos y tres formas de ensamblarlos:

| Modelo | Accuracy en el hold-out |
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

> **Cuidado con un número del notebook.** El ensamble por promedio de probabilidades reporta
> 0,97 de accuracy, pero ese número está inflado: tres de los cuatro modelos que promedia se
> reentrenaron sobre el 100 % del set antes de evaluarlos, así que ya habían visto las filas
> del *hold-out*. Los válidos son los de la tabla —el *stacking* sí se entrena solo con
> `X_train`—. **No conviene publicar el 0,97 en la tarjeta.**

Los informes escritos de los dos trabajos están en el repositorio
(`TA047R_TP1_GRUPO06_REPORTE.pdf` y `TA047R_TP2_GRUPO06_REPORTE.pdf`), y los modelos
entrenados quedaron serializados en `.joblib`.

### Tecnologías

Leídas de los `import` de los seis notebooks y del `requirements.txt` de `tp2/`.

**Base** — **Python** en **Jupyter Notebook**, con **pandas** y **NumPy** para los datos,
**Matplotlib** y **seaborn** para los gráficos, y **joblib** para serializar los modelos y
paralelizar búsquedas.

**Modelado clásico** — **scikit-learn** es el esqueleto de todo: `DecisionTreeClassifier`,
`RandomForestClassifier` y `RandomForestRegressor`, `LinearRegression`,
`LogisticRegression`, `MultinomialNB`, `KMeans`, `IsolationForest`, `KNNImputer`,
`NearestNeighbors` y `PCA`. **XGBoost** para clasificación y regresión. Búsqueda de
hiperparámetros con `RandomizedSearchCV` sobre `StratifiedKFold`, y ensambles con
`VotingClassifier` y `StackingClassifier`. Preprocesamiento con `OneHotEncoder`,
`LabelEncoder`, `MultiLabelBinarizer`, `StandardScaler`, `MinMaxScaler` y `RobustScaler`;
selección de variables con `RFE`. Desbalanceo de clases con **SMOTE** de
**imbalanced-learn**. Métricas: `classification_report`, `confusion_matrix`, `roc_auc`,
`r2_score`, `silhouette_score`.

**Texto y PNL** — **NLTK** (tokenizador, *stopwords* en español, `SnowballStemmer`) y
**spaCy** con el modelo `es_core_news_md` para lematización. Vectorización con
`TfidfVectorizer` y `CountVectorizer`. **emoji** para convertir emojis a texto.

**Redes neuronales** — **TensorFlow / Keras**: `Embedding`, `LSTM` bidireccional, `Dense`,
`Dropout`, `Attention` y `GlobalMaxPool1D`, con regularización `l2`, optimizador `Adam` y
*callbacks* `EarlyStopping`, `ReduceLROnPlateau` y `ModelCheckpoint`. La búsqueda de
arquitectura se hizo a mano, con validación cruzada propia sobre una grilla aleatoria.

**Datos geográficos y estadística** — **GeoPandas** para el *shapefile* de las zonas de taxi
de Nueva York, **pyarrow** para leer los viajes en Parquet, **statsmodels** y **networkx**
en el análisis exploratorio.

> El `requirements.txt` está solo en `tp2/` y **le faltan dependencias**: no incluye
> `tensorflow`, `geopandas`, `pyarrow`, `imbalanced-learn`, `statsmodels`, `networkx` ni el
> modelo `es_core_news_md` de spaCy. Con ese archivo tal como está, los notebooks no corren
> completos.

### Docker

**No tiene, y queda pendiente decidirlo.** Es el caso más fácil de todos: una imagen de
`jupyter/scipy-notebook` con el `requirements.txt` completo y el repositorio montado como
volumen alcanza. Lo que hay que resolver antes es el peso: `tp1/data/` son **273 MB** de
datasets versionados (175 MB solo los Parquet de los taxis), así que la imagen no los tiene
que copiar adentro.

---

## Motor de Monopoly (`monopoly`)

**Dónde está.** `~/Escritorio/project-porfolio/proyectos/monopoly` ·
<https://github.com/Porfolio-Pacheco-Thiago/monopoly> · commit `4e54887`. El trabajo
original es de marzo–abril de 2024; el Docker y el rediseño del front son de agosto
de 2025.

**Andaba desde el principio.** A diferencia de Zorro y Ocas y del motor de Cassandra, este
compiló y corrió a la primera. No hubo nada que arreglar: lo que se hizo fue meterlo en un
contenedor y rehacerle la interfaz.

### Docker

**No tenía nada, y era el caso incómodo:** una aplicación de escritorio con ventana. El
criterio que había quedado de `flight_app` era dejarla afuera del contenedor, pero acá se
resolvió al revés, porque Monopoly necesita bastante menos que la app de vuelos — no pide
placa de video ni salida a internet, solo una ventana.

La ventana la dibuja el servidor X del anfitrión; el contenedor se cuelga de él por el
socket de `/tmp/.X11-unix`, que se monta en solo lectura.

```bash
xhost +local:docker            # una vez por sesión
docker-compose run --rm monopoly
xhost -local:docker            # opcional, para dejar todo como estaba
```

Va con `run` y no con `up` porque es una ventana sola: al cerrarla el proceso termina.

El `Dockerfile` tiene dos etapas y **la imagen final no lleva ni Maven ni el JDK**:
`mvn javafx:jlink` —que ya estaba configurado en el `pom.xml` y nadie usaba— arma en
`target/app` un runtime autocontenido con solo los módulos que el programa necesita y su
propio lanzador. La segunda etapa es un Ubuntu 22.04 pelado con GTK y una fuente, y le
copia ese runtime. La base es Ubuntu y no Debian a propósito: es la misma que usa la imagen
de Maven, y el runtime que arma jlink queda enlazado contra su glibc.

Pesa **451 MB**. Se probó una variante sin Mesa que baja a 297 MB y también funciona
—JavaFX se cae al pipeline por software y el tablero se ve igual—, pero escupe un *stack
trace* de Java entero en cada arranque. Se eligió la grande: arranca con cinco líneas de
aviso de `libGL` en vez de una traza, y deja la puerta abierta a usar la placa de video
descomentando el `devices: /dev/dri` que quedó documentado en el compose.

Sin Docker sigue siendo `mvn javafx:run`, que para desarrollar es más rápido porque
recompila solo lo que cambió.

### El front

Es JavaFX, y el informe del trabajo lo dice sin vueltas: *"la implementacion de la
visualización del juego resulta trivial para la evaluación del presente trabajo práctico"*,
así que se omitió del análisis. Se notaba.

**No había ninguna hoja de estilos.** Cada color y cada borde estaba escrito a mano dentro
de un `setStyle()` en Java o en un atributo `style=` del FXML, repetido decenas de veces. Lo
más caro de eso no era el desorden sino una consecuencia concreta: **el hover de un botón
tenía que escribirse como una segunda cadena de estilo completa** e intercambiarse a mano
con dos listeners de mouse. Por eso `BotonView.crearBoton` recibía dos strings de estilo.
Ahora eso son dos reglas de CSS y `BotonView` quedó en once líneas.

Se agregó `estilos.css` y un `Estilos.java` que lo engancha. El detalle que obliga a tener
ese punto único es que el juego abre **cinco ventanas** por su cuenta (inicio, partida,
tarjeta de casilla, listado de propiedades, final) y cada una crea su propia `Scene`; una
`Scene` no hereda los estilos de ninguna otra, así que olvidarse en una sola se nota
enseguida.

La paleta pasó a tener **un solo acento** (naranja desaturado), todos los grises tirados al
verde, crema en lugar de blanco puro y sombras tintadas de verde en vez de negro.

Aparte del aspecto, cambiaron cuatro cosas que se usan:

- **Se ve de quién es el turno.** Antes eso se sabía solamente mirando el muñeco de la
  cabecera. Ahora la tarjeta del jugador en turno se levanta del resto.
- **Se nota que las casillas se clickean**, con cursor de mano y realce al pasar por encima.
  El cartel de *"click en una casilla para ver su información"* existía justamente porque no
  se notaba.
- **Los botones responden a `setOnAction`** en lugar de `setOnMouseClicked`, así que se
  activan con Enter o barra espaciadora, y el foco se ve. El juego se puede recorrer con el
  teclado.
- **Las fichas del inicio tienen tooltip y texto accesible.** Son botones sin una sola
  palabra: la imagen era la única pista de qué personaje se estaba eligiendo.

Además el saldo pasó a ser el número grande de la tarjeta, en monoespaciada para que no
baile de ancho cuando 1500 pasa a 980; el estado dejó de ser una línea de texto y es una
etiqueta; la tarjeta de una casilla quedó como un título de propiedad con los importes
alineados en columna; y el listado de propiedades vacío dice algo en lugar de abrirse en
blanco.

**El modelo no se tocó.** Los cambios son de `resources/`, de `view/` y de las dos clases de
`controller/` que arman pantalla.

> **Trampa para el que venga después.** `TableroView`, `CasillaView` y `PropiedadesView`
> agarran nodos **por posición** (`getChildren().get(1)`), no por `fx:id`. Se pueden cambiar
> estilos y medidas, pero agregar un hijo en el medio de esos FXML rompe el tablero sin que
> el compilador diga nada. Quedó advertido en un comentario dentro de cada uno.

### Resumen

Monopoly de escritorio para dos a cuatro jugadores, en **Java 17 con JavaFX**, hecho de cero
para Paradigmas de Programación (FIUBA) y entregado en abril de 2024. Son unas 2.900 líneas
repartidas en 52 clases con separación estricta de modelo, vista y controlador: **el modelo
no sabe que la vista existe**, y esa es la decisión que sostiene todo lo demás.

Lo que lo hace más que una copia del juego de mesa es que **el tablero es configuración, no
código**. `Config.java` describe la partida entera —las 36 casillas, los precios, los
alquileres, los barrios, cuánto sale construir, el dinero inicial, los turnos de cárcel, la
fianza— y el resto del programa la lee. La lista por defecto son 22 propiedades, 4
estaciones, 4 multas, 2 loterías y las cuatro esquinas, y está armada de modo que **SALIDA,
CÁRCEL, PASO e IR A CÁRCEL caen justo en las esquinas** cuando la vista reparte las casillas
de a ocho por lado. Se puede cambiar la cantidad de casillas y el tablero se redibuja solo,
con las esquinas donde toque; hasta los personajes son configuración, porque cada
`ColorJugador` es el nombre de un `.png` de `resources/images/`.

Las reglas propias que el grupo decidió y documentó en el informe:

- Para salir de prisión sin pagar la fianza hay que sacar **los dos dados iguales**.
- Vender una construcción devuelve **la mitad** de lo que costó, y lo mismo vale para
  hipotecar y deshipotecar.
- **Las estaciones también se pueden hipotecar**, no solo las propiedades.
- Se agregó un estado **CRISIS**: el jugador cayó en una casilla que lo obliga a pagar más
  de lo que tiene. Mientras esté en crisis solo puede hipotecar o vender hasta juntar el
  monto; si no llega, lo único que le queda es declararse en quiebra.

Del lado del diseño, lo que se aprovecha del enunciado son dos abstracciones. `Casilla` es
una interfaz con una sola operación, `accionar`, de manera que **agregar un tipo de casilla
nuevo no obliga a tocar nada del motor**: el jugador cae, la casilla sabe qué hacerle. Y las
acciones del turno están divididas en tres etapas (inicio, casilla, fin), cada una con su
*calculadora* que lee el estado del juego y devuelve qué puede hacer el jugador ahora — el
controlador arma un botón por cada acción que le devuelven, sin saber cuáles son. Es un
*abstract factory* que produce objetos `Accion`, y es lo que hace que la botonera cambie
sola según el momento del turno.

### Tecnologías

Leídas del `pom.xml`, del `module-info.java` y de los imports:

- **Java 17** con **módulos de JPMS**: hay un `module-info.java` de verdad, que exporta
  `org.monopoly` y abre `org.monopoly.controller` a `javafx.fxml` para que la inyección de
  `@FXML` funcione bajo el sistema de módulos.
- **JavaFX 17.0.6**, `javafx.controls` y `javafx.fxml`.
- **FXML** para cinco vistas (`escena-inicio`, `vistaMonopoly`, `tablero`, `casilla`,
  `propiedades`), cargadas con `FXMLLoader`.
- **CSS de JavaFX** (`estilos.css`), agregado en el rediseño: colores como *looked-up
  colors*, y `:hover` / `:pressed` / `:focused` para los estados.
- **Maven** con `maven-compiler-plugin` y **`javafx-maven-plugin`**, del que se usan
  `javafx:run` para desarrollo y **`javafx:jlink`** para armar el runtime del contenedor.
- **Docker** multietapa y **X11** para sacar la ventana afuera del contenedor.
- 27 imágenes PNG (628 KB) en `resources/images/`: los quince personajes, las caras de los
  dados, las esquinas y el centro del tablero.

> Dos dependencias declaradas que **no se usan**: `controlsfx` y `formsfx-core` están en el
> `pom.xml` y el `module-info.java` no las requiere ni aparecen en ningún import. Se pueden
> sacar.
>
> Y **no hay ni un test**: el `pom.xml` declara `junit-jupiter-api` y `junit-jupiter-engine`,
> pero `src/test/` no existe. Es la diferencia más grande contra Zorro y Ocas, donde las 55
> verificaciones son media ficha.

### Capturas

**Todavía no hay ninguna en el portfolio.** Durante el rediseño se sacaron seis de trabajo
—inicio antes y después, selección de fichas, el botón con el hover puesto, el tablero en
juego y el arranque dentro del contenedor— pero están en un directorio temporal y ninguna
sirve tal cual: la del tablero es una partida de dos jugadores recién empezada, sin
propiedades compradas ni dados tirados.

Lo que conviene fotografiar, de una partida ya avanzada:

- El tablero con cuatro jugadores, propiedades compradas y los dados con un resultado.
- La tarjeta de una casilla, que es donde mejor se ve el rediseño.
- El listado de propiedades de un jugador con varias filas.
- La pantalla de ganador.

El *antes* para comparar no hace falta sacarlo: está en la página 1 de
`InformeMonopoly.pdf`, que tiene una captura de una partida de cuatro jugadores con la
interfaz original.
