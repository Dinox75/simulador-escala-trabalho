from fastapi import FastAPI

from api.routes.health import router as health_router
from api.routes.modelos import router as modelos_router


app = FastAPI(
    title="Simulador de Escala de Trabalho API",
    description="API inicial do projeto Simulador de Escala de Trabalho.",
    version="0.11.0"
)


app.include_router(health_router)
app.include_router(modelos_router)