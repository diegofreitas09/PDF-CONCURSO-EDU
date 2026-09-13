#!/usr/bin/env python3
"""Auditoria corrigida da seção de Matemática da apostila UECE por Assunto 11ª edição.

Corrige duas distorções do auditor legado:
1. "Progressão Aritmética" precisa ser classificada como PA antes da regra genérica de "Aritmética".
2. O quadro de gabaritos da p. 77 só possui respostas para Aritmética 1-3; as posições 4-10 estão vazias e não são questões válidas a integrar.
"""
from __future__ import annotations

import auditar_uece_matematica as base

# Na p. 77, Aritmética possui somente 3 questões com gabarito oficial.
base.EXPECTED_MAX["ARITMETICA"] = 3

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
