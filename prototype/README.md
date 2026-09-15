# FARMTECH · protótipo de análise agropecuária

Protótipo front-end navegável da FARMTECH, com dashboard, análises estatísticas, tabela de dados e página sobre o projeto. A interface foi pensada como uma camada visual para resultados produzidos em R.

## Executar

Abra [`index.html`](index.html) diretamente no navegador. Não há build nem dependências obrigatórias. Os gráficos são SVG gerados pelo JavaScript; a fonte Manrope é carregada do Google Fonts quando houver internet, com fallback para fontes do sistema.

Para testar as rotas completas, abra `analysis.html`, `data.html` e `about.html` na mesma pasta. Também é possível servir a pasta com qualquer servidor estático local.

## Estrutura

```text
farmtech-platform/
├── index.html              # dashboard principal
├── dashboard.html          # atalho para index.html
├── analysis.html           # análises e estatísticas
├── data.html               # tabela pesquisável
├── about.html              # contexto, fluxo e fontes
├── css/styles.css          # tokens, layout e responsividade
├── js/app.js               # navegação, filtros, métricas, gráficos e estados
├── data/data.js            # contrato de dados e MOCK DATA / DEMONSTRAÇÃO
└── assets/                 # reservado para futuros ícones ou imagens
```

## Dados e integração futura

`data/data.js` é a única fonte dos dados da demonstração. O objeto `window.FARMTECH_DATA` possui `meta`, `records`, `analyses` e `sources`. Substitua esse objeto por um JSON exportado pelo R mantendo esse contrato, ou adapte a função de carregamento em `js/app.js` para buscar um endpoint.

Os números da demonstração refletem os dois registros de café e cana do protótipo Python/R. Eles são sempre marcados na interface como “Dados de demonstração”. Área, volume, média, mediana e desvio padrão são apresentados de forma descritiva; o front-end não substitui a metodologia do R.

Os links de repositório ainda não foram preenchidos no briefing. Por isso, apenas o repositório base conhecido é ativo e os demais aparecem como “Link não informado”.

Para adicionar uma análise, inclua um item em `analyses` com `id`, `title`, `description`, `method`, `variables` e `interpretation`; a página de análises o renderiza automaticamente. Para adicionar um gráfico, crie uma função SVG em `js/app.js`, passe os dados filtrados e insira o resultado no card correspondente.

## Estados e responsividade

O dashboard possui loading inicial por skeleton, empty state para filtros sem dados, feedback de sucesso ao atualizar e empty state de busca na tabela. A navegação lateral vira menu em telas menores; os cards ficam em uma coluna e a tabela usa rolagem horizontal.

## Pendências antes da apresentação

- Trocar a fonte de demonstração pelos resultados reais dos repositórios R assim que os links forem fornecidos.
- Validar a chamada Open-Meteo no RStudio/Posit Cloud com `httr` e `jsonlite` instalados.
- Confirmar os links do GitHub da equipe e usar os botões ativos de fonte.
- Gravar o vídeo de até cinco minutos e incluir o link não listado no pacote final.
