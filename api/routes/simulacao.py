from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from escala import calcular_status_por_escala
from modelos_escala import (
    criar_modelo_6x3,
    criar_modelo_5x2,
    criar_modelo_4x2,
    criar_modelo_12x36,
    criar_modelo_turno_rotativo_simples,
    criar_modelo_escala_real_24_dias,
)


router = APIRouter(
    prefix="/api/v1/simulacao",
    tags=["Simulação"]
)


class ConsultaStatusRequest(BaseModel):
    modelo_id: str
    data_inicio: str
    data_consulta: str
    hora_inicio: str | None = None
    hora_consulta: str | None = None


class ProximosDiasRequest(BaseModel):
    modelo_id: str
    data_inicio: str
    quantidade_dias: int = Field(ge=1, le=60)
    hora_inicio: str | None = None
    hora_consulta: str | None = None


def obter_modelos_disponiveis():
    return {
        "6x3": criar_modelo_6x3,
        "5x2": criar_modelo_5x2,
        "4x2": criar_modelo_4x2,
        "12x36": criar_modelo_12x36,
        "turno_rotativo_simples": criar_modelo_turno_rotativo_simples,
        "escala_real_24_dias": criar_modelo_escala_real_24_dias,
    }


def obter_escala_por_modelo(modelo_id: str):
    modelos_disponiveis = obter_modelos_disponiveis()

    if modelo_id not in modelos_disponiveis:
        raise HTTPException(
            status_code=404,
            detail="Modelo de escala não encontrado."
        )

    return modelos_disponiveis[modelo_id]()


def converter_data(data_texto: str):
    try:
        return datetime.strptime(data_texto, "%d/%m/%Y")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Data inválida. Use o formato dd/mm/aaaa."
        )


def converter_data_hora(data_texto: str, hora_texto: str):
    try:
        return datetime.strptime(f"{data_texto} {hora_texto}", "%d/%m/%Y %H:%M")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Data ou hora inválida. Use data dd/mm/aaaa e hora HH:MM."
        )


@router.post("/status")
def consultar_status(payload: ConsultaStatusRequest):
    escala = obter_escala_por_modelo(payload.modelo_id)

    if payload.modelo_id == "12x36":
        if not payload.hora_inicio or not payload.hora_consulta:
            raise HTTPException(
                status_code=400,
                detail="Para escala 12x36, informe hora_inicio e hora_consulta no formato HH:MM."
            )

        data_inicio = converter_data_hora(payload.data_inicio, payload.hora_inicio)
        data_consulta = converter_data_hora(payload.data_consulta, payload.hora_consulta)

    else:
        data_inicio = converter_data(payload.data_inicio)
        data_consulta = converter_data(payload.data_consulta)

    status = calcular_status_por_escala(
        escala,
        data_inicio,
        data_consulta
    )

    return {
        "modelo_id": payload.modelo_id,
        "modelo_nome": escala["nome"],
        "tipo": escala["tipo"],
        "data_inicio": payload.data_inicio,
        "data_consulta": payload.data_consulta,
        "status": status
    }


@router.post("/proximos-dias")
def consultar_proximos_dias(payload: ProximosDiasRequest):
    escala = obter_escala_por_modelo(payload.modelo_id)

    dias = []

    if payload.modelo_id == "12x36":
        if not payload.hora_inicio:
            raise HTTPException(
                status_code=400,
                detail="Para escala 12x36, informe hora_inicio no formato HH:MM."
            )

        hora_consulta = payload.hora_consulta or payload.hora_inicio

        data_inicio = converter_data_hora(payload.data_inicio, payload.hora_inicio)
        data_consulta_base = converter_data_hora(payload.data_inicio, hora_consulta)

        for indice in range(payload.quantidade_dias):
            data_consulta = data_consulta_base + timedelta(days=indice)

            status = calcular_status_por_escala(
                escala,
                data_inicio,
                data_consulta
            )

            dias.append({
                "data": data_consulta.strftime("%d/%m/%Y"),
                "hora_consulta": data_consulta.strftime("%H:%M"),
                "status": status
            })

    else:
        data_inicio = converter_data(payload.data_inicio)

        for indice in range(payload.quantidade_dias):
            data_consulta = data_inicio + timedelta(days=indice)

            status = calcular_status_por_escala(
                escala,
                data_inicio,
                data_consulta
            )

            dias.append({
                "data": data_consulta.strftime("%d/%m/%Y"),
                "status": status
            })

    return {
        "modelo_id": payload.modelo_id,
        "modelo_nome": escala["nome"],
        "tipo": escala["tipo"],
        "data_inicio": payload.data_inicio,
        "quantidade_dias": payload.quantidade_dias,
        "dias": dias
    }