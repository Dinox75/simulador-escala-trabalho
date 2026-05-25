import json

CAMINHO_ESCALAS = "data/escalas.json"

def carregar_escalas():
    try:
        with open(CAMINHO_ESCALAS, "r", encoding="utf-8") as file:
            escalas = json.load(file)
            return escalas
    except FileNotFoundError:
        return []

def salvar_escalas(escalas):
    with open(CAMINHO_ESCALAS, "w", encoding="utf-8") as file:
        json.dump(escalas, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    escalas = carregar_escalas()
    salvar_escalas(escalas)
    print("Escalas salvas com sucesso.")