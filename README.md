# Qu'est-ce que cette API ?

Ce projet est une API de gestion de train et de station. Elle permet à certains utilisateurs de faire des actions sur les trains et/ou les stations en fonction de leur **rôle**. Grâce à ces rôles, les utilisateurs auront plus ou moins de droits sur les trains/stations.

## Actions possibles sur les trains et les stations :
- **CRUD :**
  - Tous les utilisateurs : Read.
  - **Administrateurs :** Create, Update, Delete.

## Authentification
Les utilisateurs doivent se connecter pour obtenir un **token** JWT, nécessaire pour accéder à certaines routes de l'API. Ce token doit être inclus dans les en-têtes des requêtes pour les actions nécessitant une authentification.

## Setup & Exécution de l'API
1. **Installer les packages**
   - Exécutez **npm install** dans le terminal pour installer les dépendances.
   
2. **Démarrer l'API**
   - Exécutez **node server.js** OU **npm run start** dans le terminal. 
   - Attendez les messages de connexion à la base de données et d'écoute sur le port.

3. **Tests des routes**
   - Utilisez PostMan pour tester les différentes routes. Vous pouvez également explorer la documentation Swagger disponible à l'URL :
   - **http://localhost:3000/RailRoad/api-docs**

4. **Tests "manuels" des fonctionnalité**
   - Utilisez les commandes suivantes afin de tester certaines fonctionnalités de l'API      directement dans votre terminal : 
   - user_test (teste les fonctionnalités des utilisateurs)
  - station_test (teste les fonctionnalités des stations)
  - train_test (teste certaines fonctionnalités des trains)

## Gestion des erreurs
L'API inclut une gestion des erreurs qui renvoie des messages appropriés en cas de problème, facilitant ainsi le diagnostic des requêtes.

## Création d'un utilisateur admin
Si vous souhaitez créer un utilisateur ayant comme rôle "admin", il vous faudra être connecté à l'API avec un compte **admin existant** et ajouter la token de cette connexion à l'entête de votre requête HTTP (section header) avec les données suivantes : "Key : Authorization, Value : {{votre token admin}}. 

**Compte administrateur existant :** claude@gmail.com, Mot de passe :  RailRoadAdmin1@