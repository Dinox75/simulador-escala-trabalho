import pytest

from services.escala_service_factory import criar_escala_service


@pytest.fixture(autouse=True)
def isolar_repository_json_da_api(tmp_path, monkeypatch, request):
    """Keep API route tests away from the project's sample data file."""
    if not request.node.path.name.startswith("test_api_"):
        return

    from api.routes import escalas

    caminho_teste = tmp_path / "escalas.json"
    monkeypatch.setattr(
        escalas,
        "criar_escala_service",
        lambda: criar_escala_service(caminho_arquivo=str(caminho_teste)),
    )
