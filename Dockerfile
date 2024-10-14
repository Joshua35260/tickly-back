# Étape 1: Construction de l'image
FROM node:22 AS builder

WORKDIR /app

# Copiez les fichiers package.json et installez les dépendances
COPY package*.json ./
RUN npm install

# Copiez tous les fichiers de l'application
COPY . .  # Cela inclut tous les fichiers, y compris ceux de Prisma

# Générer le client Prisma et construire l'application
RUN npx prisma generate
RUN npm run build

# Étape 2: Image finale
FROM node:22

WORKDIR /app

# Copier les fichiers depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/prisma ./prisma  # Pas nécessaire si tous les fichiers Prisma sont déjà inclus

# Exposez le port pour NestJS
EXPOSE 3000

# Démarrez l'application en mode production
CMD ["npm", "run", "start:prod"]
