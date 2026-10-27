# API Todo Tala 1.0

Backend PHP conectado a MySQL mediante PDO.

## Iniciar

Desde la raíz de Todo Tala:

powershell -ExecutionPolicy Bypass -File .\api\preparar-entorno.ps1

Luego:

powershell -ExecutionPolicy Bypass -File .\api\iniciar-api.ps1

La API funciona en:

http://localhost:3000

## Seguridad

Se utilizan:
- consultas preparadas con PDO;
- password_hash y password_verify;
- sesiones mediante token;
- permisos según rol;
- validaciones del lado del servidor;
- comprobación del comercio correspondiente;
- transacciones cuando corresponde.

## Postman

Colección:

api/postman/TodoTala.postman_collection.json

Las solicitudes protegidas utilizan:

Authorization: Bearer TOKEN