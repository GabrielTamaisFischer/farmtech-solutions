# FarmTech Solutions

Projeto acadêmico FIAP: gestão de café e cana em Python e estatísticas em R.

## Organização

- `farmtech.py`: menu, vetores paralelos, cálculo de área e insumos, exportação CSV.
- `estatisticas.R`: leitura do CSV, média, desvio padrão, gráfico e chamada da meteorologia.
- `meteorologia.R`: consulta atual ao Open-Meteo com `jsonlite`.
- `culturas_manejo.csv`: exemplo original fornecido pelo grupo; a opção 5 substitui o arquivo pelos dados da sessão.
- `docs/ROTEIRO_VIDEO.md`: demonstração de até cinco minutos.
- `docs/INTEGRANTES.md`: identificação da equipe.
- `CONTRIBUTING.md`: fluxo de colaboração.

## Executar

Na pasta do projeto:

```sh
python farmtech.py
Rscript estatisticas.R
Rscript meteorologia.R
```

No RStudio/Posit Cloud, abra a pasta do projeto e execute `source("estatisticas.R")` ou `source("meteorologia.R")`. O Python usa apenas a biblioteca padrão e o R usa `jsonlite` para consultar o Open-Meteo. A consulta usa Itapecerica da Serra, SP, nas coordenadas do exemplo do projeto. Falhas de rede são informadas no terminal.

## Cálculos

Para ambas as culturas, o terreno é um retângulo: área em m² = comprimento × largura; hectares = m² / 10000.
As dimensões do terreno são independentes do comprimento e quantidade de ruas usados no manejo.
Volume total em litros = dosagem em mL/m × comprimento de rua em m × quantidade de ruas / 1000.
As dosagens são exemplos didáticos fornecidos pelo grupo.

O menu contém entrada (1), saída (2), atualização por índice (3), deleção (4), exportação (5) e saída do programa (6).
Os registros ficam em memória durante a sessão; o programa não importa o CSV ao iniciar.
As dimensões são guardadas em vetores e recalculadas ao atualizar. A exclusão mantém todos os vetores alinhados.
O CSV original não informa dimensões: não foram inventadas medidas para esses registros históricos.
Novas exportações incluem comprimento e largura do terreno, preservando as colunas usadas pelo R.
Com apenas uma observação, o desvio padrão amostral em R é NA.

## Pendências da entrega

- Confirmar o aceite dos convites dos colaboradores no GitHub.
- Adicionar o resumo do artigo revisado pelo grupo (até uma página A4, Arial 11, espaçamento simples, margens laterais de 2 cm).
- Gravar o vídeo, publicar como não listado e incluir o link em TXT.
- R 4.6.1 e `jsonlite` 2.0.0 foram instalados e os scripts `estatisticas.R` e `meteorologia.R` foram executados com resposta atual do Open-Meteo.
- Revisar o ZIP final antes de enviar à plataforma.

## Referências do enunciado

- Trello: https://trello.com/c/azl166Md/4-aplica%C3%A7%C3%A3o-em-r-e-estat%C3%ADstica
- Artigo: https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1003485/1/CAP8.pdf
- API opcional: https://open-meteo.com/en/docs
