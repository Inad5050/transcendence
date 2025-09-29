up:
	docker compose up --detach --build

down:
	docker compose down --volumes

rebuild:
	docker compose up --detach --force-recreate

prune:
	docker system prune -all --force --volumes 


.PHONY: up down rebuild prune
