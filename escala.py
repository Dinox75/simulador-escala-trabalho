# Responsável pela lógica da escala.

from datetime import datetime, timedelta


def converter_data(data_texto):  # Receber uma data em texto e converter para data
    try:
        data_convertida = datetime.strptime(data_texto, "%d/%m/%Y").date()
        return data_convertida

    except ValueError:
        return None


def calcular_status(data_inicio, data_consulta, dias_trabalho, dias_folga):  # Calcular se está de "Folga" ou "Trabalhando"
    ciclo = dias_trabalho + dias_folga

    dias_passados = (data_consulta - data_inicio).days

    posicao_ciclo = dias_passados % ciclo

    if posicao_ciclo < dias_trabalho:
        return "Trabalhando"
    else:
        return "Folga"


def gerar_proximos_dias(data_inicio, quantidade_dias, dias_trabalho, dias_folga):
    for i in range(quantidade_dias):
        data_atual = data_inicio + timedelta(days=i)

        status = calcular_status(
            data_inicio,
            data_atual,
            dias_trabalho,
            dias_folga
        )

        print(f"{data_atual.strftime('%d/%m/%Y')}: {status}")


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