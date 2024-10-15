# Étape 1: Construction de l'image
FROM node:22 AS builder

WORKDIR /app

# Copiez les fichiers package.json et installez les dépendances
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

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copier le fichier .env dans l'image
COPY .env ./

# Exposez le port pour NestJS
EXPOSE 3000

# Démarrez l'application en mode production
CMD ["node", "dist/src/main.js"]
