//Shopify Module
var shopifyAPI = require('shopify-node-api');
 
 
var shopify = new shopifyAPI({
  shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
  shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
  access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
});


//Getting order sales data
shopify.get('/admin/orders.json', (err, data, headers) => {
  var orderLength = Object.keys(data.orders).length;  

  //1. Getting Created Date
    for(let i = 0; i < orderLength; i++){
      let createdDate = data.orders[i].created_at;
      console.log("Date: " + createdDate);
    }


  //2. Fulfillment's status
    for(let i = 0; i < orderLength; i++){

      let quantity = Object.keys(data.orders[i].line_items).length;
        
        // let check = 0;
        // let fulfilledCheck = data.orders[i].fulfillments[check].status;
        // console.log(fulfilledCheck);
        
        // if(fulfilledCheck == 1){
        //   let f = 0;
        //   let fulfillmentStatus = data.orders[i].fulfillments[f].status;
        // console.log(fulfillmentStatus);
        // }
        // else{
        //   console.log("error");
        // }
        
        // // if(fulfillmentStatus == 'sucess' && fulfillmentStatus == 'partial'){
        // //     console.log(fulfillmentStatus);
        // // }
      
        // Quantity value
          let j = 0;
          if(j < quantity){
             console.log("quantity: " + quantity);
          }
          else{
             console.log("quantity: " + quantity);
          }

          //Revenue Value
          let n = 0;
          let error = 'error';
          if(n < quantity){
            let revenue = data.orders[i].line_items[n].price * data.orders[i].line_items[n].quantity;
            console.log("revenue: " + revenue);
            
          }
          else{
            console.log("revenue: " + error);
          }

      }
  });