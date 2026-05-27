import json

CAMINHO_ESCALAS = "data/escalas.json"
TIPO_ESCALA_PADRAO = "ciclo_dias"

def normalizar_escala(escala):
    if "tipo" not in escala:
        escala["tipo"] = TIPO_ESCALA_PADRAO

    return escala

def carregar_escalas():
    try:
        with open(CAMINHO_ESCALAS, "r", encoding="utf-8") as file:
            escalas = json.load(file)
            return [normalizar_escala(escala) for escala in escalas]
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
    "tipo": TIPO_ESCALA_PADRAO,
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
    
def editar_escala(indice, novo_nome, novos_dias_trabalho, novos_dias_folga):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return "indice_invalido"

    novo_nome_limpo = novo_nome.strip()
    novo_nome_normalizado = novo_nome_limpo.lower()

    for posicao, escala in enumerate(escalas):
        if posicao != indice:
            nome_existente = escala["nome"].lower().strip()

            if nome_existente == novo_nome_normalizado:
                return "nome_duplicado"

            if escala["dias_trabalho"] == novos_dias_trabalho and escala["dias_folga"] == novos_dias_folga:
                return "configuracao_duplicada"

    tipo_atual = escalas[indice].get("tipo", TIPO_ESCALA_PADRAO)

    escalas[indice] = {
        "nome": novo_nome_limpo,
        "tipo": tipo_atual,
        "dias_trabalho": novos_dias_trabalho,
        "dias_folga": novos_dias_folga
    }

    salvar_escalas(escalas)

    return "sucesso"