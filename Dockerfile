FROM node:22.15-alpine3.20 AS frontend-builder
WORKDIR /app/web
COPY web/ .
RUN rm -rf node_modules
RUN npm install --legacy-peer-deps
RUN npm run build


FROM node:22.15-alpine3.20 AS buildapplicationserver

WORKDIR /app
# Set variables
ENV HOME="/sltk"
ENV APP_CODE="${HOME}/code/sltk"
ENV USER_HOME="/home/appuser"

# Create folders
RUN  mkdir -p ${APP_CODE}/ && \
  mkdir -p ${APP_CODE}/packages/ && \
  mkdir -p ${APP_CODE}/public/


# Copy backend code
COPY api/ ${APP_CODE}/
# Copy built frontend to backend's public folder
COPY --from=frontend-builder /app/web/dist/spa ${APP_CODE}/public

# Move to app dir
WORKDIR ${APP_CODE}
COPY api/package*.json ./
RUN echo "Package Name: $(jq -r '.name' package.json)"
RUN echo "Package Name: $(sed -n 's/.*"name": "\(.*\)",*/\1/p' package.json)"
RUN npm install eslint --unsafe-perm=true --allow-root --legacy-peer-deps
RUN npm run build

WORKDIR ${APP_CODE}

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]
