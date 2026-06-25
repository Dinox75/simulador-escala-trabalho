from tipos_escala import TIPO_TURNO_ROTATIVO


class EscalaTurnoRotativo:
    def __init__(self, nome, sequencia_turnos):
        self.nome = nome
        self.sequencia_turnos = sequencia_turnos
        self.tipo = TIPO_TURNO_ROTATIVO

    def obter_resumo(self):
        return " -> ".join(self.sequencia_turnos)

    def obter_total_dias_ciclo(self):
        return len(self.sequencia_turnos)

    def to_dict(self):
        return {
            "nome": self.nome,
            "tipo": self.tipo,
            "sequencia_turnos": self.sequencia_turnos
        }

    @classmethod
    def from_dict(cls, dados):
        return cls(
            dados["nome"],
            dados["sequencia_turnos"]
        )