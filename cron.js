var cron = require('node-cron');
var fetch = require('node-fetch')
const shopifyAPI = require('shopify-node-api');
const _ = require('lodash');
var mysql = require('mysql');



function doUpdateData() {
    let ids = fetch('https://api.myjson.com/bins/18g6fs')
        .then(res => res.json())

    let color = fetch('https://api.myjson.com/bins/13d5pc')
        .then(res => res.json())

    let size = fetch('https://api.myjson.com/bins/1e53oc')
        .then(res => res.json())



    Promise.all([ids, color, size])
        .then(results => results[0].map((item, i) => {
            console.log(results[0]);
            // [ array of 77 objects containing productId, variantId, color and size]
            return {
                productId: item.product_id,
                variantId: item.variant_id,
                color: results[1][i],
                size: results[2][i]
            }
        }
        ))

        // if an item in finalResult with key as item, productId exist, it returns the variants property of that. Else an empty array
        .then(results => {
            return _.reduce(results, (finalResult, item) => {
                let variants = _.get(finalResult, [item.productId, 'variants'], []);
                variants.push({
                    id: item.variantId,
                    option1: item.color,
                    option2: item.size,
                })
                //we add the info to the variant
                return {
                    ...finalResult,
                    [item.productId]: {
                        id: item.productId,
                        variants,
                    }
                }
                //we override the existing product info with the updated vairants
            }, {})
        })
        .then(combined =>
            _.chain(combined)
                .values()
                .forEach((item, i) => {
                    var index = item.variants.map(size => size.option2)
                    //console.log(index);
                    if (i != 1) {
                        return;
                    }
                    // putDataCron(item)
                })
                .value()
        )
}

function putDataCron(product) {
    var shopify = new shopifyAPI({
        shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
        shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
        access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
    });

    var putData = {
        product,
    };


    shopify.put(`/admin/products/${product.id}.json`, putData, (err, data, headers) => {
        let variants = data.product.variants;
        //     if (err) { console.log(err) }
        //for (let i = 0; i < 80; i++) {
        let sizeNull = variants.filter(size => size.option2 === null);
        // console.log("****", sizeNull, product.variants);

        // }
    })
}

// cron.schedule('* * * * *', () => {
//     console.log('running a task every minute');
// });

doUpdateData();


