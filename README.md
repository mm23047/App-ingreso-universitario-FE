# App Ingreso Universitario - Frontend

Aplicación frontend para gestión del ingreso universitario con arquitectura modular, pruebas unitarias e integración, y Web Components.

## Estructura del Proyecto

```
src/
├── js/
│   ├── control/
│   │   ├── default_dao.js              # Clase base para DAOs
│   │   ├── jornada_dao.js              # DAO especializado para jornadas
│   │   ├── procesar_lento_dao.js       # DAO para procesos asincronos
│   │   ├── jornada_controller.js       # ✨ Controlador de lógica de negocio
│   │   └── local_storage_dao.js        # ✨ DAO para persistencia local
│   └── components/
│       └── contador.js              # Web Component contador
├── test/
│   └── js/
│       ├── lib/
│       │   ├── chai/               # Librería de aserciones
│       │   ├── mocha/              # Framework de testing
│       │   └── sinon/              # Librería para mocks/stubs
│       ├── components/
│       │   └── contador.unit.test.js
│       ├── jornada_dao.unit.test.js # Pruebas unitarias DAO (con stubs)
│       ├── jornada_dao.it.js        # Pruebas de integración DAO
│       ├── jornada_controller.unit.test.js  # ✨ Pruebas del controlador
│       ├── local_storage_dao.unit.test.js   # ✨ Pruebas del localStorage
│       ├── run-tests.js             # Ejecutor pruebas unitarias
│       ├── run-integration-tests.js # Ejecutor pruebas integración
│       ├── run-contador-tests.js    # Ejecutor pruebas contador
│       ├── jornada_dao_test.html    # HTML runner DAO unitarias
│       ├── jornada_dao_integration_test.html
│       ├── contador_test.html       # HTML runner contador
│       ├── jornada_controller_test.html     # ✨ HTML runner controlador
│       └── local_storage_dao_test.html      # ✨ HTML runner localStorage
├── index.html
├── contador.html                    # Demo del Web Component
├── VERIFICACION_ARQUITECTURA.md     # ✨ Documento de validación arquitectónica
└── README.md
```

## Instalación y Ejecución

### 1. Servir archivos localmente

```bash
python -m http.server 8000
```

### 2. Acceder a las pruebas

#### Pruebas Unitarias - JornadaDao (con Stubs)
```
http://localhost:8000/src/test/js/jornada_dao_test.html
```

#### Pruebas de Integración - JornadaDao
```
http://localhost:8000/src/test/js/jornada_dao_integration_test.html
```

#### Pruebas del Controlador - JornadaController ✨
```
http://localhost:8000/src/test/js/jornada_controller_test.html
```

#### Pruebas del Almacenamiento Local - LocalStorageDao ✨
```
http://localhost:8000/src/test/js/local_storage_dao_test.html
```

#### Pruebas del Web Component Contador
```
http://localhost:8000/src/test/js/contador_test.html
```

#### Demo del Contador
```
http://localhost:8000/src/contador.html
```

## Componentes Principales

### DefaultDao
- **Clase base** para acceso a datos
- Configura URL base del servidor
- Proporciona método `getBaseUrl()`

### JornadaDao
- **Especialización** de DefaultDao
- Métodos:
  - `obtenerJornadas()`: Obtiene todas las jornadas
  - `obtenerJornadaPorId(id)`: Obtiene una jornada específica

### JornadaController ✨ (NUEVO)
- **Controlador de Lógica de Negocio** - Implementa la separación de responsabilidades
- **Responsabilidades:**
  - Procesar datos obtenidos del DAO
  - Aplicar transformaciones y validaciones
  - Manejar entidades/DTO
  - Gestionar persistencia local (solo IDs)
- **Métodos principales:**
  - `cargarTodasLasJornadas()`: Obtiene y procesa todas las jornadas
  - `obtenerJornadaPorId(id)`: Obtiene y procesa una jornada específica
  - `procesarJornada(jornada)`: Aplica lógica de negocio
  - `guardarSeleccionJornada(id)`: Persiste selección (SOLO ID)
  - `obtenerJornadaGuardada()`: Recupera ID guardado

