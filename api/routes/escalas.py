from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from escala import calcular_status_por_escala
from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo
from services.escala_service_factory import criar_escala_service
from tipos_escala import (
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO,
    validar_tipo_escala,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Escalas salvas"]
)

MAX_CYCLE_LENGTH = 120
MAX_SEQUENCE_LENGTH = 60


class CriarEscalaRequest(BaseModel):
    nome: str
    tipo: str
    dias_trabalho: int | None = None
    dias_folga: int | None = None
    horas_trabalho: int | None = None
    horas_folga: int | None = None
    sequencia_turnos: list[str] | None = None


class ConsultaEscalaSalvaStatusRequest(BaseModel):
    data_inicio: str
    data_consulta: str
    hora_inicio: str | None = None
    hora_consulta: str | None = None


class ConsultaEscalaSalvaProximosDiasRequest(BaseModel):
    data_inicio: str
    data_consulta: str | None = None
    quantidade_dias: int = Field(ge=1, le=60)
    hora_inicio: str | None = None
    hora_consulta: str | None = None


def obter_service():
    return criar_escala_service()


def obter_indice_escala_por_nome(escalas, nome):
    for indice, escala in enumerate(escalas):
        if escala.nome == nome:
            return indice

    return None


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


def buscar_escala_salva_ou_404(nome: str):
    service = obter_service()
    escala = service.buscar_escala_por_nome(nome)

    if escala is None:
        raise HTTPException(
            status_code=404,
            detail="Escala não encontrada."
        )

    return escala


def criar_escala_a_partir_payload(payload: CriarEscalaRequest):
    if not validar_tipo_escala(payload.tipo):
        raise HTTPException(
            status_code=400,
            detail="Tipo de escala inválido."
        )

    try:
        if payload.tipo == TIPO_CICLO_DIAS:
            if payload.dias_trabalho is None or payload.dias_folga is None:
                raise HTTPException(
                    status_code=400,
                    detail="Para ciclo_dias, informe dias_trabalho e dias_folga."
                )

            if payload.dias_trabalho + payload.dias_folga > MAX_CYCLE_LENGTH:
                raise HTTPException(
                    status_code=400,
                    detail=f"O ciclo por dias não pode exceder {MAX_CYCLE_LENGTH} dias."
                )

            return EscalaCicloDias(
                payload.nome,
                payload.dias_trabalho,
                payload.dias_folga
            )

        if payload.tipo == TIPO_CICLO_HORAS:
            if payload.horas_trabalho is None or payload.horas_folga is None:
                raise HTTPException(
                    status_code=400,
                    detail="Para ciclo_horas, informe horas_trabalho e horas_folga."
                )

            if payload.horas_trabalho + payload.horas_folga > MAX_CYCLE_LENGTH:
                raise HTTPException(
                    status_code=400,
                    detail=f"O ciclo por horas não pode exceder {MAX_CYCLE_LENGTH} horas."
                )

            return EscalaCicloHoras(
                payload.nome,
                payload.horas_trabalho,
                payload.horas_folga
            )

        if payload.tipo == TIPO_TURNO_ROTATIVO:
            if not payload.sequencia_turnos:
                raise HTTPException(
                    status_code=400,
                    detail="Para turno_rotativo, informe sequencia_turnos."
                )

            if len(payload.sequencia_turnos) > MAX_SEQUENCE_LENGTH:
                raise HTTPException(
                    status_code=400,
                    detail=f"A sequência não pode exceder {MAX_SEQUENCE_LENGTH} turnos."
                )

            return EscalaTurnoRotativo(
                payload.nome,
                payload.sequencia_turnos
            )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )


def calcular_status_escala_salva(escala, payload: ConsultaEscalaSalvaStatusRequest):
    dados_escala = escala.to_dict()
    tipo = dados_escala["tipo"]

    if tipo == TIPO_CICLO_HORAS:
        if not payload.hora_inicio or not payload.hora_consulta:
            raise HTTPException(
                status_code=400,
                detail="Para ciclo_horas, informe hora_inicio e hora_consulta no formato HH:MM."
            )

        data_inicio = converter_data_hora(payload.data_inicio, payload.hora_inicio)
        data_consulta = converter_data_hora(payload.data_consulta, payload.hora_consulta)

    else:
        data_inicio = converter_data(payload.data_inicio)
        data_consulta = converter_data(payload.data_consulta)

    return calcular_status_por_escala(
        dados_escala,
        data_inicio,
        data_consulta
    )


