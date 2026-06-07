class DefaultDao {
    constructor() {
        const backendHost = window.location.hostname;
        this.BASE_URL = `http://${backendHost}:9080/IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/`;
    }

    getBaseUrl() {
        return this.BASE_URL;
    }
}

export default DefaultDao;