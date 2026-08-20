const PHONE_NUMBER = "584120000000"; // Reemplaza con tu número de WhatsApp
let products = [];
let cart = [];

// Cargar productos desde el JSON
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('productos.json');
    products = await res.json();
    renderCatalog();
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
});

// Renderizar tarjetas de productos
function renderCatalog() {
  const container = document.getElementById('catalog');
  container.innerHTML = products.map(p => `
    <div class="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between">
      <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-56 object-cover rounded-lg mb-4">
      <div>
        <span class="text-xs font-semibold text-indigo-600 tracking-wider uppercase">${p.categoria}</span>
        <h3 class="font-bold text-gray-900 text-lg">${p.nombre}</h3>
        <p class="text-gray-500 font-bold mt-1">$${p.precio.toFixed(2)}</p>
        
        <div class="mt-3 flex gap-2">
          <select id="size-${p.id}" class="border rounded p-1 text-xs bg-gray-50 flex-1">
            ${p.tallas.map(t => `<option value="${t}">Talla ${t}</option>`).join('')}
          </select>
          <select id="color-${p.id}" class="border rounded p-1 text-xs bg-gray-50 flex-1">
            ${p.colores.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <button onclick="addToCart(${p.id})" class="mt-4 w-full bg-zinc-900 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm transition">
        Añadir al Carrito
      </button>
    </div>
  `).join('');
}

// Agregar ítem al carrito
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const size = document.getElementById(`size-${productId}`).value;
  const color = document.getElementById(`color-${productId}`).value;
  
  const cartItemId = `${productId}-${size}-${color}`;
  const existing = cart.find(item => item.cartItemId === cartItemId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, size, color, quantity: 1, cartItemId });
  }

  updateCartUI();
}

// Actualizar UI del Carrito
function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  countEl.innerText = totalCount;
  totalEl.innerText = `$${totalPrice.toFixed(2)}`;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="text-gray-400 text-center py-8">El carrito está vacío</p>`;
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="flex justify-between items-center border-b pb-2">
      <div>
        <h4 class="font-bold text-sm">${item.nombre}</h4>
        <p class="text-xs text-gray-500">Talla: ${item.size} | Color: ${item.color}</p>
        <p class="text-xs font-bold mt-1">$${item.precio} x ${item.quantity}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="changeQty('${item.cartItemId}', -1)" class="px-2 py-0.5 bg-gray-200 rounded font-bold text-sm">-</button>
        <span class="text-sm">${item.quantity}</span>
        <button onclick="changeQty('${item.cartItemId}', 1)" class="px-2 py-0.5 bg-gray-200 rounded font-bold text-sm">+</button>
      </div>
    </div>
  `).join('');
}

function changeQty(cartItemId, delta) {
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
  }
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cart-modal').classList.toggle('hidden');
}

// Generar y enviar enlace formateado a WhatsApp
function sendToWhatsApp() {
  if (cart.length === 0) return alert("Tu carrito está vacío.");
  
  const name = document.getElementById('client-name').value.trim();
  const address = document.getElementById('client-address').value.trim();

  if (!name || !address) return alert("Por favor ingresa tu nombre y dirección.");

  let text = `¡Hola! Quisiera procesar el siguiente pedido:\n\n`;
  cart.forEach(item => {
    text += `• *${item.quantity}x* ${item.nombre} (Talla: ${item.size}, Color: ${item.color}) - $${(item.precio * item.quantity).toFixed(2)}\n`;
  });

  const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
  text += `\n*Total:* $${total.toFixed(2)}\n`;
  text += `*Cliente:* ${name}\n`;
  text += `*Dirección:* ${address}`;

  const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
