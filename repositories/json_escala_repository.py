import json
import os
import tempfile
from pathlib import Path

from models.escala_factory import (
    converter_escalas_para_dict,
    converter_escalas_para_objetos,
)
from repositories.escala_repository import EscalaRepository, EscalaRepositoryError
from tipos_escala import TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO


TIPOS_ESCALA = {TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO}


class JsonEscalaRepository(EscalaRepository):
    def __init__(self, caminho_arquivo="data/escalas.json"):
        self.caminho_arquivo = Path(caminho_arquivo)

    def listar(self):
        return converter_escalas_para_objetos(self._carregar_dados())

    def salvar_todos(self, escalas):
        # A replacement request must not erase an unreadable or incompatible file.
        self._carregar_dados()
        dados = converter_escalas_para_dict(escalas)
        self._salvar_dados(dados)

    def adicionar(self, escala):
        escalas = self.listar()
        escalas.append(escala)
        self.salvar_todos(escalas)

    def buscar_por_nome(self, nome):
        return next((escala for escala in self.listar() if escala.nome == nome), None)

    def atualizar_por_nome(self, nome, nova_escala):
        escalas = self.listar()
        indice = next((i for i, escala in enumerate(escalas) if escala.nome == nome), None)
        if indice is None:
            return False
        escalas[indice] = nova_escala
        self.salvar_todos(escalas)
        return True

    def excluir_por_nome(self, nome):
        escalas = self.listar()
        filtradas = [escala for escala in escalas if escala.nome != nome]
        if len(filtradas) == len(escalas):
            return False
        self.salvar_todos(filtradas)
        return True

    def _carregar_dados(self):
        try:
            self.caminho_arquivo.stat()
        except FileNotFoundError:
            return []
        except OSError as erro:
            raise EscalaRepositoryError(
                f"Não foi possível acessar o arquivo de escalas: {erro}"
            ) from erro

        try:
            with self.caminho_arquivo.open("r", encoding="utf-8") as arquivo:
                dados = json.load(arquivo)
        except (json.JSONDecodeError, UnicodeDecodeError) as erro:
            raise EscalaRepositoryError(
                f"Arquivo JSON de escalas inválido: {erro}"
            ) from erro
        except OSError as erro:
            raise EscalaRepositoryError(
                f"Não foi possível ler o arquivo de escalas: {erro}"
            ) from erro

        if not isinstance(dados, list):
            raise EscalaRepositoryError(
                "O arquivo JSON de escalas deve conter uma lista."
            )

        for indice, item in enumerate(dados):
            if not isinstance(item, dict):
                raise EscalaRepositoryError(
                    f"Registro de escala inválido no índice {indice}: esperado objeto."
                )
            tipo = item.get("tipo", TIPO_CICLO_DIAS)
            if tipo not in TIPOS_ESCALA:
                raise EscalaRepositoryError(
                    f"Tipo de escala inválido no índice {indice}: {tipo!r}."
                )

        try:
            converter_escalas_para_objetos(dados)
        except (KeyError, TypeError, ValueError) as erro:
            raise EscalaRepositoryError(
                f"Configuração de escala inválida no arquivo JSON: {erro}"
            ) from erro
        return dados

    def _salvar_dados(self, dados):
        caminho_temporario = None
        try:
            self.caminho_arquivo.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=self.caminho_arquivo.parent,
                prefix=f".{self.caminho_arquivo.name}.",
                suffix=".tmp",
                delete=False,
            ) as arquivo:
                caminho_temporario = Path(arquivo.name)
                json.dump(dados, arquivo, ensure_ascii=False, indent=4)
                arquivo.flush()
                os.fsync(arquivo.fileno())
            os.replace(caminho_temporario, self.caminho_arquivo)
        except (OSError, TypeError, ValueError) as erro:
            if caminho_temporario is not None:
                try:
                    caminho_temporario.unlink(missing_ok=True)
                except OSError:
                    pass
            raise EscalaRepositoryError(
                f"Não foi possível salvar o arquivo JSON de escalas: {erro}"
            ) from erro
