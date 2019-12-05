//Shopify Module
var shopifyAPI = require('shopify-node-api');
 
 
var shopify = new shopifyAPI({
  shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
  shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
  access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
});

// Inventory Api
shopify.get('/admin/collects.json', (err, data, header) => {
    var collection = Object.keys(data.collects[0]).length;
      for(var i = 0; i < collection; i++){
          console.log("Collect_id: " + data.collects[i].product_id);
      }
  });