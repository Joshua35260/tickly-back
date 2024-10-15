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

# Définissez les variables d'environnement
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
ENV JWT_SECRET=${JWT_SECRET}

# Exposez le port pour NestJS
EXPOSE 3000

# Démarrez l'application en mode production
CMD ["node", "dist/src/main.js"]
