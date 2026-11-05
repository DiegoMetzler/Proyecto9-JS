// Simulador de Productos - Pinturest

// CLASE Producto
class Producto {
    constructor(id, nombre, precio, stock, categoria) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.categoria = categoria;
    }
}

// PRODUCTOS INICIALES
const productosIniciales = [
    new Producto(1, "Pintura Negra", 6000, 50, "Pinturas"),
    new Producto(2, "Pintura Blanca", 4500, 30, "Pinturas"),
    new Producto(3, "Pintura Universal", 5500, 20, "Pinturas"),
    new Producto(4, "Pincel Fino", 1500, 100, "Pinceles"),
    new Producto(5, "Pincel Ancho", 1800, 80, "Pinceles"),
    new Producto(6, "Rodillo Estándar", 3000, 25, "Rodillos"),
    new Producto(7, "Rodillo Profesional", 4000, 10, "Rodillos"),
    new Producto(8, "Sellador", 7000, 0, "Otros"),
];

// ESTADO: arranca vacio, se llena cuando la promesa se resuelve
let catalogo = [];

// SELECCIÓN DE ELEMENTOS DEL DOM
const contenedor = document.querySelector("#contenedor-productos");
const inputNombre = document.querySelector("#inputNombre");
const inputPrecio = document.querySelector("#inputPrecio");
const inputStock = document.querySelector("#inputStock");
const inputCategoria = document.querySelector("#inputCategoria");
const btnAgregar = document.querySelector("#btnAgregar");
const mensaje = document.querySelector("#mensaje");
const inputBuscar = document.querySelector("#inputBuscar");
const aviso = document.querySelector("#aviso");
const cargando = document.querySelector("#cargando");

// LOCALSTORAGE
function guardarEnStorage() {
    localStorage.setItem("catalogo", JSON.stringify(catalogo));
}

// PROMESA - simula la carga de productos desde un servidor
function obtenerProductos() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const guardados = JSON.parse(localStorage.getItem("catalogo")) ?? productosIniciales;

            // Simula un fallo ocasional del servidor (20% de las veces)
            const falla = Math.random() < 0.2;

            falla
                ? reject(new Error("El servidor no respondió"))
                : resolve(guardados);
        }, 2000);
    });
}

// FUNCIÓN DE RENDERIZADO
function renderizarProductos(lista) {
    contenedor.innerHTML = lista.length === 0
        ? "<p class='sin-resultados'>No se encontraron productos.</p>"
        : lista.map(producto => {
            // DESTRUCTURING
            const { id, nombre, precio, stock, categoria } = producto;
            return `
                <div class="producto-card" id="producto-${id}">
                    <span class="categoria">${categoria}</span>
                    <h3>${nombre}</h3>
                    <p class="precio">$${precio.toLocaleString()}</p>
                    <p>Stock: ${stock > 0 ? `${stock} unidades` : "Sin stock"}</p>
                    <button onclick="eliminarProducto(${id})">🗑 Eliminar</button>
                </div>
            `;
        }).join("");
}

// FUNCIÓN PARA MOSTRAR MENSAJE
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo;
    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "";
    }, 3000);
}

// CARGA DE PRODUCTOS con async/await + try/catch/finally
async function cargarCatalogo() {
    cargando.classList.remove("oculto");

    try {
        catalogo = await obtenerProductos();
        renderizarProductos(catalogo);
        mostrarMensaje(`✅ ${catalogo.length} productos cargados.`, "exito");
    } catch (error) {
        contenedor.innerHTML = "";
        mostrarMensaje(`⚠️ No se pudieron cargar los productos: ${error.message}. Recargá la página para intentar de nuevo.`, "error");
    } finally {
        // Se ejecuta SIEMPRE, haya salido bien o mal
        cargando.classList.add("oculto");
    }
}

// FUNCION PARA ELIMINAR PRODUCTO
function eliminarProducto(id) {
    catalogo = catalogo.filter(p => p.id !== id);
    guardarEnStorage();
    renderizarProductos(catalogo);
    mostrarMensaje("✅ Producto eliminado correctamente.", "exito");
}

// EVENTO CLICK - Agregar producto
btnAgregar.addEventListener("click", () => {
    const nombre = inputNombre.value.trim();
    const precio = Number(inputPrecio.value);
    const stock = Number(inputStock.value);
    const categoria = inputCategoria.value;

    if (!nombre || !precio || !stock || !categoria) {
        mostrarMensaje("❌ Completá todos los campos.", "error");
        return;
    }

    const nuevoId = catalogo.length > 0 ? catalogo[catalogo.length - 1].id + 1 : 1;
    catalogo.push(new Producto(nuevoId, nombre, precio, stock, categoria));

    guardarEnStorage();
    renderizarProductos(catalogo);
    mostrarMensaje(`✅ "${nombre}" agregado al catálogo.`, "exito");

    inputNombre.value = "";
    inputPrecio.value = "";
    inputStock.value = "";
    inputCategoria.value = "";
});

// EVENTO TECLADO - Filtrar productos
inputBuscar.addEventListener("keyup", () => {
    const busqueda = inputBuscar.value.toLowerCase();
    const filtrados = catalogo.filter(p => p.nombre.toLowerCase().includes(busqueda));
    renderizarProductos(filtrados);
});

// TEMPORIZADOR - aviso unos segundos despues de entrar
setTimeout(() => {
    aviso.textContent = "🔔 Envío gratis en compras mayores a $20.000";
    aviso.classList.remove("oculto");

    // Se oculta solo a los 6 segundos
    setTimeout(() => aviso.classList.add("oculto"), 6000);
}, 4000);

// INICIO
cargarCatalogo();