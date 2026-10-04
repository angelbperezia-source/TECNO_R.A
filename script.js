// ====================================================
// ESQUELETO DE FUNCIONES - JAVASCRIPT (En desarrollo)
// ====================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado correctamente para Insumos Tecnológicos.");
    
    // Llamadas a funciones principales (pendientes de completar)
    initMenuResponsive();
    initValidacionFormulario();
    initAdminPanel();
    initTienda();
});

// TODO: Desarrollar lógica para el menú en dispositivos móviles (hamburguesa)
function initMenuResponsive() {
    // Ejemplo de estructura vacía:
    // const menuToggle = document.querySelector(".menu-toggle");
    // menuToggle.addEventListener("click", () => { ... });
    console.log("Función initMenuResponsive pendiente de programar...");
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

    if (!panel || !botonAbrir || !login || !formularioLogin || !dashboard) {
        return;
    }

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

function seleccionarIconoProducto(producto) {
    const descripcion = `${producto.nombre || ""} ${producto.categoria || ""}`.toLocaleLowerCase("es");

    if (descripcion.includes("auricular") || descripcion.includes("audio")) return "🎧";
    if (descripcion.includes("cargador")) return "🔌";
    if (descripcion.includes("cable")) return "🔗";
    if (descripcion.includes("funda")) return "📱";
    if (descripcion.includes("vidrio") || descripcion.includes("protección")) return "🛡️";
    if (descripcion.includes("batería") || descripcion.includes("powerbank")) return "🔋";
    return "📦";
}

function initTienda() {
    const contenedorProductos = document.getElementById("tienda-productos");
    const listaCarrito = document.getElementById("carrito-lista");
    const numeroCarrito = document.getElementById("tienda-carrito-cantidad");
    const botonPedido = document.getElementById("enviar-pedido-whatsapp");

    if (!contenedorProductos || !listaCarrito || !numeroCarrito || !botonPedido) {
        return;
    }

    const catalogoInicial = [
        { id: "demo-cargador-usbc", nombre: "Cargador USB-C", categoria: "Cargadores", icono: "🔌" },
        { id: "demo-cable-usbc", nombre: "Cable USB-C", categoria: "Cables", icono: "🔗" },
        { id: "demo-auriculares", nombre: "Auriculares", categoria: "Audio", icono: "🎧" },
        { id: "demo-vidrio-templado", nombre: "Vidrio templado", categoria: "Protección", icono: "🛡️" },
        { id: "demo-funda", nombre: "Funda para celular", categoria: "Protección", icono: "📱" },
        { id: "demo-powerbank", nombre: "Batería portátil", categoria: "Energía", icono: "🔋" }
    ];
    let catalogoGuardado = null;
    let inventario = [];
    let errorLecturaCatalogo = false;

    try {
        catalogoGuardado = localStorage.getItem("tecno_stock");
        const datos = catalogoGuardado ? JSON.parse(catalogoGuardado) : [];
        inventario = Array.isArray(datos) ? datos : [];
    } catch (error) {
        errorLecturaCatalogo = true;
        console.warn("No se pudo leer el inventario; se mostrará el catálogo básico.", error);
    }

    const productos = inventario.length > 0
        ? inventario.map((producto) => ({
            ...producto,
            id: String(producto.id),
            precio: Number.isFinite(Number(producto.precio)) && Number(producto.precio) > 0
                ? Number(producto.precio)
                : null,
            stock: Math.max(0, Number(producto.stock) || 0),
            icono: producto.icono || seleccionarIconoProducto(producto)
        }))
        : catalogoInicial.map((producto) => ({ ...producto, precio: null, stock: null }));
    const productosVisibles = contenedorProductos.dataset.modo === "destacados"
        ? productos.slice(0, 3)
        : productos;

    let carrito = [];
    if (!errorLecturaCatalogo) {
        try {
            const guardado = JSON.parse(localStorage.getItem("tecno_carrito") || "[]");
            carrito = Array.isArray(guardado)
                ? guardado.filter((item) => productos.some((producto) => producto.id === String(item.id)) && Number(item.cantidad) > 0)
                    .map((item) => ({ id: String(item.id), cantidad: Math.floor(Number(item.cantidad)) }))
                : [];
        } catch {
            carrito = [];
        }
    }

    function formatearPrecio(producto) {
        return Number.isFinite(producto.precio)
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

    function agregarAlCarrito(id) {
        const producto = productos.find((item) => item.id === id);
        if (!producto || producto.stock === 0) {
            return;
        }

        const existente = carrito.find((item) => item.id === id);
        if (existente) {
            if (producto.stock !== null && existente.cantidad >= producto.stock) {
                return;
            }
            existente.cantidad += 1;
        } else {
            carrito.push({ id, cantidad: 1 });
        }

        guardarCarrito();
        renderizarCarrito();
    }

    function renderizarProductos() {
        contenedorProductos.replaceChildren();

        productosVisibles.forEach((producto) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "producto-card";

            const imagen = document.createElement("div");
            imagen.className = "producto-icono";
            imagen.setAttribute("aria-hidden", "true");
            imagen.textContent = producto.icono;

            const categoria = document.createElement("p");
            categoria.className = "producto-categoria";
            categoria.textContent = producto.categoria || "Accesorios";

            const nombre = document.createElement("h3");
            nombre.textContent = producto.nombre;

            const precio = document.createElement("p");
            precio.className = "producto-precio";
            precio.textContent = formatearPrecio(producto);

            const disponibilidad = document.createElement("p");
            disponibilidad.className = "producto-disponibilidad";
            disponibilidad.textContent = producto.stock === null
                ? "Consultar disponibilidad"
                : producto.stock > 0 ? `Disponible: ${producto.stock}` : "Agotado";

            const agregar = document.createElement("button");
            agregar.className = "producto-agregar";
            agregar.type = "button";
            agregar.textContent = producto.stock === 0 ? "Agotado" : "Agregar al pedido";
            agregar.setAttribute("aria-label", `${agregar.textContent}: ${producto.nombre}`);
            agregar.disabled = producto.stock === 0;
            agregar.addEventListener("click", () => agregarAlCarrito(producto.id));

            tarjeta.append(imagen, categoria, nombre, precio, disponibilidad, agregar);
            contenedorProductos.append(tarjeta);
        });
    }

    function renderizarCarrito() {
        listaCarrito.replaceChildren();
        const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
        const productosEnCarrito = carrito
            .map((item) => ({ ...item, producto: productos.find((producto) => producto.id === item.id) }))
            .filter((item) => item.producto);
        const botonVacio = document.getElementById("carrito-vacio");
        const total = document.getElementById("carrito-total");
        const subtotalConocido = productosEnCarrito.every((item) => Number.isFinite(item.producto.precio));

        numeroCarrito.textContent = String(cantidadTotal);
        botonVacio.hidden = productosEnCarrito.length > 0;
        botonPedido.disabled = productosEnCarrito.length === 0;
        total.hidden = productosEnCarrito.length === 0;

        productosEnCarrito.forEach((item) => {
            const linea = document.createElement("li");
            linea.className = "carrito-item";

            const informacion = document.createElement("span");
            informacion.className = "carrito-item-info";
            informacion.textContent = `${item.producto.nombre} · ${item.cantidad}`;

            const precio = document.createElement("span");
            precio.className = "carrito-item-precio";
            precio.textContent = Number.isFinite(item.producto.precio)
                ? formatearPrecio({ precio: item.producto.precio * item.cantidad })
                : "A confirmar";

            const quitar = document.createElement("button");
            quitar.className = "carrito-quitar";
            quitar.type = "button";
            quitar.textContent = "Quitar";
            quitar.setAttribute("aria-label", `Quitar ${item.producto.nombre} del pedido`);
            quitar.addEventListener("click", () => {
                carrito = carrito.filter((producto) => producto.id !== item.id);
                guardarCarrito();
                renderizarCarrito();
            });

            linea.append(informacion, precio, quitar);
            listaCarrito.append(linea);
        });

        if (subtotalConocido && productosEnCarrito.length > 0) {
            const subtotal = productosEnCarrito.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
            total.textContent = `Subtotal: ${formatearPrecio({ precio: subtotal })}`;
        } else {
            total.textContent = "Precio total a confirmar por WhatsApp";
        }
    }

    botonPedido.addEventListener("click", () => {
        const lineasPedido = carrito
            .map((item) => {
                const producto = productos.find((elemento) => elemento.id === item.id);
                return producto ? `• ${producto.nombre} x${item.cantidad}` : null;
            })
            .filter(Boolean);

        if (lineasPedido.length === 0) {
            return;
        }

        const mensaje = encodeURIComponent(`Hola, quiero consultar por este pedido de TECNO R.A.:\n${lineasPedido.join("\n")}\n¿Me confirman precio y disponibilidad?`);
        window.open(`https://wa.me/5493624542645?text=${mensaje}`, "_blank", "noopener,noreferrer");
    });

    renderizarProductos();
    renderizarCarrito();
}