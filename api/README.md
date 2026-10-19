Versión actual: 0.6.0

# API Todo Tala

Esta carpeta contiene el backend PHP, la configuración de ejemplo y los archivos de Postman necesarios para probar la API en otra computadora.

## Estructura

```text
api/
├── comercios.php
├── empleados.php
├── pedidos.php
├── productos.php
├── promociones.php
├── usuarios.php
├── conexion.ejemplo.php
├── preparar-entorno.ps1
├── iniciar-api.ps1
├── probar-api.ps1
└── postman/
    ├── TodoTala.postman_collection.json
    └── TodoTala.postman_environment.json
```

`conexion.php` se crea localmente y no se sube a GitHub porque contiene la contraseña de MySQL.

## Preparar en otra computadora

Requisitos:

- PHP 8 o superior.
- PDO y pdo_mysql habilitados.
- MySQL 8.
- Postman.

Después de clonar el proyecto, abrir PowerShell en la carpeta `Todo-Tala` y ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File .\api\preparar-entorno.ps1
```

El script pide la contraseña del usuario `root` de MySQL, crea `api/conexion.php` y carga automáticamente `database/baseplataforma.sql`.

Luego iniciar la API:

```powershell
powershell -ExecutionPolicy Bypass -File .\api\iniciar-api.ps1
```

La API queda disponible en:

```text
http://localhost:3000
```

Para comprobar rápidamente los GET principales, con el servidor encendido ejecutar en otra PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\api\probar-api.ps1
```

## Postman

Importar estos dos archivos:

```text
api/postman/TodoTala.postman_collection.json
api/postman/TodoTala.postman_environment.json
```

El entorno ya utiliza:

```text
http://localhost:3000
```

Las solicitudes se encuentran agrupadas por Productos, Usuarios, Comercios, Empleados, Promociones y Pedidos.

## Seguridad

No subir `api/conexion.php` al repositorio. Está incluido en `.gitignore` para evitar publicar contraseñas de MySQL.
