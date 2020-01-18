//Shopify Module
const shopifyAPI = require('shopify-node-api');
const _ = require('lodash');
const moment = require('moment');


var shopify = new shopifyAPI({
    shop: 'joosworks.myshopify.com', // MYSHOP.myshopify.com
    shopify_api_key: '97d0873caa8de8b81c0f0f519ad5361e', // Your API key
    access_token: '0ce194f153ba658ed99b7f630a6a6a39' // Your API password
});


//Getting order sales data
shopify.get('/admin/orders.json', (err, data, headers) => {

    var orders = data.orders;

    const fF = order => {
        return { 
          date: moment.parseZone(order.created_at).toISOString(), line_items: _.get(order, 'line_items', []) 
        };
    };

    const sF = order => {
        const quantity = _.get(order, ['line_items', 0, 'quantity'], 0);
        //order.line_items[0].quantity
        const price = _.get(order, ['line_items', 0, 'price'], '0');
        return Object.assign({}, { date: order.date, value: quantity * (+price) });
    }

    const orderWithValues = _.chain(orders)
        .map(fF)
        .map(sF)
        .value()

    console.log(orderWithValues)
});

