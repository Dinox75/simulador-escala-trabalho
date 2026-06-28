from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1",
    tags=["Modelos"]
)


@router.get("/modelos")
def listar_modelos():
    return {
        "modelos": [
            {
                "id": "6x3",
                "nome": "Escala 6x3",
                "tipo": "ciclo_dias",
                "descricao": "Ciclo com 6 dias de trabalho e 3 dias de folga."
            },
            {
                "id": "5x2",
                "nome": "Escala 5x2",
                "tipo": "ciclo_dias",
                "descricao": "Ciclo com 5 dias de trabalho e 2 dias de folga."
            },
            {
                "id": "4x2",
                "nome": "Escala 4x2",
                "tipo": "ciclo_dias",
                "descricao": "Ciclo com 4 dias de trabalho e 2 dias de folga."
            },
            {
                "id": "12x36",
                "nome": "Escala 12x36",
                "tipo": "ciclo_horas",
                "descricao": "Ciclo com 12 horas de trabalho e 36 horas de folga."
            },
            {
                "id": "turno_rotativo_simples",
                "nome": "Turno rotativo simples",
                "tipo": "turno_rotativo",
                "descricao": "Sequência rotativa com turnos definidos manualmente."
            },
            {
                "id": "escala_real_24_dias",
                "nome": "Minha escala real 24 dias",
                "tipo": "turno_rotativo",
                "descricao": "Modelo de turno rotativo baseado em uma sequência de 24 dias."
            }
        ]
    }