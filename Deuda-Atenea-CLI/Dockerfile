FROM node:14.18.1

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install -g @angular/cli@13.3.5

RUN npm install

RUN npm install jspdf jspdf-autotable

RUN npm install rxjs

RUN npm install rxjs-compat

RUN npm i file-saver

RUN npm i exceljs

COPY . .

CMD  ng serve --host 0.0.0.0
