# Todo Tala

Versión: 1.0.0

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

## Interfaz

La versión 1.0 incluye modo oscuro predeterminado, modo claro y diseño adaptable para computadora, tablet y celular.