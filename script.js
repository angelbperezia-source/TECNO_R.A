// ====================================================
// TECNO R.A. - JavaScript principal
// Escrito en ES2015 (sin ?. ni ?? ni "..." ni catch sin variable) para que
// funcione también en celulares y navegadores viejos.
// ====================================================

// ---------- Compatibilidad con navegadores antiguos ----------
(function () {
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    var proto = window.Element && Element.prototype;
    if (!proto) {
        return;
    }

    if (!proto.append) {
        proto.append = function () {
            for (var i = 0; i < arguments.length; i++) {
                var nodo = arguments[i];
                this.appendChild(nodo instanceof Node ? nodo : document.createTextNode(String(nodo)));
            }
        };
    }

    if (!proto.replaceChildren) {
        proto.replaceChildren = function () {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
            this.append.apply(this, arguments);
        };
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            return setTimeout(function () {
                callback(Date.now());
            }, 16);
        };
    }
})();

// ---------- Utilidades compartidas ----------
function generarId() {
    try {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }
    } catch (error) {
        // Se usa el identificador de respaldo.
    }
    return Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function prefiereMovimientoReducido() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function posicionScroll() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
}

function desplazarSuave(destino) {
    var inicio = posicionScroll();
    var distancia = destino - inicio;

    if (!distancia) {
        return;
    }

    if (prefiereMovimientoReducido()) {
        window.scrollTo(0, destino);
        return;
    }

    var duracion = Math.min(900, Math.max(350, Math.abs(distancia) * 0.5));
    var t0 = null;

    function paso(t) {
        if (t0 === null) {
            t0 = t;
        }
        var avance = Math.min(1, (t - t0) / duracion);
        var suavizado = avance < 0.5 ? 2 * avance * avance : 1 - Math.pow(-2 * avance + 2, 2) / 2;
        window.scrollTo(0, inicio + distancia * suavizado);
        if (avance < 1) {
            window.requestAnimationFrame(paso);
        }
    }

    window.requestAnimationFrame(paso);
}

// Algunos navegadores viejos no soportan "gap" en flexbox: se avisa al CSS para usar márgenes.
function detectarSoporte() {
    try {
        var caja = document.createElement("div");
        caja.style.cssText = "display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden;pointer-events:none";
        caja.appendChild(document.createElement("div"));
        caja.appendChild(document.createElement("div"));
        document.body.appendChild(caja);
        var soportaGap = caja.scrollHeight === 1;
        document.body.removeChild(caja);

        if (!soportaGap) {
            document.documentElement.classList.add("sin-gap");
        }
    } catch (error) {
        // Si falla la detección, el diseño base sigue funcionando.
    }
}

// ---------- Arranque ----------
function iniciar() {
    detectarSoporte();

    // Cada módulo se inicia por separado: si uno falla, el resto sigue funcionando.
    [initMenuResponsive, initValidacionFormulario, initAdminPanel, initTienda, initAnimaciones].forEach(function (inicializar) {
        try {
            inicializar();
        } catch (error) {
            console.error("No se pudo iniciar " + inicializar.name + ":", error);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}

// ---------- Navegación: sombra al bajar, sección activa y scroll suave ----------
function initMenuResponsive() {
    var header = document.querySelector("header");
    var soportaScrollSuave = "scrollBehavior" in document.documentElement.style;

    if (header) {
        var pendiente = false;
        var actualizarSombra = function () {
            pendiente = false;
            header.classList.toggle("header-scroll", posicionScroll() > 8);
        };

        window.addEventListener("scroll", function () {
            if (!pendiente) {
                pendiente = true;
                window.requestAnimationFrame(actualizarSombra);
            }
        }, { passive: true });
        actualizarSombra();
    }

    // Sección activa en el menú
    var enlaces = [];
    document.querySelectorAll(".nav-links a").forEach(function (enlace) {
        var href = enlace.getAttribute("href") || "";
        if (href.charAt(0) === "#" && href.length > 1) {
            var seccion = document.getElementById(href.slice(1));
            if (seccion) {
                enlaces.push({ enlace: enlace, seccion: seccion });
            }
        }
    });

    function marcarActivo(seccion) {
        enlaces.forEach(function (item) {
            if (item.seccion === seccion) {
                item.enlace.setAttribute("aria-current", "true");
            } else {
                item.enlace.removeAttribute("aria-current");
            }
        });
    }

    if (document.getElementById("inicio") && enlaces.length > 1 && "IntersectionObserver" in window) {
        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    marcarActivo(entrada.target);
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });

        enlaces.forEach(function (item) {
            observador.observe(item.seccion);
        });
    } else if (enlaces.length === 1) {
        // Página de tienda: solo existe el enlace a su propia sección.
        marcarActivo(enlaces[0].seccion);
    }

    // Scroll suave con compensación del header en navegadores que no lo hacen solos
    if (!soportaScrollSuave) {
        document.addEventListener("click", function (evento) {
            if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) {
                return;
            }

            var enlace = evento.target;
            while (enlace && enlace !== document && !(enlace.tagName === "A" && enlace.getAttribute("href"))) {
                enlace = enlace.parentNode;
            }

            if (!enlace || enlace === document) {
                return;
            }

            var href = enlace.getAttribute("href");
            if (href.charAt(0) !== "#" || href.length < 2) {
                return;
            }

            var destino = document.getElementById(href.slice(1));
            if (!destino) {
                return;
            }

            evento.preventDefault();
            var alturaHeader = header ? header.offsetHeight : 0;
            desplazarSuave(destino.getBoundingClientRect().top + posicionScroll() - alturaHeader);

            try {
                window.history.pushState(null, "", href);
            } catch (error) {
                // Algunos navegadores internos no permiten cambiar el historial.
            }
        });
    }
}

