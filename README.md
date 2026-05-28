# App Ingreso Universitario - Frontend

Aplicación frontend para gestión del ingreso universitario con arquitectura modular, pruebas unitarias e integración, y Web Components.

## Estructura del Proyecto

```
src/
├── js/
│   ├── control/
│   │   ├── default_dao.js          # Clase base para DAOs
│   │   ├── jornada_dao.js          # DAO especializado para jornadas
│   │   └── procesar_lento_dao.js   # DAO para procesos asincronos
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
│       ├── jornada_dao.unit.test.js # Pruebas unitarias (con stubs)
│       ├── jornada_dao.it.js        # Pruebas de integración
│       ├── run-tests.js             # Ejecutor pruebas unitarias
│       ├── run-integration-tests.js # Ejecutor pruebas integración
│       ├── run-contador-tests.js    # Ejecutor pruebas contador
│       ├── jornada_dao_test.html    # HTML runner DAO unitarias
│       ├── jornada_dao_integration_test.html
│       └── contador_test.html       # HTML runner contador
├── index.html
├── contador.html                    # Demo del Web Component
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

### ContadorComponent (Web Component)
- **Custom Element**: `<app-contador>`
- **Shadow DOM**: Encapsulamiento de estilos
- **Ciclo de vida**: constructor, connectedCallback, disconnectedCallback, attributeChangedCallback
- **Métodos**: `getValor()`, `setValor(valor)`, `aumentar()`, `disminuir()`, `reiniciar()`
- **Eventos**: Emite `contador-cambio` con el valor actual

## Pruebas

### Pruebas Unitarias (jornada_dao.unit.test.js)
- ✓ 20+ pruebas con **stubs de Sinon**
- ✓ No realiza peticiones reales al servidor
- ✓ Mocksea datos controlados
- ✓ Valida comportamiento interno

**Características:**
- Stub de `window.fetch` para simular respuestas del servidor
- Pruebas de casos de éxito y error
- Validación de estructura de datos

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

### DAO Pattern (Data Access Object)
```
DefaultDao (base)
  ├── JornadaDao (jornadas)
  └── ProcesarLentoDao (procesos)
```

### Separación de Pruebas
```
Pruebas Unitarias (.unit.test.js)
  → Aisladas con stubs
  → No requieren servidor
  → Prueban lógica interna

Pruebas de Integración (.it.js)
  → Con servidor real
  → Validan flujo completo
  → Permiten validar API
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
| Integración DAO | 5+ | ✓ Pasando |
| Unitarias Contador | 25+ | ✓ Pasando |
| **Total** | **50+** | **✓ Todas pasan** |

## Requisitos Implementados

✓ **VIDEO 1**: Configuración de Mocha, Chai y pruebas en navegador
✓ **VIDEO 2**: Sinon stubs para pruebas unitarias aisladas
✓ **VIDEO 3**: Separación de pruebas unitarias e integración
✓ **VIDEO 4**: Web Components con Custom Elements y Shadow DOM

## Notas

- Las pruebas unitarias **no requieren servidor** (usan stubs)
- Las pruebas de integración **requieren servidor** corriendo en puerto 9080
- El componente contador es totalmente **independiente** y **reutilizable**
- Todos los estilos están **encapsulados** en Shadow DOM

