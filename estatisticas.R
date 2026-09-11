# =============================================================
# FarmTech Solutions - Estatisticas basicas (R)
# Le o CSV exportado pelo programa em Python e calcula
# medidas estatisticas (media, desvio padrao, min, max) por
# cultura e no geral.
# =============================================================

# 1) LEITURA DO CSV -------------------------------------------
# Ajuste o caminho se o arquivo estiver em outra pasta
dados <- read.csv("culturas_manejo.csv", stringsAsFactors = FALSE)

# Conferindo a estrutura dos dados
print(str(dados))
print(head(dados))


# 2) VETORES A PARTIR DAS COLUNAS -------------------------------
cultura      <- dados$cultura
area_m2      <- dados$area_m2
area_ha      <- dados$area_ha
qtd_ruas     <- dados$qtd_ruas
comprimento  <- dados$comprimento_rua_m
dosagem_ml_m <- dados$dosagem_ml_por_metro
volume_total <- dados$volume_total_L


# 3) FUNCAO AUXILIAR: RESUMO ESTATISTICO -------------------------
resumo_estatistico <- function(vetor, nome_vetor) {
  cat("\n---", nome_vetor, "---\n")
  cat("Media:        ", mean(vetor), "\n")
  cat("Desvio padrao:", sd(vetor), "\n")
  cat("Minimo:       ", min(vetor), "\n")
  cat("Maximo:       ", max(vetor), "\n")
}


# 4) ESTATISTICAS GERAIS (todas as culturas juntas) --------------
cat("\n============ ESTATISTICAS GERAIS ============\n")
resumo_estatistico(area_ha, "Area (ha)")
resumo_estatistico(volume_total, "Volume total de insumo (L)")


# 5) ESTATISTICAS POR CULTURA -------------------------------------
cat("\n============ ESTATISTICAS POR CULTURA ============\n")

culturas_unicas <- unique(cultura)

for (c in culturas_unicas) {
  cat("\nCultura:", c, "\n")

  linhas <- dados[dados$cultura == c, ]

  cat("Area (ha):           ", linhas$area_ha, "\n")
  cat("Volume total (L):    ", linhas$volume_total_L, "\n")
  cat("Dosagem (ml/m):      ", linhas$dosagem_ml_por_metro, "\n")

  # obs.: com apenas 1 registro por cultura, media/desvio nao fazem
  # muito sentido aqui. Se o grupo passar a registrar VARIAS aplicacoes
  # ao longo do tempo por cultura (ex: um CSV de historico), essa parte
  # deve usar resumo_estatistico(linhas$volume_total_L, c) para calcular
  # media e desvio padrao de fato.
}


# 6) (OPCIONAL) GRAFICO SIMPLES ------------------------------------
# Comparando visualmente o volume total de insumo por cultura
barplot(
  volume_total,
  names.arg = cultura,
  main = "Volume total de insumo por cultura (L)",
  ylab = "Litros",
  col = "forestgreen"
)


# 7) DESAFIO OPCIONAL: API METEOROLOGICA EM R -------------------
consultar_clima <- function(latitude = -22.90, longitude = -47.05) {
  cat("\n============ DADOS CLIMATICOS (OPEN-METEO) ============\n")
  if (!requireNamespace("httr", quietly = TRUE) ||
      !requireNamespace("jsonlite", quietly = TRUE)) {
    cat('Para consultar o clima, execute install.packages(c("httr", "jsonlite")) e rode novamente.\n')
    return(invisible(NULL))
  }
  tryCatch({
    resposta <- httr::GET(
      "https://api.open-meteo.com/v1/forecast",
      query = list(latitude = latitude, longitude = longitude,
                   current = "temperature_2m,precipitation", timezone = "auto"),
      httr::timeout(15)
    )
    httr::stop_for_status(resposta)
    clima <- jsonlite::fromJSON(httr::content(resposta, as = "text", encoding = "UTF-8"))
    temperatura <- clima$current$temperature_2m
    chuva <- clima$current$precipitation
    if (length(temperatura) != 1 || length(chuva) != 1 ||
        !is.finite(temperatura) || !is.finite(chuva)) {
      stop("Resposta sem temperatura ou precipitacao validas.")
    }
    cat("Coordenadas de demonstracao:", latitude, longitude, "\n")
    cat("Horario:", clima$current$time, "Fuso:", clima$timezone, "\n")
    cat("Temperatura:", temperatura, clima$current_units$temperature_2m, "\n")
    cat("Precipitacao:", chuva, clima$current_units$precipitation, "\n")
    cat("Intervalo do dado atual:", clima$current$interval, "segundos\n")
    cat(if (chuva > 0) "Ha precipitacao no intervalo informado.\n" else
      "Nao ha precipitacao no intervalo informado.\n")
    cat("Fonte: Open-Meteo (dados de modelo meteorologico).\n")
    invisible(clima)
  }, error = function(e) {
    cat("Consulta meteorologica indisponivel:", conditionMessage(e), "\n")
    invisible(NULL)
  })
}

# Exemplo do Trello, nao a localizacao confirmada da fazenda.
consultar_clima()
