FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start"]
