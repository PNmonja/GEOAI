#!/usr/bin/env python3
"""Valida el manifiesto CSV de imágenes de OQTHERA sin dependencias externas.

Uso desde la raíz del repositorio:
    python scripts/validate_dataset.py
"""
from collections import Counter, defaultdict
from pathlib import Path
import csv
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "image_manifest.csv"
ALLOWED_CLASSES = {"MIN-001", "MIN-002", "MIN-003", "MIN-004", "MIN-005", "MIN-006"}
ALLOWED_SPLITS = {"train", "validation", "test", "out_of_scope", ""}
REQUIRED = [
    "image_id", "sample_id", "class_id", "scientific_name",
    "determination_source", "determined_by", "review_status",
    "image_path", "photographer", "license", "attribution",
    "source_url", "view", "lighting", "background", "condition",
    "split", "sha256",
]

def main():
    if not MANIFEST.exists():
        print(f"ERROR: no existe el manifiesto: {MANIFEST}")
        return 2

    with MANIFEST.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing_columns = [name for name in REQUIRED if name not in (reader.fieldnames or [])]
        if missing_columns:
            print("ERROR: faltan columnas: " + ", ".join(missing_columns))
            return 2
        rows = list(reader)

    errors, warnings = [], []
    seen_images, seen_hashes = set(), {}
    sample_splits = defaultdict(set)
    class_counts = Counter()
    split_counts = Counter()

    for line, row in enumerate(rows, start=2):
        image_id = row["image_id"].strip()
        sample_id = row["sample_id"].strip()
        class_id = row["class_id"].strip()
        status = row["review_status"].strip().lower()
        split = row["split"].strip().lower()
        digest = row["sha256"].strip().lower()

        if not image_id or not sample_id:
            errors.append(f"Fila {line}: image_id y sample_id son obligatorios.")
        if image_id in seen_images:
            errors.append(f"Fila {line}: image_id duplicado: {image_id}.")
        seen_images.add(image_id)

        if split not in ALLOWED_SPLITS:
            errors.append(f"Fila {line}: partición no válida: {split}.")
        if split and status != "verified":
            errors.append(f"Fila {line}: solo las filas verified pueden tener partición.")
        if split and class_id not in ALLOWED_CLASSES and split != "out_of_scope":
            errors.append(f"Fila {line}: clase no admitida para partición supervisada: {class_id}.")
        if split and sample_id:
            sample_splits[sample_id].add(split)

        if split:
            split_counts[split] += 1
            class_counts[(class_id or "SIN_CLASE", split)] += 1

        for field in ("determination_source", "photographer", "license", "attribution", "source_url"):
            if not row[field].strip():
                errors.append(f"Fila {line}: falta {field}; no se puede verificar la procedencia o los derechos.")

        if status not in {"pending", "verified", "rejected"}:
            errors.append(f"Fila {line}: review_status debe ser pending, verified o rejected.")
        if status == "verified" and class_id not in ALLOWED_CLASSES and split != "out_of_scope":
            warnings.append(f"Fila {line}: clase fuera del catálogo inicial; revisar si es un ejemplo fuera de categoría.")

        if digest:
            if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
                errors.append(f"Fila {line}: SHA-256 no tiene formato hexadecimal de 64 caracteres.")
            elif digest in seen_hashes:
                warnings.append(f"Fila {line}: posible imagen duplicada; coincide con {seen_hashes[digest]}.")
            else:
                seen_hashes[digest] = image_id
        elif status == "verified":
            warnings.append(f"Fila {line}: falta SHA-256 para una imagen verificada.")

        if status == "verified" and not split:
            warnings.append(f"Fila {line}: muestra verificada todavía sin partición.")

    for sample_id, splits in sample_splits.items():
        if len(splits) > 1:
            errors.append(f"FUGA DE DATOS: el ejemplar {sample_id} aparece en varias particiones: {', '.join(sorted(splits))}.")

    print(f"Fotografías registradas: {len(rows)}")
    print(f"Particiones: {dict(split_counts)}")
    print("Recuento por clase y partición:")
    for (class_id, split), count in sorted(class_counts.items()):
        print(f"  {class_id} / {split}: {count}")

    for warning in warnings:
        print("AVISO:", warning)
    for error in errors:
        print("ERROR:", error)

    if errors:
        print(f"VALIDACIÓN FALLIDA: {len(errors)} error(es), {len(warnings)} aviso(s).")
        return 1
    print(f"VALIDACIÓN SUPERADA: {len(warnings)} aviso(s). Esto no sustituye la revisión científica ni legal.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
