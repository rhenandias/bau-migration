const magento = require("../services/magento");

module.exports = {
  async flow() {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    await magento.endSession(client, sessionId);

    return "ok";
  },

  async salesOrderList() {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.salesOrderList(client, sessionId);

    await magento.endSession(client, sessionId);

    return response;
  },

  async catalogProductInfo(productId) {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.catalogProductInfo(client, sessionId, productId);

    await magento.endSession(client, sessionId);

    return response;
  },

  async catalogProductList() {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.catalogProductList(client, sessionId);

    await magento.endSession(client, sessionId);

    return response;
  },

  async catalogProductAttributeMediaList(productId) {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.catalogProductAttributeMediaList(client, sessionId, productId);

    await magento.endSession(client, sessionId);

    return response;
  },

  async catalogProductAttributeList(setId) {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.catalogProductAttributeList(client, sessionId, setId);

    await magento.endSession(client, sessionId);

    return response;
  },

  async salesOrderInfo(orderIncrementId) {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const response = await magento.salesOrderInfo(client, sessionId, orderIncrementId);

    await magento.endSession(client, sessionId);

    return response;
  },
};
