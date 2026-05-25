from escala import calcular_status, gerar_proximos_dias
from validacoes import ler_numero, ler_data, ler_opcao_menu, ler_indice_lista, ler_texto
from interface import (
    exibir_menu,
    exibir_proximos_dias,
    exibir_resultado_consulta,
    exibir_escala_alterada,
    exibir_escalas_salvas
)
from armazenamento import carregar_escalas, adicionar_escala


def main():
    dias_trabalho = 6
    dias_folga = 3

    while True:
        exibir_menu(dias_trabalho, dias_folga)

        menu = ler_opcao_menu("\nEscolha uma opção: ", ["1", "2", "3", "4", "5", "6"])

        if menu == "1":
            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")
            data_consulta = ler_data("Digite a data que deseja consultar (dd/mm/aaaa): ")

            status = calcular_status(
                data_inicio,
                data_consulta,
                dias_trabalho,
                dias_folga
            )

            exibir_resultado_consulta(data_consulta, status)

        elif menu == "2":

            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")

            quantidade_dias = ler_numero("Quantos dias deseja visualizar? ")

            proximos_dias = gerar_proximos_dias(
                data_inicio,
                quantidade_dias,
                dias_trabalho,
                dias_folga
            )

            exibir_proximos_dias(proximos_dias)

        elif menu == "3":
            novo_dias_trabalho = ler_numero("Quantos dias de trabalho? ")
            novo_dias_folga = ler_numero("Quantos dias de folga? ")

            dias_trabalho = novo_dias_trabalho
            dias_folga = novo_dias_folga

            exibir_escala_alterada(dias_trabalho, dias_folga)

        elif menu == "4":
            escalas = carregar_escalas()
            exibir_escalas_salvas(escalas)

            if escalas:
                indice = ler_indice_lista("Escolha uma escala para usar: ", len(escalas))
                escala_escolhida = escalas[indice]

                dias_trabalho = escala_escolhida["dias_trabalho"]
                dias_folga = escala_escolhida["dias_folga"]

                exibir_escala_alterada(dias_trabalho, dias_folga)

        elif menu == "5":
            nome = ler_texto("Digite o nome da escala: ")
            dias_trabalho = ler_numero("Digite a quantidade de dias trabalhados: ")
            dias_folga = ler_numero("Digite a quantidade de dias de folga: ")

            cadastro_realizado = adicionar_escala(nome, dias_trabalho, dias_folga)

            if cadastro_realizado:
                print("Escala cadastrada com sucesso!")
            else:
                print(f"A escala '{nome}' já existe.")

        elif menu == "6":
            print("Volte sempre!")
            break

if __name__ == "__main__":
    main()