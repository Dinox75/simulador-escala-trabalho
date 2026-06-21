from escala import (
    calcular_status_por_escala,
    gerar_proximos_dias_por_escala,
    gerar_proximos_periodos_por_escala
)

from validacoes import (
    ler_numero,
    ler_data,
    ler_data_hora,
    ler_opcao_menu,
    ler_indice_lista,
    ler_texto,
    confirmar_acao
)

from interface import (
    exibir_menu,
    exibir_proximos_dias,
    exibir_resultado_consulta_por_tipo,
    exibir_proximos_periodos
)

from armazenamento import (
    carregar_escalas,
    adicionar_escala,
    adicionar_escala_ciclo_horas,
    adicionar_escala_turno_rotativo,
    remover_escala,
    editar_escala_ciclo_horas,
    editar_escala_turno_rotativo,
    editar_escala,
    normalizar_sequencia_turnos,
    existe_turno_invalido,
    TURNOS_VALIDOS,
    montar_sequencia_por_blocos as montar_sequencia_por_blocos_dados
)

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO,
    obter_nome_tipo
)

from modelos_escala import listar_modelos_escala

def formatar_sequencia_turnos(sequencia_turnos):
    return " -> ".join(sequencia_turnos)


def formatar_turnos_validos():
    return ", ".join(TURNOS_VALIDOS)


def obter_turnos_invalidos(sequencia_turnos):
    return [
        turno
        for turno in sequencia_turnos
        if turno not in TURNOS_VALIDOS
    ]


def exibir_previa_sequencia_turnos(sequencia_turnos):
    print("\nPrévia da sequência:")

    for indice, turno in enumerate(sequencia_turnos, start=1):
        print(f"Dia {indice}: {turno}")

    print(f"\nTotal do ciclo: {len(sequencia_turnos)} dias")

def ler_sequencia_manual(confirmar_previa=True):
    while True:
        texto = ler_texto(
            "Digite a sequência de turnos separados por vírgula "
            "(ex: Manhã,Tarde,Noite,Folga): "
        )

        partes_sequencia = texto.split(",")
        sequencia_turnos = normalizar_sequencia_turnos(partes_sequencia)

        if not sequencia_turnos:
            print("A sequência de turnos não pode ficar vazia.")
            continue

        if existe_turno_invalido(sequencia_turnos):
            turnos_invalidos = obter_turnos_invalidos(sequencia_turnos)

            print("\nA sequência possui turno inválido.")
            print(f"Turnos inválidos: {formatar_sequencia_turnos(turnos_invalidos)}")
            print(f"Turnos permitidos: {formatar_turnos_validos()}")
            continue

        exibir_previa_sequencia_turnos(sequencia_turnos)

        if not confirmar_previa:
            return sequencia_turnos

        if confirmar_acao("Deseja usar essa sequência?"):
            return sequencia_turnos

        print("Digite a sequência novamente.")

def ler_turno_bloco():
    while True:
        texto_turno = ler_texto(
            f"Digite o turno do bloco ({formatar_turnos_validos()}): "
        )

        turno_normalizado = normalizar_sequencia_turnos([texto_turno])

        if not turno_normalizado:
            print("O turno não pode ficar vazio.")
            continue

        if existe_turno_invalido(turno_normalizado):
            print("\nTurno inválido.")
            print(f"Use apenas: {formatar_turnos_validos()}.")
            continue

        return turno_normalizado[0]

def ler_quantidade_dias_bloco():
    while True:
        quantidade_dias = ler_numero("Quantos dias seguidos neste turno? ")

        if quantidade_dias > 0:
            return quantidade_dias

        print("A quantidade de dias precisa ser maior que zero.")

def ler_sequencia_por_blocos(confirmar_previa=True):
    blocos = []

    while True:
        turno = ler_turno_bloco()
        quantidade_dias = ler_quantidade_dias_bloco()

        blocos.append((turno, quantidade_dias))

        sequencia_turnos = montar_sequencia_por_blocos_dados(blocos)

        if sequencia_turnos is None:
            print("\nNão foi possível montar a sequência.")
            print(f"Use apenas: {formatar_turnos_validos()}.")
            continue

        print("\nBloco adicionado:")
        print(f"{turno} x{quantidade_dias}")

        exibir_previa_sequencia_turnos(sequencia_turnos)

        if not confirmar_acao("Deseja adicionar outro bloco?"):
            break

    sequencia_turnos = montar_sequencia_por_blocos_dados(blocos)

    if not sequencia_turnos:
        print("A sequência de turnos não pode ficar vazia.")
        return ler_sequencia_por_blocos(confirmar_previa)

    if not confirmar_previa:
        return sequencia_turnos

    if confirmar_acao("Deseja usar essa sequência completa?"):
        return sequencia_turnos

    print("Vamos montar a sequência novamente.")
    return ler_sequencia_por_blocos(confirmar_previa)

