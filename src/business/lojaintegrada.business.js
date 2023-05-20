const lojaIntegrada = require("../services/lojaIntegrada");

const { exportToExcel } = require("../modules/excel");
const { delay } = require("../utils/delay");

const filename = __filename.slice(__dirname.length + 1) + " -";

module.exports = {
  async exportarCategorias() {
    // Realizar busca contínua em todas as categorias da Loja Integrada
    let searching = true;
    let page = 1;
    let nextUrl = "";

    const categorias = [];

    while (searching) {
      console.log(filename, `Iniciando busca na página:  ${page}`);

      const respostaCategorias = await lojaIntegrada.listarCategorias(nextUrl);

      nextUrl = respostaCategorias.meta.next;

      categorias.push(...respostaCategorias.objects);

      console.log(filename, `Quantidade de categorias encontradas: ${respostaCategorias.objects.length}`);

      nextUrl ? (nextUrl = nextUrl.replace("/api/v1", "")) : (searching = false);

      await delay(300);

      page++;
    }

    const categoriasDesestruturadas = categorias.map((categoria) => {
      console.log(categoria);
      return {
        id: categoria.id,
        nome: categoria.nome,
        resource_uri: categoria.resource_uri,
        url: categoria.url,
      };
    });

    await exportToExcel(categoriasDesestruturadas, "dump_categorias_loja_integrada", "Categorias");

    return {
      categoriasDesestruturadas,
    };
  },
};
