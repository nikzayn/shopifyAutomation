//Shopify Module
var shopifyAPI = require('shopify-node-api');
 
 
var shopify = new shopifyAPI({
  shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
  shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
  access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
});



//Product Api
shopify.get('/admin/products.json', (err, data, headers) => {
  let productLength = Object.keys(data.products).length;

  // 1. Getting sku
  for(let i = 0; i < productLength; i++){
    let variantLength = Object.keys(data.products[i].variants).length;
    let j = 0;
    
    while(j < variantLength){
      if(variantLength == 1){
        let sku1 = data.products[i].variants[j].sku;
        console.log(sku1);
      }
      else if(variantLength == 2){
        let sku2 = data.products[i].variants[j].sku;
        console.log(sku2);
      }
      else if(variantLength == 3){
        let sku3 = data.products[i].variants[j].sku;
        console.log(sku3);
      }
      else{
        let sku4 = data.products[i].variants[j].sku;
        console.log(sku4);
      }
      j++;
    }
  }

  // 2. Getting Product_id
  for(let i = 0; i < productLength; i++){
      let product_id = data.products[i].id;
      console.log(product_id);  
    }


  // 3. Getting Image src
  for(let i = 0; i < productLength; i++){
    let image = data.products[i].image.src;
    console.log(image);
  }  


  // 4. Getting title
  for(let i = 0; i < productLength; i++){
    let title = data.products[i].title;
    console.log(title);
  }

});



//