// ---------- Formulario de presupuesto ----------
function initValidacionFormulario() {
    var formulario = document.getElementById("form-presupuesto");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        var nuevoPresupuesto = {
            id: generarId(),
            nombre: formulario.elements.namedItem("nombre").value.trim(),
            modelo: formulario.elements.namedItem("modelo").value.trim(),
            problema: formulario.elements.namedItem("problema").value.trim(),
            estado: "Recibido",
            fecha: new Date().toISOString()
        };

        if (!nuevoPresupuesto.nombre || !nuevoPresupuesto.modelo || !nuevoPresupuesto.problema) {
            alert("Completá todos los campos. No dejes espacios en blanco.");
            return;
        }

        try {
            var guardados = localStorage.getItem("tecno_presupuestos");
            var listaPresupuestos = [];

            if (guardados) {
                try {
                    var presupuestos = JSON.parse(guardados);
                    listaPresupuestos = Array.isArray(presupuestos) ? presupuestos : [];
                } catch (error) {
                    console.warn("El historial guardado no era JSON válido; se iniciará uno nuevo.", error);
                }
            }

            listaPresupuestos.push(nuevoPresupuesto);
            localStorage.setItem("tecno_presupuestos", JSON.stringify(listaPresupuestos));

            alert("¡Consulta guardada en este dispositivo! Ticket #" + nuevoPresupuesto.id.slice(-4));
            formulario.reset();
        } catch (error) {
            console.error("No se pudo guardar el presupuesto en este dispositivo:", error);
            alert("No se pudo guardar la consulta en este dispositivo. Revisá el almacenamiento del navegador e intentá nuevamente.");
        }
    });
}

