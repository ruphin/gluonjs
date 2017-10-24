dev:
	docker run -it --rm -v $$PWD:/app -p 5000:5000 ruphin/webdev yarn run dev
.PHONY: dev

shell:
	docker run -it --rm -v $$PWD:/app ruphin/webdev bash
.PHONY: shell

build:
	docker run -it --rm -v $$PWD:/app ruphin/webdev yarn run build
.PHONY: build

publish: build
	docker run -it --rm -v $$PWD:/app -v $$HOME/.gitconfig:/home/app/.gitconfig -v $$HOME/.ssh:/home/app/.ssh ruphin/webdev yarn publish
.PHONY: publish
