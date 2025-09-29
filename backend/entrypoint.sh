#!/bin/sh

chown -R www-data:www-data /var/www/html/database #Cambia la propiedad del directorio de la base de datos
exec "$@" #Ejecuta el comando principal del contenedor (se lo pasamos como argumento a este script con CMD)