# OQTHERA — conjunto de imágenes

Esta carpeta contiene el esquema y los manifiestos del conjunto de datos. **No contiene todavía fotografías ni etiquetas verificadas.**

## Cómo empezar
1. Lee `../AI_DATASET_PROTOCOL.md`.
2. Copia una fila por fotografía en `image_manifest.csv`.
3. Usa el mismo `sample_id` para todas las vistas de una misma pieza física.
4. No rellenes con datos supuestos: usa `unknown` cuando el dato no esté disponible y no incluyas la imagen si falta una licencia o permiso claro.
5. Ejecuta `python scripts/validate_dataset.py` desde la raíz del repositorio antes de preparar particiones.

Las imágenes deben almacenarse solo cuando se hayan comprobado sus permisos y su procedencia. Este repositorio público no debe recibir imágenes privadas ni datos personales.

## Estados de revisión recomendados
- `pending`: sin revisar.
- `verified`: etiqueta y metadatos revisados.
- `rejected`: no apta para el conjunto.

Solo `verified` podrá pasar a entrenamiento, validación o evaluación.
