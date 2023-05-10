const ExcelJS = require("exceljs");
const validator = require("validator");

const filename = __filename.slice(__dirname.length + 1) + " -";

module.exports = {
  async exportToExcel(list, filename, worksheetName, headers = null) {
    try {
      const workbook = new ExcelJS.Workbook();

      let worksheets = [];

      const sheet = workbook.addWorksheet(worksheetName);

      let sheetColumns = [];

      if (headers) {
        sheetColumns = [...headers];
      } else {
        for (const name in list[0]) {
          sheetColumns.push({
            header: name,
          });
        }
      }

      sheet.columns = sheetColumns;

      worksheets.push(sheet);

      // Insere cada um dos itens da list como sendo uma linha na tabela
      for (const item of list) {
        let row = [];

        for (const nome in item) {
          if (typeof item[nome] === "string") {
            if (validator.isDecimal(item[nome], { locale: "pt-BR" })) {
              item[nome] = parseFloat(item[nome].replace(",", "."));
            }
          }

          row.push(item[nome]);
        }

        worksheets[0].addRow(row);
      }

      // Ajuste de tamanho das colunas
      // worksheets[0].columns.forEach((column) => {
      //   const lengths = column.values.map((v) => v.toString().length);
      //   const maxLength = Math.max(...lengths.filter((v) => typeof v === "number"));
      //   column.width = maxLength + 2;
      // });

      // Escreve arquivo final
      await workbook.xlsx.writeFile("./files/" + filename + ".xlsx");

      return;
    } catch (error) {
      console.log(filename, "Erro durante manipulação de arquivo excel:", error.message);
    }
  },
};
