from escala import calcular_status_por_escala, gerar_proximos_dias_por_escala
from validacoes import (
    ler_numero,
    ler_data,
    ler_opcao_menu,
    ler_data_hora,
    ler_indice_lista,
    ler_texto,
    confirmar_acao
)
from interface import (
    exibir_menu,
    exibir_proximos_dias,
    exibir_resultado_consulta,
    exibir_escala_alterada,
    exibir_escalas_salvas
)
from armazenamento import carregar_escalas, adicionar_escala, remover_escala, editar_escala
from tipos_escala import TIPO_ESCALA_PADRAO, TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, obter_nome_tipo


def criar_escala_manual(dias_trabalho=6, dias_folga=3):
    return {
        "nome": "Escala manual",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": dias_trabalho,
        "dias_folga": dias_folga
    }

def obter_resumo_escala(escala):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return f"{escala['horas_trabalho']}x{escala['horas_folga']} horas"

    return f"{escala['dias_trabalho']}x{escala['dias_folga']} dias"

def obter_resumo_escala(escala):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return f"{escala['horas_trabalho']}x{escala['horas_folga']} horas"

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
    else:
        print(f"Dias trabalhados: {escala_atual['dias_trabalho']}")
        print(f"Dias de folga: {escala_atual['dias_folga']}")

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
            if menu == "1":
                tipo_escala_atual = escala_atual.get("tipo", TIPO_ESCALA_PADRAO)

                if tipo_escala_atual == TIPO_CICLO_HORAS:
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

                exibir_resultado_consulta(data_consulta, status)

            except NotImplementedError as erro:
                print(f"\n{erro}")

        elif menu == "2":
            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")
            quantidade_dias = ler_numero("Quantos dias deseja visualizar? ")

            try:
                proximos_dias = gerar_proximos_dias_por_escala(
                    escala_atual,
                    data_inicio,
                    quantidade_dias
                )

                exibir_proximos_dias(proximos_dias)

            except NotImplementedError as erro:
                print(f"\n{erro}")

        elif menu == "3":
            novo_dias_trabalho = ler_numero("Quantos dias de trabalho? ")
            novo_dias_folga = ler_numero("Quantos dias de folga? ")

            escala_atual = criar_escala_manual(
                novo_dias_trabalho,
                novo_dias_folga
            )

            exibir_escala_alterada(
                escala_atual["dias_trabalho"],
                escala_atual["dias_folga"]
            )

        elif menu == "4":
            escalas = carregar_escalas()
            exibir_escalas_salvas(escalas)

            if escalas:
                indice = ler_indice_lista("Escolha uma escala para usar: ", len(escalas))
                escala_escolhida = escalas[indice]

                escala_atual = escala_escolhida

                print("\nEscala aplicada como escala atual.")
                exibir_escala_atual(escala_atual)

        elif menu == "5":
            nome = ler_texto("Digite o nome da escala: ")
            dias_trabalho = ler_numero("Digite a quantidade de dias trabalhados: ")
            dias_folga = ler_numero("Digite a quantidade de dias de folga: ")

            resultado = adicionar_escala(nome, dias_trabalho, dias_folga)

            if resultado == "sucesso":
                print("Escala cadastrada com sucesso!")

            elif resultado == "nome_duplicado":
                print(f"A escala '{nome}' já existe.")

            elif resultado == "configuracao_duplicada":
                print("Já existe uma escala com essa mesma quantidade de dias trabalhados e dias de folga.")

        elif menu == "6":
            escalas = carregar_escalas()
            exibir_escalas_salvas(escalas)

            if escalas:
                indice = ler_indice_lista("Escolha uma escala para editar: ", len(escalas))
                escala_selecionada = escalas[indice]

                tipo_formatado = obter_nome_tipo(
                    escala_selecionada.get("tipo", TIPO_ESCALA_PADRAO)
                )

                print("\nEscala selecionada:")
                print(f"Nome atual: {escala_selecionada['nome']}")
                print(f"Tipo atual: {tipo_formatado}")
                print(f"Dias trabalhados atuais: {escala_selecionada['dias_trabalho']}")
                print(f"Dias de folga atuais: {escala_selecionada['dias_folga']}")

                novo_nome = ler_texto("Digite o novo nome da escala: ")
                novos_dias_trabalho = ler_numero("Digite a nova quantidade de dias trabalhados: ")
                novos_dias_folga = ler_numero("Digite a nova quantidade de dias de folga: ")

                print("\nResumo da alteração:")
                print(f"Nome: {escala_selecionada['nome']} -> {novo_nome}")
                print(f"Tipo: {tipo_formatado}")
                print(f"Dias trabalhados: {escala_selecionada['dias_trabalho']} -> {novos_dias_trabalho}")
                print(f"Dias de folga: {escala_selecionada['dias_folga']} -> {novos_dias_folga}")

                confirmacao = confirmar_acao("Deseja salvar essa alteração?")

                if confirmacao:
                    resultado = editar_escala(
                        indice,
                        novo_nome,
                        novos_dias_trabalho,
                        novos_dias_folga
                    )

                    if resultado == "sucesso":
                        print("Escala editada com sucesso!")

                        escala_editada = {
                            "nome": novo_nome,
                            "tipo": escala_selecionada.get("tipo", TIPO_ESCALA_PADRAO),
                            "dias_trabalho": novos_dias_trabalho,
                            "dias_folga": novos_dias_folga
                        }

                        if escala_atual == escala_selecionada:
                            escala_atual = escala_editada
                            print("A escala atual também foi atualizada.")

                    elif resultado == "indice_invalido":
                        print("Índice inválido.")

                    elif resultado == "nome_duplicado":
                        print("Já existe uma escala com esse nome.")

                    elif resultado == "configuracao_duplicada":
                        print("Já existe uma escala com essa configuração.")

                else:
                    print("Edição cancelada.")

        elif menu == "7":
            escalas = carregar_escalas()
            exibir_escalas_salvas(escalas)

            if escalas:
                indice = ler_indice_lista("Escolha uma escala para excluir: ", len(escalas))
                escala_removida = escalas[indice]
                nome_escala = escala_removida["nome"]

                confirmacao = confirmar_acao(
                    f"Tem certeza que deseja excluir a escala '{nome_escala}'?"
                )

                if confirmacao:
                    removido = remover_escala(indice)

                    if removido:
                        print(f"Escala '{nome_escala}' removida com sucesso!")

                        if escala_atual == escala_removida:
                            escala_atual = criar_escala_manual()
                            print("A escala atual foi redefinida para a escala manual padrão.")

                    else:
                        print("Não foi possível remover a escala.")

                else:
                    print("Exclusão cancelada.")

        elif menu == "8":
            print("Saindo...")
            break


if __name__ == "__main__":
    main()