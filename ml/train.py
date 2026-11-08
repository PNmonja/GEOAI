#!/usr/bin/env python3
"""Entrenamiento experimental de OQTHERA con transfer learning.

Requiere un manifiesto revisado y fotografías locales con licencia compatible.
No descarga imágenes ni valida identificaciones. No usar resultados como diagnóstico.
"""
from pathlib import Path
import csv
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "image_manifest.csv"
OUT = ROOT / "models"
CLASSES = ["MIN-001", "MIN-002", "MIN-003", "MIN-004", "MIN-005", "MIN-006"]
LABELS = {
    "MIN-001": "Cuarzo", "MIN-002": "Calcita", "MIN-003": "Yeso",
    "MIN-004": "Halita", "MIN-005": "Moscovita", "MIN-006": "Biotita"
}
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 12

def load_rows():
    if not MANIFEST.exists():
        raise RuntimeError("No existe data/image_manifest.csv")
    with MANIFEST.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    valid = []
    sample_splits = {}
    for row in rows:
        if row.get("review_status", "").strip().lower() != "verified":
            continue
        split = row.get("split", "").strip().lower()
        class_id = row.get("class_id", "").strip()
        sample_id = row.get("sample_id", "").strip()
        path_text = row.get("image_path", "").strip()
        if split not in {"train", "validation", "test"} or class_id not in CLASSES:
            continue
        if not sample_id or not path_text:
            raise RuntimeError("Fila verificada sin sample_id o image_path.")
        path = (ROOT / path_text).resolve()
        if ROOT.resolve() not in path.parents or not path.is_file():
            raise RuntimeError(f"Ruta de imagen inexistente o fuera del repositorio: {path_text}")
        prior = sample_splits.setdefault(sample_id, split)
        if prior != split:
            raise RuntimeError(f"Fuga de datos: {sample_id} aparece en {prior} y {split}.")
        valid.append((str(path), class_id, split, sample_id))
    if not valid:
        raise RuntimeError("No hay imágenes verificadas y particionadas. Recopila y revisa el dataset primero.")
    for split in ("train", "validation", "test"):
        present = {c for _, c, s, _ in valid if s == split}
        if split != "test" and present != set(CLASSES):
            raise RuntimeError(f"El conjunto {split} debe contener las seis clases; presentes: {sorted(present)}")
    for class_id in CLASSES:
        n = len({sid for _, c, s, sid in valid if c == class_id and s == "train"})
        if n < 5:
            raise RuntimeError(f"Muy pocos ejemplares distintos para {LABELS[class_id]}: {n}. Se requieren al menos 5 para este ensayo.")
    return valid

def main():
    try:
        import numpy as np
        import tensorflow as tf
        from sklearn.metrics import classification_report, confusion_matrix
    except ImportError as exc:
        print("Faltan dependencias. Instala requirements-ml.txt:", exc)
        return 2

    rows = load_rows()
    class_to_index = {name: i for i, name in enumerate(CLASSES)}

    def dataset(split, training=False):
        subset = [r for r in rows if r[2] == split]
        paths = [r[0] for r in subset]
        labels = [class_to_index[r[1]] for r in subset]
        ds = tf.data.Dataset.from_tensor_slices((paths, labels))
        def read_image(path, label):
            image = tf.io.read_file(path)
            image = tf.image.decode_image(image, channels=3, expand_animations=False)
            image.set_shape([None, None, 3])
            image = tf.image.resize(image, IMAGE_SIZE)
            image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
            return image, tf.one_hot(label, len(CLASSES))
        ds = ds.map(read_image, num_parallel_calls=tf.data.AUTOTUNE)
        if training:
            ds = ds.shuffle(min(len(subset), 1000), seed=42)
        return ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE), subset

    train_ds, _ = dataset("train", True)
    val_ds, _ = dataset("validation")
    test_ds, test_rows = dataset("test")

    base = tf.keras.applications.MobileNetV2(
        input_shape=(*IMAGE_SIZE, 3), include_top=False, weights="imagenet"
    )
    base.trainable = False
    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3))
    x = base(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(len(CLASSES), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)

    probabilities = model.predict(test_ds, verbose=0)
    y_pred = np.argmax(probabilities, axis=1)
    y_true = np.array([class_to_index[r[1]] for r in test_rows])
    report = classification_report(y_true, y_pred, labels=list(range(len(CLASSES))),
        target_names=[LABELS[c] for c in CLASSES], output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES))))
    OUT.mkdir(exist_ok=True)
    model.save(OUT / "oqthera-mineral-experimental.keras")
    result = {
        "status": "experimental_not_for_diagnosis",
        "classes": LABELS,
        "test_images": len(test_rows),
        "test_specimens": len({r[3] for r in test_rows}),
        "classification_report": report,
        "confusion_matrix": matrix.tolist(),
        "warning": "No calibrated confidence or out-of-scope rejection is implemented. Human review is required."
    }
    (OUT / "evaluation.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("Modelo y evaluación guardados en models/. Interpreta los resultados con cautela.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
