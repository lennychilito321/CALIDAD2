# Paquete V1 – Análisis de VUL-01 a VUL-04 · Miguel Llantén

Revisión de los hallazgos VUL-01 a VUL-04 del informe 3, comparados uno a uno con el CSV exportado de OpenVAS (`Anexo_Reporte_OpenVAS.csv`, escaneo del 17-nov-2026). **No se repitió el escaneo ni se abrió ningún servicio del servidor**: todo sale del reporte ya generado. Luis integra este análisis en `G_Vulnerabilidades.md`.

## 1. Verificación de totales
| Severidad | Informe 3 | CSV | ¿Coincide? |
|---|---|---|---|
| Media | 2 | 2 | Sí |
| Baja | 1 | 1 | Sí |
| Informativa (Log) | 47 | 47 | Sí |
| Crítica / Alta | 0 | 0 | Sí |
| **Total** | **50** | **50** | **Sí** |

Ningún resultado del CSV tiene CVE asociado, como dice el informe.

## 2. Verificación hallazgo por hallazgo
| ID | Resultado del CSV (NVT) | Puerto | CVSS | QoD en CSV | ¿Coincide con el informe? |
|---|---|---|---|---|---|
| VUL-01 | SSL/TLS: Certificate Expired | 10443 | 5,0 Medium | 99 | Sí |
| VUL-02 | Web Proxy Auto-Discovery Protocol Information Disclosure (badWPAD, HTTP) – Active Check | 10443 | 4,3 Medium | 70 | Sí |
| VUL-03 | TCP Timestamps Information Disclosure | host (sin puerto) | 2,6 Low | 80 | Sí |
| VUL-04 | Hidden WWW Server Name (HTTP) y HTTP Server Banner Enumeration | 10443 | 0,0 Log | **70** y 80 | **Parcial**: ver corrección 1 |

### Correcciones propuestas para el informe 3
1. **VUL-04, QoD:** la tabla 6 dice "QoD 80", pero el hallazgo se apoya en dos resultados. "HTTP Server Banner Enumeration" tiene QoD 80; "Hidden WWW Server Name", que es el que revela "OPNsense", tiene **QoD 70**. Propongo escribir "QoD 70–80 (dos detecciones)".
2. **VUL-01, dato faltante:** el certificado vencido está emitido a `CN=uniautonoma.edu.co`, el dominio principal de la universidad, y no a `nova.uniautonoma.edu.co`. Conviene agregarlo: muestra que es un certificado institucional reutilizado en el firewall y que su renovación depende del área de infraestructura.

## 3. Análisis detallado

### VUL-01 – Certificado TLS expirado (Media, CVSS 5,0, QoD 99)
- **Lo que dice el CSV:** venció el 2026-09-12 23:59:59; huella SHA-256 `FE74DAFC…C4AC8951`; emisor DigiCert Global G2 TLS RSA SHA256 2020 CA1; RSA de 4096 bits con firma sha512WithRSAEncryption; sujeto `uniautonoma.edu.co`.
- **Comprobación:** del 12-sep al 17-nov hay 66 días, igual que en el informe. La QoD 99 corresponde a una lectura directa de la fecha del certificado, así que el hallazgo es fiable.
- **Mi valoración:** coincido con la severidad media. Lo que más preocupa no es la criptografía, que es fuerte (RSA 4096), sino el proceso: un certificado de DigiCert vencido hace más de dos meses indica que nadie vigila las fechas de vencimiento. Si eso le pasa al certificado del puerto 443, que usa el aspirante, el navegador bloquearía el acceso a Nova y a las postulaciones.
- **Recomendación adicional:** inventariar todos los certificados de la institución (443, 8088, 10443) con sus fechas de vencimiento y poner alertas a 30 y 7 días.

### VUL-02 – Divulgación por WPAD (Media, CVSS 4,3, QoD 70)
- **Lo que dice el CSV:** "Vulnerable URL: https://nova.uniautonoma.edu.co:10443/wpad.dat", detectado con una prueba activa.
- **Comprobación:** la QoD 70 corresponde a una detección remota sin confirmar el contenido. El informe hace bien en marcarlo "por validar" y no darlo por confirmado.
- **Mi valoración:** la severidad media es razonable como máximo. Un `wpad.dat` en un puerto 10443 externo es raro: WPAD se usa en redes internas. Puede tratarse de una respuesta genérica de la interfaz del firewall (devuelve algo para cualquier ruta). La validación debe hacerla el personal de redes de la universidad, no el grupo, para no salir del alcance.
- **Recomendación adicional:** en la validación, comprobar si `/wpad.dat` devuelve un archivo PAC real (con `FindProxyForURL`) o una página genérica. Si es genérica, se reclasifica como falso positivo.

### VUL-03 – Marcas de tiempo TCP (Baja, CVSS 2,6, QoD 80)
- **Lo que dice el CSV:** dos marcas, 89913031 y 89915108, tomadas con 1 segundo de diferencia.
- **Comprobación:** la diferencia es de 2077 unidades en un segundo aproximado. Con esa frecuencia, el contador equivale a unas 12 horas; con 1000 Hz, a cerca de 1 día. Los sistemas Linux actuales suman un desplazamiento aleatorio a esas marcas, así que **el tiempo de encendido que se pueda calcular no es confiable**.
- **Mi valoración:** coincido con la severidad baja y con la prioridad del plan ("próximo ciclo"). No afecta al rol Aspirante. Desactivar las marcas puede empeorar el rendimiento de TCP, así que no lo recomiendo como acción urgente.

### VUL-04 – Interfaz de firewall OPNsense expuesta (Informativa en OpenVAS, riesgo alto según el grupo)
- **Lo que dice el CSV:** "Hidden WWW Server Name" indica que el servidor intenta ocultar su nombre, pero una petición especial revela "OPNsense". "HTTP Server Banner Enumeration" muestra `Server: OPNsense` ante una petición con versión HTTP inexistente (`HTTP 00.5`).
- **Comprobación:** dos técnicas distintas dan el mismo resultado, lo que refuerza la identificación aunque cada una por separado tenga QoD 70 u 80. OpenVAS le da CVSS 0,0 porque solo detecta el producto, no una falla concreta.
- **Mi valoración:** estoy de acuerdo con subirlo a riesgo alto, y es correcto que el informe aclare que la valoración es del grupo y no de OpenVAS. Junto con VUL-01 y VUL-02, que están en el mismo puerto, el 10443 concentra los tres hallazgos más relevantes del escaneo: es el servicio con peor mantenimiento. Que intente ocultar su nombre no lo protege, porque el escáner lo identificó igual.
- **Limitación:** no se confirmó que la página sea el panel de inicio de sesión de OPNsense, porque no se abrió la interfaz (fuera de alcance). El riesgo alto se basa en el tipo de servicio, no en una prueba de acceso.

## 4. Conclusión del paquete V1
Las cifras y los cuatro hallazgos del informe 3 coinciden con el CSV, salvo la QoD de VUL-04, que conviene corregir. Mis aportes al análisis son:
- el sujeto del certificado de VUL-01;
- un criterio práctico para validar VUL-02;
- la advertencia de que VUL-03 no permite calcular con certeza el tiempo de encendido;
- la observación de que el puerto 10443 concentra VUL-01, VUL-02 y VUL-04.

Ese puerto debería ser la primera prioridad del plan de remediación, como ya propone el informe.
