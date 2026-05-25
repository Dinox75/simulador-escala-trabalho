#Responsável por toda a interação com o usuário, exibindo menus e resultados de forma clara e organizada.

def formatar_status(status):
    if status == "Trabalhando":
        return "🟢 Trabalhando"

    elif status == "Folga":
        return "🌙 Folga"

    return status

def exibir_proximos_dias(proximos_dias):
    print("\n==== PRÓXIMOS DIAS ====")

    for dia in proximos_dias:
        data_formatada = dia['data'].strftime('%d/%m/%Y')
        status = formatar_status(dia["status"])

        print(f"{data_formatada}: {status}")

def exibir_menu(dias_trabalho, dias_folga):
    print("\n==== SIMULADOR DE ESCALAS ====")
    print(f"Escala atual: {dias_trabalho}x{dias_folga}")
    print("\n1 - Consultar uma data")
    print("2 - Ver próximos dias")
    print("3 - Alterar escala")
    print("4 - Ver escalas salvas")
    print("5 - Cadastrar nova escala")
    print("6 - Sair")

def exibir_resultado_consulta(data_consulta, status):
    data_formatada = data_consulta.strftime('%d/%m/%Y')
    status_formatado = formatar_status(status)
    print(f"\nNa data {data_formatada}, você estará: {status_formatado}")

def exibir_escala_alterada(dias_trabalho, dias_folga):
    print(f"\nEscala alterada para {dias_trabalho}x{dias_folga}.")

def exibir_escalas_salvas(escalas):
    if not escalas:
        print("\nNenhuma escala salva encontrada.")
        return

    print("\n==== ESCALAS SALVAS ====\n")

    for indice, escala in enumerate(escalas, start=1):
        nome = escala["nome"]
        dias_trabalho = escala["dias_trabalho"]
        dias_folga = escala["dias_folga"]

        print(f"{indice} - {nome}")
        print(f"    Dias trabalhados: {dias_trabalho}")
        print(f"    Dias de folga: {dias_folga}\n")