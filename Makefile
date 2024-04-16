install:
	cd tdm-types && \
	npm install && \
	cd ../tdm-backend && \
	npm install && \
	cd ../tdm-frontend && \
	npm install && \
	cd ..

run-dev:
	docker compose -f docker-compose.dev.yml up --force-recreate

run-docker:
	docker build --tag 'tdm-factory:latest' .
	docker run -p 3000:3000 'tdm-factory:latest'

update-front-api:
	cd tdm-be && \
	npm run swagger-autogen && \
	cd ../tdm-fe && \
	npm run generate-api && \
	cd ..
