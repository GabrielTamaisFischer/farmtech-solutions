/*
 * FARMTECH data contract
 *
 * MOCK DATA / DEMONSTRACAO: estes registros reproduzem o CSV do prototipo
 * Python/R. Eles nao sao uma leitura em tempo real dos repositorios.
 * Para conectar resultados reais do R, substitua window.FARMTECH_DATA por um
 * objeto com a mesma estrutura ou carregue um JSON neste ponto.
 */
window.FARMTECH_DATA = {
  meta: {
    isMock: true,
    updatedAt: "10 set 2026",
    sourceLabel: "FarmTech Solutions · demonstração",
    sourceUrl: "https://github.com/GabrielTamaisFischer/farmtech-solutions",
    note: "Os quatro links de repositório do briefing ainda não foram preenchidos."
  },
  records: [
    {
      id: "cana-001",
      cultura: "Cana-de-açúcar",
      culturaShort: "Cana",
      areaHa: 10,
      areaM2: 100000,
      qtdRuas: 133,
      comprimentoRuaM: 500,
      produto: "Herbicida",
      volumeTotalL: 19950,
      dosagemMlM: 300,
      regiao: null,
      periodo: "Registro atual"
    },
    {
      id: "cafe-001",
      cultura: "Café",
      culturaShort: "Café",
      areaHa: 6,
      areaM2: 60000,
      qtdRuas: 57,
      comprimentoRuaM: 300,
      produto: "Fosfato",
      volumeTotalL: 8550,
      dosagemMlM: 500,
      regiao: null,
      periodo: "Registro atual"
    }
  ],
  analyses: [
    {
      id: "area",
      title: "Área de plantio",
      description: "A área é calculada a partir das dimensões do terreno retangular.",
      method: "Comprimento × largura; conversão de m² para hectares",
      variables: ["areaM2", "areaHa"],
      interpretation: "A demonstração reúne 16 hectares em dois registros. Como há dois valores, o desvio padrão descreve a diferença entre as áreas observadas; ele não indica desempenho agrícola."
    },
    {
      id: "insumos",
      title: "Manejo de insumos",
      description: "O volume estimado combina dosagem, comprimento de cada rua e quantidade de ruas.",
      method: "mL/m × m por rua × número de ruas ÷ 1.000",
      variables: ["dosagemMlM", "volumeTotalL"],
      interpretation: "A cana apresenta o maior volume total nesta demonstração porque o comprimento e a quantidade de ruas registrados resultam em 19.950 L. Isso é uma comparação descritiva, sem inferir causa ou produtividade."
    }
  ],
  sources: [
    { label: "Repositório base do protótipo Python/R", url: "https://github.com/GabrielTamaisFischer/farmtech-solutions", available: true },
    { label: "Repositório R 2", url: null, available: false },
    { label: "Repositório R 3", url: null, available: false },
    { label: "Repositório R 4", url: null, available: false }
  ]
};