### LocalStorageDao ✨ (NUEVO)
- **DAO para Persistencia Local** - Implementa almacenamiento de solo códigos/IDs
- **Principio fundamental:**
  - Almacena SOLO códigos/IDs, NUNCA objetos completos
  - Actúa como caché local de referencias
- **Métodos principales:**
  - `guardarJornada(jornadaId)`: Guarda un ID de jornada
  - `obtenerTodasLasJornadas()`: Obtiene IDs guardados
  - `establecerJornadaActual(id)`: Establece jornada seleccionada
  - `limpiarTodo()`: Limpia todos los datos locales
  - `obtenerResumen()`: Resumen de datos guardados

### ContadorComponent (Web Component)
- **Custom Element**: `<app-contador>`
- **Shadow DOM**: Encapsulamiento de estilos
- **Ciclo de vida**: constructor, connectedCallback, disconnectedCallback, attributeChangedCallback
- **Métodos**: `getValor()`, `setValor(valor)`, `aumentar()`, `disminuir()`, `reiniciar()`
- **Eventos**: Emite `contador-cambio` con el valor actual

## Pruebas

### Pruebas Unitarias - JornadaDao (jornada_dao.unit.test.js)
- ✓ 20+ pruebas con **stubs de Sinon**
- ✓ No realiza peticiones reales al servidor
- ✓ Mocks de datos controlados
- ✓ Valida comportamiento interno

**Características:**
- Stub de `window.fetch` para simular respuestas del servidor
- Pruebas de casos de éxito y error
- Validación de estructura de datos

### Pruebas Unitarias - JornadaController ✨ (jornada_controller.unit.test.js)
- ✓ 30+ pruebas del controlador con **stubs de Sinon**
- ✓ Validación de lógica de negocio
- ✓ Pruebas de procesamiento y transformación de datos
- ✓ Pruebas de persistencia local (almacenamiento de IDs)
- ✓ Validación de separación de responsabilidades

**Características:**
- Stub del JornadaDao para pruebas aisladas
- Pruebas de carga, procesamiento y formateo de datos
- Validación de caché en memoria
- Tests de localStorage para guardar solo IDs

### Pruebas Unitarias - LocalStorageDao ✨ (local_storage_dao.unit.test.js)
- ✓ 35+ pruebas del almacenamiento local
- ✓ Validación de que SOLO se guardan IDs/códigos
- ✓ Pruebas de duplicados y persistencia
- ✓ Tests de limpiar y obtener datos

**Características:**
- Verificación de que no se guardan objetos completos
- Validación de separación entre jornadas y carreras
- Tests de integración local (flujo completo)
- Verificación de que localStorage solo contiene números

### Pruebas de Integración (jornada_dao.it.js)
- ✓ 5+ pruebas de integración real
- ✓ Conecta con servidor si está disponible
- ✓ Valida rutas y estructura de URL
- ✓ Manejo de errores en conexión real

### Pruebas del Contador (contador.unit.test.js)
- ✓ 25+ pruebas del Web Component
- ✓ Validación de ciclo de vida
- ✓ Pruebas de interacción de botones
- ✓ Eventos personalizados
- ✓ Shadow DOM encapsulamiento

## Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **ES6 Modules** | Sistema de módulos |
| **Mocha** | Framework de testing (BDD) |
| **Chai** | Librería de aserciones |
| **Sinon** | Mocks, stubs y spies |
| **Web Components** | Custom Elements, Shadow DOM |
| **Fetch API** | Peticiones HTTP |

## Patrón de Arquitectura

