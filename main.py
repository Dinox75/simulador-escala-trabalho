from datetime import datetime
from escala import converter_data, gerar_proximos_dias

def iniciar_programa():
    data_texto = input("Digite a data inicial da escala (dd/mm/aaaa): ")

    data_inicio = converter_data(data_texto)

    if data_inicio is None:
        print("Data inválida. Use o formato dd/mm/aaaa.")
        return

    quantidade_dias = int(input("Quantos dias deseja visualizar? "))
    dias_trabalho = int(input("Quantos dias de trabalho? "))
    dias_folga = int(input("Quantos dias de folga? "))

    gerar_proximos_dias(
        data_inicio,
        quantidade_dias,
        dias_trabalho,
        dias_folga
    )

if __name__ == "__main__":
    iniciar_programa()