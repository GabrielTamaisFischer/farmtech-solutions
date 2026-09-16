# Consulta meteorologica ao vivo usando a API publica Open-Meteo.
# A consulta nao exige chave de API e pode ser executada com:
#   Rscript meteorologia.R

options(warn = 1)

user_lib <- Sys.getenv("R_LIBS_USER")
if (nzchar(user_lib)) {
  dir.create(user_lib, recursive = TRUE, showWarnings = FALSE)
  .libPaths(unique(c(user_lib, .libPaths())))
}

if (!requireNamespace("jsonlite", quietly = TRUE)) {
  install.packages(
    "jsonlite",
    repos = "https://cloud.r-project.org",
    lib = if (nzchar(user_lib)) user_lib else .libPaths()[1],
    type = "binary"
  )
}

latitude <- -19.9678
longitude <- -44.1983
location <- "Betim, MG"
api_url <- paste0(
  "https://api.open-meteo.com/v1/forecast?latitude=", latitude,
  "&longitude=", longitude,
  "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
  "&timezone=America%2FSao_Paulo"
)

resultado <- tryCatch(
  jsonlite::fromJSON(api_url, simplifyVector = TRUE),
  error = function(erro) {
    cat("Falha ao consultar o Open-Meteo:", conditionMessage(erro), "\n")
    NULL
  }
)

if (is.null(resultado) || is.null(resultado$current)) {
  quit(save = "no", status = 1)
}

atual <- resultado$current
cat("===== FarmTech Solutions | Meteorologia =====\n")
cat("Local:", location, "\n")
cat("Data e hora:", atual$time, "\n")
cat("Temperatura:", atual$temperature_2m, "°C\n")
cat("Umidade relativa:", atual$relative_humidity_2m, "%\n")
cat("Precipitacao:", atual$precipitation, "mm\n")
cat("Velocidade do vento:", atual$wind_speed_10m, "km/h\n")
cat("Fonte:", api_url, "\n")


