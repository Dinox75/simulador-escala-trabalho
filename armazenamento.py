import json

def carregar_escalas():
    try:
        with open("data/escalas.json", "r", encoding="utf-8") as file:
            escalas = json.load(file)
            return escalas
    except FileNotFoundError:
        return []


if __name__ == "__main__":
    from interface import exibir_escalas_salvas

    escalas = carregar_escalas()
    exibir_escalas_salvas(escalas)