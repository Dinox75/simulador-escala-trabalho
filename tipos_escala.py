TIPO_CICLO_DIAS = "ciclo_dias"
TIPO_CICLO_HORAS = "ciclo_horas"
TIPO_TURNO_ROTATIVO = "turno_rotativo"

TIPO_ESCALA_PADRAO = TIPO_CICLO_DIAS

TIPOS_ESCALA_SUPORTADOS = [
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
]

NOMES_TIPOS_ESCALA = {
    TIPO_CICLO_DIAS: "Ciclo por dias",
    TIPO_CICLO_HORAS: "Ciclo por horas",
    TIPO_TURNO_ROTATIVO: "Turno rotativo"
}

def validar_tipo_escala(tipo):
    return tipo in TIPOS_ESCALA_SUPORTADOS

def obter_nome_tipo(tipo):
    return NOMES_TIPOS_ESCALA.get(tipo, "Ciclo por dias")