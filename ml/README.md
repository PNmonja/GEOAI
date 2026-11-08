# Entrenamiento experimental (no ejecutar hasta tener dataset revisado)

1. Reúne imágenes propias o reutilizables y revisa una por una su licencia y atribución.
2. Completa `data/image_manifest.csv`. Cada pieza física debe tener un `sample_id` estable.
3. Marca `review_status=verified` solo tras revisión científica y legal.
4. Ejecuta `python scripts/split_dataset.py` para asignar particiones por ejemplar.
5. Ejecuta `python scripts/validate_dataset.py` y corrige todos los errores.
6. Instala dependencias: `pip install -r requirements-ml.txt`.
7. Ejecuta: `python ml/train.py`.

El entrenamiento usa MobileNetV2 preentrenada como extractor congelado y una cabeza clasificadora de seis clases. Es un experimento inicial, no un sistema de identificación mineralógica validado. Exige al menos cinco ejemplares de entrenamiento por clase y las seis clases en entrenamiento y validación. Una evaluación fiable necesita bastantes más ejemplares, variedad de colecciones y una prueba externa independiente.

El informe contiene precisión, recall, F1 y matriz de confusión por clase. No implementa calibración de confianza ni rechazo automático de imágenes fuera de categoría. No se debe mostrar al público como certeza ni usar para decisiones profesionales.
