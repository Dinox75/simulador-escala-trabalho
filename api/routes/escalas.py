from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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


class CriarEscalaRequest(BaseModel):
    nome: str
    tipo: str
    dias_trabalho: int | None = None
    dias_folga: int | None = None
    horas_trabalho: int | None = None
    horas_folga: int | None = None
    sequencia_turnos: list[str] | None = None


def obter_service():
    return criar_escala_service()

def obter_indice_escala_por_nome(escalas, nome):
    for indice, escala in enumerate(escalas):
        if escala.nome == nome:
            return indice

    return None

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

            return EscalaTurnoRotativo(
                payload.nome,
                payload.sequencia_turnos
            )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )


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
    service = obter_service()

    escala = service.buscar_escala_por_nome(nome)

    if escala is None:
        raise HTTPException(
            status_code=404,
            detail="Escala não encontrada."
        )

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