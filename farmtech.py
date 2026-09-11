"""
FarmTech Solutions - Gestao de culturas (Python)
Estrutura em vetores (listas paralelas) + menu de opcoes.

Cada cultura ocupa a MESMA posicao (indice) em todas as listas abaixo.
Ex: se "cafe" esta no indice 0 de nomes_cultura, entao areas_m2[0],
qtd_ruas[0], produtos[0] etc. tambem se referem ao cafe.
"""

from math import isfinite
from pathlib import Path

# ---------------------------------------------------------
# 1) VETORES DE DADOS (listas paralelas)
# ---------------------------------------------------------
nomes_cultura   = []   # ex: "cafe", "cana"
comprimentos_m  = []   # comprimento do terreno retangular
larguras_m      = []   # largura do terreno retangular
areas_m2        = []   # area total em m2
areas_ha        = []   # area total em hectares
qtd_ruas        = []   # quantidade de ruas de plantio
comprimento_rua = []   # comprimento de cada rua (m)
produtos        = []   # insumo aplicado (ex: "fosfato", "herbicida")
metodos         = []   # metodo de aplicacao (ex: "pulverizacao mecanizada")
dosagens_ml_m   = []   # dosagem em ml por metro de rua


# ---------------------------------------------------------
# 2) FUNCOES DE CALCULO
# ---------------------------------------------------------
def ler_positivo(mensagem, inteiro=False, atual=None):
    while True:
        valor = input(mensagem).strip()
        if not valor and atual is not None:
            return atual
        try:
            numero = int(valor) if inteiro else float(valor.replace(",", "."))
            if isfinite(numero) and numero > 0:
                return numero
        except (ValueError, OverflowError):
            pass
        print("Informe um numero positivo valido.")


def calcular_area_retangulo(comprimento, largura):
    """Area plantada retangular para cafe e cana: comprimento x largura."""
    return comprimento * largura


def calcular_area_ha(area_m2):
    """Converte area em m2 para hectares (1 ha = 10.000 m2)."""
    return area_m2 / 10000


def calcular_volume_total_litros(dosagem_ml_m, comprimento_m, qtd_ruas_cultura):
    """
    Calcula o volume total de insumo necessario, em litros.
    dosagem_ml_m: ml aplicados por metro de rua
    comprimento_m: comprimento de cada rua (m)
    qtd_ruas_cultura: numero de ruas da lavoura
    """
    volume_por_rua_ml = dosagem_ml_m * comprimento_m
    volume_total_ml = volume_por_rua_ml * qtd_ruas_cultura
    return volume_total_ml / 1000  # ml -> litros


def buscar_indice_por_nome(nome):
    """Retorna o indice da cultura pelo nome, ou -1 se nao encontrada."""
    nome = nome.strip().lower()
    for i, cultura in enumerate(nomes_cultura):
        if cultura.lower() == nome:
            return i
    return -1


# ---------------------------------------------------------
# 3) ENTRADA DE DADOS
# ---------------------------------------------------------
def entrada_dados():
    print("\n--- Entrada de dados de uma nova cultura ---")
    nome = input("Nome da cultura: ")

    comprimento_terreno = ler_positivo("Comprimento do terreno (m): ")
    largura_terreno = ler_positivo("Largura do terreno (m): ")
    area_m2 = calcular_area_retangulo(comprimento_terreno, largura_terreno)
    print(f"Area calculada: {comprimento_terreno} x {largura_terreno} = {area_m2} m2")
    area_ha = calcular_area_ha(area_m2)

    ruas = ler_positivo("Quantidade de ruas: ", inteiro=True)
    comprimento = ler_positivo("Comprimento de cada rua (m): ")

    produto = input("Produto/insumo aplicado: ")
    metodo = input("Metodo de aplicacao: ")
    dosagem = ler_positivo("Dosagem (ml por metro de rua): ")

    nomes_cultura.append(nome)
    comprimentos_m.append(comprimento_terreno)
    larguras_m.append(largura_terreno)
    areas_m2.append(area_m2)
    areas_ha.append(area_ha)
    qtd_ruas.append(ruas)
    comprimento_rua.append(comprimento)
    produtos.append(produto)
    metodos.append(metodo)
    dosagens_ml_m.append(dosagem)

    print(f"\nCultura '{nome}' cadastrada com sucesso!")


# ---------------------------------------------------------
# 4) SAIDA DE DADOS
# ---------------------------------------------------------
def saida_dados():
    print("\n--- Dados cadastrados ---")
    if not nomes_cultura:
        print("Nenhuma cultura cadastrada ainda.")
        return

    for i in range(len(nomes_cultura)):
        volume_total = calcular_volume_total_litros(
            dosagens_ml_m[i], comprimento_rua[i], qtd_ruas[i]
        )
        print(f"\n[{i}] {nomes_cultura[i]}")
        print(f"    Terreno retangular: {comprimentos_m[i]} x {larguras_m[i]} m")
        print(f"    Area: {areas_m2[i]} m2 ({areas_ha[i]:.2f} ha)")
        print(f"    Ruas: {qtd_ruas[i]} x {comprimento_rua[i]} m")
        print(f"    Insumo: {produtos[i]} ({metodos[i]})")
        print(f"    Dosagem: {dosagens_ml_m[i]} ml/m -> Total: {volume_total:.2f} L")


