from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.health import router as health_router
from api.routes.modelos import router as modelos_router
from api.routes.simulacao import router as simulacao_router
from api.routes.escalas import router as escalas_router


app = FastAPI(
    title="Simulador de Escala de Trabalho API",
    description="API do projeto Simulador de Escala de Trabalho.",
    version="0.14.0"
)


origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "https://dinox75.github.io",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(modelos_router)
app.include_router(simulacao_router)
app.include_router(escalas_router)