def ler_sequencia_turnos(confirmar_previa=True):
    print("\nComo deseja montar a sequência de turnos?")
    print("1 - Digitar sequência manualmente")
    print("2 - Montar sequência por blocos")

    opcao = ler_opcao_menu(
        "Escolha uma opção: ",
        ["1", "2"]
    )

    if opcao == "1":
        return ler_sequencia_manual(confirmar_previa)

    return ler_sequencia_por_blocos(confirmar_previa)

def criar_escala_manual(dias_trabalho=6, dias_folga=3):
    return {
        "nome": "Escala manual",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": dias_trabalho,
        "dias_folga": dias_folga
    }

def criar_escala_ciclo_horas(horas_trabalho=12, horas_folga=36):
    return {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": horas_trabalho,
        "horas_folga": horas_folga
    }

def criar_escala_turno_rotativo(sequencia_turnos=None):
    if sequencia_turnos is None:
        sequencia_turnos = [
            "Manhã",
            "Manhã",
            "Tarde",
            "Tarde",
            "Noite",
            "Noite",
            "Folga",
            "Folga"
        ]

    sequencia_turnos = normalizar_sequencia_turnos(sequencia_turnos)

    if not sequencia_turnos:
        raise ValueError("A sequência de turnos não pode ficar vazia.")

    if existe_turno_invalido(sequencia_turnos):
        raise ValueError(
            f"A sequência possui turno inválido. "
            f"Use apenas: {formatar_turnos_validos()}."
        )

    return {
        "nome": "Escala turno rotativo",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": sequencia_turnos
    }


def obter_resumo_escala(escala):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return f"{escala['horas_trabalho']}x{escala['horas_folga']} horas"

    if tipo == TIPO_TURNO_ROTATIVO:
        quantidade_turnos = len(escala.get("sequencia_turnos", []))
        return f"Turno rotativo ({quantidade_turnos} etapas)"

    return f"{escala['dias_trabalho']}x{escala['dias_folga']} dias"


def exibir_escala_atual(escala_atual):
    tipo = escala_atual.get("tipo", TIPO_ESCALA_PADRAO)
    tipo_formatado = obter_nome_tipo(tipo)

    print("\nEscala atual:")
    print(f"Nome: {escala_atual['nome']}")
    print(f"Tipo: {tipo_formatado}")

    if tipo == TIPO_CICLO_HORAS:
        print(f"Horas trabalhadas: {escala_atual['horas_trabalho']}")
        print(f"Horas de folga: {escala_atual['horas_folga']}")

    elif tipo == TIPO_TURNO_ROTATIVO:
        sequencia_turnos = escala_atual.get("sequencia_turnos", [])
        print(f"Sequência: {formatar_sequencia_turnos(sequencia_turnos)}")

    else:
        print(f"Dias trabalhados: {escala_atual['dias_trabalho']}")
        print(f"Dias de folga: {escala_atual['dias_folga']}")


def exibir_escalas_salvas(escalas):
    if not escalas:
        print("\nNenhuma escala salva.")
        return

    print("\n==== ESCALAS SALVAS ====")

    for indice, escala in enumerate(escalas, start=1):
        tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)
        tipo_formatado = obter_nome_tipo(tipo)
        resumo = obter_resumo_escala(escala)

        print(f"{indice} - {escala['nome']} | {tipo_formatado} | {resumo}")

def exibir_modelos_escala(modelos):
    print("\n==== MODELOS DE ESCALA ====")

    for indice, modelo in enumerate(modelos, start=1):
        tipo = modelo.get("tipo", TIPO_ESCALA_PADRAO)
        tipo_formatado = obter_nome_tipo(tipo)
        resumo = obter_resumo_escala(modelo)

        print(f"{indice} - {modelo['nome']} | {tipo_formatado} | {resumo}")

