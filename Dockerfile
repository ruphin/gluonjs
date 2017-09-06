FROM ruphin/webserve

COPY . /usr/share/nginx/html
COPY ./node_modules/lit-html /usr/share/nginx/html/lit-html
