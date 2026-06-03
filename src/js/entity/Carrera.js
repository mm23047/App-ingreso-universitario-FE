// BE: CatalogoCarrera  @Table(name="catalogo_carrera")
// PK: String idCarrera  (max 10)
class Carrera {
    constructor(idCarrera, nombreCatalogoCarrera) {
        this.idCarrera             = idCarrera;
        this.nombreCatalogoCarrera = nombreCatalogoCarrera;
    }
}

export default Carrera;
