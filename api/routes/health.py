from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def verificar_saude_api():
    return {
        "status": "ok",
        "message": "API do Simulador de Escala de Trabalho funcionando",
        "version": "0.12.0"
    }