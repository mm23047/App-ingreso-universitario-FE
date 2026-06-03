// BE: CuposCarrera  @Table(name="cupos_carrera")
// PK compuesta (@EmbeddedId): idCupoCarrera { idPrueba: UUID, idCarrera: String, idEtapa: UUID }
// Relaciones:
//   pruebaAdmision  @ManyToOne PruebasAdmision  (NOT NULL, LAZY → JOIN FETCH)
//   catalogoCarrera @ManyToOne CatalogoCarrera  (NOT NULL, LAZY → JOIN FETCH)
//   etapaAdmision   @ManyToOne EtapasAdmision   (NOT NULL, LAZY → JOIN FETCH)
// version: Long — campo @Version para bloqueo optimista, viene en JSON
// Endpoint: GET  /cupos_carrera
//           POST /cupos_carrera
//           GET  /cupos_carrera/{idPrueba}/{idCarrera}/{idEtapa}
//           PUT  /cupos_carrera/{idPrueba}/{idCarrera}/{idEtapa}
//           DELETE /cupos_carrera/{idPrueba}/{idCarrera}/{idEtapa}
class CuposCarrera {
    constructor(idCupoCarrera, pruebaAdmision, catalogoCarrera, etapaAdmision, cupos, version) {
        this.idCupoCarrera   = idCupoCarrera;
        this.pruebaAdmision  = pruebaAdmision;
        this.catalogoCarrera = catalogoCarrera;
        this.etapaAdmision   = etapaAdmision;
        this.cupos           = cupos;
        this.version         = version;
    }
}

export default CuposCarrera;
