FROM node:12.16-alpine3.11

RUN mkdir /home/node/app;\ 
    chmod -R 777 /home/node/app;

WORKDIR /home/node/app

RUN npm install -g pm2@5.0.3
RUN npm install typescript-json-schema -g

#RUN npm install -g mongoose

#CMD ["echo", "you must mount the node js src folder in /home/node/app volume in docker-volume and run bash -c 'npm install && pm2 start ecosystem.config.js'", ""]
CMD ["tail", "-f", "wait"]

