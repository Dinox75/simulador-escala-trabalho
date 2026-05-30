#Responsável por toda a interação com o usuário, exibindo menus e resultados de forma clara e organizada.
from tipos_escala import obter_nome_tipo
from tipos_escala import TIPO_ESCALA_PADRAO, TIPO_CICLO_HORAS, obter_nome_tipo

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

def exibir_menu(resumo_escala):
    print("\n==== SIMULADOR DE ESCALAS ====")
    print(f"Escala atual: {resumo_escala}")
    print("\n1 - Consultar uma data")
    print("2 - Ver próximos dias")
    print("3 - Alterar escala")
    print("4 - Ver escalas salvas")
    print("5 - Cadastrar nova escala")
    print("6 - Editar escala salva")
    print("7 - Excluir escala salva")
    print("8 - Sair")

def exibir_resultado_consulta(data_consulta, status):
    data_formatada = data_consulta.strftime('%d/%m/%Y')
    status_formatado = formatar_status(status)
    print(f"\nNa data {data_formatada}, você estará: {status_formatado}")

def exibir_escala_alterada(dias_trabalho, dias_folga):
    print(f"\nEscala alterada para {dias_trabalho}x{dias_folga}.")

def formatar_resumo_escala(escala):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return f"{escala['horas_trabalho']}x{escala['horas_folga']} horas"

    return f"{escala['dias_trabalho']}x{escala['dias_folga']} dias"

def exibir_escalas_salvas(escalas):
    if not escalas:
        print("\nNenhuma escala salva.")
        return

    print("\n==== ESCALAS SALVAS ====")

    for indice, escala in enumerate(escalas, start=1):
        tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)
        tipo_formatado = obter_nome_tipo(tipo)
        resumo = formatar_resumo_escala(escala)

        print(f"{indice} - {escala['nome']} | {tipo_formatado} | {resumo}")