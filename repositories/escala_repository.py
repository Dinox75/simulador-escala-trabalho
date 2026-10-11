from abc import ABC, abstractmethod


class EscalaRepositoryError(RuntimeError):
    """Erro de leitura ou gravação na camada de persistência de escalas."""


class EscalaRepository(ABC):
    @abstractmethod
    def listar(self):
        pass

    @abstractmethod
    def salvar_todos(self, escalas):
        pass

    @abstractmethod
    def adicionar(self, escala):
        pass

    @abstractmethod
    def buscar_por_nome(self, nome):
        pass

    @abstractmethod
    def atualizar_por_nome(self, nome, nova_escala):
        pass

    @abstractmethod
    def excluir_por_nome(self, nome):
        pass
