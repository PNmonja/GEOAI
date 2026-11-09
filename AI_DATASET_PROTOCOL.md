# OQTHERA — protocolo de datos para la primera IA visual

**Estado real:** diseño inicial. Aún no hay fotografías reunidas ni modelo entrenado.

## 1. Objetivo de la primera versión
Clasificar fotografías de un conjunto cerrado de seis minerales frecuentes y permitir que el sistema se abstenga: «no hay información suficiente» o «fuera del conjunto admitido».

Fuera de alcance por ahora: identificación detallada de fósiles, prospección minera y clasificación general de todas las rocas.

## 2. Categorías iniciales admitidas

| ID | Clase | Fórmula | Alcance |
|---|---|---|---|
| MIN-001 | Cuarzo | SiO₂ | No separar variedades en esta fase |
| MIN-002 | Calcita | CaCO₃ | Distinguir de otros carbonatos |
| MIN-003 | Yeso | CaSO₄·2H₂O | Solo etiquetas verificadas |
| MIN-004 | Halita | NaCl | Sin pruebas de sabor |
| MIN-005 | Moscovita | KAl₂(AlSi₃O₁₀)(OH)₂ | No usar «mica» como etiqueta genérica |
| MIN-006 | Biotita (grupo) | K(Fe²⁺/Mg)₂(Al/Fe³⁺/Mg/Ti)([Si/Al/Fe]₂Si₂O₁₀)(OH/F)₂ | Grupo de micas; no tratar como una especie única |

Feldespatos, otras especies y rocas se aplazan hasta validar estas seis clases.

## 3. Ficha obligatoria de cada ejemplar
Cada pieza física tendrá un ID propio, por ejemplo `OQ-MIN-001-0001`. Todas sus fotos conservarán el mismo `sample_id`.

Campos: `sample_id`, `class_id`, `scientific_name`, `determination_source`, `determined_by`, `review_status`, `locality` (solo si es conocida y publicable), `image_id`, `image_path`, `photographer`, `license`, `attribution`, `source_url`, `view`, `lighting`, `background`, `condition`, `split`, `notes`.

No se usarán fotos sin licencia/permiso claro, ni se inventarán autorías, procedencias o identificaciones.

## 4. Fotografías
Por ejemplar: varias caras, detalles de textura, escala cuando sea posible, distintas iluminaciones y fondos. Revisar nitidez, correspondencia con la etiqueta y derechos de uso.

**Regla contra fuga de datos:** todas las fotografías de una misma pieza física deben quedar en la misma partición. Nunca repartir distintas vistas de un mismo ejemplar entre entrenamiento y evaluación.

## 5. Separación propuesta
Por ejemplares físicos, no por fotos:
- 70 % entrenamiento.
- 15 % validación.
- 15 % evaluación final reservada.

La evaluación final no se utiliza para ajustar el modelo. Estos porcentajes son una propuesta, no resultados existentes.

## 6. Ejemplos fuera de categoría
Crear un conjunto aparte con minerales no admitidos, rocas, fósiles, objetos fabricados, imágenes borrosas/oscuras y fotos que no muestren muestras. El modelo debe poder rechazarlos; no se etiquetarán artificialmente como una de las seis clases.

## 7. Evaluación
Registrar precisión por clase, recall por clase, matriz de confusión, casos de abstención y rechazo de ejemplos fuera de categoría. No anunciar una cifra global sin describir el conjunto de prueba y su distribución. Una puntuación interna no se llamará «probabilidad de acierto» sin calibración comprobada.

## 8. Formato del resultado
```text
Identificación orientativa: posible [categoría]
Otras posibilidades: [alternativas]
Rasgos observados: [rasgos]
Qué falta comprobar: [dato o vista]
Estado: pendiente de confirmación
Referencias: [fuentes verificables]
```

Si no hay evidencia suficiente: indicar el motivo y qué dato concreto falta, sin forzar una clase.

## 9. Hitos antes de entrenar
1. Aprobar las seis clases.
2. Reunir ejemplares identificados y con permisos revisados.
3. Completar metadatos y agrupar fotos por ejemplar.
4. Separar entrenamiento, validación y evaluación.
5. Auditar duplicados, fugas y equilibrio.
6. Entrenar y evaluar un primer modelo.

**No se entrena hasta tener etiquetas fiables, derechos de uso claros y particiones sin fuga.**
