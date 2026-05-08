#Responsavel pela logica da escala.

from datetime import datetime, timedelta

def converter_data(data_texto):    #Receber uma data em texto e converter para data
    try:                                                                                #Tenta converter a data usando o formato dia/mês/ano
        data_convertida = datetime.strptime(data_texto, "%d/%m/%Y").date()
        return data_convertida

    except ValueError:
        return None


def calcular_status(data_inicio, data_consulta, dias_trabalho, dias_folga):
    ciclo = dias_trabalho + dias_folga

    dias_passados = (data_consulta - data_inicio).days

    posicao_ciclo = dias_passados % ciclo
    
    if posicao_ciclo < dias_trabalho:
        return "Trabalhando"
    else:
        return "Folga"


def gerar_proximos_dias(data_inicio, quantidade_dias, dias_trabalho, dias_folga):          #Gerar os próximos dias de trabalho e folga a partir da data atual
    for i in range(quantidade_dias):
        data_atual = data_inicio + timedelta(days=i)

        status = calcular_status(
            data_inicio,
            data_atual,
            dias_trabalho,
            dias_folga
        )

        print(f"{data_atual.strftime('%d/%m/%Y')}: {status}")

if __name__ == "__main__":
    data_inicio = converter_data("01/05/2026")
    gerar_proximos_dias(data_inicio, 15, 6, 3)