// ---------- Panel de administración ----------
function initAdminPanel() {
    var panel = document.getElementById("admin-panel");
    var botonAbrir = document.getElementById("abrir-admin");
    var elementosPublicos = [
        document.getElementById("sitio-header"),
        document.getElementById("sitio-publico"),
        document.getElementById("sitio-footer")
    ].filter(Boolean);
    var login = document.getElementById("admin-login");
    var formularioLogin = document.getElementById("admin-login-form");
    var campoClave = document.getElementById("admin-password");
    var mensajeLogin = document.getElementById("admin-login-error");
    var dashboard = document.getElementById("admin-dashboard");

    if (!panel || !botonAbrir || !login || !formularioLogin || !dashboard) {
        return;
    }

    var estadosReparacion = ["Recibido", "En diagnóstico", "Esperando repuesto", "En reparación", "Listo para retirar", "Entregado"];
    var claveReparaciones = "tecno_presupuestos";
    var claveStock = "tecno_stock";
    var claveVentas = "tecno_ventas";
    var claveAdmin = "admin123";
    var posicionPrevia = 0;

    function enfocar(elemento) {
        try {
            elemento.focus({ preventScroll: true });
        } catch (error) {
            elemento.focus();
        }
    }

    function leerLista(clave) {
        try {
            var guardado = localStorage.getItem(clave);
            var datos = guardado ? JSON.parse(guardado) : [];
            return Array.isArray(datos)
                ? { datos: datos, error: "" }
                : { datos: [], error: "Los datos guardados tienen un formato no válido." };
        } catch (error) {
            console.error("No se pudieron leer los datos de " + clave + ":", error);
            return { datos: [], error: "No se pudieron leer los datos locales del navegador." };
        }
    }

    function guardarLista(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error("No se pudieron guardar los datos de " + clave + ":", error);
            return false;
        }
    }

    function mismoId(registro, id) {
        return Boolean(registro) && String(registro.id) === String(id);
    }

    function agregarCelda(fila, valor, etiqueta) {
        var celda = document.createElement("td");
        celda.textContent = valor === null || valor === undefined ? "—" : String(valor);

        if (etiqueta) {
            celda.dataset.label = etiqueta;
        }

        fila.append(celda);
        return celda;
    }

    function formatearFecha(valor) {
        if (!valor) {
            return "—";
        }

        var fecha = new Date(valor);
        return isNaN(fecha.getTime()) ? String(valor) : fecha.toLocaleString("es-AR");
    }

    function formatearImporte(valor) {
        var numero = Number(valor);
        return isFinite(numero)
            ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(numero)
            : "—";
    }

    function volverAlSitio() {
        panel.hidden = true;
        elementosPublicos.forEach(function (elemento) {
            elemento.hidden = false;
        });
        login.hidden = false;
        dashboard.hidden = true;
        formularioLogin.reset();
        mensajeLogin.textContent = "";
        // Vuelve exactamente al lugar de la página donde estaba el usuario
        window.scrollTo(0, posicionPrevia);
        enfocar(botonAbrir);
    }

    function renderizarPresupuestos() {
        var resultado = leerLista(claveReparaciones);
        var cuerpoTabla = document.getElementById("admin-tabla-presupuestos");
        var mensajeDatos = document.getElementById("admin-error-datos");
        cuerpoTabla.replaceChildren();
        mensajeDatos.textContent = resultado.error;
        document.getElementById("admin-sin-datos").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        document.getElementById("admin-tabla-contenedor").hidden = resultado.datos.length === 0;

        resultado.datos.forEach(function (presupuesto) {
            var registro = presupuesto && typeof presupuesto === "object" ? presupuesto : {};
            var fila = document.createElement("tr");
            [
                ["Ingreso", formatearFecha(registro.fecha)],
                ["Cliente", registro.nombre],
                ["Equipo", registro.modelo],
                ["Falla", registro.problema]
            ].forEach(function (par) {
                agregarCelda(fila, par[1], par[0]);
            });

            var celdaEstado = agregarCelda(fila, "", "Estado actual");
            var selectorEstado = document.createElement("select");
            selectorEstado.className = "admin-estado-select";
            selectorEstado.setAttribute("aria-label", "Estado del equipo " + (registro.modelo || "sin modelo"));
            var estadoActual = estadosReparacion.indexOf(registro.estado) !== -1 ? registro.estado : "Recibido";

            estadosReparacion.forEach(function (estado) {
                var opcion = document.createElement("option");
                opcion.value = estado;
                opcion.textContent = estado;
                opcion.selected = estado === estadoActual;
                selectorEstado.append(opcion);
            });

            selectorEstado.addEventListener("change", function () {
                var listaActualizada = leerLista(claveReparaciones).datos.map(function (equipo) {
                    return mismoId(equipo, registro.id)
                        ? Object.assign({}, equipo, { estado: selectorEstado.value, actualizado: new Date().toISOString() })
                        : equipo;
                });

                if (!guardarLista(claveReparaciones, listaActualizada)) {
                    mensajeDatos.textContent = "No se pudo guardar el nuevo estado en este navegador.";
                    return;
                }

                mensajeDatos.textContent = "Estado del equipo actualizado.";
            });

            celdaEstado.append(selectorEstado);
            agregarCelda(fila, registro.id, "Ticket");
            cuerpoTabla.append(fila);
        });
    }

    function renderizarStock() {
        var resultado = leerLista(claveStock);
        var cuerpo = document.getElementById("admin-tabla-stock");
        var contenedor = document.getElementById("admin-stock-tabla-contenedor");
        cuerpo.replaceChildren();
        document.getElementById("admin-stock-mensaje").textContent = resultado.error;
        document.getElementById("admin-stock-vacio").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        contenedor.hidden = resultado.datos.length === 0;

        resultado.datos.forEach(function (item) {
            var producto = item && typeof item === "object" ? item : {};
            var fila = document.createElement("tr");
            agregarCelda(fila, producto.nombre, "Producto");
            agregarCelda(fila, producto.categoria, "Categoría");
            agregarCelda(fila, formatearImporte(producto.precio), "Precio");

            var celdaStock = agregarCelda(fila, "", "Existencias");
            var entradaStock = document.createElement("input");
            entradaStock.className = "admin-stock-cantidad";
            entradaStock.type = "number";
            entradaStock.min = "0";
            entradaStock.step = "1";
            entradaStock.setAttribute("inputmode", "numeric");
            entradaStock.value = String(Math.max(0, Number(producto.stock) || 0));
            entradaStock.setAttribute("aria-label", "Existencias de " + (producto.nombre || "producto"));
            celdaStock.append(entradaStock);

            var celdaAccion = agregarCelda(fila, "", "Acción");
            var botonGuardar = document.createElement("button");
            botonGuardar.type = "button";
            botonGuardar.className = "admin-boton-secundario";
            botonGuardar.textContent = "Guardar";
            botonGuardar.addEventListener("click", function () {
                var cantidad = Number(entradaStock.value);
                if (entradaStock.value === "" || !Number.isInteger(cantidad) || cantidad < 0) {
                    document.getElementById("admin-stock-mensaje").textContent = "Ingresá una cantidad válida (0 o mayor).";
                    return;
                }

                var actualizados = leerLista(claveStock).datos.map(function (otro) {
                    return mismoId(otro, producto.id) ? Object.assign({}, otro, { stock: cantidad }) : otro;
                });
                document.getElementById("admin-stock-mensaje").textContent = guardarLista(claveStock, actualizados)
                    ? "Existencias actualizadas."
                    : "No se pudo guardar el stock en este navegador.";
                actualizarSelectorProductos();
                renderizarVentas();
            });
            celdaAccion.append(botonGuardar);
            cuerpo.append(fila);
        });

        actualizarSelectorProductos();
    }

    function actualizarSelectorProductos() {
        var selector = document.getElementById("venta-producto");
        var tipo = document.getElementById("venta-tipo").value;
        var productoLabel = document.querySelector('label[for="venta-producto"]');
        var cantidadInput = document.getElementById("venta-cantidad");
        var cantidadLabel = document.querySelector('label[for="venta-cantidad"]');
        var precioInput = document.getElementById("venta-precio");
        var productos = leerLista(claveStock).datos.filter(function (item) {
            return item && typeof item === "object";
        });
        var esGoogle = tipo === "google";
        var esPedido = tipo === "pedido";

        selector.replaceChildren();
        selector.disabled = esGoogle;
        selector.required = !esGoogle;
        productoLabel.hidden = esGoogle;
        selector.hidden = esGoogle;
        cantidadLabel.hidden = esGoogle;
        cantidadInput.hidden = esGoogle;
        cantidadInput.required = !esGoogle;

        if (esGoogle) {
            precioInput.value = "";
            precioInput.readOnly = false;
            return;
        }

        var opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = productos.length ? "Seleccioná un producto" : "Agregá productos al inventario primero";
        selector.append(opcionInicial);
        selector.required = productos.length > 0;

        productos.forEach(function (producto) {
            var opcion = document.createElement("option");
            opcion.value = String(producto.id);
            opcion.textContent = producto.nombre + " · stock " + Math.max(0, Number(producto.stock) || 0);
            opcion.dataset.precio = String(Number(producto.precio) || 0);
            opcion.disabled = !esPedido && Number(producto.stock) <= 0;
            selector.append(opcion);
        });

        selector.disabled = productos.length === 0;
        precioInput.readOnly = true;
        precioInput.value = "";
    }

    function renderizarVentas() {
        var resultado = leerLista(claveVentas);
        var cuerpo = document.getElementById("admin-tabla-ventas");
        cuerpo.replaceChildren();
        document.getElementById("admin-ventas-mensaje").textContent = resultado.error;
        document.getElementById("admin-ventas-vacio").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        document.getElementById("admin-ventas-tabla-contenedor").hidden = resultado.datos.length === 0;

        resultado.datos.slice().reverse().forEach(function (item) {
            var venta = item && typeof item === "object" ? item : {};
            var fila = document.createElement("tr");
            [
                ["Fecha", formatearFecha(venta.fecha)],
                ["Cliente", venta.cliente],
                ["Operación", venta.tipo],
                ["Producto / servicio", venta.producto],
                ["Cantidad", venta.cantidad],
                ["Importe", formatearImporte(venta.importe)],
                ["Estado", venta.estado]
            ].forEach(function (par) {
                agregarCelda(fila, par[1], par[0]);
            });

            var celdaAccion = agregarCelda(fila, "", "Acción");
            if (venta.estado === "Pedido pendiente" || venta.estado === "Pendiente") {
                var botonCompletar = document.createElement("button");
                botonCompletar.type = "button";
                botonCompletar.className = "admin-boton-secundario";
                botonCompletar.textContent = "Marcar realizado";
                botonCompletar.addEventListener("click", function () {
                    completarOperacion(venta);
                });
                celdaAccion.append(botonCompletar);
            }
            cuerpo.append(fila);
        });
    }

    function completarOperacion(operacion) {
        var mensaje = document.getElementById("admin-ventas-mensaje");
        var ventas = leerLista(claveVentas).datos;
        var operacionActual = ventas.find(function (item) {
            return mismoId(item, operacion.id);
        });

        if (!operacionActual || (operacionActual.estado !== "Pedido pendiente" && operacionActual.estado !== "Pendiente")) {
            renderizarVentas();
            return;
        }

        var productos = leerLista(claveStock).datos;
        var esPedidoDeAccesorio = operacionActual.tipo === "Pedido de accesorio";

        if (esPedidoDeAccesorio) {
            var producto = productos.find(function (item) {
                return mismoId(item, operacionActual.productoId);
            }) || productos.find(function (item) {
                return item && item.nombre === operacionActual.producto;
            });

            if (!producto || Number(producto.stock) < Number(operacionActual.cantidad)) {
                mensaje.textContent = "No hay stock suficiente para completar este pedido.";
                return;
            }

            var productosActualizados = productos.map(function (item) {
                return mismoId(item, producto.id)
                    ? Object.assign({}, item, { stock: Number(item.stock) - Number(operacionActual.cantidad) })
                    : item;
            });

            if (!guardarLista(claveStock, productosActualizados)) {
                mensaje.textContent = "No se pudo actualizar el stock para completar el pedido.";
                return;
            }
        }

        var ventasActualizadas = ventas.map(function (item) {
            return mismoId(item, operacionActual.id)
                ? Object.assign({}, item, { estado: "Realizada", actualizado: new Date().toISOString() })
                : item;
        });

        if (!guardarLista(claveVentas, ventasActualizadas)) {
            if (esPedidoDeAccesorio) {
                guardarLista(claveStock, productos);
            }
            mensaje.textContent = "No se pudo guardar el nuevo estado de la operación.";
            return;
        }

        mensaje.textContent = "Operación marcada como realizada.";
        renderizarVentas();
        renderizarStock();
    }

    function renderizarVistaActual(vista) {
        if (vista === "reparaciones") {
            renderizarPresupuestos();
        } else if (vista === "stock") {
            renderizarStock();
        } else if (vista === "ventas") {
            actualizarSelectorProductos();
            renderizarVentas();
        }
    }

    botonAbrir.addEventListener("click", function () {
        posicionPrevia = posicionScroll();
        elementosPublicos.forEach(function (elemento) {
            elemento.hidden = true;
        });
        panel.hidden = false;
        login.hidden = false;
        dashboard.hidden = true;
        mensajeLogin.textContent = "";
        formularioLogin.reset();
        window.scrollTo(0, 0);
        enfocar(campoClave);
        document.querySelector('[data-admin-vista="reparaciones"]').click();
    });

    document.querySelectorAll("[data-cerrar-admin]").forEach(function (boton) {
        boton.addEventListener("click", volverAlSitio);
    });

    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (campoClave.value !== claveAdmin) {
            mensajeLogin.textContent = "Contraseña incorrecta. Intentá nuevamente.";
            campoClave.select();
            return;
        }

        mensajeLogin.textContent = "";
        login.hidden = true;
        dashboard.hidden = false;
        renderizarVistaActual("reparaciones");
    });

    document.querySelectorAll("[data-admin-vista]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            document.querySelectorAll("[data-admin-vista]").forEach(function (pestana) {
                var activa = pestana === boton;
                pestana.classList.toggle("activa", activa);
                pestana.setAttribute("aria-pressed", String(activa));
            });

            document.querySelectorAll("[data-admin-seccion]").forEach(function (seccion) {
                seccion.hidden = seccion.dataset.adminSeccion !== boton.dataset.adminVista;
            });

            renderizarVistaActual(boton.dataset.adminVista);
        });
    });

    document.getElementById("actualizar-presupuestos").addEventListener("click", function () {
        var pestanaActiva = document.querySelector("[data-admin-vista].activa");
        renderizarVistaActual((pestanaActiva && pestanaActiva.dataset.adminVista) || "reparaciones");
    });

    document.getElementById("form-producto").addEventListener("submit", function (evento) {
        evento.preventDefault();
        var formulario = evento.currentTarget;
        var producto = {
            id: generarId(),
            nombre: formulario.elements.namedItem("nombre").value.trim(),
            categoria: formulario.elements.namedItem("categoria").value.trim(),
            precio: Number(formulario.elements.namedItem("precio").value),
            stock: Number(formulario.elements.namedItem("stock").value)
        };
        var precioIngresado = formulario.elements.namedItem("precio").value.trim();
        var stockIngresado = formulario.elements.namedItem("stock").value.trim();

        if (!producto.nombre || !producto.categoria || !precioIngresado || !stockIngresado || !isFinite(producto.precio) || producto.precio < 0 || !Number.isInteger(producto.stock) || producto.stock < 0) {
            document.getElementById("admin-stock-mensaje").textContent = "Revisá nombre, categoría, precio y cantidad.";
            return;
        }

        var productos = leerLista(claveStock).datos;
        productos.push(producto);
        if (!guardarLista(claveStock, productos)) {
            document.getElementById("admin-stock-mensaje").textContent = "No se pudo guardar el producto en este navegador.";
            return;
        }

        formulario.reset();
        document.getElementById("admin-stock-mensaje").textContent = "Producto agregado al inventario.";
        renderizarStock();
    });

    document.getElementById("venta-tipo").addEventListener("change", actualizarSelectorProductos);
    document.getElementById("venta-producto").addEventListener("change", function (evento) {
        var opcion = evento.currentTarget.selectedOptions[0];
        document.getElementById("venta-precio").value = (opcion && opcion.dataset.precio) || "";
    });

    document.getElementById("form-venta").addEventListener("submit", function (evento) {
        evento.preventDefault();
        var formulario = evento.currentTarget;
        var tipo = formulario.elements.namedItem("tipo").value;
        var cliente = formulario.elements.namedItem("cliente").value.trim();
        var cantidad = tipo === "google" ? 1 : Number(formulario.elements.namedItem("cantidad").value);
        var importeIngresado = formulario.elements.namedItem("precio").value.trim();
        var importe = Number(importeIngresado);
        var mensaje = document.getElementById("admin-ventas-mensaje");
        var producto;
        var nombreProducto;
        var estado;
        var productos = leerLista(claveStock).datos;

        if (!cliente || !importeIngresado || !isFinite(importe) || importe < 0 || !Number.isInteger(cantidad) || cantidad < 1) {
            mensaje.textContent = "Completá cliente, cantidad e importe con valores válidos.";
            return;
        }

        if (tipo === "google") {
            nombreProducto = "Desbloqueo de cuenta Google";
            estado = "Pendiente";
        } else {
            producto = productos.find(function (item) {
                return item && String(item.id) === formulario.elements.namedItem("producto").value;
            });
            if (!producto) {
                mensaje.textContent = "Seleccioná un producto del inventario.";
                return;
            }

            if (tipo === "venta" && Number(producto.stock) < cantidad) {
                mensaje.textContent = "Stock insuficiente. Disponibles: " + (Number(producto.stock) || 0) + ".";
                return;
            }

            nombreProducto = producto.nombre;
            estado = tipo === "venta" ? "Realizada" : "Pedido pendiente";
        }

        var operacion = {
            id: generarId(),
            fecha: new Date().toISOString(),
            cliente: cliente,
            tipo: tipo === "google" ? "Servicio adicional" : tipo === "venta" ? "Venta de accesorio" : "Pedido de accesorio",
            producto: nombreProducto,
            productoId: producto ? producto.id : null,
            cantidad: cantidad,
            importe: importe * cantidad,
            estado: estado,
            notas: formulario.elements.namedItem("notas").value.trim()
        };

        if (tipo === "venta") {
            var productosActualizados = productos.map(function (item) {
                return mismoId(item, producto.id) ? Object.assign({}, item, { stock: Number(item.stock) - cantidad }) : item;
            });
            if (!guardarLista(claveStock, productosActualizados)) {
                mensaje.textContent = "No se pudo actualizar el inventario; no se registró la venta.";
                return;
            }
        }

        var ventas = leerLista(claveVentas).datos;
        ventas.push(operacion);
        if (!guardarLista(claveVentas, ventas)) {
            if (tipo === "venta") {
                guardarLista(claveStock, productos);
            }
            mensaje.textContent = "No se pudo guardar el registro de la operación.";
            return;
        }

        formulario.reset();
        actualizarSelectorProductos();
        mensaje.textContent = "Venta o pedido registrado.";
        renderizarVentas();
        renderizarStock();
    });
}