def escolher_modelo_escala():
    modelos = listar_modelos_escala()
    exibir_modelos_escala(modelos)

    indice = ler_indice_lista("Escolha um modelo de escala: ", len(modelos))
    modelo_escolhido = modelos[indice]

    print("\nModelo aplicado como escala atual.")
    exibir_escala_atual(modelo_escolhido)

    return modelo_escolhido

def consultar_status(escala_atual):
    tipo = escala_atual.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        data_inicio = ler_data_hora(
            "Digite a data e hora inicial da escala (dd/mm/aaaa hh:mm): "
        )
        data_consulta = ler_data_hora(
            "Digite a data e hora que deseja consultar (dd/mm/aaaa hh:mm): "
        )
    else:
        data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")
        data_consulta = ler_data("Digite a data que deseja consultar (dd/mm/aaaa): ")

    try:
        status = calcular_status_por_escala(
            escala_atual,
            data_inicio,
            data_consulta
        )

        exibir_resultado_consulta_por_tipo(data_consulta, status, tipo)

    except NotImplementedError as erro:
        print(f"\n{erro}")

    except ValueError as erro:
        print(f"\nErro: {erro}")


def visualizar_proximos(escala_atual):
    tipo = escala_atual.get("tipo", TIPO_ESCALA_PADRAO)

    try:
        if tipo == TIPO_CICLO_HORAS:
            data_hora_inicio = ler_data_hora(
                "Digite a data e hora inicial da escala (dd/mm/aaaa hh:mm): "
            )
            quantidade_periodos = ler_numero("Quantos períodos deseja visualizar? ")

            proximos_periodos = gerar_proximos_periodos_por_escala(
                escala_atual,
                data_hora_inicio,
                quantidade_periodos
            )

            exibir_proximos_periodos(proximos_periodos)

        else:
            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")
            quantidade_dias = ler_numero("Quantos dias deseja visualizar? ")

            proximos_dias = gerar_proximos_dias_por_escala(
                escala_atual,
                data_inicio,
                quantidade_dias
            )

            exibir_proximos_dias(proximos_dias)

    except NotImplementedError as erro:
        print(f"\n{erro}")

    except ValueError as erro:
        print(f"\nErro: {erro}")


def alterar_escala_atual():
    print("\nComo deseja alterar a escala?")
    print("1 - Usar modelo predefinido")
    print("2 - Criar escala personalizada")

    modo_escolhido = ler_opcao_menu(
        "Escolha uma opção: ",
        ["1", "2"]
    )

    if modo_escolhido == "1":
        return escolher_modelo_escala()

    print("\nTipo de escala personalizada:")
    print("1 - Ciclo por dias")
    print("2 - Ciclo por horas")
    print("3 - Turno rotativo")

    tipo_escolhido = ler_opcao_menu(
        "Escolha o tipo de escala: ",
        ["1", "2", "3"]
    )

    if tipo_escolhido == "1":
        novo_dias_trabalho = ler_numero("Quantos dias de trabalho? ")
        novo_dias_folga = ler_numero("Quantos dias de folga? ")

        escala_atual = criar_escala_manual(
            novo_dias_trabalho,
            novo_dias_folga
        )

        print("\nEscala alterada com sucesso.")
        exibir_escala_atual(escala_atual)

        return escala_atual

    if tipo_escolhido == "2":
        horas_trabalho = ler_numero("Quantas horas de trabalho? ")
        horas_folga = ler_numero("Quantas horas de folga? ")

        escala_atual = criar_escala_ciclo_horas(
            horas_trabalho,
            horas_folga
        )

        print("\nEscala por horas aplicada com sucesso.")
        exibir_escala_atual(escala_atual)

        return escala_atual

    sequencia_turnos = ler_sequencia_turnos()
    escala_atual = criar_escala_turno_rotativo(sequencia_turnos)

    print("\nEscala de turno rotativo aplicada com sucesso.")
    exibir_escala_atual(escala_atual)

    return escala_atual


def aplicar_escala_salva():
    escalas = carregar_escalas()
    exibir_escalas_salvas(escalas)

    if not escalas:
        return None

    indice = ler_indice_lista("Escolha uma escala para usar: ", len(escalas))
    escala_escolhida = escalas[indice]

    print("\nEscala aplicada como escala atual.")
    exibir_escala_atual(escala_escolhida)

    return escala_escolhida