def gerar_proximos_dias_escala_salva(
    escala,
    payload: ConsultaEscalaSalvaProximosDiasRequest
):
    dados_escala = escala.to_dict()
    tipo = dados_escala["tipo"]
    dias = []

    if tipo == TIPO_CICLO_HORAS:
        if not payload.hora_inicio:
            raise HTTPException(
                status_code=400,
                detail="Para ciclo_horas, informe hora_inicio no formato HH:MM."
            )

        hora_consulta = payload.hora_consulta or payload.hora_inicio

        data_inicio = converter_data_hora(payload.data_inicio, payload.hora_inicio)
        data_consulta_base = converter_data_hora(
            payload.data_consulta or payload.data_inicio,
            hora_consulta
        )

        for indice in range(payload.quantidade_dias):
            data_consulta = data_consulta_base + timedelta(days=indice)

            status = calcular_status_por_escala(
                dados_escala,
                data_inicio,
                data_consulta
            )

            dias.append({
                "data": data_consulta.strftime("%d/%m/%Y"),
                "hora_consulta": data_consulta.strftime("%H:%M"),
                "status": status
            })

        return dias

    data_inicio = converter_data(payload.data_inicio)
    data_consulta_base = converter_data(payload.data_consulta or payload.data_inicio)

    for indice in range(payload.quantidade_dias):
        data_consulta = data_consulta_base + timedelta(days=indice)

        status = calcular_status_por_escala(
            dados_escala,
            data_inicio,
            data_consulta
        )

        dias.append({
            "data": data_consulta.strftime("%d/%m/%Y"),
            "status": status
        })

    return dias


@router.get("/escalas")
def listar_escalas_salvas():
    service = obter_service()
    escalas = service.listar_escalas()

    return {
        "total": len(escalas),
        "escalas": [
            escala.to_dict()
            for escala in escalas
        ]
    }


@router.post("/escalas", status_code=201)
def criar_escala(payload: CriarEscalaRequest):
    service = obter_service()
    escala = criar_escala_a_partir_payload(payload)

    resultado = service.adicionar_escala(escala)

    if resultado == "nome_duplicado":
        raise HTTPException(
            status_code=409,
            detail="Já existe uma escala salva com esse nome."
        )

    if resultado == "configuracao_duplicada":
        raise HTTPException(
            status_code=409,
            detail="Já existe uma escala salva com essa configuração."
        )

    return {
        "message": "Escala criada com sucesso.",
        "escala": escala.to_dict()
    }


@router.delete("/escalas/{nome}")
def excluir_escala(nome: str):
    service = obter_service()

    resultado = service.excluir_escala_por_nome(nome)

    if resultado == "nao_encontrada":
        raise HTTPException(
            status_code=404,
            detail="Escala não encontrada."
        )

    return {
        "message": "Escala excluída com sucesso.",
        "nome": nome
    }


@router.get("/escalas/{nome}")
def buscar_escala_por_nome(nome: str):
    escala = buscar_escala_salva_ou_404(nome)

    return {
        "escala": escala.to_dict()
    }


@router.put("/escalas/{nome}")
def editar_escala(nome: str, payload: CriarEscalaRequest):
    service = obter_service()
    escalas = service.listar_escalas()

    indice = obter_indice_escala_por_nome(escalas, nome)

    if indice is None:
        raise HTTPException(
            status_code=404,
            detail="Escala não encontrada."
        )

    nova_escala = criar_escala_a_partir_payload(payload)

    resultado = service.editar_escala_por_indice(indice, nova_escala)

    if resultado == "nome_duplicado":
        raise HTTPException(
            status_code=409,
            detail="Já existe uma escala salva com esse nome."
        )

    if resultado == "configuracao_duplicada":
        raise HTTPException(
            status_code=409,
            detail="Já existe uma escala salva com essa configuração."
        )

    if resultado == "indice_invalido":
        raise HTTPException(
            status_code=404,
            detail="Escala não encontrada."
        )

    return {
        "message": "Escala editada com sucesso.",
        "escala": nova_escala.to_dict()
    }


@router.post("/escalas/{nome}/simulacao/status")
def consultar_status_escala_salva(
    nome: str,
    payload: ConsultaEscalaSalvaStatusRequest
):
    escala = buscar_escala_salva_ou_404(nome)
    status = calcular_status_escala_salva(escala, payload)
    dados_escala = escala.to_dict()

    return {
        "escala_nome": escala.nome,
        "tipo": dados_escala["tipo"],
        "data_inicio": payload.data_inicio,
        "data_consulta": payload.data_consulta,
        "status": status
    }


@router.post("/escalas/{nome}/simulacao/proximos-dias")
def consultar_proximos_dias_escala_salva(
    nome: str,
    payload: ConsultaEscalaSalvaProximosDiasRequest
):
    escala = buscar_escala_salva_ou_404(nome)
    dias = gerar_proximos_dias_escala_salva(escala, payload)
    dados_escala = escala.to_dict()

    return {
        "escala_nome": escala.nome,
        "tipo": dados_escala["tipo"],
        "data_inicio": payload.data_inicio,
        "quantidade_dias": payload.quantidade_dias,
        "dias": dias
    }
