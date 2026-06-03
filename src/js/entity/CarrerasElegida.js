// BE: CarrerasElegida  @Table(name="carrera_elegida")
// PK compuesta (@EmbeddedId): idCarreraElegida { idInscripcion: UUID, idCarrera: String }
//   Getter: getIdCarreraElegida() → JSON key: "idCarreraElegida"
// Relaciones:
//   inscripcionesPrueba @ManyToOne InscripcionesPrueba (NOT NULL, LAZY → JOIN FETCH)
//   catalogoCarrera     @ManyToOne CatalogoCarrera     (NOT NULL, LAZY → JOIN FETCH)
// prioridad: Short (1 = primera opción preferida)
class CarrerasElegida {
    constructor(idCarreraElegida, inscripcionesPrueba, catalogoCarrera, prioridad) {
        this.idCarreraElegida    = idCarreraElegida;
        this.inscripcionesPrueba = inscripcionesPrueba;
        this.catalogoCarrera     = catalogoCarrera;
        this.prioridad           = prioridad;
    }
}

export default CarrerasElegida;