// ---------- Tienda ----------
function seleccionarIconoProducto(producto) {
    var descripcion = ((producto.nombre || "") + " " + (producto.categoria || "")).toLocaleLowerCase("es");

    if (descripcion.indexOf("auricular") !== -1 || descripcion.indexOf("audio") !== -1) return "🎧";
    if (descripcion.indexOf("cargador") !== -1) return "🔌";
    if (descripcion.indexOf("cable") !== -1) return "🔗";
    if (descripcion.indexOf("funda") !== -1) return "📱";
    if (descripcion.indexOf("vidrio") !== -1 || descripcion.indexOf("protección") !== -1) return "🛡️";
    if (descripcion.indexOf("batería") !== -1 || descripcion.indexOf("powerbank") !== -1) return "🔋";
    return "📦";
}

// Abre WhatsApp; si el navegador bloquea la ventana nueva (pasa en navegadores internos
// de Instagram/Facebook), abre en la misma pestaña.
function abrirWhatsApp(url) {
    var ventana = null;

    try {
        ventana = window.open(url, "_blank");
    } catch (error) {
        ventana = null;
    }

    if (ventana) {
        try {
            ventana.opener = null;
        } catch (error) {
            // Sin acceso a opener: no es necesario hacer nada.
        }
    } else {
        window.location.href = url;
    }
}

