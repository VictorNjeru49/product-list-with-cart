import './style.css';
import data from '../public/data.json';
import { DatabaseService, type ProductCart } from './database.service.ts';

const cart: Array<ProductCart & { quantity: number }> = [];
const dbService = new DatabaseService(); // moved out for shared use


async function init() {
  await dbService.initDatabase();
  await loadCartFromIndexedDB();
  await displayProducts();
  await addCart();


async function renderProducts(products: ProductCart[], card: HTMLDivElement) {
  card.innerHTML = products.map((product) => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return `
      <div class="product-card">
        <img src="${product.image.desktop}" alt="${product.name}" class="product-image" />
        <p class="category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="price">Price: $${product.price.toFixed(2)}</p>
        ${
          quantity > 0
            ? `
              <div class="quantity-controls">
                <button onclick="updateQuantity(${product.id}, -1) ">
                <img src="../public/assets/images/icon-decrement-quantity.svg" alt="">
                </button>
                <span>${quantity}</span>
                <button onclick="updateQuantity(${product.id}, 1)">
                <img src="../public/assets/images/icon-increment-quantity.svg" alt="">
                </button>
              </div>
            `
            : `<button onclick="addToCart(${product.id})" class="add-cart-btn">Add to Cart</button>`
        }
      </div>
    `;
  }).join('');
}

async function loadCartFromIndexedDB(): Promise<void> {
  const storedCart = await dbService.loadProducts();
  cart.length = 0;
  cart.push(...storedCart.map(item => ({ ...item, quantity: (item as any).quantity ?? 1 })));
  await updateCartDisplay();
}

async function saveCartToIndexedDB(): Promise<void> {
  await dbService.clearStore();
  await dbService.storeProducts(cart);
}

async function updateCartDisplay(): Promise<void> {
  const card = document.querySelector<HTMLDivElement>('.cart-content')!;
  const cartCount = document.getElementById('cart-count')!;
  const orderTotal = document.getElementById('order-total')!;
  let total = 0;

  card.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `

      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Quantity: ${item.quantity}</p>
        <p>Price: $${itemTotal.toFixed(2)}</p>
        <button onclick="removeFromCart(${item.id})">
        <img src="../public/assets/images/icon-remove-item.svg" alt="">
        </button>
      </div>



    `;
  }).join('');

  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0).toString();
  orderTotal.textContent = `Order Total: $${total.toFixed(2)}`;
}

window.addToCart = async (id: number) => {
  const products: ProductCart[] = data as ProductCart[];
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existingProduct = cart.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  await renderProducts(data as ProductCart[], document.querySelector<HTMLDivElement>('.card')!);
  await updateCartDisplay();
  await saveCartToIndexedDB();
};

window.updateQuantity = async (id: number, delta: number) => {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    const index = cart.indexOf(item);
    cart.splice(index, 1);
  }

  await renderProducts(data as ProductCart[], document.querySelector<HTMLDivElement>('.card')!);
  await updateCartDisplay();
  await saveCartToIndexedDB();
};

window.removeFromCart = async (id: number) => {
  const index = cart.findIndex(p => p.id === id);
  if (index > -1) cart.splice(index, 1);

  await renderProducts(data as ProductCart[], document.querySelector<HTMLDivElement>('.card')!);
  await updateCartDisplay();
  await saveCartToIndexedDB();
};

async function displayProducts() {
  const card = document.querySelector<HTMLDivElement>('.card')!;
  card.innerHTML = '<p>Loading products...</p>';

  try {
    const typedProducts: ProductCart[] = data as ProductCart[];
    await renderProducts(typedProducts, card);
  } catch (error) {
    console.log(error);
    card.innerHTML = '<p>Error loading products. Please try again later.</p>';
  }
}

async function addCart(): Promise<void> {
  const card = document.querySelector<HTMLDivElement>('.cart-content')!;
  if (card && card.innerHTML.trim() === '') {
    card.innerHTML = `
      <div class="emptyclass">
        <img src="../public/assets/images/illustration-empty-cart.svg" alt="">
        <p>Your added items will appear here</p>
      </div>
    `;
  }
  else if(card){
    await updateCartDisplay()
    
  }
}

}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

    <div class="self-container">
   <h1>Desserts</h1>
   </div>

   <div class="container">
    <div class="card"></div>
    <div class="cart">
      <h1>Your Cart (<span id="cart-count">0</span>)</h1>
      <div class="cart-content">
      
      </div>
      <div id="order-total">Order Total: $0.00</div>
          
    </div>
  </div>
`;

declare global {
  interface Window {
    addToCart: (id: number) => Promise<void>;
    updateQuantity: (id: number, delta: number) => Promise<void>;
    removeFromCart: (id: number) => Promise<void>;
  }
}

init().catch((error) => {
  console.error('Error initializing app:', error);
});