# ---------------------------------------------------------
# 5) ATUALIZACAO DE DADOS
# ---------------------------------------------------------
def atualizar_dados():
    saida_dados()
    if not nomes_cultura:
        return

    try:
        indice = int(input("\nDigite o indice da cultura a atualizar: "))
        if indice < 0 or indice >= len(nomes_cultura):
            print("Indice invalido.")
            return
    except ValueError:
        print("Entrada invalida.")
        return

    print(f"Atualizando '{nomes_cultura[indice]}'. Deixe em branco para manter o valor atual.")

    comprimentos_m[indice] = ler_positivo(
        f"Novo comprimento do terreno ({comprimentos_m[indice]}): ", atual=comprimentos_m[indice])
    larguras_m[indice] = ler_positivo(
        f"Nova largura do terreno ({larguras_m[indice]}): ", atual=larguras_m[indice])
    areas_m2[indice] = calcular_area_retangulo(comprimentos_m[indice], larguras_m[indice])
    areas_ha[indice] = calcular_area_ha(areas_m2[indice])
    qtd_ruas[indice] = ler_positivo(
        f"Nova quantidade de ruas ({qtd_ruas[indice]}): ", inteiro=True, atual=qtd_ruas[indice])
    comprimento_rua[indice] = ler_positivo(
        f"Novo comprimento de rua em m ({comprimento_rua[indice]}): ", atual=comprimento_rua[indice])
    dosagens_ml_m[indice] = ler_positivo(
        f"Nova dosagem ml/m ({dosagens_ml_m[indice]}): ", atual=dosagens_ml_m[indice])

    print("Dados atualizados com sucesso!")


# ---------------------------------------------------------
# 6) DELECAO DE DADOS
# ---------------------------------------------------------
def deletar_dados():
    saida_dados()
    if not nomes_cultura:
        return

    try:
        indice = int(input("\nDigite o indice da cultura a deletar: "))
        if indice < 0 or indice >= len(nomes_cultura):
            print("Indice invalido.")
            return
    except ValueError:
        print("Entrada invalida.")
        return

    nome_removido = nomes_cultura[indice]

    # remove a mesma posicao em TODOS os vetores, para manter sincronizados
    del nomes_cultura[indice]
    del comprimentos_m[indice]
    del larguras_m[indice]
    del areas_m2[indice]
    del areas_ha[indice]
    del qtd_ruas[indice]
    del comprimento_rua[indice]
    del produtos[indice]
    del metodos[indice]
    del dosagens_ml_m[indice]

    print(f"Cultura '{nome_removido}' removida com sucesso!")


# ---------------------------------------------------------
# 7) EXPORTACAO PARA CSV (ponte com o script em R)
# ---------------------------------------------------------
def exportar_csv(caminho=None):
    import csv

    if caminho is None:
        caminho = Path(__file__).resolve().parent / "culturas_manejo.csv"

    with open(caminho, mode="w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow([
            "cultura", "area_m2", "area_ha", "qtd_ruas", "comprimento_rua_m",
            "produto", "metodo_aplicacao", "dosagem_ml_por_metro", "volume_total_L",
            "comprimento_terreno_m", "largura_terreno_m"
        ])
        for i in range(len(nomes_cultura)):
            volume_total = calcular_volume_total_litros(
                dosagens_ml_m[i], comprimento_rua[i], qtd_ruas[i]
            )
            escritor.writerow([
                nomes_cultura[i], areas_m2[i], areas_ha[i],
                qtd_ruas[i], comprimento_rua[i], produtos[i], metodos[i],
                dosagens_ml_m[i], round(volume_total, 2), comprimentos_m[i], larguras_m[i]
            ])

    print(f"\nDados exportados para '{caminho}' com sucesso!")


# ---------------------------------------------------------
# 8) MENU PRINCIPAL (loop + decisao)
# ---------------------------------------------------------
def menu_principal():
    while True:
        print("\n===== FarmTech Solutions =====")
        print("1 - Entrada de dados (cadastrar cultura)")
        print("2 - Saida de dados (listar culturas)")
        print("3 - Atualizar dados")
        print("4 - Deletar dados")
        print("5 - Exportar para CSV")
        print("6 - Sair do programa")

        opcao = input("Escolha uma opcao: ")

        if opcao == "1":
            entrada_dados()
        elif opcao == "2":
            saida_dados()
        elif opcao == "3":
            atualizar_dados()
        elif opcao == "4":
            deletar_dados()
        elif opcao == "5":
            exportar_csv()
        elif opcao == "6":
            print("Encerrando o programa. Ate mais!")
            break
        else:
            print("Opcao invalida, tente novamente.")


if __name__ == "__main__":
    menu_principal()
