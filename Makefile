install:
	cd tdm-be && \
	npm install && \
	cd ../tdm-fe && \
	npm install && \
	cd ../tdm-admin && \
	npm install && \
	cd ..


run-dev:
	docker compose -f docker-compose.dev.yml up --force-recreate

run-docker:
	docker build --tag 'tdm-factory:latest' .
	docker run -p 3000:3000 'tdm-factory:latest'

lint-fix:
	cd tdm-be && \
	npm run lint && \
	cd ../tdm-fe && \
	npm run lint && \
	npm run stylelint && \
	cd ../tdm-admin && \
	npm run stylelint && \
	npm run lint && \
	cd ..
