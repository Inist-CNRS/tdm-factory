FROM node:18.19-bullseye-slim
RUN useradd -ms /bin/sh -u 1001 app
USER app
COPY --chown=app:app . /app
