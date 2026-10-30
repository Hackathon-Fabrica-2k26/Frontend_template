FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN echo ">>> VITE_API_URL=[$VITE_API_URL]"
RUN npm run build

FROM nginx:alpine
ARG VITE_API_URL
# Usada no connect-src da Content-Security-Policy (nginx.conf).
ENV API_URL=$VITE_API_URL
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
