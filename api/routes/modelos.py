from fastapi import APIRouter

from tipos_escala import (
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Modelos"]
)


ESCALA_REAL_24_DIAS = [
    "Tarde", "Tarde", "Tarde",
    "Noite", "Noite", "Noite",
    "Folga", "Folga", "Folga",
    "Tarde", "Tarde", "Tarde",
    "Noite", "Noite", "Noite",
    "Folga", "Folga",
    "Manhã", "Manhã", "Manhã", "Manhã", "Manhã", "Manhã",
    "Folga"
]


@router.get("/modelos")
def listar_modelos():
    return {
        "modelos": [
            {
                "id": "6x3",
                "nome": "Escala 6x3",
                "tipo": TIPO_CICLO_DIAS,
                "descricao": "Ciclo com 6 dias de trabalho e 3 dias de folga.",
                "dias_trabalho": 6,
                "dias_folga": 3
            },
            {
                "id": "5x2",
                "nome": "Escala 5x2",
                "tipo": TIPO_CICLO_DIAS,
                "descricao": "Ciclo com 5 dias de trabalho e 2 dias de folga.",
                "dias_trabalho": 5,
                "dias_folga": 2
            },
            {
                "id": "4x2",
                "nome": "Escala 4x2",
                "tipo": TIPO_CICLO_DIAS,
                "descricao": "Ciclo com 4 dias de trabalho e 2 dias de folga.",
                "dias_trabalho": 4,
                "dias_folga": 2
            },
            {
                "id": "12x36",
                "nome": "Escala 12x36",
                "tipo": TIPO_CICLO_HORAS,
                "descricao": "Ciclo com 12 horas de trabalho e 36 horas de folga.",
                "horas_trabalho": 12,
                "horas_folga": 36
            },
            {
                "id": "turno_rotativo_simples",
                "nome": "Turno rotativo simples",
                "tipo": TIPO_TURNO_ROTATIVO,
                "descricao": "Sequência rotativa com turnos definidos manualmente.",
                "sequencia_turnos": [
                    "Manhã", "Manhã",
                    "Tarde", "Tarde",
                    "Noite", "Noite",
                    "Folga", "Folga"
                ]
            },
            {
                "id": "escala_real_24_dias",
                "nome": "Minha escala real 24 dias",
                "tipo": TIPO_TURNO_ROTATIVO,
                "descricao": "Modelo de turno rotativo baseado em uma sequência de 24 dias.",
                "sequencia_turnos": ESCALA_REAL_24_DIAS
            }
        ]
    }