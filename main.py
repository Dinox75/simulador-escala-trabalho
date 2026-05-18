from escala import calcular_status, gerar_proximos_dias
from validacoes import ler_numero, ler_data, ler_opcao_menu

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

        menu = ler_opcao_menu("\nEscolha uma opção: ", ["1", "2", "3", "4"])

        if menu == "1":
            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")
            data_consulta = ler_data("Digite a data que deseja consultar (dd/mm/aaaa): ")

            status = calcular_status(
                data_inicio,
                data_consulta,
                dias_trabalho,
                dias_folga
            )

            print(f"\nNa data {data_consulta.strftime('%d/%m/%Y')}, você estará: {status}")

        elif menu == "2":

            data_inicio = ler_data("Digite a data inicial da escala (dd/mm/aaaa): ")

            quantidade_dias = ler_numero("Quantos dias deseja visualizar? ")

            proximos_dias = gerar_proximos_dias(
                data_inicio,
                quantidade_dias,
                dias_trabalho,
                dias_folga
            )

            for dia in proximos_dias:
                print(f"{dia['data'].strftime('%d/%m/%Y')}: {dia['status']}")

        elif menu == "3":
            novo_dias_trabalho = ler_numero("Quantos dias de trabalho? ")
            novo_dias_folga = ler_numero("Quantos dias de folga? ")

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