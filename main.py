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
    exibir_resultado_consulta,
    exibir_escalas_salvas,
    obter_resumo_escala,
    exibir_escala_atual,
    exibir_resultado_consulta_por_tipo,
    exibir_proximos_periodos
)
from armazenamento import (
    carregar_escalas,
    adicionar_escala,
    adicionar_escala_ciclo_horas,
    remover_escala,
    editar_escala_ciclo_horas,
    editar_escala
)

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    obter_nome_tipo
)


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


def alterar_escala_atual():
    print("\nTipo de escala:")
    print("1 - Ciclo por dias")
    print("2 - Ciclo por horas")

    tipo_escolhido = ler_opcao_menu(
        "Escolha o tipo de escala: ",
        ["1", "2"]
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

    escala_atual = criar_escala_ciclo_horas(12, 36)

    print("\nEscala 12x36 aplicada com sucesso.")
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

    tipo_escolhido = ler_opcao_menu(
        "Escolha o tipo de escala para cadastrar: ",
        ["1", "2"]
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

    else:
        horas_trabalho = ler_numero("Digite a quantidade de horas trabalhadas: ")
        horas_folga = ler_numero("Digite a quantidade de horas de folga: ")

        resultado = adicionar_escala_ciclo_horas(
            nome,
            horas_trabalho,
            horas_folga
        )

    if resultado == "sucesso":
        print("Escala cadastrada com sucesso!")

    elif resultado == "nome_duplicado":
        print(f"A escala '{nome}' já existe.")

    elif resultado == "configuracao_duplicada":
        print("Já existe uma escala com essa mesma configuração.")

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

        novas_horas_trabalho = ler_numero("Digite a nova quantidade de horas trabalhadas: ")
        novas_horas_folga = ler_numero("Digite a nova quantidade de horas de folga: ")

        print("\nResumo da alteração:")
        print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
        print(f"Tipo: {tipo_formatado}")
        print(f"Horas trabalhadas: {escala_selecionada['horas_trabalho']} -> {novas_horas_trabalho}")
        print(f"Horas de folga: {escala_selecionada['horas_folga']} -> {novas_horas_folga}")

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

    else:
        print(f"Dias trabalhados atuais: {escala_selecionada['dias_trabalho']}")
        print(f"Dias de folga atuais: {escala_selecionada['dias_folga']}")

        novos_dias_trabalho = ler_numero("Digite a nova quantidade de dias trabalhados: ")
        novos_dias_folga = ler_numero("Digite a nova quantidade de dias de folga: ")

        print("\nResumo da alteração:")
        print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
        print(f"Tipo: {tipo_formatado}")
        print(f"Dias trabalhados: {escala_selecionada['dias_trabalho']} -> {novos_dias_trabalho}")
        print(f"Dias de folga: {escala_selecionada['dias_folga']} -> {novos_dias_folga}")

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