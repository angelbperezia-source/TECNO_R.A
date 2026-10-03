// ====================================================
// ESQUELETO DE FUNCIONES - JAVASCRIPT (En desarrollo)
// ====================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado correctamente para Insumos Tecnológicos.");
    
    // Llamadas a funciones principales (pendientes de completar)
    initMenuResponsive();
    initValidacionFormulario();
    initCarrusel();
});

// TODO: Desarrollar lógica para el menú en dispositivos móviles (hamburguesa)
function initMenuResponsive() {
    // Ejemplo de estructura vacía:
    // const menuToggle = document.querySelector(".menu-toggle");
    // menuToggle.addEventListener("click", () => { ... });
    console.log("Función initMenuResponsive pendiente de programar...");
}

// TODO: Desarrollar lógica para capturar los datos del formulario de presupuesto
function initValidacionFormulario() {
    const formulario = document.getElementById("form-presupuesto");

    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            
            // Capturamos los valores de ejemplo
            const nombre = document.getElementById("nombre").value;
            const modelo = document.getElementById("modelo").value;
            
            console.log(`Datos recibidos de ${nombre} para el equipo ${modelo}.`);
            
            // TODO: Agregar alerta visual de éxito o conectar con API de WhatsApp
            alert("¡Consulta recibida! (Falta conectar lógica de envío)");
        });
    }
}

function initCarrusel() {
    const carrusel = document.querySelector("[data-carrusel]");

    if (!carrusel) {
        return;
    }

    const pista = carrusel.querySelector(".carrusel-pista");
    const diapositivas = Array.from(pista.children);
    const indicadores = Array.from(carrusel.querySelectorAll("[data-carrusel-ir]"));
    const botonAnterior = carrusel.querySelector("[data-carrusel-anterior]");
    const botonSiguiente = carrusel.querySelector("[data-carrusel-siguiente]");
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let indiceActual = 0;
    let temporizador;

    function mostrarDiapositiva(indice) {
        indiceActual = (indice + diapositivas.length) % diapositivas.length;
        pista.style.transform = `translateX(-${indiceActual * (100 / diapositivas.length)}%)`;

        indicadores.forEach((indicador, posicion) => {
            const estaActivo = posicion === indiceActual;
            indicador.classList.toggle("activo", estaActivo);

            if (estaActivo) {
                indicador.setAttribute("aria-current", "true");
            } else {
                indicador.removeAttribute("aria-current");
            }
        });
    }

    function detenerAvanceAutomatico() {
        window.clearInterval(temporizador);
    }

    function iniciarAvanceAutomatico() {
        detenerAvanceAutomatico();

        if (!movimientoReducido.matches && !document.hidden) {
            temporizador = window.setInterval(() => {
                mostrarDiapositiva(indiceActual + 1);
            }, 4000);
        }
    }

    botonAnterior.addEventListener("click", () => {
        mostrarDiapositiva(indiceActual - 1);
        iniciarAvanceAutomatico();
    });

    botonSiguiente.addEventListener("click", () => {
        mostrarDiapositiva(indiceActual + 1);
        iniciarAvanceAutomatico();
    });

    indicadores.forEach((indicador) => {
        indicador.addEventListener("click", () => {
            mostrarDiapositiva(Number(indicador.dataset.carruselIr));
            iniciarAvanceAutomatico();
        });
    });

    carrusel.addEventListener("mouseenter", detenerAvanceAutomatico);
    carrusel.addEventListener("mouseleave", iniciarAvanceAutomatico);
    carrusel.addEventListener("focusin", detenerAvanceAutomatico);
    carrusel.addEventListener("focusout", (evento) => {
        if (!carrusel.contains(evento.relatedTarget)) {
            iniciarAvanceAutomatico();
        }
    });
    document.addEventListener("visibilitychange", iniciarAvanceAutomatico);
    movimientoReducido.addEventListener("change", iniciarAvanceAutomatico);

    iniciarAvanceAutomatico();
}