def cadastrar_escala():
    print("\nTipo de escala:")
    print("1 - Ciclo por dias")
    print("2 - Ciclo por horas")
    print("3 - Turno rotativo")

    tipo_escolhido = ler_opcao_menu(
        "Escolha o tipo de escala para cadastrar: ",
        ["1", "2", "3"]
    )

    nome = ler_texto("Digite o nome da escala: ")

    if tipo_escolhido == "1":
        dias_trabalho = ler_numero("Digite a quantidade de dias trabalhados: ")
        dias_folga = ler_numero("Digite a quantidade de dias de folga: ")

        resultado = adicionar_escala(
            nome,
            dias_trabalho,
            dias_folga
        )

    elif tipo_escolhido == "2":
        horas_trabalho = ler_numero("Digite a quantidade de horas trabalhadas: ")
        horas_folga = ler_numero("Digite a quantidade de horas de folga: ")

        resultado = adicionar_escala_ciclo_horas(
            nome,
            horas_trabalho,
            horas_folga
        )

    else:
        sequencia_turnos = ler_sequencia_turnos()

        resultado = adicionar_escala_turno_rotativo(
            nome,
            sequencia_turnos
        )

    if resultado == "sucesso":
        print("Escala cadastrada com sucesso!")

    elif resultado == "nome_duplicado":
        print(f"A escala '{nome}' já existe.")

    elif resultado == "configuracao_duplicada":
        print("Já existe uma escala com essa mesma configuração.")

    elif resultado == "sequencia_vazia":
        print("A sequência de turnos não pode ficar vazia.")

    elif resultado == "turno_invalido":
        print("\nA sequência possui turno inválido.")
        print(f"Use apenas: {formatar_turnos_validos()}.")


def editar_escala_salva(escala_atual):
    escalas = carregar_escalas()
    exibir_escalas_salvas(escalas)

    if not escalas:
        return escala_atual

    indice = ler_indice_lista("Escolha uma escala para editar: ", len(escalas))
    escala_selecionada = escalas[indice]

    tipo = escala_selecionada.get("tipo", TIPO_ESCALA_PADRAO)
    tipo_formatado = obter_nome_tipo(tipo)

    print("\nEscala selecionada:")
    print(f"Nome atual: {escala_selecionada['nome']}")
    print(f"Tipo atual: {tipo_formatado}")

    novo_nome = ler_texto("Digite o novo nome da escala: ")

    if tipo == TIPO_CICLO_HORAS:
        print(f"Horas trabalhadas atuais: {escala_selecionada['horas_trabalho']}")
        print(f"Horas de folga atuais: {escala_selecionada['horas_folga']}")

        novas_horas_trabalho = ler_numero(
            "Digite a nova quantidade de horas trabalhadas: "
        )
        novas_horas_folga = ler_numero(
            "Digite a nova quantidade de horas de folga: "
        )

        print("\nResumo da alteração:")
        print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
        print(f"Tipo: {tipo_formatado}")
        print(
            "Horas trabalhadas: "
            f"{escala_selecionada['horas_trabalho']} -> {novas_horas_trabalho}"
        )
        print(
            "Horas de folga: "
            f"{escala_selecionada['horas_folga']} -> {novas_horas_folga}"
        )

        confirmacao = confirmar_acao("Deseja salvar essa alteração?")

        if not confirmacao:
            print("Edição cancelada.")
            return escala_atual

        resultado = editar_escala_ciclo_horas(
            indice,
            novo_nome,
            novas_horas_trabalho,
            novas_horas_folga
        )

        escala_editada = {
            "nome": novo_nome,
            "tipo": TIPO_CICLO_HORAS,
            "horas_trabalho": novas_horas_trabalho,
            "horas_folga": novas_horas_folga
        }

    elif tipo == TIPO_TURNO_ROTATIVO:
        sequencia_atual = escala_selecionada.get("sequencia_turnos", [])

        print(f"Sequência atual: {formatar_sequencia_turnos(sequencia_atual)}")

        nova_sequencia_turnos = ler_sequencia_turnos(confirmar_previa=False)

        print("\nResumo da alteração:")
        print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
        print(f"Tipo: {tipo_formatado}")
        print(f"Sequência atual: {formatar_sequencia_turnos(sequencia_atual)}")
        print(f"Nova sequência: {formatar_sequencia_turnos(nova_sequencia_turnos)}")
        print(f"Total do novo ciclo: {len(nova_sequencia_turnos)} dias")

        confirmacao = confirmar_acao("Deseja salvar essa alteração?")

        if not confirmacao:
            print("Edição cancelada.")
            return escala_atual

        resultado = editar_escala_turno_rotativo(
            indice,
            novo_nome,
            nova_sequencia_turnos
        )

        escala_editada = {
            "nome": novo_nome,
            "tipo": TIPO_TURNO_ROTATIVO,
            "sequencia_turnos": nova_sequencia_turnos
        }

    else:
        print(f"Dias trabalhados atuais: {escala_selecionada['dias_trabalho']}")
        print(f"Dias de folga atuais: {escala_selecionada['dias_folga']}")

        novos_dias_trabalho = ler_numero(
            "Digite a nova quantidade de dias trabalhados: "
        )
        novos_dias_folga = ler_numero(
            "Digite a nova quantidade de dias de folga: "
        )

        print("\nResumo da alteração:")
        print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
        print(f"Tipo: {tipo_formatado}")
        print(
            "Dias trabalhados: "
            f"{escala_selecionada['dias_trabalho']} -> {novos_dias_trabalho}"
        )
        print(
            "Dias de folga: "
            f"{escala_selecionada['dias_folga']} -> {novos_dias_folga}"
        )

        confirmacao = confirmar_acao("Deseja salvar essa alteração?")

        if not confirmacao:
            print("Edição cancelada.")
            return escala_atual

        resultado = editar_escala(
            indice,
            novo_nome,
            novos_dias_trabalho,
            novos_dias_folga
        )

        escala_editada = {
            "nome": novo_nome,
            "tipo": escala_selecionada.get("tipo", TIPO_ESCALA_PADRAO),
            "dias_trabalho": novos_dias_trabalho,
            "dias_folga": novos_dias_folga
        }

    if resultado == "sucesso":
        print("Escala editada com sucesso!")

        if escala_atual == escala_selecionada:
            escala_atual = escala_editada
            print("A escala atual também foi atualizada.")

    elif resultado == "indice_invalido":
        print("Índice inválido.")

    elif resultado == "nome_duplicado":
        print("Já existe uma escala com esse nome.")

    elif resultado == "configuracao_duplicada":
        print("Já existe uma escala com essa configuração.")

    elif resultado == "sequencia_vazia":
        print("A sequência de turnos não pode ficar vazia.")

    elif resultado == "turno_invalido":
        print("\nA sequência possui turno inválido.")
        print(f"Use apenas: {formatar_turnos_validos()}.")

    return escala_atual


