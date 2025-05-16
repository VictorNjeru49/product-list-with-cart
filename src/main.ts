import './style.css'
import { DatabaseService, type ProductCart } from './database.service.ts'

 async function init() {
  const dbservice = new DatabaseService()
  await dbservice.initDatabase()
  console.log('Database Sucessfull')
  await displayProducts()

  async function displayProducts() {
    //  await fetchandstore();

    const product = await dbservice.getAllProduct();
     console.log("Products:", product);

     const cardContainer = document.createElement('div')
    const productCardPromises = product.map(product =>
      createProductcard(product));

    const productCards = await Promise.all(productCardPromises);

    productCards.forEach(card => 
      cardContainer.appendChild(card));

    document.body.appendChild(cardContainer)
  }

  async function fetchandstore(): Promise<void> {
    try {
      // Use the correct path for data.json depending on your build setup
      const res = await fetch('./data.json');
      if (!res.ok) {
        throw new Error(`Network response was not ok: ${res.statusText}`);
      }

      // Check if the response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Fetched file is not JSON');
      }

      const data: ProductCart[] = await res.json();
      await dbservice.storeProducts(data);
    } catch (error) {
      console.error(`Failed to fetch: ${error}`);
    }
  }

  async function createProductcard(product: ProductCart): Promise<HTMLElement> {
    const card = document.createElement('div')
    card.className ='produt-card';
    card.innerHTML = `
     <img src="${product.image[0].thumbnail}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>Category: ${product.category}</p>
            <p>Price: $${product.price}</p>
    `
    return card
    
  }

  displayProducts()
 }
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>

    <div class="card">
    </div>


  </div>
`


init().catch((error)=>{
  console.error("Error initializing app:", error);
})

declare global {
  interface Window{
    deleteMovie: (id:number) => Promise<void>;
    cancelEdit(id: number): void;
    saveEdit( id: number): void;
  }
}