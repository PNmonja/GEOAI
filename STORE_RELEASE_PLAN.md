# OQTHERA — Preparación para publicación en tiendas

Estado: planificación técnica. OQTHERA todavía no está publicada en Google Play, Samsung Galaxy Store ni Apple App Store.

## Web instalable (PWA)
- [x] Manifiesto de aplicación web.
- [x] Icono vectorial inicial.
- [x] Service worker y caché básica de recursos propios.
- [x] Alcance y ruta de inicio configurados para GitHub Pages.
- [ ] Probar instalación real en Android, Samsung Internet, Chrome y Safari en iOS.
- [ ] Crear iconos PNG en tamaños exigidos y capturas finales.
- [ ] Revisar accesibilidad, rendimiento, navegación offline y enlaces rotos.

## Google Play
Ruta técnica probable: empaquetar la PWA como Trusted Web Activity (TWA) o crear una aplicación Android nativa si se necesitan funciones propias del dispositivo.
- Crear cuenta de desarrollador con la persona adulta responsable cuando corresponda.
- Preparar nombre, descripción, categoría, icono, capturas, ficha de tienda y correo de soporte.
- Generar Android App Bundle (AAB), probarlo y firmarlo.
- Configurar Digital Asset Links en /.well-known/assetlinks.json para verificar el dominio.
- Completar clasificación de contenido, formulario de seguridad de datos, política de privacidad y pruebas requeridas por Google Play.
- Revisar requisitos vigentes antes de enviar.

## Samsung Galaxy Store
- Preparar una versión Android firmada y compatible con los requisitos actuales de Seller Portal.
- Crear ficha, iconos, capturas, clasificación, política de privacidad y datos de contacto.
- Verificar requisitos de cuenta de vendedor y revisión de Samsung.
- Confirmar formatos y requisitos vigentes en Seller Portal.

## Safari y Apple
Safari no es una tienda de aplicaciones. En iPhone/iPad, la PWA puede añadirse a la pantalla de inicio desde el menú Compartir en versiones compatibles de iOS. Para estar en Apple App Store hará falta una aplicación iOS empaquetada/desarrollada y cumplir el proceso de Apple Developer y App Review.

## Antes de publicar
- Completar y revisar la política de privacidad y definir responsable legal y canal de contacto.
- Revisar derechos de imágenes, fuentes, tipografías y bases de datos.
- Auditar seguridad, accesibilidad, compatibilidad y funcionamiento offline.
- No presentar la guía mineralógica como IA visual: aún es una guía basada en propiedades declaradas.
- No publicar datos sensibles de especies amenazadas ni localizaciones vulnerables.
