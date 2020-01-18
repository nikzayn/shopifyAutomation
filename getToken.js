const express = require('express');
const app = express();

const shopifyAPI = require('shopify-node-api');
var mysql = require('mysql');
const axios = require('axios');
const _ = require('lodash');



//DB Connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nikhil123',
  database: 'zorder',
});


var shopify = new shopifyAPI({
  shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
  shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
  access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
});


//Zorder API
shopify.get('/admin/products.json', (err, data, headers) => {
  //1 .Getting color and size from shopify

  var products = data.products;

  const colors = product => {
    const variants = _.get(product, 'variants', []);
    const values = _.map(variants, vairant => {
      return { sku: _.get(vairant, 'sku', 'wrong sku!'), color: _.get(vairant, 'option1', 'wrong color code!'), size: _.get(vairant, 'option2', 'wrong size code!') }
    });
    return values;
  }


  const orderWithValues = _.chain(products)
    .map(colors)
    .flattenDeep()
    .value()


  // console.log(JSON.stringify(orderWithValues[3].sku));
  // let val1 = JSON.stringify(orderWithValues[38].sku)
  // console.log(val1);

  const urlToken = 'http://zorder.cloudapp.net/AppFabric/getToken';
  axios.post(urlToken, {
    "username": "Pawan@mbindia.net",
    "password": "admin"
  })
    .then((response) => {
      let data = response.data.data;

      const values = values => {
        return {
          Token: _.get(values, 'Token', []),
          ProductKey: _.get(values, 'ProductKey', [])
        }
      }

      const detailValues = _.chain(data)
        .map(values)
        .value()

      // console.log(JSON.stringify(detailValues));  
      // 2. Getting data from Ecomm
      const urlStock = 'http://zorder.cloudapp.net/appfabric/Clients/MB/GetEcommStock';

      axios.post(urlStock, {
        "Token": `${detailValues[0].Token}`,
        "ProductKey": `${detailValues[0].ProductKey}`
      })
        .then((response) => {
          let data = response.data.data;

          const values = values => {
            return {
              Sku: _.get(values, 'SKU', []),
              ArticleNo: _.get(values, 'ArticleNo', []),
              Color: _.get(values, 'Para1Name', []),
              Size: _.get(values, 'Para2Name', []),
              BranchId: _.get(values, 'BranchId', []),
              StockQty: _.get(values, 'StockQty', [])
            }
          }

          const detailValues = _.chain(data)
            .map(values)
            .value()

          console.log(detailValues);



          // Adding zorder values in database
          // connection.connect((err) => {
          //   if (err) throw err;
          //   console.log("Connected");

          //   for(var i = 0; i < detailValues.length; i++){
          //     var sql = `INSERT INTO zorder (SKU, ArticleNo, Color, Size, BranchId, StockQty) VALUES ('${detailValues[i].Sku}', 
          //     '${detailValues[i].ArticleNo}', 
          //     '${detailValues[i].Color}', 
          //     '${detailValues[i].Size}', 
          //     '${detailValues[i].BranchId}', 
          //     '${detailValues[i].StockQty}'
          //     )`;

          //     connection.query(sql, (err, result) => {
          //       if (err) throw err;
          //       console.log("Number of records inserted: " + result.affectedRows);
          //     });
          //   }

          // }); 



          //Case 1: Get values from zorder table
          connection.query('select SKU from zorder use index (zorderSku)', (err, result, fields) => {
            if (err) throw err;


            const zorderSku = sku => {
              return {
                SKU: _.get(sku, 'SKU', [])
              }
            }

            const zorderSkuValues = _.chain(result)
              .map(zorderSku)
              .value()

            // console.log(zorderSkuValues);
            // let val1 = [];
            // for(let i = 0; i < zorderSkuValues.length; i++){
            //   val1.push(JSON.stringify(zorderSkuValues));
            // }

            // console.log(val1);
            connection.query('select distinct SKU from inventory use index(inventorySku)', (err, result, fields) => {
              if (err) throw err;

              const inventorySku = sku => {
                return {
                  SKU: _.get(sku, 'SKU', [])
                }
              }

              const inventorySkuValues = _.chain(result).map(inventorySku).value()


              // console.log(inventorySkuValues.length);

              // console.log(inventorySkuValues[3].SKU);
              // var matchedValues = [];

              // _.forEach(zorderSkuValues, (n1, key1) => {
              //   _.forEach(inventorySkuValues, (n2, key2) => {
              //     if(n1.SKU === n2.SKU){
              //       console.log("Matched");
              //     }
              //     else{
              //       console.log("Not Matched");
              //     }
              //   });
              // });

              // return matchedValues;
              // console.log(matchedValues);

            });

          });












        })

        .catch((error) => {
          console.log(error);
        })

    })
    .catch((error) => {
      console.log(error);
    })

});






      // let val2 = JSON.stringify(result[11234].SKU).replace(" INCH CHEST", "");
                  // for(var i = 0; i < 5; i++){
                  //   if(JSON.stringify(zorValues[i].SKU) === JSON.stringify(orderWithValues[i].sku)){
                  //     console.log("Success");
                  //   }
                  //   else{
                  //     console.log("Fail");
                  //   }
                  // }



                  // Updating api from matching shopify sku with zorder sku
                //   var putData = {
                //     "product": {
                //       "id": 4507894699999,
                //       "note": "Customer contacted us about a custom engraving on this iPod"
                //     }
                //   }

                // var shopifyOrderOptions = {
                //       url: "https://97d0873caa8de8b81c0f0f519ad5361e:0ce194f153ba658ed99b7f630a6a6a39@joosworks.myshopify.com/admin/api/2019-10/orders/1998160724058.json",
                //       headers : { 'Content-Type': 'application/json' },
                //       body: putData
                //     }
                // shopify.put()



                  // if(val1 === val2){
                  //   console.log("success");


                  // }
                  // else{
                  //   console.log("fail");
                  // }


                  //2. Getting values from inventory table
              // connection.query('SELECT SKU FROM inventory', (err, inventorySku, fields) => {
              //   if(err) throw err;
              //   // console.log(JSON.stringify(inventorySku[94].SKU));
              //   // NETRA-WOV-AHL-WOVN-GREEN 
              //   // NETRA-WOV-AHL-WOVN-GREEN-5.40 MTR
              //   // console.log(JSON.stringify(zorderSku[11522].SKU));
              //   // let inventorySku = 

              //   for(let i = 0; i < zorderSku.length; i++){
              //     for(let j = 0; j < i; j++){
              //       if(JSON.stringify(zorderSku[i].SKU).replace("-5.40 MTR", "") === JSON.stringify(inventorySku[j].SKU)){
              //           console.log("Matched sku");
              //           // debugger;
              //       }
              //       else{
              //         console.log("Failed");
              //         debugger;
              //       }
              //     }
              //   }