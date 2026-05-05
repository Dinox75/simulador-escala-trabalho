#Responsavel pela logica da escala.

from datetime import datetime

def converter_data(data_texto):    #Receber uma data em texto e converter para data
    try:
        data_texto = datetime.strptime(data_texto, "%d/%m/%Y").date()
        return data_texto

    except ValueError:
        return None


def calcular_status():
    pass

def gerar_proximos_dias():
    pass

print(converter_data("05/05/2026"))
print(converter_data("2026-05-05"))
print(converter_data("abc"))