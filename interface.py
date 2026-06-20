#Responsável por toda a interação com o usuário, exibindo menus e resultados de forma clara e organizada.
from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    obter_nome_tipo
)

def formatar_status(status):
    status_formatado = {
        "Trabalhando": "🟢 Trabalhando",
        "Folga": "💤 Folga",
        "Manhã": "🌅 Manhã",
        "Tarde": "🌇 Tarde",
        "Noite": "🌙 Noite"
    }

    return status_formatado.get(status, status)

def exibir_proximos_dias(proximos_dias):
    print("\n==== PRÓXIMOS PERÍODOS ====")

    for dia in proximos_dias:
        data_formatada = dia['data'].strftime('%d/%m/%Y')
        status = formatar_status(dia["status"])

        print(f"{data_formatada}: {status}")

def exibir_menu(resumo_escala):
    print("\n==== SIMULADOR DE ESCALAS ====")
    print(f"Escala atual: {resumo_escala}")
    print("\n1 - Consultar status")
    print("2 - Ver próximos dias/períodos")
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

def exibir_resultado_consulta_por_tipo(data_consulta, status, tipo):
    status_formatado = formatar_status(status)

    if tipo == TIPO_CICLO_HORAS:
        data_formatada = data_consulta.strftime("%d/%m/%Y %H:%M")
        print(f"\nNa data e hora {data_formatada}, você estará: {status_formatado}")
    else:
        data_formatada = data_consulta.strftime("%d/%m/%Y")
        print(f"\nNa data {data_formatada}, você estará: {status_formatado}")

def exibir_proximos_periodos(periodos):
    print("\n==== PRÓXIMOS PERÍODOS ====")

    for periodo in periodos:
        inicio = periodo["inicio"].strftime("%d/%m/%Y %H:%M")
        fim = periodo["fim"].strftime("%d/%m/%Y %H:%M")
        status = periodo["status"]

        print(f"{inicio} até {fim}: {status}")