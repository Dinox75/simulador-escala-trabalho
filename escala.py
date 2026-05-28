# Responsável pela lógica da escala.
from datetime import timedelta
from tipos_escala import TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_ESCALA_PADRAO

def calcular_status(data_inicio, data_consulta, dias_trabalho, dias_folga):
    ciclo = dias_trabalho + dias_folga

    dias_passados = (data_consulta - data_inicio).days

    posicao_ciclo = dias_passados % ciclo

    if posicao_ciclo < dias_trabalho:
        return "Trabalhando"
    else:
        return "Folga"
    
def calcular_status_ciclo_horas(data_hora_inicio, data_hora_consulta, horas_trabalho, horas_folga):
    ciclo_horas = horas_trabalho + horas_folga

    horas_passadas = (data_hora_consulta - data_hora_inicio).total_seconds() / 3600

    posicao_ciclo = horas_passadas % ciclo_horas

    if posicao_ciclo < horas_trabalho:
        return "Trabalhando"
    else:
        return "Folga"
    
def gerar_proximos_periodos_ciclo_horas(data_hora_inicio, quantidade_periodos, horas_trabalho, horas_folga):
    periodos = []
    inicio_periodo = data_hora_inicio

    for indice in range(quantidade_periodos):
        if indice % 2 == 0:
            duracao_horas = horas_trabalho
            status = "Trabalhando"
        else:
            duracao_horas = horas_folga
            status = "Folga"

        fim_periodo = inicio_periodo + timedelta(hours=duracao_horas)

        periodos.append({
            "inicio": inicio_periodo,
            "fim": fim_periodo,
            "status": status
        })

        inicio_periodo = fim_periodo

    return periodos
    
def calcular_status_por_escala(escala, data_inicio, data_consulta):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_DIAS:
        return calcular_status(
            data_inicio,
            data_consulta,
            escala["dias_trabalho"],
            escala["dias_folga"]
        )

    if tipo == TIPO_CICLO_HORAS:
        return calcular_status_ciclo_horas(
            data_inicio,
            data_consulta,
            escala["horas_trabalho"],
            escala["horas_folga"]
        )

    raise NotImplementedError("Tipo de escala ainda não implementado no cálculo.")

def gerar_proximos_dias(data_inicio, quantidade_dias, dias_trabalho, dias_folga):
    result = []

    for dia in range(quantidade_dias):
        data_atual = data_inicio + timedelta(days=dia)

        status = calcular_status(
            data_inicio,
            data_atual,
            dias_trabalho,
            dias_folga
        )
        result.append({
            "data": data_atual,
            "status": status
        })

    return result

def gerar_proximos_dias_por_escala(escala, data_inicio, quantidade_dias):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_DIAS:
        return gerar_proximos_dias(
            data_inicio,
            quantidade_dias,
            escala["dias_trabalho"],
            escala["dias_folga"]
        )

    raise NotImplementedError("Tipo de escala ainda não implementado na geração de próximos dias.")

def gerar_proximos_periodos_por_escala(escala, data_hora_inicio, quantidade_periodos):
    tipo = escala.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return gerar_proximos_periodos_ciclo_horas(
            data_hora_inicio,
            quantidade_periodos,
            escala["horas_trabalho"],
            escala["horas_folga"]
        )

    raise NotImplementedError("Tipo de escala ainda não implementado para geração de períodos.")
