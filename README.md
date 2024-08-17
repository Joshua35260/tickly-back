# Likorn-nestJs

<h1>Back Alayde sous NestJs, Prisma, PostgreSQL et Swagger.</h1>
<p>
  N'oubliez pas de créer le fichier .env en prenant comme modèle le env-copy.txt à la racine.
</p>
<p>La bdd tourne sur docker, il faut donc avoir docker desktop de lancer par exemple, et lancer docker compose up, puis lancer npm start pour lancer l'api en local, sinon l'api ne pourra communiquer avec la bdd</p>
<p>
  Utilisez <strong>`prisma studio` ou `npx prisma studio`</strong>, très utile pour voir toutes les tables avec leurs données et même effectuer des actions sur la data de la bdd directement depuis l'interface. Remarque : utilisez `npx prisma` au lieu de simplement `prisma` si prisma n'est pas installé globalement (`npm i prisma -D`).
</p>
<p>Si un changement de schema est fait, pensez à mettre à jour avec le prisma client avec <strong>prisma generate (ou npx prisma generate)</strong>
<p>
  Exécutez  <strong>`prisma migrate dev --name "init"`</strong> ou simplement `npm run migrate` avec le script dans package.json pour mettre à jour votre base de données avec le schéma de migration actuel, de docker/localhost à prisma/migration.
</p>
<p>
  Utilisez <strong>`npx nest generate resource`</strong>, une commande très utile pour créer un module avec son contrôleur, son service, son module et son DTO (évitez de le faire à la main).
</p>
<p>
  En résumé, vous utiliserez <strong>`prisma generate`</strong> chaque fois que vous apportez des modifications à votre schéma Prisma pour régénérer le client Prisma, et vous utiliserez <strong>`prisma migrate dev`</strong> chaque fois que vous apportez des modifications à votre schéma Prisma et que vous souhaitez appliquer ces modifications à votre base de données. Ces deux commandes sont essentielles pour maintenir la cohérence entre votre schéma de base de données Prisma et votre application NestJS. Assurez-vous que vous avez exécuté `prisma generate` après avoir modifié votre schéma Prisma pour générer les types TypeScript correspondants.
</p>
<p>
  Extension vscode pour prisma : https://marketplace.visualstudio.com/items?itemName=Prisma.prisma
</p>

<p>
  Et enfin, indispensable, accédez à Swagger et l'API via http://localhost/3000/api.
</p>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
# alayde-back
