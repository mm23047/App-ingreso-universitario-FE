# Verificación de Cumplimiento - Instrucciones del Ingeniero

## Análisis de la Aplicación "Ingreso Universitario - Frontend"

---

## ✅ VERIFICACIÓN DE CUMPLIMIENTO

### 1. **Separación de Responsabilidades (Arquitectura)**

#### 1.1 Vista vs. Controlador

**Estado Actual:** ⚠️ **PARCIALMENTE CUMPLIDO**

**Lo que existe:**
- ✅ **Vista (HTML):** Los archivos HTML (`index.html`, `contador.html`) solo contienen estructura y estilos
- ✅ **Web Component:** `contador.js` es un Web Component que encapsula su propia lógica de presentación
- ✅ **DAOs (Data Access Objects):** Existen clases especializadas para acceso a datos (`JornadaDao`, `ProcesarLentoDao`)

**Lo que FALTA:**
- ❌ **Controlador de Negocio:** No hay un controlador intermedio que procese datos antes de enviarlos a la vista
  - Actualmente, la vista accede directamente a los DAOs
  - No hay transformación de datos entre el DAO y la presentación
  - No hay manejo centralizado de lógica de negocio

**Recomendación:**
```
CREAR: src/js/control/jornada_controller.js

Responsabilidades del controlador:
- Recibir eventos de la vista
- Procesar/transformar datos
- Consumir datos del DAO
- Enviar datos procesados a la vista
```

---

### 2. **Implementación de Datos Simulados (Mocking)**

**Estado Actual:** ✅ **CUMPLIDO CORRECTAMENTE**

**Lo que existe:**

✅ **Datos "Quemados" en Tests:**
- El archivo `jornada_dao.unit.test.js` implementa correctamente datos simulados:
  ```javascript
  const mockData = [
      { id: 1, nombre: 'Mañana' },
      { id: 2, nombre: 'Tarde' }
  ];
  ```

✅ **Stubs de Sinon:**
- Se usa `sinon.stub(window, 'fetch')` para simular peticiones REST
- Los tests NO realizan peticiones reales al servidor
- Se simulan casos de éxito (status 200) y error (status 500)

✅ **Recurso REST Simulado:**
- El DAO está estructurado como si consumiera un servicio REST real:
  - URL: `http://localhost:9080/IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/jornada`
  - Métodos: `obtenerJornadas()`, `obtenerJornadaPorId(id)`

✅ **Web Component de Prueba:**
- `contador.unit.test.js` prueba el contador de forma aislada

---

### 3. **Lógica de Almacenamiento en Base de Datos**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO AÚN**

**Lo que existe:**
- Los DAOs manejan lectura de datos desde el servidor
- No hay implementación de guardado en base de datos local

**Lo que FALTA:**
- ❌ Separación entre datos completos del servicio y lo que se guarda localmente
- ❌ Almacenamiento de solo códigos/IDs en la base de datos local
- ❌ Lógica de persistencia local

**Recomendación:**
```
CREAR: src/js/control/local_storage_dao.js

Responsabilidades:
- Guardar solo el ID/código en localStorage
- No guardar datos completos
- Recuperar códigos guardados para futuras consultas
- Actuar como caché local
```

---

## 📊 TABLA DE CUMPLIMIENTO

| Requisito | Estado | Descripción |
|-----------|--------|------------|
| Vista sin procesamiento | ✅ | Solo detecta interacción del usuario |
| Controlador centralizado | ❌ | FALTA crear controlador de negocio |
| Datos "quemados" en tests | ✅ | Implementados con Sinon stubs |
| Recurso REST simulado | ✅ | Estructura REST lista para producción |
| Datos completos en DAO | ✅ | Se obtiene objeto completo |
| Almacenar solo IDs | ❌ | FALTA implementar persistencia local |
| Separación responsabilidades | ⚠️ | Parcialmente; falta controlador |

---

## 🔧 ACCIONES RECOMENDADAS

### **Prioridad 1 (URGENTE):**
1. **Crear controlador de negocio**
   - Archivo: `src/js/control/jornada_controller.js`
   - Responsable de procesar datos antes de mostrar en vista

### **Prioridad 2 (IMPORTANTE):**
2. **Implementar persistencia local**
   - Archivo: `src/js/control/local_storage_dao.js`
   - Guardar solo códigos/IDs
   - Mantener caché local

### **Prioridad 3 (MEJORA):**
3. **Integrar controlador en vista**
   - Modificar HTML para usar controlador
   - Eliminar acceso directo del HTML a DAOs

---

## 📝 ESTRUCTURA RECOMENDADA

```
src/
├── js/
│   ├── control/
│   │   ├── default_dao.js              ✅ EXISTE
│   │   ├── jornada_dao.js              ✅ EXISTE
│   │   ├── procesar_lento_dao.js       ✅ EXISTE
│   │   ├── jornada_controller.js       ❌ FALTA CREAR
│   │   └── local_storage_dao.js        ❌ FALTA CREAR
│   └── components/
│       └── contador.js                  ✅ EXISTE
└── test/
    └── js/
        ├── jornada_dao.unit.test.js    ✅ EXISTE
        ├── jornada_controller.unit.test.js  ❌ FALTA CREAR
        └── ...
```

---

## 🎯 CONCLUSIÓN

**Cumplimiento General: 60%**

### ✅ Lo que está bien:
1. Arquitectura base con DAOs correctamente implementada
2. Web Components con encapsulamiento adecuado
3. Testing con mocks/stubs correctamente estructurado
4. Separación de vista correcta (HTML sin lógica)

### ❌ Lo que falta:
1. **Controlador de negocio** - CREAR
2. **Persistencia local** - CREAR
3. **Integración completa** - REFACTORIZAR

### 📈 Próximos pasos:
- Implementar `jornada_controller.js`
- Implementar `local_storage_dao.js`
- Crear tests unitarios para el controlador
- Integrar controlador en la vista