function initTienda() {
    var contenedorProductos = document.getElementById("tienda-productos");
    var listaCarrito = document.getElementById("carrito-lista");
    var numeroCarrito = document.getElementById("tienda-carrito-cantidad");
    var botonPedido = document.getElementById("enviar-pedido-whatsapp");

    if (!contenedorProductos || !listaCarrito || !numeroCarrito || !botonPedido) {
        return;
    }

    var catalogoInicial = [
        { id: "demo-cargador-usbc", nombre: "Cargador USB-C", categoria: "Cargadores", icono: "🔌" },
        { id: "demo-cable-usbc", nombre: "Cable USB-C", categoria: "Cables", icono: "🔗" },
        { id: "demo-auriculares", nombre: "Auriculares", categoria: "Audio", icono: "🎧" },
        { id: "demo-vidrio-templado", nombre: "Vidrio templado", categoria: "Protección", icono: "🛡️" },
        { id: "demo-funda", nombre: "Funda para celular", categoria: "Protección", icono: "📱" },
        { id: "demo-powerbank", nombre: "Batería portátil", categoria: "Energía", icono: "🔋" }
    ];
    var inventario = [];

    try {
        var catalogoGuardado = localStorage.getItem("tecno_stock");
        var datos = catalogoGuardado ? JSON.parse(catalogoGuardado) : [];
        inventario = Array.isArray(datos)
            ? datos.filter(function (item) {
                return item && typeof item === "object";
            })
            : [];
    } catch (error) {
        console.warn("No se pudo leer el inventario; se mostrará el catálogo básico.", error);
    }

    var productos = inventario.length > 0
        ? inventario.map(function (producto) {
            return Object.assign({}, producto, {
                id: String(producto.id),
                precio: isFinite(Number(producto.precio)) && Number(producto.precio) > 0
                    ? Number(producto.precio)
                    : null,
                stock: Math.max(0, Number(producto.stock) || 0),
                icono: producto.icono || seleccionarIconoProducto(producto)
            });
        })
        : catalogoInicial.map(function (producto) {
            return Object.assign({}, producto, { precio: null, stock: null });
        });
    var productosVisibles = contenedorProductos.dataset.modo === "destacados"
        ? productos.slice(0, 3)
        : productos;

    function buscarProducto(id) {
        return productos.find(function (producto) {
            return producto.id === id;
        });
    }

    // Lee el carrito guardado y lo ajusta a lo que realmente existe y hay en stock
    function leerCarritoGuardado() {
        try {
            var guardado = JSON.parse(localStorage.getItem("tecno_carrito") || "[]");
            if (!Array.isArray(guardado)) {
                return [];
            }

            return guardado
                .filter(function (item) {
                    return item && buscarProducto(String(item.id)) && Number(item.cantidad) > 0;
                })
                .map(function (item) {
                    var producto = buscarProducto(String(item.id));
                    var cantidad = Math.floor(Number(item.cantidad));
                    if (producto.stock !== null) {
                        cantidad = Math.min(cantidad, producto.stock);
                    }
                    return { id: String(item.id), cantidad: cantidad };
                })
                .filter(function (item) {
                    return item.cantidad > 0;
                });
        } catch (error) {
            return [];
        }
    }

    var carrito = leerCarritoGuardado();
    var ultimoAgregado = null;
    var cantidadAnterior = null;

    function formatearPrecio(producto) {
        return isFinite(producto.precio) && producto.precio !== null
            ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(producto.precio)
            : "Consultar precio";
    }

    function guardarCarrito() {
        try {
            localStorage.setItem("tecno_carrito", JSON.stringify(carrito));
        } catch (error) {
            console.warn("No se pudo guardar el carrito en este dispositivo.", error);
        }
    }

    // Cambia un instante el texto del botón para confirmar la acción
    function destello(boton, texto) {
        if (!boton) {
            return;
        }

        if (!boton.dataset.textoOriginal) {
            boton.dataset.textoOriginal = boton.textContent;
        }

        boton.textContent = texto;
        boton.classList.remove("agregado");
        void boton.offsetWidth;
        boton.classList.add("agregado");

        clearTimeout(boton.temporizadorDestello);
        boton.temporizadorDestello = setTimeout(function () {
            boton.textContent = boton.dataset.textoOriginal;
            boton.classList.remove("agregado");
        }, 1100);
    }

    function agregarAlCarrito(id, boton) {
        var producto = buscarProducto(id);
        if (!producto || producto.stock === 0) {
            return;
        }

        var existente = carrito.find(function (item) {
            return item.id === id;
        });

        if (existente) {
            if (producto.stock !== null && existente.cantidad >= producto.stock) {
                destello(boton, "Máximo disponible");
                return;
            }
            existente.cantidad += 1;
        } else {
            carrito.push({ id: id, cantidad: 1 });
        }

        ultimoAgregado = id;
        guardarCarrito();
        renderizarCarrito();
        destello(boton, "✓ Agregado");
    }

    function renderizarProductos() {
        contenedorProductos.replaceChildren();

        productosVisibles.forEach(function (producto) {
            var tarjeta = document.createElement("article");
            tarjeta.className = "producto-card";

            var imagen = document.createElement("div");
            imagen.className = "producto-icono";
            imagen.setAttribute("aria-hidden", "true");
            imagen.textContent = producto.icono;

            var categoria = document.createElement("p");
            categoria.className = "producto-categoria";
            categoria.textContent = producto.categoria || "Accesorios";

            var nombre = document.createElement("h3");
            nombre.textContent = producto.nombre;

            var precio = document.createElement("p");
            precio.className = "producto-precio";
            precio.textContent = formatearPrecio(producto);

            var disponibilidad = document.createElement("p");
            disponibilidad.className = "producto-disponibilidad";
            disponibilidad.textContent = producto.stock === null
                ? "Consultar disponibilidad"
                : producto.stock > 0 ? "Disponible: " + producto.stock : "Agotado";

            var agregar = document.createElement("button");
            agregar.className = "producto-agregar";
            agregar.type = "button";
            agregar.textContent = producto.stock === 0 ? "Agotado" : "Agregar al pedido";
            agregar.setAttribute("aria-label", agregar.textContent + ": " + producto.nombre);
            agregar.disabled = producto.stock === 0;
            agregar.addEventListener("click", function () {
                agregarAlCarrito(producto.id, agregar);
            });

            tarjeta.append(imagen, categoria, nombre, precio, disponibilidad, agregar);
            contenedorProductos.append(tarjeta);
        });
    }

    function renderizarCarrito() {
        listaCarrito.replaceChildren();
        var cantidadTotal = carrito.reduce(function (total, item) {
            return total + item.cantidad;
        }, 0);
        var productosEnCarrito = carrito
            .map(function (item) {
                return { id: item.id, cantidad: item.cantidad, producto: buscarProducto(item.id) };
            })
            .filter(function (item) {
                return item.producto;
            });
        var botonVacio = document.getElementById("carrito-vacio");
        var total = document.getElementById("carrito-total");
        var subtotalConocido = productosEnCarrito.every(function (item) {
            return item.producto.precio !== null && isFinite(item.producto.precio);
        });
        var resumen = numeroCarrito.parentNode;

        numeroCarrito.textContent = String(cantidadTotal);
        if (resumen && cantidadAnterior !== null && cantidadTotal > cantidadAnterior) {
            resumen.classList.remove("bump");
            void resumen.offsetWidth;
            resumen.classList.add("bump");
        }
        cantidadAnterior = cantidadTotal;

        botonVacio.hidden = productosEnCarrito.length > 0;
        botonPedido.disabled = productosEnCarrito.length === 0;
        total.hidden = productosEnCarrito.length === 0;

        productosEnCarrito.forEach(function (item) {
            var linea = document.createElement("li");
            linea.className = "carrito-item" + (item.id === ultimoAgregado ? " nuevo" : "");

            var informacion = document.createElement("span");
            informacion.className = "carrito-item-info";
            informacion.textContent = item.producto.nombre + " · " + item.cantidad;

            var precio = document.createElement("span");
            precio.className = "carrito-item-precio";
            precio.textContent = item.producto.precio !== null && isFinite(item.producto.precio)
                ? formatearPrecio({ precio: item.producto.precio * item.cantidad })
                : "A confirmar";

            var quitar = document.createElement("button");
            quitar.className = "carrito-quitar";
            quitar.type = "button";
            quitar.textContent = "Quitar";
            quitar.setAttribute("aria-label", "Quitar " + item.producto.nombre + " del pedido");
            quitar.addEventListener("click", function () {
                quitar.disabled = true;

                var terminar = function () {
                    carrito = carrito.filter(function (producto) {
                        return producto.id !== item.id;
                    });
                    guardarCarrito();
                    renderizarCarrito();
                };

                if (prefiereMovimientoReducido()) {
                    terminar();
                    return;
                }

                linea.classList.add("saliendo");
                setTimeout(terminar, 200);
            });

            linea.append(informacion, precio, quitar);
            listaCarrito.append(linea);
        });

        ultimoAgregado = null;

        if (subtotalConocido && productosEnCarrito.length > 0) {
            var subtotal = productosEnCarrito.reduce(function (suma, item) {
                return suma + item.producto.precio * item.cantidad;
            }, 0);
            total.textContent = "Subtotal: " + formatearPrecio({ precio: subtotal });
        } else {
            total.textContent = "Precio total a confirmar por WhatsApp";
        }
    }

    botonPedido.addEventListener("click", function () {
        var lineasPedido = carrito
            .map(function (item) {
                var producto = buscarProducto(item.id);
                return producto ? "• " + producto.nombre + " x" + item.cantidad : null;
            })
            .filter(Boolean);

        if (lineasPedido.length === 0) {
            return;
        }

        var mensaje = encodeURIComponent("Hola, quiero consultar por este pedido de TECNO R.A.:\n" + lineasPedido.join("\n") + "\n¿Me confirman precio y disponibilidad?");
        abrirWhatsApp("https://wa.me/5493624542645?text=" + mensaje);
    });

    // Mantiene el carrito al día si cambia en otra pestaña o al volver con el botón "atrás"
    function sincronizarCarrito() {
        carrito = leerCarritoGuardado();
        renderizarCarrito();
    }

    window.addEventListener("storage", function (evento) {
        if (evento.key === "tecno_carrito" || evento.key === null) {
            sincronizarCarrito();
        }
    });

    window.addEventListener("pageshow", function (evento) {
        if (evento.persisted) {
            sincronizarCarrito();
        }
    });

    renderizarProductos();
    renderizarCarrito();
}

