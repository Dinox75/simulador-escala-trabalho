from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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


def obter_modelos_disponiveis():
    return {
        "6x3": criar_modelo_6x3,
        "5x2": criar_modelo_5x2,
        "4x2": criar_modelo_4x2,
        "12x36": criar_modelo_12x36,
        "turno_rotativo_simples": criar_modelo_turno_rotativo_simples,
        "escala_real_24_dias": criar_modelo_escala_real_24_dias,
    }


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
    modelos_disponiveis = obter_modelos_disponiveis()

    if payload.modelo_id not in modelos_disponiveis:
        raise HTTPException(
            status_code=404,
            detail="Modelo de escala não encontrado."
        )

    escala = modelos_disponiveis[payload.modelo_id]()

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