from escala import converter_data, calcular_status, gerar_proximos_dias


def ler_numero(mensagem):
    try:
        numero = int(input(mensagem))
        return numero
    except ValueError:
        print("Digite apenas números.")
        return None


def main():
    dias_trabalho = 6
    dias_folga = 3

    while True:
        print("\n==== SIMULADOR DE ESCALAS ====")
        print(f"Escala atual: {dias_trabalho}x{dias_folga}")
        print("\n1 - Consultar uma data")
        print("2 - Ver próximos dias")
        print("3 - Alterar escala")
        print("4 - Sair")

        menu = input("\nEscolha uma opção: ")

        if menu == "1":
            data_inicio_texto = input("Digite a data inicial da escala (dd/mm/aaaa): ")
            data_consulta_texto = input("Digite a data que deseja consultar (dd/mm/aaaa): ")

            data_inicio = converter_data(data_inicio_texto)
            data_consulta = converter_data(data_consulta_texto)

            if data_inicio is None or data_consulta is None:
                print("Data inválida. Use o formato dd/mm/aaaa.")
                continue

            status = calcular_status(
                data_inicio,
                data_consulta,
                dias_trabalho,
                dias_folga
            )

            print(f"\nNa data {data_consulta.strftime('%d/%m/%Y')}, você estará: {status}")

        elif menu == "2":
            data_inicio_texto = input("Digite a data inicial da escala (dd/mm/aaaa): ")
            data_inicio = converter_data(data_inicio_texto)

            if data_inicio is None:
                print("Data inválida. Use o formato dd/mm/aaaa.")
                continue

            quantidade_dias = ler_numero("Quantos dias deseja visualizar? ")

            if quantidade_dias is None or quantidade_dias <= 0:
                print("Informe uma quantidade de dias válida.")
                continue

            gerar_proximos_dias(
                data_inicio,
                quantidade_dias,
                dias_trabalho,
                dias_folga
            )

        elif menu == "3":
            novo_dias_trabalho = ler_numero("Quantos dias de trabalho? ")
            novo_dias_folga = ler_numero("Quantos dias de folga? ")

            if (
                novo_dias_trabalho is None
                or novo_dias_folga is None
                or novo_dias_trabalho <= 0
                or novo_dias_folga <= 0
            ):
                print("Informe valores válidos para a escala.")
                continue

            dias_trabalho = novo_dias_trabalho
            dias_folga = novo_dias_folga

            print(f"Escala alterada para {dias_trabalho}x{dias_folga}.")

        elif menu == "4":
            print("Volte sempre!")
            break

        else:
            print("Favor inserir uma opção válida entre 1 e 4!")


if __name__ == "__main__":
    main()