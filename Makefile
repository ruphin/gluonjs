shell:
	docker run -it --rm -v $$PWD:/app -v $$HOME/.gitconfig:/home/app/.gitconfig ruphin/webdev bash
.PHONY: shell

build:
	docker run -it --rm -v $$PWD:/app ruphin/webdev yarn run build
.PHONY: build

publish: build
	docker run -it --rm -v $$PWD:/app -v $$HOME/.git:/home/app/.git -v $$HOME/.ssh:/home/app/.ssh ruphin/webdev yarn publish
.PHONY: build
