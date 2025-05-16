import './style.css'
import data from '../public/data.json'
import { DatabaseService, type ProductCart} from './database.service.ts'



console.log(data)
 async function init() {
  const dbservice = new DatabaseService()
  await dbservice.initDatabase()
  console.log('Database Sucessfull')
  await displayProducts()

  async function renderProducts(products: ProductCart[], card: HTMLDivElement) {

    card.innerHTML = products.map((product: ProductCart) => `
        <div class="products-card" id="product-${product.id}">
            <div class="products-content">
                <img src="${product.image.desktop}" alt="${product.name}" class="product-thumbnail" />
                <button onclick ="addItems(${product.id})"> 
                <img src="../public/assets/images/icon-add-to-cart.svg" alt="">
                add to cart
                </button>
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <p>Price: $${product.price.toFixed(2)}</p>     
            </div>
        </div>
    `).join('');
}


async function addItems() {
  


}

async function displayProducts() {
    const card = document.querySelector<HTMLDivElement>('.card')!; 
    card.innerHTML = '<p>Loading products...</p>'; 

    try {
        const response = data
        console.log(response)

        
        const products = await response; 
         

        const typedProducts: ProductCart[] = products as ProductCart[];

        // Render products
        renderProducts(typedProducts, card);
    } catch (error) {
        console.log(error);
        card.innerHTML = '<p>Error loading products. Please try again later.</p>'; // Show error message
    }
}

async function addCart():Promise<void> {
  const card = document.querySelector<HTMLDivElement>('.cart-content')!; 



  if (card && card.innerHTML.trim() === '') {
    card.innerHTML = `
      <div class="emptyclass">
        <img src="../public/assets/images/illustration-empty-cart.svg" alt="">
        <p> your added items will appear here</p>
      </div>
    `;
  } else if (card) {
    card.innerHTML = `
      <div class ="">
        <div class="cart-section">
        </div>
        <h2> Total Order: </h2>
        <button> Confirm Order </button>
      </div>
    `;
  }
}

addCart()
addItems()
displayProducts();

 }
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class = "container" >
      
    <div class="card">
    </div>

    <div class ="cart">
    <h1> Your Cart (0)</h1>
        <div class ="cart-content">
        </div>
    </div>

  </div>
`


init().catch((error)=>{
  console.error("Error initializing app:", error);
})

declare global {
  interface Window{
    deleteproducts: (id:number) => Promise<void>;
    cancelEdit(id: number): void;
    saveEdit( id: number): void;
  }
}