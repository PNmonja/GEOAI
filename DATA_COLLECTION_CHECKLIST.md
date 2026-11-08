# OQTHERA — checklist de recogida y revisión

## Antes de aceptar una muestra
- [ ] Tiene un identificador único de ejemplar físico.
- [ ] La identificación está respaldada por una fuente trazable.
- [ ] La persona revisora y el estado de revisión están registrados.
- [ ] La procedencia está documentada o marcada como desconocida.
- [ ] No se ha inferido una localidad a partir de una imagen.
- [ ] Todas las fotografías de la misma pieza comparten el mismo `sample_id`.

## Antes de aceptar una fotografía
- [ ] Se conoce quién tomó o publicó la fotografía.
- [ ] La licencia permite el uso previsto y se ha comprobado la atribución requerida.
- [ ] Se conserva el enlace a la fuente original.
- [ ] La fotografía corresponde a la muestra registrada.
- [ ] La imagen tiene nitidez suficiente para observar rasgos.
- [ ] Se ha anotado la vista, iluminación, fondo y conservación.
- [ ] Se ha calculado y registrado SHA-256 para detectar duplicados.

## Revisión científica
- [ ] La clase pertenece al conjunto admitido.
- [ ] La etiqueta está a nivel de detalle coherente con la evidencia.
- [ ] No se ha usado una etiqueta genérica ambigua si se conoce la especie.
- [ ] Las dudas están anotadas; las muestras dudosas no se usan para entrenar.

## Separación del conjunto
- [ ] La división se ha hecho por ejemplar físico, no por fotografía.
- [ ] Ningún `sample_id` aparece en más de una partición.
- [ ] La evaluación final queda reservada y no se usa para ajustar el modelo.
- [ ] Hay ejemplos fuera de categoría para probar la abstención.

## Revisión antes de publicar resultados
- [ ] Se informa el número de ejemplares y fotografías por clase.
- [ ] Se calculan precisión y recall por clase.
- [ ] Se revisa la matriz de confusión.
- [ ] Se informan abstenciones y rechazos de ejemplos fuera de categoría.
- [ ] No se presenta una puntuación interna como probabilidad de acierto.