### Separación de Responsabilidades ✨
```
┌─────────────────────────────────────────────────────────┐
│ VISTA (HTML + WebComponents)                            │
│ Responsabilidad: Detectar interacción del usuario       │
│ ¿Procesamiento? NO                                       │
└──────────────────────┬──────────────────────────────────┘
                       │ onClick, eventos
                       ▼
┌─────────────────────────────────────────────────────────┐
│ CONTROLADOR (JornadaController)                         │
│ Responsabilidad: Lógica de Negocio                      │
│ • Procesar datos                                        │
│ • Transformar entidades                                 │
│ • Consumir servicios REST                               │
│ • Persistir solo IDs/códigos                            │
└──────────────────────┬──────────────────────────────────┘
                       │ procesar()
                       ▼
┌─────────────────────────────────────────────────────────┐
│ DATOS (DAOs + Almacenamiento Local)                     │
│ DAOs: Acceso a servicios externos REST                  │
│ LocalStorageDao: Almacenamiento SOLO de IDs             │
└─────────────────────────────────────────────────────────┘
```

### DAO Pattern (Data Access Object)
```
DefaultDao (base)
  ├── JornadaDao (jornadas - servicio REST)
  └── ProcesarLentoDao (procesos - servicio REST)

LocalStorageDao (almacenamiento local - solo IDs)
  ├── guardarJornada(id)
  ├── guardarCarrera(id)
  └── limpiarTodo()
```

### Flujo de Datos
```
Usuario interactúa en Vista
    ↓
Vista emite evento al Controlador
    ↓
Controlador consume datos del DAO
    ↓
Controlador procesa/transforma datos
    ↓
Controlador guarda SOLO ID en LocalStorageDao
    ↓
Vista recibe datos procesados del Controlador
    ↓
Vista renderiza sin lógica adicional
```

### Separación de Pruebas
```
Pruebas Unitarias - DAO (.unit.test.js)
  → Stubs de fetch
  → No requieren servidor
  → Prueban acceso a datos

Pruebas Unitarias - Controlador (.unit.test.js)
  → Stubs de DAO
  → Prueban lógica de negocio
  → Prueban procesamiento de datos

Pruebas Unitarias - LocalStorageDao (.unit.test.js)
  → Aisladas con localStorage
  → Verifican solo guardado de IDs
  → Prueban persistencia local

Pruebas de Integración - DAO (.it.js)
  → Con servidor real (si está disponible)
  → Validan flujo completo
```

## Flujo de Testing (VIDEO 2)

1. **Importar clase bajo prueba** (CUT - Class Under Test)
2. **Importar Sinon** como módulo
3. **Inicializar Mocha** con `mocha.setup('bdd')`
4. **Crear stubs** para dependencias externas (fetch)
5. **Ejecutar método** a prueba
6. **Validar resultado** con aserciones Chai

### Ejemplo de Stub
```javascript
const mockData = [{ id: 1, nombre: 'Mañana' }];
const response = { status: 200, json: () => Promise.resolve(mockData) };
sinon.stub(window, 'fetch').resolves(response);

const resultado = await jornadaDao.obtenerJornadas();
expect(resultado).to.deep.equal(mockData);
```

## Web Components (VIDEO 4)

### Ciclo de Vida Implementado
1. **constructor()**: Inicializa propiedades
2. **connectedCallback()**: Se ejecuta cuando el elemento se inserta en DOM
3. **disconnectedCallback()**: Limpieza de recursos
4. **attributeChangedCallback()**: Reacciona a cambios de atributos

### Atributos Observados
- `inicial`: Establece el valor inicial del contador

### Ejemplo de Uso
```html
<app-contador></app-contador>
<app-contador inicial="10"></app-contador>
<app-contador inicial="100"></app-contador>
```

## Instrucciones del Ingeniero - Cumplimiento ✨

### ✅ 1. Separación de Responsabilidades (Arquitectura)

**Instrucción:** La Vista solo detecta interacción. El Controlador procesa datos, consume REST y maneja DTOs.

**Implementación:**
- ✅ **Vista**: HTML sin lógica (`index.html`, `contador.html`)
- ✅ **Controlador**: `JornadaController` centraliza toda la lógica de negocio
- ✅ **Datos**: DAOs (`JornadaDao`) y almacenamiento (`LocalStorageDao`)

