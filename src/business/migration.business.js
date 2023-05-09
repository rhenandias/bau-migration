const bling = require("../services/bling");
const lojaIntegrada = require("../services/lojaIntegrada");
const magento = require("../services/magento");

const filename = __filename.slice(__dirname.length + 1) + " -";

module.exports = {
  async exportarProduto(sku, exportarDescricao, exportarImagens, exportarSEO) {
    console.log(filename, `Migrando produto para a Loja Integrada - SKU: ${sku}`);

    // Adquirir os dados do produto no Bling (para obter o vínculo com a Loja Integrada)
    const produtoBling = await bling.produto(sku, "203426320");

    // Adquirir os dados do produto na Loja Integrada (para obter o vínculo de SEO)
    const produtoLojaIntegrada = await lojaIntegrada.detalhesProduto(produtoBling.idComponex);

    // Adquirir os dados do produto no Magento
    const { produtoMagento, imagensMagento } = await this.dadosMagento(sku);

    // Exportar as imagens
    if (exportarImagens) {
      await this.exportarImagens(imagensMagento, produtoBling);
    }

    // Exportar dados do produto
    if (exportarDescricao) {
      await this.exportarDadosProduto(produtoMagento, produtoBling);
    }

    // Atualizar informações de SEO
    if (exportarSEO) {
      await this.exportarSEO(produtoMagento, produtoLojaIntegrada);
    }

    return "Exportação realizada com sucesso.";
  },

  async dadosMagento(sku) {
    const client = await magento.createClient();

    const sessionId = await magento.login(client);

    const produtoMagento = await magento.catalogProductInfo(client, sessionId, sku);

    const imagensMagento = await magento.catalogProductAttributeMediaList(client, sessionId, sku);

    try {
      await magento.endSession(client, sessionId);
    } catch (error) {
      console.log(filename, "Não foi possível finalizar a sessão do Magento");
    }

    return { produtoMagento, imagensMagento };
  },

  async exportarImagens(imagensMagento, produtoBling) {
    console.log(filename, "Exportando imagens");

    let imagens = [];

    // A API do Magento retorna objetos diferentes dependendo da quantidade de imagens cadastras
    // Retorna uma Array caso tenha mais uma imagem cadastrada, caso contrário, um objeto
    // Identificar as duas situações e converter ambas para uma array
    if (Array.isArray(imagensMagento.result.item)) {
      imagens = imagensMagento.result.item.map((item) => item);
    } else {
      imagens = [imagensMagento.result.item];
    }

    for (const imagem of imagens) {
      if (imagem.exclude === "0") {
        const principal = imagem.position === "1" ? true : false;

        await lojaIntegrada.cadastrarImagens(
          imagem.url,
          produtoBling.idComponex,
          principal,
          parseInt(imagem.position)
        );
      }
    }
  },

  async exportarDadosProduto(produtoMagento, produtoBling) {
    console.log(filename, "Exportando dados do produto");

    // Manter essas variáveis com os mesmos nomes de exportação para a Loja Integrada
    let nome = produtoMagento.info.name;
    let ativo = produtoMagento.info.status === "1" ? true : false;
    let descricao_completa = produtoMagento.info.description;

    // Acrescenta modificadores de tamanho e fonte a descrição
    // color: rgb(47, 47, 47);
    const head = `<span style="font-family:Arial,Helvetica,sans-serif; font-size: 14px; ">`;
    const tail = `</span>`;

    descricao_completa = head + descricao_completa + tail;

    // Montar o objeto de exportação para a Loja Integrada
    const dadosLojaIntegrada = {
      nome,
      ativo,
      descricao_completa,
      categorias: [],
    };

    await lojaIntegrada.alterarProduto(produtoBling.idComponex, dadosLojaIntegrada);
  },

  async exportarSEO(produtoMagento, produtoLojaIntegrada) {
    console.log(filename, "Exportando dados de SEO");

    // Extrair o vínculo com SEO
    const re = /(?:\/([^/]+))?$/;
    const seo = re.exec(produtoLojaIntegrada.seo)[1];

    let description = produtoMagento.info.meta_description;
    let title = produtoMagento.info.meta_title;

    // Manipulação de Descrição
    description = description.substring(0, 250);

    // Manipulação de Título
    title = title.replace("Baú da Eletrônica", "Componex");

    const dadosLojaIntegrada = {
      description,
      title,
    };

    await lojaIntegrada.alterarSEO(seo, dadosLojaIntegrada);
  },
};
