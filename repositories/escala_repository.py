from abc import ABC, abstractmethod


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
    def excluir_por_nome(self, nome):
        pass