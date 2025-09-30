COMPOSE = docker-compose

all: up
up:
	@$(COMPOSE) up -d --build
down:
	@$(COMPOSE) down
stop:
	@$(COMPOSE) stop
logs:
	@$(COMPOSE) logs -f

re: down
	@$(COMPOSE) up -d --build --force-recreate

clean: down
	@docker system prune -af
ps:
	@$(COMPOSE) ps

.PHONY: all up down stop logs re clean ps
