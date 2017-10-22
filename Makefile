shell:
	docker run -it --rm -v $$PWD:/app ruphin/webdev bash
.PHONY: shell

dev:
	@echo App is open at http://localhost:5000
	docker run -it --rm -v  $$PWD:/usr/share/nginx/html -p 5000:80 ruphin/webserve
.PHONY: dev

build:
	docker run -it --rm -v $$PWD:/app ruphin/webdev yarn run build
.PHONY: build

publish: build
	docker run -it --rm -v $$PWD:/app -v $$HOME/.gitconfig:/home/app/.gitconfig -v $$HOME/.ssh:/home/app/.ssh ruphin/webdev yarn publish
.PHONY: publish

production:
	docker build -t ruphin/gluonpages .
.PHONY: production
