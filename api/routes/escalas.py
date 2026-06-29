from fastapi import APIRouter

from services.escala_service_factory import criar_escala_service


router = APIRouter(
    prefix="/api/v1",
    tags=["Escalas salvas"]
)


def obter_service():
    return criar_escala_service()


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