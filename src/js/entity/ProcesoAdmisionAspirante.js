// BE: ProcesoAdmisionAspirante  @Table(name="proceso_admision_aspirante")
// PK: UUID idProcesoAdmisionAspirante  (columna id_inscripcion, compartida con InscripcionesPrueba via @MapsId)
// Relaciones:
//   inscripcionesPrueba @OneToOne  InscripcionesPrueba (NOT NULL, LAZY → JOIN FETCH)
//   etapaAdmision       @ManyToOne EtapasAdmision      (NOT NULL, LAZY → JOIN FETCH)
//   carreraAsignada     @ManyToOne CatalogoCarrera      (LAZY, nullable — null hasta asignación final)
// estado: String max 20, NOT NULL (ej. "PENDIENTE", "ADMITIDO", "NO_ADMITIDO")
// Endpoint: GET  /proceso_admision
//           GET  /proceso_admision/{idInscripcion}
//           POST /proceso_admision/asignar-masivo  body: { idPrueba, idEtapa }
//           POST /proceso_admision/{idInscripcion}/asignar
class ProcesoAdmisionAspirante {
    constructor(idProcesoAdmisionAspirante, inscripcionesPrueba, etapaAdmision, estado, carreraAsignada) {
        this.idProcesoAdmisionAspirante = idProcesoAdmisionAspirante;
        this.inscripcionesPrueba        = inscripcionesPrueba;
        this.etapaAdmision              = etapaAdmision;
        this.estado                     = estado;
        this.carreraAsignada            = carreraAsignada;
    }
}

export default ProcesoAdmisionAspirante;
