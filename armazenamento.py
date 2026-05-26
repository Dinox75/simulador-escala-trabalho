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

def adicionar_escala(nome, dias_trabalho, dias_folga):
    escalas = carregar_escalas()

    novo_nome = nome.lower().strip()

    for escala in escalas:
        nome_existente = escala["nome"].lower().strip()

        if novo_nome == nome_existente:
            return "nome_duplicado"

        if (
            escala["dias_trabalho"] == dias_trabalho
            and escala["dias_folga"] == dias_folga
        ):
            return "configuracao_duplicada"

    nova_escala = {
        "nome": nome,
        "dias_trabalho": dias_trabalho,
        "dias_folga": dias_folga
    }

    escalas.append(nova_escala)
    salvar_escalas(escalas)

    return "sucesso"

def remover_escala(indice):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return False

    escalas.pop(indice)

    salvar_escalas(escalas)

    return True
    