// ---------- Animaciones de aparición al hacer scroll ----------
function initAnimaciones() {
    if (prefiereMovimientoReducido() || !("IntersectionObserver" in window)) {
        return;
    }

    var objetivos = document.querySelectorAll(
        "main > section > h2, .grid-servicios > .card, .tienda-encabezado, .tienda-ver-mas, " +
        ".tienda-carrito, #form-presupuesto, .contactos-directos, .tienda-productos > .producto-card"
    );

    if (!objetivos.length) {
        return;
    }

    var raiz = document.documentElement;
    var respuestaRecibida = false;

    function mostrar(elemento) {
        elemento.classList.add("visible");

        // Al terminar la transición se limpian las clases para que vuelvan los efectos hover normales.
        setTimeout(function () {
            elemento.classList.remove("reveal");
            elemento.classList.remove("visible");
            elemento.style.transitionDelay = "";
        }, 1100);
    }

    objetivos.forEach(function (elemento) {
        var padre = elemento.parentNode;
        var posicion = padre.cantidadRevelada || 0;
        padre.cantidadRevelada = posicion + 1;
        elemento.classList.add("reveal");
        elemento.style.transitionDelay = (posicion % 3) * 90 + "ms";
    });

    var observador = new IntersectionObserver(function (entradas) {
        respuestaRecibida = true;
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                mostrar(entrada.target);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    raiz.classList.add("js-reveal");
    objetivos.forEach(function (elemento) {
        observador.observe(elemento);
    });

    // Red de seguridad: si el navegador no respondió nunca, se muestra todo sin animar.
    setTimeout(function () {
        if (!respuestaRecibida) {
            objetivos.forEach(function (elemento) {
                elemento.classList.remove("reveal");
            });
        }
    }, 2000);
}