def excluir_escala_salva(escala_atual):
    escalas = carregar_escalas()
    exibir_escalas_salvas(escalas)

    if not escalas:
        return escala_atual

    indice = ler_indice_lista("Escolha uma escala para excluir: ", len(escalas))
    escala_removida = escalas[indice]
    nome_escala = escala_removida["nome"]

    confirmacao = confirmar_acao(
        f"Tem certeza que deseja excluir a escala '{nome_escala}'?"
    )

    if not confirmacao:
        print("Exclusão cancelada.")
        return escala_atual

    removido = remover_escala(indice)

    if removido:
        print(f"Escala '{nome_escala}' removida com sucesso!")

        if escala_atual == escala_removida:
            escala_atual = criar_escala_manual()
            print("A escala atual foi redefinida para a escala manual padrão.")

    else:
        print("Não foi possível remover a escala.")

    return escala_atual


def main():
    escala_atual = criar_escala_manual()

    while True:
        resumo_escala_atual = obter_resumo_escala(escala_atual)
        exibir_menu(resumo_escala_atual)

        menu = ler_opcao_menu(
            "\nEscolha uma opção: ",
            ["1", "2", "3", "4", "5", "6", "7", "8"]
        )

        if menu == "1":
            consultar_status(escala_atual)

        elif menu == "2":
            visualizar_proximos(escala_atual)

        elif menu == "3":
            escala_atual = alterar_escala_atual()

        elif menu == "4":
            escala_escolhida = aplicar_escala_salva()

            if escala_escolhida is not None:
                escala_atual = escala_escolhida

        elif menu == "5":
            cadastrar_escala()

        elif menu == "6":
            escala_atual = editar_escala_salva(escala_atual)

        elif menu == "7":
            escala_atual = excluir_escala_salva(escala_atual)

        elif menu == "8":
            print("Saindo...")
            break


if __name__ == "__main__":
    main()