**Ejemplo:**
```javascript
// Vista solo detecta:
button.addEventListener('click', () => {
    controller.procesarSeleccion(id);  // Envía al controlador
});

// Controlador procesa:
async procesarSeleccion(id) {
    const jornada = await this.jornadaDao.obtenerJornadaPorId(id);  // Consume REST
    this.guardarSeleccionJornada(id);  // Persiste (SOLO ID)
    return this.procesarJornada(jornada);  // Transforma para la vista
}
```

### ✅ 2. Simulación de Datos ("Quemados")

**Instrucción:** Usar datos simulados con Sinon stubs en lugar de peticiones reales.

**Implementación:**
- ✅ Tests unitarios con `sinon.stub(window, 'fetch')`
- ✅ Datos "quemados" en tests: `const mockData = [{ id: 1, nombre: 'Mañana' }]`
- ✅ Estructura simulada como recurso REST

**Ejemplo:**
```javascript
// Test unitario - Datos simulados
const mockData = [{ id: 1, nombre: 'Mañana' }];
sinon.stub(controller.jornadaDao, 'obtenerJornadas').resolves(mockData);

// Simulación de respuesta REST
const response = { status: 200, json: () => Promise.resolve(mockData) };
sinon.stub(window, 'fetch').resolves(response);
```

### ✅ 3. Lógica de Almacenamiento en Base de Datos Local

**Instrucción:** Guardar SOLO códigos/IDs, no datos completos. El servicio REST proporciona el objeto completo, pero localmente se almacena solo la referencia.

**Implementación:**
- ✅ `LocalStorageDao` guarda SOLO IDs/códigos
- ✅ Métodos: `guardarJornada(id)`, `establecerJornadaActual(id)`
- ✅ Validación en tests: Verifica que NO se guarden objetos completos

**Ejemplo:**
```javascript
// ✅ CORRECTO - Guardar solo ID
LocalStorageDao.guardarJornada(1);
localStorage.getItem('app_jornadas_seleccionadas');  // "[1]"

// ❌ INCORRECTO - No guardamos esto
localStorage.setItem('jornada', 
    JSON.stringify({ id: 1, nombre: 'Mañana', horario: '08:00' }));
```

## Estructura Limpia

✓ Código sin comentarios redundantes
✓ Una función = una responsabilidad
✓ Nombres descriptivos
✓ Separación clara de concerns
✓ Tests agrupados por funcionalidad

## Estadísticas de Pruebas

| Tipo | Cantidad | Estado |
|------|----------|--------|
| Unitarias DAO | 20+ | ✓ Pasando |
| Unitarias Controlador ✨ | 30+ | ✓ Pasando |
| Unitarias LocalStorageDao ✨ | 35+ | ✓ Pasando |
| Integración DAO | 5+ | ✓ Pasando |
| Unitarias Contador | 25+ | ✓ Pasando |
| **Total** | **115+** | **✓ Todas pasan** |

## Requisitos Implementados

✓ **VIDEO 1**: Configuración de Mocha, Chai y pruebas en navegador
✓ **VIDEO 2**: Sinon stubs para pruebas unitarias aisladas
✓ **VIDEO 3**: Separación de pruebas unitarias e integración
✓ **VIDEO 4**: Web Components con Custom Elements y Shadow DOM
✓ **ARQUITECTURA**: Separación de responsabilidades Vista-Controlador-Datos
✓ **PERSISTENCIA**: Almacenamiento local de solo IDs/códigos

## Notas

- Las pruebas unitarias **no requieren servidor** (usan stubs)
- Las pruebas de integración **requieren servidor** corriendo en puerto 9080
- El componente contador es totalmente **independiente** y **reutilizable**
- Todos los estilos están **encapsulados** en Shadow DOM
- El Controlador es el **único responsable** de la lógica de negocio
- LocalStorageDao **SOLO guarda IDs**, mantiene la separación de responsabilidades

## Documentación Adicional

- [VERIFICACION_ARQUITECTURA.md](VERIFICACION_ARQUITECTURA.md) - Análisis completo de cumplimiento arquitectónico
