// BE: ClavesExamen  @Table(name="clave_examen")
// PK: UUID idClaveExaman  (columna id_clave — NOTA: typo en el código Java: "Examan")
// Unique constraint: (id_prueba, nombre_clave)
// Relaciones:
//   pruebaAdmision @ManyToOne PruebasAdmision (NOT NULL, LAZY)
//   etapaAdmision  @ManyToOne EtapasAdmision  (NOT NULL, LAZY)
// Esta entidad llega anidada dentro de ExamenRealizado.claveExamen
class ClavesExamen {
    constructor(idClaveExaman, pruebaAdmision, nombreClave, etapaAdmision) {
        this.idClaveExaman  = idClaveExaman;
        this.pruebaAdmision = pruebaAdmision;
        this.nombreClave    = nombreClave;
        this.etapaAdmision  = etapaAdmision;
    }
}

export default ClavesExamen;
