# OQTHERA — guía de desarrollo

## Estado
- Sitio web estático publicado con GitHub Pages.
- Catálogo educativo inicial y guía de propiedades basada en reglas.
- La guía no es un modelo de IA visual y no analiza imágenes.
- Protocolo de dataset y manifiesto CSV preparados.
- No hay todavía imágenes registradas, modelo entrenado ni métricas.
- La conexión/API de Mindat queda expresamente fuera de este trabajo hasta decidir condiciones y permisos.

## Archivos importantes
- `index.html`, `styles.css`, `app.js`: web.
- `assets/oqthera-emblem.svg`: emblema horizontal.
- `assets/oqthera-mark.svg`: símbolo compacto para navegación.
- `AI_DATASET_PROTOCOL.md`: protocolo científico del conjunto.
- `data/mineral-classes.json`: seis clases iniciales.
- `data/image_manifest.csv`: registro de fotografías y ejemplares.
- `DATA_COLLECTION_CHECKLIST.md`: control de calidad y derechos.
- `scripts/validate_dataset.py`: revisión de consistencia del manifiesto.
- `scripts/split_dataset.py`: partición reproducible por ejemplar físico.

## Flujo recomendado
1. Revisar el protocolo y confirmar el alcance.
2. Recopilar imágenes con licencia compatible y etiqueta verificable.
3. Registrar todas las vistas de una pieza con el mismo `sample_id`.
4. Marcar `review_status=verified` solo después de la revisión.
5. Ejecutar `python scripts/split_dataset.py`.
6. Ejecutar `python scripts/validate_dataset.py`.
7. Revisar manualmente el reparto y los posibles duplicados.
8. Diseñar y entrenar el modelo solo cuando el conjunto sea suficiente y equilibrado.

Los scripts ayudan a detectar errores de organización, pero no certifican la identificación mineralógica ni los derechos de autor.

## Banco visual y entrenamiento experimental
- `commons-gallery.js`: buscador de candidatos en Wikimedia Commons, con metadatos de autoría/licencia y exportación CSV para revisión. Los candidatos no se marcan como verificados.
- `ml/train.py`: pipeline experimental de transfer learning con MobileNetV2; requiere imágenes locales revisadas y particionadas.
- `requirements-ml.txt`: dependencias para el entrenamiento.
- `ml/README.md`: instrucciones y límites del experimento.

La API de Commons expone metadatos de cada archivo, pero la licencia debe comprobarse en su página original; los archivos pueden tener condiciones distintas. El buscador no descarga ni incorpora imágenes automáticamente al entrenamiento.
