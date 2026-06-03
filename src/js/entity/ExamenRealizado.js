// BE: ExamenRealizado  @Table(name="examen_realizado")
// PK: UUID idExamenRealizado  (columna id_examen)
// Unique constraint: (id_inscripcion, id_etapa)
// Relaciones:
//   inscripcionesPrueba @ManyToOne InscripcionesPrueba (NOT NULL, LAZY → JOIN FETCH)
//   claveExamen         @ManyToOne ClavesExamen        (NOT NULL, LAZY → JOIN FETCH)
//   etapaAdmision       @ManyToOne EtapasAdmision      (NOT NULL, LAZY → JOIN FETCH)
// puntajeFinal: null hasta que se llame POST /examen_realizado/{id}/calificar
// fechaRealizacion: OffsetDateTime, set automáticamente por @PrePersist
class ExamenRealizado {
    constructor(idExamenRealizado, inscripcionesPrueba, claveExamen, etapaAdmision, puntajeFinal, fechaRealizacion) {
        this.idExamenRealizado   = idExamenRealizado;
        this.inscripcionesPrueba = inscripcionesPrueba;
        this.claveExamen         = claveExamen;
        this.etapaAdmision       = etapaAdmision;
        this.puntajeFinal        = puntajeFinal;
        this.fechaRealizacion    = fechaRealizacion;
        this.estadoAdmision      = null;  // PENDIENTE / ADMITIDO / NO_ADMITIDO (desde ProcesoAdmisionAspirante)
        this.carreraAsignada     = null;  // nombre de la carrera asignada (desde ProcesoAdmisionAspirante)
    }
}

export default ExamenRealizado;
