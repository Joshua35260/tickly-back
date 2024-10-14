# Étape 1: Construction de l'image
FROM node:22 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier tous les fichiers de l'application
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Étape 2: Image finale
FROM node:22

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma  # Copiez le dossier Prisma dans l'image finale

# Exposer le port pour NestJS
EXPOSE 3000

# Démarrer l'application en mode production
CMD ["npm", "run", "start:prod"]
