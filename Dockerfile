# Étape 1: Construction de l'image
FROM node:22 AS builder

WORKDIR /app

# Copiez les fichiers package.json et install dependencies
COPY package*.json ./
RUN npm install

# Copiez les fichiers Prisma
COPY prisma ./prisma/

# Copiez tous les fichiers de l'application
COPY . .

# Générer le client Prisma et construire l'application
RUN npx prisma generate
RUN npm run build

# Étape 2: Image finale
FROM node:22

WORKDIR /app

# Copier les fichiers depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exposez le port pour NestJS
EXPOSE 3000

# Démarrez l'application en mode production
CMD ["npm", "run", "start:prod"]
