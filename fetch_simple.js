const { getProducts } = require('./api/shopify'); getProducts(5).then(p => console.log(JSON.stringify(p, null, 2))).catch(e => console.error(e));
