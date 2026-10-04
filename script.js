// ====================================================
// ESQUELETO DE FUNCIONES - JAVASCRIPT (En desarrollo)
// ====================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado correctamente para Insumos Tecnológicos.");
    
    // Llamadas a funciones principales (pendientes de completar)
    initMenuResponsive();
    initValidacionFormulario();
    initCarrusel();
    initAdminPanel();
});

// TODO: Desarrollar lógica para el menú en dispositivos móviles (hamburguesa)
function initMenuResponsive() {
    // Ejemplo de estructura vacía:
    // const menuToggle = document.querySelector(".menu-toggle");
    // menuToggle.addEventListener("click", () => { ... });
    console.log("Función initMenuResponsive pendiente de programar...");
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
function initValidacionFormulario() {
    const formulario = document.getElementById("form-presupuesto");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nuevoPresupuesto = {
            id: window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
            const guardados = localStorage.getItem("tecno_presupuestos");
            let listaPresupuestos = [];

            if (guardados) {
                try {
                    const presupuestos = JSON.parse(guardados);
                    listaPresupuestos = Array.isArray(presupuestos) ? presupuestos : [];
                } catch (error) {
                    console.warn("El historial guardado no era JSON válido; se iniciará uno nuevo.", error);
                }
            }

            listaPresupuestos.push(nuevoPresupuesto);
            localStorage.setItem("tecno_presupuestos", JSON.stringify(listaPresupuestos));

            alert(`¡Consulta guardada en este dispositivo! Ticket #${nuevoPresupuesto.id.slice(-4)}`);
            formulario.reset();
        } catch (error) {
            console.error("No se pudo guardar el presupuesto en este dispositivo:", error);
            alert("No se pudo guardar la consulta en este dispositivo. Revisá el almacenamiento del navegador e intentá nuevamente.");
        }
    });
}

