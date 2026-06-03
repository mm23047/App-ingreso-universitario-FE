// BE: Tema  @Table(name="tema")
// PK: UUID idTema  (columna id_tema)
// Relaciones:
//   areaConocimiento @ManyToOne AreasConocimiento (NOT NULL, LAZY → viene con JOIN FETCH)
//   idTemaPadre      @ManyToOne Tema self-ref (@JsonbTransient → NO viene en JSON)
//   subtemas         @OneToMany (LAZY → NO viene en JSON)
class Tema {
    constructor(idTema, nombreTema, areaConocimiento) {
        this.idTema           = idTema;
        this.nombreTema       = nombreTema;
        this.areaConocimiento = areaConocimiento;
        // idTemaPadre: @JsonbTransient en BE → nunca viene en respuesta JSON
        // subtemas: LAZY → nunca viene en respuesta JSON
    }
}

export default Tema;
