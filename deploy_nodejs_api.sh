#!/bin/bash

current_folder=$(pwd)

docker run -it --rm -v "${current_folder}/app:/home/node/app" -w "/home/node/app" node:12.16-alpine3.11 /bin/sh -c "echo 'INSTALLATION'  && npm install && echo 'TRANSPILATION' && ./node_modules/.bin/tsc && echo 'FINISH'"

rsync -avz -e "ssh -i /docker/webhook/data/id_rsa_ezspace_staging" "${current_folder}/app" root@staging.be-link.fr:/var/www/be-link/docker/node
