SHELL=/bin/sh

export BUILDKIT_PROGRESS=tty
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1
export GROUP_ID=$(shell id -u)
export USER_ID=$(shell id -u)

.PHONY: run

docker-install-pre:
	sudo apt remove containerd docker docker-engine docker.io runc -y || true
	sudo apt update -y
	sudo apt install apt-transport-https ca-certificates curl gnupg2 software-properties-common -y

docker-install:
	make docker-install-pre
	$(eval export DISTRIBUTOR_ID=$(shell lsb_release -si))
	$(eval export DISTRIBUTOR_ID=$(shell echo $(DISTRIBUTOR_ID) | awk '{print tolower($$0)}'))
	curl -fsSL https://download.docker.com/linux/$$DISTRIBUTOR_ID/gpg | sudo apt-key add -
	sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/$$DISTRIBUTOR_ID $$(lsb_release -cs) stable"
	sudo apt update -y
	sudo apt install containerd.io docker-ce docker-ce-cli -y
	sudo usermod -aG docker $(USER)

docker-build:
	docker build \
		-f Dockerfile \
		--build-arg GROUP_ID=$$GROUP_ID \
		--build-arg USER_ID=$$USER_ID \
		-t alicorp-pe/atenea-front \
		--no-cache=false \
		.

run-vm:
	make docker-build
	docker run \
		-d \
		--name atenea-front \
		-p 4200:4200/tcp \
		--restart unless-stopped \
		alicorp-pe/atenea-front

run:
	make docker-build
	docker run \
		-it --rm \
		--name atenea-front \
		-p 4200:4200/tcp \
		alicorp-pe/atenea-front

logs:
	docker logs atenea-front

stop:
	docker stop atenea-front
	docker rm atenea-front

file-permission:
	sudo chmod +x mvnw
