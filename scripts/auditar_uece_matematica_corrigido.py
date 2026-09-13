#!/usr/bin/env python3
"""Auditoria corrigida da seção de Matemática da apostila UECE por Assunto 11ª edição.

Corrige distorções do auditor legado e respeita a regra editorial de não reconstruir itens incompletos:
1. "Progressão Aritmética" precisa ser classificada como PA antes da regra genérica de "Aritmética".
2. O quadro de gabaritos da p. 77 só possui respostas para Aritmética 1-3; as posições 4-10 estão vazias e não são questões válidas a integrar.
3. Questões cujo enunciado/fórmula/alternativas estão visualmente incompletos na própria apostila ficam explicitamente fora da meta auditável, sem reconstrução por inferência.
"""
from __future__ import annotations

import auditar_uece_matematica as base

# Na p. 77, Aritmética possui somente 3 questões com gabarito oficial.
base.EXPECTED_MAX["ARITMETICA"] = 3

# Itens não integráveis sem reconstrução/inferência do conteúdo ausente na própria fonte.
# Matrizes 22 já era excluída no auditor-base por não possuir gabarito oficial.
base.EXPECTED_EXCLUDE.setdefault("FUNCOES", set()).add(7)
base.EXPECTED_EXCLUDE.setdefault("GEOMETRIA_PLANA", set()).add(13)
base.EXPECTED_EXCLUDE.setdefault("OPERACOES_BASICAS", set()).update({3, 10})
base.EXPECTED_EXCLUDE.setdefault("LOGARITMO", set()).add(4)
base.EXPECTED_EXCLUDE.setdefault("POLINOMIOS_COMPLEXOS", set()).update({1, 3, 23})

_original_canonical_topic = base.canonical_topic


def canonical_topic_corrigido(topic: str) -> str:
    t = base.norm(topic)
    if "progressao aritmetica" in t:
        return "PA"
    if "progressao geometrica" in t:
        return "PG"
    return _original_canonical_topic(topic)


base.canonical_topic = canonical_topic_corrigido

if __name__ == "__main__":
    base.main()
