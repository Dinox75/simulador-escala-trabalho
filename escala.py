#Responsavel pela logica da escala.

from datetime import datetime

def converter_data(data_texto):    #Receber uma data em texto e converter para data
    try:
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


def gerar_proximos_dias():
    pass