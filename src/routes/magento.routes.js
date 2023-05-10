const controller = require("../controllers/magento.controller");

function load(routes) {
  routes.get("/magento/flow", controller.flow);
  
  routes.get("/magento/product", controller.catalogProductInfo);
  routes.get("/magento/products", controller.catalogProductList);
  routes.get("/magento/product/images", controller.catalogProductAttributeMediaList);
  routes.get("/magento/product/attributes", controller.catalogProductAttributeList);
  
  routes.get("/magento/sale", controller.salesOrderInfo);
  routes.get("/magento/sales", controller.salesOrderList);

  routes.get("/magento/categories", controller.catalogCategoryTree);
}

module.exports = { load };
