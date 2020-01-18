//Modules
const express = require('express');
const app = express();
const shopifyAPI = require('shopify-node-api');
var mysql = require('mysql');
const request = require('request');
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



shopify.get('/admin/products.json', (err, data, headers) => {
  //1 .Getting color and size from shopify
  var products = data.products;
  const colors = product => {
    const variants = _.get(product, 'variants', []);
    const sku = _.map(variants, vairant => {
      return { sku: _.get(vairant, 'sku', 'error with sku') }
    });
    return sku;
  }

  const orderWithValues = _.chain(products)
    .map(colors)
    .flattenDeep()
    .value()


  //2.Getting only the sku from the shopify product variant
  let shopifySku = [];
  for (var i = 0; i < orderWithValues.length; i++) {
    shopifySku.push(orderWithValues[i].sku);
  }


  //Zorder DB query with sku, color, size, branchId and stockQty
  connection.query('select distinct ID, SKU, COLOR, SIZE from zorderSku use index (zorderSku)', (err, result, fields) => {
    if (err) throw err;

    const zorderSku = sku => {
      return {
        SKU: _.get(sku, 'SKU', []),
        color: _.get(sku, 'COLOR', []),
        size: _.get(sku, 'SIZE', [])
      }
    }

    const zorderSkuValues = _.chain(result)
      .map(zorderSku)
      .value()



    let zorderValues = [], matchedSku = [], colorValues = [], sizeValues = [];

    //1. Get matched SKU's
    function getmatchedSku() {
      //To get the matched sku, have to replace the ending characters of SKU
      for (let i = 0; i < zorderSkuValues.length; i++) {
        zorderValues.push(zorderSkuValues[i].SKU
          .replace("-5.40 MTR", "")
          .replace("-ONION PINK-42 INCH CHEST", "")
          .replace(" INCH CHEST", "")
          .replace("-BEIGE-2.50 MTR", ""));
      }

      zorderValues.forEach(e1 => shopifySku.forEach(e2 => {
        if (e1 === e2) {
          matchedSku.push(e1);
        }
      }));
      // console.log(JSON.stringify(matchedSku));
    }



    //2. Get color and size values
    function getColorAndSizeValues() {
      const colorSizeValues = _.chain(result)
        .map(zorderSku)
        .value()

      //Color values
      for (let i = 0; i < colorSizeValues.length; i++) {
        colorValues.push(colorSizeValues[i].color);
      }

      //Size values
      for (let i = 0; i < colorSizeValues.length; i++) {
        sizeValues.push(colorSizeValues[i].size);
      }
    }



    //3. Get product and variant ids from the matched sku 
    function getProductAndVariantIds() {
      shopifySku.forEach(n1 => n1);
      matchedSku.forEach(n2 => n2);


      if (this.n1 === this.n2) {
        const id = product => {
          const variants = _.get(product, 'variants', []);
          const vid = _.map(variants, vairant => {
            return { product_id: _.get(vairant, 'product_id', 'wrong id'), variant_id: _.get(vairant, 'id', 'wrong id') }
          });
          return vid;
        }

        const productIdShopify = _.chain(products)
          .map(id)
          .flattenDeep()
          .value()
      }
    }



    //4. Get branchId and StockQty
    function getBranchAndStock() {
      connection.query('select SKU, BranchId, StockQty from zorderStock use index (zorderStock)',
        (err, branchResult, fields) => {
          if (err) throw err;

          const zorderStock = branch => {
            return {
              SKU: _.get(branch, 'SKU', []),
              BranchId: _.get(branch, 'BranchId', []),
              StockQty: _.get(branch, 'StockQty', []),
            }
          }

          const zorderStockValues = _.chain(branchResult)
            .map(zorderStock)
            .value()

          // console.log(zorderStockValues);



          // console.log(zorderStockValues);
          let zorderBranchSkuValues = [], zorderBranchIdValues = [], zorderStockQty = [];

          //Zorder Sku Values
          for (let i = 0; i < zorderStockValues.length; i++) {
            zorderBranchSkuValues.push(zorderStockValues[i].SKU);
          }

          // console.log(zorderBranchSkuValues);
          //Zorder BranchId Values
          for (let i = 0; i < zorderStockValues.length; i++) {
            zorderBranchIdValues.push(zorderStockValues[i].BranchId);
          }

          //Zorder StockId Values
          for (let i = 0; i < zorderStockValues.length; i++) {
            zorderStockQty.push(zorderStockValues[i].StockQty);
          }



          //Duplicate SKU in Zorder 
          let sortedSku = zorderBranchSkuValues.slice().sort();
          let getSameSku = [];
          for (let i = 0; i < sortedSku.length - 1; i++) {
            if (sortedSku[i + 1] === sortedSku[i]) {
              getSameSku.push(sortedSku[i])
            }
          }

          console.log(getSameSku);


          // console.log(getSameSku);
          //If same sku is repeating for more than one time, then add up the stockQty with it
          // function getSameSkuCount() {
          //   zorderStockQty.sort();
          //   var current = null;
          //   var count = 0;
          //   for (var i = 0; i < zorderStockQty.length; i++) {
          //     if (zorderStockQty[i] != current) {
          //       if (count > 0) {
          //         console.log(count);
          //       }
          //       current = zorderStockQty[i];
          //       count = 1;
          //     } else {
          //       count++;
          //     }
          //   }
          // }
          // getSameSkuCount();

          var zorderValuesStock = [];
          for (let i = 0; i < zorderBranchSkuValues.length; i++) {
            zorderValuesStock.push(zorderBranchSkuValues[i]
              .replace("-5.40 MTR", "")
              .replace("-ONION PINK-42 INCH CHEST", "")
              .replace(" INCH CHEST", "")
              .replace("-BEIGE-2.50 MTR", ""));
          }

          var matchedZorderSku = [];
          zorderValuesStock.forEach(e1 => shopifySku.forEach(e2 => {
            if (e1 === e2) {
              matchedZorderSku.push(e1);
            }
          }));



          // console.log(JSON.stringify(matchedZorderSku));

          let skuTest = 'BS18-STA-3030-SKD-COT-CHND';
          // for(let i = 0; i < zorderStockValues.length; i++){
          //   if(shopifySku[i] === getSameSku[i]){
              
          //   }
          // }


          let total = 0;
          for (let i = 0; i < zorderStockValues.length; i++) {
            if (skuTest === zorderStockValues[i].SKU) {
              let stockTotal = zorderStockValues[i].StockQty;
              total += stockTotal;
            } 
          }

          console.log(total);
          /*{
            <id>: {id:<>, branchID: <>, QTY: <>}
            [
              "branch_id": 11,
              "br"

              "totalStockQty": 3
            ]
          }*/

          // console.log(matchedZorderSku);  

        });

    }



    getmatchedSku();
    getColorAndSizeValues();
    getProductAndVariantIds();
    getBranchAndStock();
  });

});

