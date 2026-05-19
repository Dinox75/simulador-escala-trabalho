#Responsável por toda a interação com o usuário, exibindo menus e resultados de forma clara e organizada.

def exibir_proximos_dias(proximos_dias):
    print("\n==== PRÓXIMOS DIAS ====")

    for dia in proximos_dias:
        data_formatada = dia['data'].strftime('%d/%m/%Y')
        status = dia['status']

        print(f"{data_formatada}: {status}")

def exibir_menu(dias_trabalho, dias_folga):
    print("\n==== SIMULADOR DE ESCALAS ====")
    print(f"Escala atual: {dias_trabalho}x{dias_folga}")
    print("\n1 - Consultar uma data")
    print("2 - Ver próximos dias")
    print("3 - Alterar escala")
    print("4 - Sair")