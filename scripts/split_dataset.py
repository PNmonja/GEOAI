#!/usr/bin/env python3
"""Divide el manifiesto por ejemplar físico (no por fotografía).

Solo incluye filas verified con split vacío. No mueve imágenes.
Uso: python scripts/split_dataset.py [--seed 42]
"""
from collections import defaultdict, Counter
from pathlib import Path
import argparse, csv, random, sys

ROOT=Path(__file__).resolve().parents[1]
CSV_PATH=ROOT/"data"/"image_manifest.csv"
CLASSES={"MIN-001","MIN-002","MIN-003","MIN-004","MIN-005","MIN-006"}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--seed",type=int,default=42)
    args=parser.parse_args()
    with CSV_PATH.open(encoding="utf-8-sig",newline="") as f:
        reader=csv.DictReader(f); fields=reader.fieldnames or []; rows=list(reader)
    required={"sample_id","class_id","review_status","split"}
    if not required.issubset(fields):
        print("ERROR: faltan columnas:",", ".join(sorted(required-set(fields)))); return 2
    grouped=defaultdict(list)
    for row in rows:
        if row["review_status"].strip().lower()=="verified" and not row["split"].strip():
            grouped[row["sample_id"].strip()].append(row)
    if not grouped:
        print("No hay ejemplares verified sin partición. No se modificó el CSV."); return 0
    by_class=defaultdict(list)
    for sid, group in grouped.items():
        labels={r["class_id"].strip() for r in group}
        if len(labels)!=1 or not next(iter(labels)):
            print(f"ERROR: el ejemplar {sid} tiene etiquetas ausentes o contradictorias."); return 1
        label=next(iter(labels))
        if label not in CLASSES:
            print(f"ERROR: clase no admitida para split automático: {label}"); return 1
        by_class[label].append(sid)
    rng=random.Random(args.seed)
    assignments={}
    for label, ids in sorted(by_class.items()):
        rng.shuffle(ids)
        n=len(ids)
        if n<3:
            print(f"AVISO: {label} tiene {n} ejemplar(es); se dejan sin split (mínimo 3 para crear tres grupos).")
            continue
        n_test=max(1,round(n*.15)); n_val=max(1,round(n*.15))
        while n_test+n_val>=n:
            if n_val>1: n_val-=1
            else: n_test-=1
        for sid in ids[:n_test]: assignments[sid]="test"
        for sid in ids[n_test:n_test+n_val]: assignments[sid]="validation"
        for sid in ids[n_test+n_val:]: assignments[sid]="train"
    for row in rows:
        sid=row["sample_id"].strip()
        if sid in assignments and row["review_status"].strip().lower()=="verified" and not row["split"].strip():
            row["split"]=assignments[sid]
    tmp=CSV_PATH.with_suffix(".tmp")
    with tmp.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields); writer.writeheader(); writer.writerows(rows)
    tmp.replace(CSV_PATH)
    print("Ejemplares asignados:",len(assignments))
    print("Distribución por ejemplar:",dict(Counter(assignments.values())))
    print("Semilla:",args.seed)
    print("IMPORTANTE: revisa el manifiesto y ejecuta validate_dataset.py antes de entrenar.")
    return 0

if __name__=="__main__": sys.exit(main())
