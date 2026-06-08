import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/arbol.js';

describe('Arbol — app-arbol — Pruebas Unitarias', () => {
    let arbol;

    // ── Datos de prueba reutilizables ──────────────────────────────────────
    const areaSimple = {
        idAreaConocimiento: 10,
        nombreArea: 'Matemáticas',
        temas: [
            { idTema: 1, nombreTema: 'Álgebra' },
            { idTema: 2, nombreTema: 'Geometría' }
        ]
    };

    const areaConSubtemas = {
        idAreaConocimiento: 20,
        nombreArea: 'Ciencias',
        temas: [
            {
                idTema: 3,
                nombreTema: 'Biología',
                subtemas: [
                    { idTema: 31, nombreTema: 'Célula' },
                    { idTema: 32, nombreTema: 'Genética' }
                ]
            },
            { idTema: 4, nombreTema: 'Química' }
        ]
    };

    const areaSinTemas = {
        idAreaConocimiento: 30,
        nombreArea: 'Sin contenido',
        temas: []
    };

    // ── Helpers de acceso al Shadow DOM ────────────────────────────────────
    const cabecera  = () => arbol.shadowRoot.querySelector('.cabecera');
    const panelTemas = () => arbol.shadowRoot.querySelector('.temas');

    beforeEach(() => {
        arbol = document.createElement('app-arbol');
        document.body.appendChild(arbol);
    });

    afterEach(() => {
        if (arbol?.parentNode) arbol.parentNode.removeChild(arbol);
    });

    // ── Estructura inicial y ARIA ──────────────────────────────────────────
    describe('Estructura inicial y ARIA', () => {
        it('la cabecera debe tener role="button" y tabindex="0"', () => {
            expect(cabecera()).to.not.be.null;
            expect(cabecera().getAttribute('role')).to.equal('button');
            expect(cabecera().getAttribute('tabindex')).to.equal('0');
        });

        it('aria-expanded debe iniciar en "false"', () => {
            expect(cabecera().getAttribute('aria-expanded')).to.equal('false');
        });

        it('el panel de temas debe tener role="region"', () => {
            expect(panelTemas()).to.not.be.null;
            expect(panelTemas().getAttribute('role')).to.equal('region');
        });
    });

    // ── Carga de área — set area ───────────────────────────────────────────
    describe('Carga de área — set area', () => {
        it('debe mostrar el nombre del área en el título', () => {
            arbol.area = areaSimple;
            const titulo = arbol.shadowRoot.querySelector('.titulo');
            expect(titulo.textContent).to.equal('Matemáticas');
        });

        it('debe vincular aria-controls con el id del panel de temas', () => {
            arbol.area = areaSimple;
            const idPanel = panelTemas().id;
            expect(idPanel).to.include('10');
            expect(cabecera().getAttribute('aria-controls')).to.equal(idPanel);
        });

        it('debe renderizar el número correcto de ítems de tema', () => {
            arbol.area = areaSimple;
            const items = arbol.shadowRoot.querySelectorAll('.tema-item');
            expect(items.length).to.equal(2);
        });

        it('debe mostrar mensaje cuando el área no tiene temas', () => {
            arbol.area = areaSinTemas;
            const sinTemas = arbol.shadowRoot.querySelector('.sin-temas');
            expect(sinTemas).to.not.be.null;
            expect(sinTemas.textContent).to.include('no tiene temas');
        });

        it('debe reemplazar el contenido al recibir una nueva área', () => {
            arbol.area = areaSimple;
            arbol.area = {
                idAreaConocimiento: 99,
                nombreArea: 'Idiomas',
                temas: [{ idTema: 5, nombreTema: 'Inglés' }]
            };
            const titulo = arbol.shadowRoot.querySelector('.titulo');
            const items  = arbol.shadowRoot.querySelectorAll('.tema-item');
            expect(titulo.textContent).to.equal('Idiomas');
            expect(items.length).to.equal(1);
        });
    });

    // ── Estructura jerárquica de temas ────────────────────────────────────
    describe('Estructura jerárquica de temas', () => {
        it('tema sin subtemas debe ser un ítem simple (sin clase tiene-subtemas)', () => {
            arbol.area = areaSimple;
            const items = arbol.shadowRoot.querySelectorAll('.tema-item');
            items.forEach(item => {
                expect(item.classList.contains('tiene-subtemas')).to.be.false;
            });
        });

        it('tema con subtemas debe recibir la clase tiene-subtemas', () => {
            arbol.area = areaConSubtemas;
            const expandible = arbol.shadowRoot.querySelector('.tema-item.tiene-subtemas');
            expect(expandible).to.not.be.null;
        });

        it('debe renderizar el número correcto de subtemas', () => {
            arbol.area = areaConSubtemas;
            const subtemas = arbol.shadowRoot.querySelectorAll('.subtema-item');
            expect(subtemas.length).to.equal(2);
        });

        it('un área mixta debe tener ítems simples y expandibles', () => {
            arbol.area = areaConSubtemas; // 1 expandible + 1 simple
            const todos      = arbol.shadowRoot.querySelectorAll('.tema-item');
            const expandibles = arbol.shadowRoot.querySelectorAll('.tema-item.tiene-subtemas');
            expect(todos.length).to.equal(2);
            expect(expandibles.length).to.equal(1);
        });
    });

    // ── Expansión y colapso del área ──────────────────────────────────────
    describe('Expansión y colapso del área', () => {
        beforeEach(() => { arbol.area = areaSimple; });

        it('al hacer clic, aria-expanded cambia a "true"', () => {
            cabecera().click();
            expect(cabecera().getAttribute('aria-expanded')).to.equal('true');
        });

        it('al hacer clic, la cabecera recibe la clase expandida', () => {
            cabecera().click();
            expect(cabecera().classList.contains('expandida')).to.be.true;
        });

        it('al hacer clic, el panel de temas queda visible (display block)', () => {
            cabecera().click();
            expect(panelTemas().style.display).to.equal('block');
        });

        it('el segundo clic cierra: aria-expanded vuelve a "false"', () => {
            cabecera().click();
            cabecera().click();
            expect(cabecera().getAttribute('aria-expanded')).to.equal('false');
        });

        it('el segundo clic elimina la clase expandida', () => {
            cabecera().click();
            cabecera().click();
            expect(cabecera().classList.contains('expandida')).to.be.false;
        });

        it('el segundo clic oculta el panel (display none)', () => {
            cabecera().click();
            cabecera().click();
            expect(panelTemas().style.display).to.equal('none');
        });
    });

    // ── Interacción por teclado ────────────────────────────────────────────
    describe('Interacción por teclado', () => {
        beforeEach(() => { arbol.area = areaSimple; });

        it('la tecla Enter abre el área', () => {
            cabecera().dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
            );
            expect(cabecera().getAttribute('aria-expanded')).to.equal('true');
        });

        it('la tecla Espacio abre el área', () => {
            cabecera().dispatchEvent(
                new KeyboardEvent('keydown', { key: ' ', bubbles: true })
            );
            expect(cabecera().getAttribute('aria-expanded')).to.equal('true');
        });

        it('Enter alterna el estado en cada pulsación', () => {
            cabecera().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            cabecera().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(cabecera().getAttribute('aria-expanded')).to.equal('false');
        });
    });

    // ── Click en tema-cabecera nivel 2 (stopPropagation) ─────────────────────
    describe('Expansión de tema con subtemas (nivel 2)', () => {
        beforeEach(() => { arbol.area = areaConSubtemas; });

        it('al hacer clic en tema-cabecera, el tema expandible recibe la clase "abierto"', () => {
            const temaCab = arbol.shadowRoot.querySelector('.tema-cabecera');
            temaCab.click();
            const temaItem = arbol.shadowRoot.querySelector('.tema-item.tiene-subtemas');
            expect(temaItem.classList.contains('abierto')).to.be.true;
        });

        it('el segundo clic en tema-cabecera elimina la clase "abierto" (toggle)', () => {
            const temaCab = arbol.shadowRoot.querySelector('.tema-cabecera');
            temaCab.click();
            temaCab.click();
            const temaItem = arbol.shadowRoot.querySelector('.tema-item.tiene-subtemas');
            expect(temaItem.classList.contains('abierto')).to.be.false;
        });

        it('el clic en tema-cabecera NO propaga al toggle del área (stopPropagation)', () => {
            const temaCab = arbol.shadowRoot.querySelector('.tema-cabecera');
            temaCab.click();
            // El área NO debe haberse abierto: aria-expanded del área sigue en "false"
            expect(cabecera().getAttribute('aria-expanded')).to.equal('false');
        });
    });
});
