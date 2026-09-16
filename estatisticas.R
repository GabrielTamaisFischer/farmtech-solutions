# Estatisticas das culturas cadastradas e consulta meteorologica ao vivo.
# Execute a partir de qualquer pasta com:
#   Rscript caminho/estatisticas.R

args <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args, value = TRUE)
script_path <- if (length(file_arg)) sub("^--file=", "", file_arg[1]) else "estatisticas.R"
script_dir <- dirname(normalizePath(script_path, mustWork = FALSE))
if (identical(script_dir, ".") || !nzchar(script_dir)) script_dir <- getwd()

csv_path <- file.path(script_dir, "culturas_manejo.csv")
if (!file.exists(csv_path)) {
  stop("Arquivo culturas_manejo.csv nao encontrado em: ", csv_path)
}

dados <- read.csv(csv_path, stringsAsFactors = FALSE, check.names = FALSE)
dados$area_m2 <- as.numeric(dados$area_m2)
dados$area_ha <- as.numeric(dados$area_ha)
dados$volume_total_L <- as.numeric(dados$volume_total_L)

estatisticas <- function(valores) {
  valores <- valores[is.finite(valores)]
  if (!length(valores)) return(c(media = NA_real_, desvio = NA_real_))
  c(
    media = mean(valores),
    desvio = if (length(valores) > 1) sd(valores) else 0
  )
}

cat("===== FarmTech Solutions | Estatisticas =====\n")
cat("Registros analisados:", nrow(dados), "\n\n")

for (coluna in c("area_m2", "area_ha", "volume_total_L")) {
  resumo <- estatisticas(dados[[coluna]])
  cat(coluna, "-> media:", round(resumo[["media"]], 2),
      "| desvio padrao:", round(resumo[["desvio"]], 2), "\n")
}

cat("\n--- Por cultura ---\n")
for (cultura in unique(dados$cultura)) {
  grupo <- dados[dados$cultura == cultura, , drop = FALSE]
  area <- estatisticas(grupo$area_ha)
  volume <- estatisticas(grupo$volume_total_L)
  cat(cultura, "-> area media:", round(area[["media"]], 2), "ha",
      "| volume medio:", round(volume[["media"]], 2), "L\n")
}

grafico_path <- file.path(script_dir, "grafico_insumos.png")
png(grafico_path, width = 1000, height = 650)
barplot(
  dados$volume_total_L,
  names.arg = dados$cultura,
  col = "#2F5D3A",
  main = "Volume total de insumos por cultura",
  ylab = "Litros",
  xlab = "Cultura"
)
dev.off()
cat("\nGrafico salvo em:", grafico_path, "\n")

meteorologia_path <- file.path(script_dir, "meteorologia.R")
if (file.exists(meteorologia_path)) {
  cat("\n")
  source(meteorologia_path, local = new.env())
}

