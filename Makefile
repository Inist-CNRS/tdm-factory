install:
	cd tdm-be && \
	npm install && \
	cd ../tdm-fe && \
	npm install && \
	cd ..


run-dev:
	docker compose -f docker-compose.dev.yml watch

update-front-api:
	cd tdm-be && \
	npm run swagger-autogen && \
	cd ../tdm-fe && \
	npm run generate-api && \
	cd ..