function initAdminPanel() {
    const panel = document.getElementById("admin-panel");
    const botonAbrir = document.getElementById("abrir-admin");
    const elementosPublicos = [
        document.getElementById("sitio-header"),
        document.getElementById("sitio-publico"),
        document.getElementById("sitio-footer")
    ];
    const login = document.getElementById("admin-login");
    const formularioLogin = document.getElementById("admin-login-form");
    const campoClave = document.getElementById("admin-password");
    const mensajeLogin = document.getElementById("admin-login-error");
    const dashboard = document.getElementById("admin-dashboard");
    const estadosReparacion = ["Recibido", "En diagnóstico", "Esperando repuesto", "En reparación", "Listo para retirar", "Entregado"];
    const claveReparaciones = "tecno_presupuestos";
    const claveStock = "tecno_stock";
    const claveVentas = "tecno_ventas";
    const claveAdmin = "admin123";

    function leerLista(clave) {
        try {
            const guardado = localStorage.getItem(clave);
            const datos = guardado ? JSON.parse(guardado) : [];
            return Array.isArray(datos)
                ? { datos, error: "" }
                : { datos: [], error: "Los datos guardados tienen un formato no válido." };
        } catch (error) {
            console.error(`No se pudieron leer los datos de ${clave}:`, error);
            return { datos: [], error: "No se pudieron leer los datos locales del navegador." };
        }
    }

    function guardarLista(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error(`No se pudieron guardar los datos de ${clave}:`, error);
            return false;
        }
    }

    function crearId() {
        return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function agregarCelda(fila, valor, etiqueta) {
        const celda = document.createElement("td");
        celda.textContent = valor == null ? "—" : String(valor);

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

        const fecha = new Date(valor);
        return Number.isNaN(fecha.getTime()) ? String(valor) : fecha.toLocaleString("es-AR");
    }

    function formatearImporte(valor) {
        const numero = Number(valor);
        return Number.isFinite(numero)
            ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(numero)
            : "—";
    }

    function volverAlSitio() {
        panel.hidden = true;
        elementosPublicos.forEach((elemento) => {
            elemento.hidden = false;
        });
        login.hidden = false;
        dashboard.hidden = true;
        formularioLogin.reset();
        mensajeLogin.textContent = "";
        botonAbrir.focus();
    }

    function renderizarPresupuestos() {
        const resultado = leerLista(claveReparaciones);
        const cuerpoTabla = document.getElementById("admin-tabla-presupuestos");
        const mensajeDatos = document.getElementById("admin-error-datos");
        cuerpoTabla.replaceChildren();
        mensajeDatos.textContent = resultado.error;
        document.getElementById("admin-sin-datos").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        document.getElementById("admin-tabla-contenedor").hidden = resultado.datos.length === 0;

        resultado.datos.forEach((presupuesto) => {
            const registro = presupuesto && typeof presupuesto === "object" ? presupuesto : {};
            const fila = document.createElement("tr");
            [
                ["Ingreso", formatearFecha(registro.fecha)],
                ["Cliente", registro.nombre],
                ["Equipo", registro.modelo],
                ["Falla", registro.problema]
            ].forEach(([etiqueta, valor]) => agregarCelda(fila, valor, etiqueta));

            const celdaEstado = agregarCelda(fila, "", "Estado actual");
            const selectorEstado = document.createElement("select");
            selectorEstado.className = "admin-estado-select";
            selectorEstado.setAttribute("aria-label", `Estado del equipo ${registro.modelo || "sin modelo"}`);
            const estadoActual = estadosReparacion.includes(registro.estado) ? registro.estado : "Recibido";

            estadosReparacion.forEach((estado) => {
                const opcion = document.createElement("option");
                opcion.value = estado;
                opcion.textContent = estado;
                opcion.selected = estado === estadoActual;
                selectorEstado.append(opcion);
            });

            selectorEstado.addEventListener("change", () => {
                const listaActualizada = leerLista(claveReparaciones).datos.map((equipo) =>
                    String(equipo.id) === String(registro.id)
                        ? { ...equipo, estado: selectorEstado.value, actualizado: new Date().toISOString() }
                        : equipo
                );

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
        const resultado = leerLista(claveStock);
        const cuerpo = document.getElementById("admin-tabla-stock");
        const contenedor = document.getElementById("admin-stock-tabla-contenedor");
        cuerpo.replaceChildren();
        document.getElementById("admin-stock-mensaje").textContent = resultado.error;
        document.getElementById("admin-stock-vacio").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        contenedor.hidden = resultado.datos.length === 0;

        resultado.datos.forEach((producto) => {
            const fila = document.createElement("tr");
            agregarCelda(fila, producto.nombre, "Producto");
            agregarCelda(fila, producto.categoria, "Categoría");
            agregarCelda(fila, formatearImporte(producto.precio), "Precio");

            const celdaStock = agregarCelda(fila, "", "Existencias");
            const entradaStock = document.createElement("input");
            entradaStock.className = "admin-stock-cantidad";
            entradaStock.type = "number";
            entradaStock.min = "0";
            entradaStock.step = "1";
            entradaStock.value = String(Math.max(0, Number(producto.stock) || 0));
            entradaStock.setAttribute("aria-label", `Existencias de ${producto.nombre || "producto"}`);
            celdaStock.append(entradaStock);

            const celdaAccion = agregarCelda(fila, "", "Acción");
            const botonGuardar = document.createElement("button");
            botonGuardar.type = "button";
            botonGuardar.className = "admin-boton-secundario";
            botonGuardar.textContent = "Guardar";
            botonGuardar.addEventListener("click", () => {
                const cantidad = Number(entradaStock.value);
                if (!Number.isInteger(cantidad) || cantidad < 0) {
                    document.getElementById("admin-stock-mensaje").textContent = "Ingresá una cantidad válida (0 o mayor).";
                    return;
                }

                const actualizados = leerLista(claveStock).datos.map((item) =>
                    String(item.id) === String(producto.id) ? { ...item, stock: cantidad } : item
                );
                document.getElementById("admin-stock-mensaje").textContent = guardarLista(claveStock, actualizados)
                    ? "Existencias actualizadas."
                    : "No se pudo guardar el stock en este navegador.";
                renderizarVentas();
            });
            celdaAccion.append(botonGuardar);
            cuerpo.append(fila);
        });

        actualizarSelectorProductos();
    }

    function actualizarSelectorProductos() {
        const selector = document.getElementById("venta-producto");
        const tipo = document.getElementById("venta-tipo").value;
        const productoLabel = document.querySelector('label[for="venta-producto"]');
        const cantidadInput = document.getElementById("venta-cantidad");
        const cantidadLabel = document.querySelector('label[for="venta-cantidad"]');
        const precioInput = document.getElementById("venta-precio");
        const productos = leerLista(claveStock).datos;
        const esGoogle = tipo === "google";
        const esPedido = tipo === "pedido";

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

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = productos.length ? "Seleccioná un producto" : "Agregá productos al inventario primero";
        selector.append(opcionInicial);
        selector.required = productos.length > 0;

        productos.forEach((producto) => {
            const opcion = document.createElement("option");
            opcion.value = String(producto.id);
            opcion.textContent = `${producto.nombre} · stock ${Math.max(0, Number(producto.stock) || 0)}`;
            opcion.dataset.precio = String(Number(producto.precio) || 0);
            opcion.disabled = !esPedido && Number(producto.stock) <= 0;
            selector.append(opcion);
        });

        selector.disabled = productos.length === 0;
        precioInput.readOnly = true;
        precioInput.value = "";
    }

    function renderizarVentas() {
        const resultado = leerLista(claveVentas);
        const cuerpo = document.getElementById("admin-tabla-ventas");
        cuerpo.replaceChildren();
        document.getElementById("admin-ventas-mensaje").textContent = resultado.error;
        document.getElementById("admin-ventas-vacio").hidden = resultado.datos.length > 0 || Boolean(resultado.error);
        document.getElementById("admin-ventas-tabla-contenedor").hidden = resultado.datos.length === 0;

        resultado.datos.slice().reverse().forEach((venta) => {
            const fila = document.createElement("tr");
            [
                ["Fecha", formatearFecha(venta.fecha)],
                ["Cliente", venta.cliente],
                ["Operación", venta.tipo],
                ["Producto / servicio", venta.producto],
                ["Cantidad", venta.cantidad],
                ["Importe", formatearImporte(venta.importe)],
                ["Estado", venta.estado]
            ].forEach(([etiqueta, valor]) => agregarCelda(fila, valor, etiqueta));

            const celdaAccion = agregarCelda(fila, "", "Acción");
            if (venta.estado === "Pedido pendiente" || venta.estado === "Pendiente") {
                const botonCompletar = document.createElement("button");
                botonCompletar.type = "button";
                botonCompletar.className = "admin-boton-secundario";
                botonCompletar.textContent = "Marcar realizado";
                botonCompletar.addEventListener("click", () => completarOperacion(venta));
                celdaAccion.append(botonCompletar);
            }
            cuerpo.append(fila);
        });
    }

    function completarOperacion(operacion) {
        const mensaje = document.getElementById("admin-ventas-mensaje");
        const ventas = leerLista(claveVentas).datos;
        const operacionActual = ventas.find((item) => String(item.id) === String(operacion.id));

        if (!operacionActual || (operacionActual.estado !== "Pedido pendiente" && operacionActual.estado !== "Pendiente")) {
            renderizarVentas();
            return;
        }

        const productos = leerLista(claveStock).datos;
        let productosActualizados = productos;
        const esPedidoDeAccesorio = operacionActual.tipo === "Pedido de accesorio";

        if (esPedidoDeAccesorio) {
            const producto = productos.find((item) => String(item.id) === String(operacionActual.productoId))
                || productos.find((item) => item.nombre === operacionActual.producto);
            if (!producto || Number(producto.stock) < Number(operacionActual.cantidad)) {
                mensaje.textContent = "No hay stock suficiente para completar este pedido.";
                return;
            }

            productosActualizados = productos.map((item) =>
                String(item.id) === String(producto.id) ? { ...item, stock: Number(item.stock) - Number(operacionActual.cantidad) } : item
            );

            if (!guardarLista(claveStock, productosActualizados)) {
                mensaje.textContent = "No se pudo actualizar el stock para completar el pedido.";
                return;
            }
        }

        const ventasActualizadas = ventas.map((item) =>
            String(item.id) === String(operacionActual.id)
                ? { ...item, estado: "Realizada", actualizado: new Date().toISOString() }
                : item
        );

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

    botonAbrir.addEventListener("click", () => {
        elementosPublicos.forEach((elemento) => {
            elemento.hidden = true;
        });
        panel.hidden = false;
        login.hidden = false;
        dashboard.hidden = true;
        mensajeLogin.textContent = "";
        formularioLogin.reset();
        campoClave.focus();
        document.querySelector('[data-admin-vista="reparaciones"]').click();
    });

    document.querySelectorAll("[data-cerrar-admin]").forEach((boton) => {
        boton.addEventListener("click", volverAlSitio);
    });

    formularioLogin.addEventListener("submit", (evento) => {
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

    document.querySelectorAll("[data-admin-vista]").forEach((boton) => {
        boton.addEventListener("click", () => {
            document.querySelectorAll("[data-admin-vista]").forEach((pestana) => {
                const activa = pestana === boton;
                pestana.classList.toggle("activa", activa);
                pestana.setAttribute("aria-pressed", String(activa));
            });

            document.querySelectorAll("[data-admin-seccion]").forEach((seccion) => {
                seccion.hidden = seccion.dataset.adminSeccion !== boton.dataset.adminVista;
            });

            renderizarVistaActual(boton.dataset.adminVista);
        });
    });

    document.getElementById("actualizar-presupuestos").addEventListener("click", () => {
        const pestañaActiva = document.querySelector("[data-admin-vista].activa");
        renderizarVistaActual(pestañaActiva?.dataset.adminVista || "reparaciones");
    });

    document.getElementById("form-producto").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const producto = {
            id: crearId(),
            nombre: formulario.elements.namedItem("nombre").value.trim(),
            categoria: formulario.elements.namedItem("categoria").value.trim(),
            precio: Number(formulario.elements.namedItem("precio").value),
            stock: Number(formulario.elements.namedItem("stock").value)
        };
        const precioIngresado = formulario.elements.namedItem("precio").value.trim();
        const stockIngresado = formulario.elements.namedItem("stock").value.trim();

        if (!producto.nombre || !producto.categoria || !precioIngresado || !stockIngresado || !Number.isFinite(producto.precio) || producto.precio < 0 || !Number.isInteger(producto.stock) || producto.stock < 0) {
            document.getElementById("admin-stock-mensaje").textContent = "Revisá nombre, categoría, precio y cantidad.";
            return;
        }

        const productos = leerLista(claveStock).datos;
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
    document.getElementById("venta-producto").addEventListener("change", (evento) => {
        const opcion = evento.currentTarget.selectedOptions[0];
        document.getElementById("venta-precio").value = opcion?.dataset.precio || "";
    });

    document.getElementById("form-venta").addEventListener("submit", (evento) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const tipo = formulario.elements.namedItem("tipo").value;
        const cliente = formulario.elements.namedItem("cliente").value.trim();
        const cantidad = tipo === "google" ? 1 : Number(formulario.elements.namedItem("cantidad").value);
        const importeIngresado = formulario.elements.namedItem("precio").value.trim();
        const importe = Number(importeIngresado);
        const mensaje = document.getElementById("admin-ventas-mensaje");
        let producto;
        let nombreProducto;
        let estado;
        const productos = leerLista(claveStock).datos;

        if (!cliente || !importeIngresado || !Number.isFinite(importe) || importe < 0 || !Number.isInteger(cantidad) || cantidad < 1) {
            mensaje.textContent = "Completá cliente, cantidad e importe con valores válidos.";
            return;
        }

        if (tipo === "google") {
            nombreProducto = "Desbloqueo de cuenta Google";
            estado = "Pendiente";
        } else {
            producto = productos.find((item) => String(item.id) === formulario.elements.namedItem("producto").value);
            if (!producto) {
                mensaje.textContent = "Seleccioná un producto del inventario.";
                return;
            }

            if (tipo === "venta" && Number(producto.stock) < cantidad) {
                mensaje.textContent = `Stock insuficiente. Disponibles: ${Number(producto.stock) || 0}.`;
                return;
            }

            nombreProducto = producto.nombre;
            estado = tipo === "venta" ? "Realizada" : "Pedido pendiente";
        }

        const operacion = {
            id: crearId(),
            fecha: new Date().toISOString(),
            cliente,
            tipo: tipo === "google" ? "Servicio adicional" : tipo === "venta" ? "Venta de accesorio" : "Pedido de accesorio",
            producto: nombreProducto,
            productoId: producto?.id ?? null,
            cantidad,
            importe: importe * cantidad,
            estado,
            notas: formulario.elements.namedItem("notas").value.trim()
        };

        if (tipo === "venta") {
            const productosActualizados = productos.map((item) =>
                String(item.id) === String(producto.id) ? { ...item, stock: Number(item.stock) - cantidad } : item
            );
            if (!guardarLista(claveStock, productosActualizados)) {
                mensaje.textContent = "No se pudo actualizar el inventario; no se registró la venta.";
                return;
            }
        }

        const ventas = leerLista(claveVentas).datos;
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