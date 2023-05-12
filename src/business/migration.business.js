const bling = require("../services/bling");
const lojaIntegrada = require("../services/lojaIntegrada");
const magento = require("../services/magento");
const { elapsedTime } = require("../utils/time");
const { exportToExcel } = require("../modules/excel");
const { models } = require("../modules/sequelize");
const { Op } = require("sequelize");

const filename = __filename.slice(__dirname.length + 1) + " -";

module.exports = {
  async exportarProduto(
    sku,
    exportarDescricao,
    exportarImagens,
    exportarSEO,
    client = null,
    sessionId = null
  ) {
    console.log(filename, `Migrando produto - SKU: ${sku}`);

    // Adquirir os dados do produto no Bling (para obter o vínculo com a Loja Integrada)
    const produtoBling = await bling.produto(sku, "204459450");

    // Adquirir os dados do produto na Loja Integrada (para obter o vínculo de SEO)
    const produtoLojaIntegrada = await lojaIntegrada.detalhesProduto(produtoBling.idComponex);

    // Adquirir os dados do produto no Magento
    const { produtoMagento, imagensMagento } = await this.dadosMagento(sku, client, sessionId);

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

  async dadosMagento(sku, client = null, sessionId = null) {
    let killSession = false;

    if (client === null && sessionId === null) {
      client = await magento.createClient();
      sessionId = await magento.login(client);

      killSession = true;
    }

    const produtoMagento = await magento.catalogProductInfo(client, sessionId, sku);

    const imagensMagento = await magento.catalogProductAttributeMediaList(client, sessionId, sku);

    if (killSession) {
      try {
        await magento.endSession(client, sessionId);
      } catch (error) {
        console.log(filename, "Não foi possível finalizar a sessão do Magento");
      }
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
    // title = title.replace("Baú da Eletrônica", "Componex");

    const dadosLojaIntegrada = {
      description,
      title,
    };

    await lojaIntegrada.alterarSEO(seo, dadosLojaIntegrada);
  },

  async dumpProdutosMagento() {
    const client = await magento.createClient();
    const sessionId = await magento.login(client);

    console.log(filename, "Adquirindo lista completa de produtos do Magento");

    // Dump considerando todos os SKUs presentes no Magento:

    const respostaProdutosMagento = await magento.catalogProductList(client, sessionId);
    const arrayProdutosMagento = respostaProdutosMagento["storeView"]["item"];
    const listaDeSkus = arrayProdutosMagento.map((produtoMagento) => produtoMagento["sku"]);

    // Dump considerando apenas produtos ativos e com SKU numerico:

    // const produtosAtivos = await models.tbproduto.findAll({
    //   attributes: ["idsku"],
    //   where: {
    //     situacao: true,
    //     idsku: {
    //       [Op.regexp]: "^[0-9]+$",
    //     },
    //   },
    //   raw: true,
    // });

    // const listaDeSkus = produtosAtivos.map((produto) => produto.idsku);

    console.log(filename, "Iniciando extração de dados de produtos individuais");
    const start = new Date();

    let contador = 1;

    const produtosComFalha = [];
    const produtosProcessados = [];
    const produtosFinais = [];

    for (const sku of listaDeSkus) {
      try {
        console.log(filename, `Produto ${contador++}/${listaDeSkus.length}`);

        const produtoMagento = await magento.catalogProductInfo(client, sessionId, sku);

        const produto = produtoMagento["info"];

        // Verificar presença de mais de uma categoria
        const categorias = Array.isArray(produto.categories.item)
          ? produto.categories.item.join(", ")
          : produto.categories.item;

        // Desestruturar e processar o resultado
        produtosFinais.push({
          product_id: produto["product_id"],
          sku: produto["sku"],
          categories: categorias,
          name: produto["name"],
          description: produto["description"],
          short_description: produto["short_description"],
          weight: produto["weight"],
          status: produto["status"],
          url_key: produto["url_key"],
          url_path: produto["url_path"],
          price: produto["price"],
          meta_title: produto["meta_title"],
          meta_keyword: produto["meta_keyword"],
          meta_description: produto["meta_description"],
        });

        produtosProcessados.push(sku);
      } catch (error) {
        produtosComFalha.push(sku);
        console.log(filename, "Falha para o SKU:", sku, "-", error.message);
      }

      // if (contador === 100) break;
    }

    try {
      await magento.endSession(client, sessionId);
    } catch (error) {
      console.log(filename, "Não foi possível finalizar a sessão do Magento");
    }

    await exportToExcel(produtosFinais, "dump_produtos_magento", "Dump");

    console.log(filename, "Dump finalizado");
    console.log(filename, "Quantidade de produtos processados:", produtosProcessados.length);
    console.log(filename, "Quantidade de produtos não processados:", produtosComFalha.length);
    console.log(filename, "Tempo gasto no procedimento:", elapsedTime(start));

    return { produtosFinais };
  },

  async executarMigracao(skuInicial, skuFinal) {
    // Verifica existência de SKU inicial ou final
    if (skuInicial === undefined || skuInicial === null) skuInicial = 0;
    if (skuFinal === undefined || skuFinal === null) skuFinal = 9999;

    // Adquirir lista de SKUs ativos dentro do range informado
    // Os SKUs no banco são salvos como strings
    // Primeiro adquirir a lista completa e converter para número
    // Depois disso, filtrar a lista de SKUs numéricos para isolar o intervalo desejado

    const produtosAtivos = await models.tbproduto.findAll({
      attributes: ["idsku"],
      where: {
        situacao: true,
        idsku: {
          [Op.regexp]: "^[0-9]+$",
        },
      },
      raw: true,
    });

    const listaDeSkusNumericos = produtosAtivos
      .map((produto) => parseInt(produto.idsku))
      .sort((a, b) => a - b);

    const listaDeSkus = listaDeSkusNumericos.filter((sku) => sku >= skuInicial && sku < skuFinal);

    // Adquirir uma nova sessão do Magento para executar as migrações
    const client = await magento.createClient();
    const sessionId = await magento.login(client);

    // Executar a exportação para cada um dos SKUs de resultado
    const produtosProcessados = [];
    const produtosComFalha = [];

    console.log(filename, "Iniciando exportação de produtos");

    const start = new Date();

    for (const sku of listaDeSkus) {
      try {
        await this.exportarProduto(sku, true, true, true, client, sessionId);

        produtosProcessados.push(sku);
      } catch (error) {
        console.log(filename, `Falha SKU: ${sku} -  ${error.message}`);

        produtosComFalha.push(sku);
      }
    }

    // Encerrar a sessão do Magento
    try {
      await magento.endSession(client, sessionId);
      console.log(filename, "Sessão do Magento finalizada.");
    } catch (error) {
      console.log(filename, "Ocorreu um erro durante a finalização da sessão do Magento.");
    }

    console.log(filename, "Procedimento de exportação finalizado");
    console.log(filename, `Tempo gasto no procedimento: ${elapsedTime(start)}`);
    console.log(filename, `Quantidade de produtos processados: ${produtosProcessados.length}`);
    console.log(filename, `Quantidade de produtos com falha: ${produtosComFalha.length}`);
    console.log(filename, `Produtos com falha:`);
    console.dir(produtosComFalha, { maxArrayLength: null });

    return {
      produtosComFalha,
    };
  },
};
