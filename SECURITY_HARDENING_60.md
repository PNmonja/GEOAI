# OQTHERA — Plan de endurecimiento de seguridad (60 controles)

Este documento es un plan técnico y un registro de estado. No es una certificación, auditoría externa ni garantía de ausencia de malware.

## Bloque A — Proxy y API (controles 1–30)

| Nº | Control | Estado |
|---:|---|---|
| 01 | Mantener el proxy en modo de solo lectura | Implementado |
| 02 | Exponer únicamente rutas upstream fijas | Implementado |
| 03 | No aceptar URLs upstream arbitrarias | Implementado |
| 04 | Mantener el token de Mindat exclusivamente en variables privadas | Implementado en el diseño; revisar Railway |
| 05 | CORS con orígenes HTTPS exactos, sin comodín | Implementado |
| 06 | Métodos HTTP limitados a GET | Implementado |
| 07 | Cabeceras HTTP de seguridad | Implementado |
| 08 | Desactivar Swagger, ReDoc y OpenAPI en producción | Implementado según entorno |
| 09 | Desactivar modo debug | Implementado |
| 10 | Validar longitud de búsquedas | Implementado |
| 11 | Normalizar espacios y rechazar caracteres de control | Implementado |
| 12 | Validar identificadores numéricos y sus límites | Implementado |
| 13 | Limitar tamaño de respuestas upstream | Implementado |
| 14 | Exigir JSON en respuestas upstream | Implementado |
| 15 | Desactivar redirecciones upstream | Implementado |
| 16 | Aplicar timeout de conexión y petición | Implementado |
| 17 | Reutilizar conexiones HTTP con límites | Implementado |
| 18 | Limitar conexiones simultáneas del cliente upstream | Implementado |
| 19 | Limitar peticiones por cliente en el proceso | Implementado; no distribuido |
| 20 | Limitar el número de clientes registrados por el limitador | Implementado |
| 21 | No confiar en X-Forwarded-For arbitrario | Implementado |
| 22 | Identificador de petición para diagnóstico | Implementado |
| 23 | No registrar tokens ni cabeceras de autorización | Implementado |
| 24 | Mensajes de error genéricos al cliente | Parcial; revisar todos los casos |
| 25 | Política de no almacenamiento en caché de respuestas | Implementado |
| 26 | Limitar cabeceras CORS permitidas | Implementado |
| 27 | Respuesta de salud separada de las rutas de datos | Implementado |
| 28 | Versionado del servicio | Implementado |
| 29 | Protección distribuida de tasa mediante Redis o servicio equivalente | Pendiente |
| 30 | Pruebas automatizadas de seguridad y regresión en CI | Pendiente |

## Bloque B — Defensa frente a malware y amenazas (controles 31–60)

Estas medidas se aplican a los archivos, dependencias, código y procesos que realmente formen parte del servicio. El proxy actual no admite subidas de archivos ni ejecuta programas enviados por visitantes; por ello, no se debe afirmar que existe un antivirus de archivos activo hasta integrar y probar uno.

| Nº | Control | Estado |
|---:|---|---|
| 31 | Inventario de dependencias y versiones | Pendiente |
| 32 | Escaneo de vulnerabilidades de dependencias (pip-audit) | Pendiente |
| 33 | Alertas de dependencias vulnerables (Dependabot) | Pendiente |
| 34 | Fijar versiones y hashes de dependencias | Pendiente |
| 35 | Escaneo estático de Python (Bandit) | Pendiente |
| 36 | Análisis de calidad y errores (Ruff) | Pendiente |
| 37 | Escaneo de secretos en Git (gitleaks o equivalente) | Pendiente |
| 38 | Protección para impedir que secretos lleguen a commits | Pendiente |
| 39 | Escaneo de malware en artefactos de compilación | Pendiente |
| 40 | Análisis de imágenes de contenedor, si se adopta Docker | Pendiente |
| 41 | Generación de inventario SBOM | Pendiente |
| 42 | Verificación de integridad de artefactos | Pendiente |
| 43 | Revisión de cambios antes de desplegar | Pendiente |
| 44 | Separar entornos de desarrollo y producción | Pendiente |
| 45 | Ejecutar el servicio con usuario sin privilegios, si la plataforma lo permite | Pendiente |
| 46 | Sistema de archivos de solo lectura cuando sea viable | Pendiente |
| 47 | Eliminar herramientas y paquetes innecesarios de producción | Pendiente |
| 48 | Política de actualizaciones de seguridad | Pendiente |
| 49 | Registro de eventos de seguridad sin datos sensibles | Parcial |
| 50 | Alertas por picos de errores y tráfico anómalo | Pendiente |
| 51 | Detección de patrones automatizados de abuso | Pendiente |
| 52 | Reglas de cortafuegos perimetral mediante controles de Railway/proveedor | Pendiente |
| 53 | Restricción de salida de red a destinos necesarios | Pendiente; validar compatibilidad con Mindat |
| 54 | Escaneo antivirus real para archivos, solo si se habilitan cargas | No aplicable actualmente |
| 55 | Cuarentena aislada de archivos sospechosos, solo si se habilitan cargas | No aplicable actualmente |
| 56 | Límites de tipo, tamaño y frecuencia de archivos, si se habilitan cargas | No aplicable actualmente |
| 57 | Detección de indicadores conocidos de troyanos y gusanos en artefactos | Pendiente |
| 58 | Procedimiento de rotación de secretos y respuesta ante filtraciones | Pendiente |
| 59 | Copias de seguridad de configuración y procedimiento de recuperación | Pendiente |
| 60 | Revisión externa y prueba de penetración autorizada antes de publicación amplia | Pendiente |

## Orden de implantación

1. Corregir y probar el proxy localmente.
2. Añadir pruebas automatizadas y análisis estático.
3. Activar análisis de dependencias y secretos en GitHub.
4. Configurar límites compartidos y alertas para producción.
5. Revisar variables privadas y controles disponibles en Railway.
6. Desplegar primero en un entorno de prueba y verificar salud, CORS, límites, errores y conexión Mindat.
7. Solo entonces promover a producción.

## Criterios de aceptación

- Las rutas desconocidas y métodos no permitidos no acceden a Mindat.
- El navegador nunca recibe el token.
- Orígenes no autorizados no reciben permisos CORS.
- Entradas inválidas, respuestas enormes y tiempos de espera se controlan.
- No aparecen secretos en logs ni respuestas.
- Las pruebas no rompen las funciones de búsqueda y detalle.
- El escaneo de dependencias y secretos no presenta hallazgos críticos sin resolver.

**Nota:** CORS no sustituye autenticación, el limitador en memoria no protege entre varias instancias y un antivirus no sustituye el aislamiento, el control de dependencias ni las actualizaciones. Ningún conjunto de controles garantiza protección absoluta.
