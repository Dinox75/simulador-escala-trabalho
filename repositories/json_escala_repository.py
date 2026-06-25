import json
from pathlib import Path

from models.escala_factory import (
    converter_escalas_para_objetos,
    converter_escalas_para_dict
)
from repositories.escala_repository import EscalaRepository

class JsonEscalaRepository(EscalaRepository):
    def __init__(self, caminho_arquivo="data/escalas.json"):
        self.caminho_arquivo = Path(caminho_arquivo)

    def listar(self):
        dados = self._carregar_dados()
        return converter_escalas_para_objetos(dados)

    def salvar_todos(self, escalas):
        dados = converter_escalas_para_dict(escalas)
        self._salvar_dados(dados)

    def adicionar(self, escala):
        escalas = self.listar()
        escalas.append(escala)
        self.salvar_todos(escalas)

    def buscar_por_nome(self, nome):
        escalas = self.listar()

        for escala in escalas:
            if escala.nome == nome:
                return escala

        return None

    def excluir_por_nome(self, nome):
        escalas = self.listar()
        escalas_filtradas = [
            escala for escala in escalas
            if escala.nome != nome
        ]

        if len(escalas_filtradas) == len(escalas):
            return False

        self.salvar_todos(escalas_filtradas)
        return True

    def _carregar_dados(self):
        if not self.caminho_arquivo.exists():
            return []

        with open(self.caminho_arquivo, "r", encoding="utf-8") as arquivo:
            try:
                dados = json.load(arquivo)
            except json.JSONDecodeError:
                return []

        if not isinstance(dados, list):
            return []

        return dados

    def _salvar_dados(self, dados):
        self.caminho_arquivo.parent.mkdir(parents=True, exist_ok=True)

        with open(self.caminho_arquivo, "w", encoding="utf-8") as arquivo:
            json.dump(dados, arquivo, ensure_ascii=False, indent=4)