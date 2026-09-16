# FarmTech Solutions

Aplicação acadêmica desenvolvida para a Startup FarmTech Solutions, com foco em apoiar decisões de manejo agrícola por meio de cálculos de área, estimativa de insumos, organização de dados e análise estatística.

## Sistema publicado

Acesse diretamente o protótipo funcional:

**[Abrir o sistema FarmTech](https://farmtech-solutions-demo.vercel.app/dashboard)**

O sistema apresenta o dashboard, os indicadores calculados, a tabela de dados, os fluxos de cadastro/edição/exclusão/exportação e a integração meteorológica com o Open-Meteo.

## Por que este projeto existe

A agricultura digital transforma informações do campo em indicadores que ajudam no planejamento da produção. O projeto simula uma solução para uma fazenda que precisa:

- calcular a área plantada a partir das dimensões do terreno;
- estimar a quantidade de insumo necessária para o manejo;
- organizar registros de diferentes culturas;
- atualizar, excluir e exportar dados;
- analisar médias e desvios estatísticos;
- consultar condições meteorológicas atuais para apoiar o planejamento.

O protótipo trabalha com as culturas café e cana-de-açúcar. Os registros agrícolas incluídos servem como dados iniciais de demonstração e podem ser substituídos pelos dados reais da fazenda.

## Base técnica

### Python

O programa principal está em `farmtech.py` e utiliza a biblioteca padrão do Python.

A aplicação usa vetores paralelos, mantendo cada cultura na mesma posição em todas as listas de dados. O menu oferece:

1. entrada de dados;
2. saída e listagem dos registros;
3. atualização por posição do vetor;
4. deleção por posição;
5. exportação para CSV;
6. saída do programa.

O cálculo da área utiliza um terreno retangular:

```text
área em m² = comprimento do terreno × largura do terreno
área em hectares = área em m² ÷ 10.000
```

O cálculo de insumos utiliza a dosagem, o comprimento das ruas e a quantidade de ruas:

```text
volume total em litros =
dosagem em mL/m × comprimento da rua em m × quantidade de ruas ÷ 1.000
```

### R

O arquivo `estatisticas.R` lê o arquivo `culturas_manejo.csv` e calcula:

- média;
- desvio padrão;
- resultados gerais;
- resultados por cultura;
- gráfico do volume total de insumos.

O arquivo `meteorologia.R` consulta a API pública Open-Meteo usando o pacote `jsonlite`. A consulta retorna temperatura, umidade, precipitação, velocidade do vento e horário da medição para Itapecerica da Serra, SP.

### Interface web

A pasta `prototype/` contém a camada visual publicada no Vercel:

- HTML para as páginas do sistema;
- CSS para layout, responsividade e identidade visual;
- JavaScript para filtros, indicadores, gráficos, CRUD da sessão e exportação CSV;
- consulta direta ao Open-Meteo para exibir o clima atualizado no dashboard.

Os registros adicionados pela interface ficam na sessão do navegador. O sistema ainda não possui banco de dados ou autenticação.

## Estrutura do repositório

```text
farmtech-solutions/
├── farmtech.py                 # aplicação principal em Python
├── culturas_manejo.csv         # dados de entrada e exportação
├── estatisticas.R              # estatísticas e gráfico
├── meteorologia.R              # consulta meteorológica ao vivo
├── prototype/                  # interface web publicada
│   ├── index.html              # dashboard
│   ├── analysis.html           # análises e integração com R
│   ├── data.html               # tabela e operações de dados
│   ├── about.html               # informações do projeto
│   ├── css/styles.css          # estilos
│   ├── js/app.js               # comportamento da interface
│   └── data/data.js            # dados iniciais do protótipo
└── docs/                       # documentação complementar da entrega
```

## Como executar localmente

### Python

No PowerShell ou terminal:

```powershell
cd C:\Users\PC01\Documents\Estudosprogramador\farmtech
python farmtech.py
```

### R

```powershell
cd C:\Users\PC01\Documents\Estudosprogramador\farmtech
Rscript estatisticas.R
```

Para consultar apenas a meteorologia:

```powershell
Rscript meteorologia.R
```

O R utiliza o pacote `jsonlite`. Caso seja necessário instalar:

```r
install.packages("jsonlite", repos = "https://cloud.r-project.org")
```

### Interface web

A interface web é estática. Abra `prototype/index.html` no navegador ou utilize um servidor local:

```powershell
cd prototype
python -m http.server 4173
```

## API meteorológica

A integração usa o endpoint público [Open-Meteo](https://open-meteo.com/en/docs), sem chave de API.

Local consultado:

- Cidade: Itapecerica da Serra, SP
- Latitude: -23.71694444
- Longitude: -46.84916667
- Fuso horário: America/Sao_Paulo

A consulta existe tanto no dashboard web quanto no script R, permitindo demonstrar a mesma fonte de dados em duas tecnologias.

## Colaboração

O projeto utiliza GitHub para versionamento e colaboração da equipe. Alterações devem ser feitas por commits claros, mantendo separados os arquivos da aplicação Python/R, a interface web e a documentação da entrega.

## Entrega acadêmica

Além dos arquivos de código, a entrega pode incluir:

- resumo do artigo solicitado pela disciplina;
- roteiro ou link do vídeo de demonstração;
- arquivos complementares exigidos pela plataforma da FIAP.

