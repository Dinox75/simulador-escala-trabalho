from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)

from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo


def criar_escala_a_partir_de_dict(dados):
    tipo = dados.get("tipo", TIPO_ESCALA_PADRAO)

    if tipo == TIPO_CICLO_HORAS:
        return EscalaCicloHoras.from_dict(dados)

    if tipo == TIPO_TURNO_ROTATIVO:
        return EscalaTurnoRotativo.from_dict(dados)

    return EscalaCicloDias.from_dict(dados)


def converter_escalas_para_objetos(lista_escalas):
    return [
        criar_escala_a_partir_de_dict(escala)
        for escala in lista_escalas
    ]


def converter_escalas_para_dict(lista_escalas):
    return [
        escala.to_dict()
        for escala in lista_escalas
    ]