# Todo Tala

Versión: 1.3

Todo Tala es una plataforma web para comercios locales de Tala.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Fetch y async/await
- PHP
- MySQL
- PDO
- JSON
- Postman
- Git y GitHub

No se utilizan frameworks.

## Arquitectura

Frontend HTML/CSS/JavaScript
        |
        | fetch + JSON
        v
API PHP
        |
        | PDO
        v
MySQL

Los datos principales del sistema se almacenan en MySQL.

localStorage se utiliza solamente para:
- mantener la sesión del navegador;
- recordar el modo claro u oscuro.

## Roles

### Cliente
Puede consultar productos, promociones y stock, buscar, usar favoritos, seguir comercios, utilizar el carrito, realizar pedidos, consultar sus pedidos y modificar su perfil.

### Jefe
Puede gestionar productos, stock, promociones, pedidos y empleados de su comercio.

### Empleado
Puede gestionar productos, stock, promociones y pedidos. No puede administrar empleados.

## Backend

Las APIs se encuentran en la carpeta:

api/

Principales endpoints:

- login.php
- logout.php
- registro.php
- usuarios.php
- comercios.php
- mi_comercio.php
- empleados.php
- productos.php
- categorias.php
- imagen.php
- promociones.php
- carrito.php
- pedidos.php
- favoritos.php
- comercios_seguidos.php

Las rutas protegidas utilizan Bearer Token.

## Ejecutar el proyecto

Todo Tala necesita PHP y MySQL.

Live Server solo no puede ejecutar el backend.

Primera instalación:

powershell -ExecutionPolicy Bypass -File .\api\preparar-entorno.ps1

Iniciar API:

powershell -ExecutionPolicy Bypass -File .\api\iniciar-api.ps1

API:
http://localhost:3000

Iniciar frontend:

php -S localhost:8081 -t .

Frontend:
http://localhost:8081

## Postman

Colección:

api/postman/TodoTala.postman_collection.json

Está organizada por:
- Autenticación
- Usuarios
- Comercios
- Empleados
- Productos
- Promociones
- Carrito
- Pedidos
- Favoritos
- Comercios seguidos

## Interfaz y novedades de la versión 1.3

Incluye carga y reemplazo de imágenes de productos, categorías ampliadas, acceso a favoritos y comercios seguidos, navegación con iconos y mejoras en la presentación de las fotos dentro del catálogo. Mantiene el modo oscuro predeterminado, modo claro y diseño adaptable para computadora, tablet y celular.

## Publicación de productos para todos los clientes

1. Registrar una cuenta nueva de **Jefe** con su comercio.
2. Iniciar sesión como ese jefe y entrar a **Productos → Nuevo producto**.
3. Guardar el producto con los datos requeridos. Se publica inicialmente como visible.
4. Cerrar sesión y entrar con cualquier cuenta de **Cliente** de la misma instalación.
5. Abrir **Catálogo**. Allí se muestran los productos visibles de todos los comercios, no solo los del cliente o de un jefe específico.

La pantalla **Inicio** muestra solamente una selección de hasta cuatro productos. Para consultar todos, abrir **Catálogo**.

## Primera instalación y actualizaciones

En PowerShell, desde la carpeta raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File .\api\preparar-entorno.ps1
```

Este comando puede ejecutarse también si la base ya existe: conserva cuentas, comercios y productos; únicamente completa columnas faltantes que utiliza la API.

Después, iniciar la API y el frontend en dos consolas distintas según las instrucciones anteriores.

## Importante: instalaciones en diferentes computadoras

Cada descarga del ZIP usa **su propio MySQL local** de forma predeterminada. Un jefe y un cliente **en esa misma instalación** comparten los productos guardados en esa base de datos.

Para que un comercio en una computadora publique y los clientes de **otras computadoras** vean esos mismos productos, todos deben utilizar una **única API y base de datos compartidas** (por ejemplo, publicadas en un servidor). Descargar el mismo ZIP en varias computadoras **no sincroniza** sus bases MySQL automáticamente.
