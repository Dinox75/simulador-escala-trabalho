from escala import calcular_status, gerar_proximos_dias
from validacoes import ler_numero, ler_data, ler_opcao_menu, ler_indice_lista, ler_texto
from interface import (
    exibir_menu,
    exibir_proximos_dias,
    exibir_resultado_consulta,
    exibir_escala_alterada,
    exibir_escalas_salvas
)
from armazenamento import carregar_escalas, adicionar_escala, remover_escala


def main():
    dias_trabalho = 6
    dias_folga = 3

    while True:
        exibir_menu(dias_trabalho, dias_folga)

        menu = ler_opcao_menu("\nEscolha uma opção: ", ["1", "2", "3", "4", "5", "6", "7"])

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
                indice = ler_indice_lista("Escolha uma escala para excluir: ", len(escalas))
                nome_escala = escalas[indice]["nome"]

                confirmacao = input(f"Tem certeza que deseja excluir a escala '{nome_escala}'? [s/n]: ").lower().strip()

                if confirmacao == "s":
                    removido = remover_escala(indice)

                    if removido:
                        print(f"Escala '{nome_escala}' removida com sucesso!")
                    else:
                        print("Não foi possível remover a escala.")
                else:
                    print("Exclusão cancelada.")

        elif menu == "7":
            print("Saindo...")
            break

if __name__ == "__main__":
    main()