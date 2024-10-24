# Projet de fin de module API Node.js - Claude Boulay & Steven Coublant

Ceci est un repository pour le projet Node.js de fin de module.

# Qu'est ce que cette API ?

Ce projet est une API de gestion de train et de station. Elle permet à certains utilisateurs de faire des actions sur les trains et/ou les stations en fonction de leur **rôle**. Grâce à ces rôles, les utilisateurs auront plus ou moins de droits sur les trains/stations.

Actions possibles sur les trains et les stations :

- Create, Read, Update, Delete (CRUD).
- Tous les utilisateurs : Read.
- **Administrateurs** : Create, Update, Delete.

# Authentification

Les utilisateurs doivent se connecter pour obtenir un **token** JWT, qui est nécessaire pour accéder à certaines routes de l'API. Ce token doit être inclus dans les en-têtes des requêtes pour les actions nécessitant une authentification.

# Setup & Exécution de l'API

1. Installer les packages

    **npm install** (dans un terminal) pour installer les packages nécessaires au bon fonctionnement de l'API.

2. Démarrer l'API (le serveur)

    Dans un terminal : **node server.js**.

    Résultats attendus :
    - Un message indiquant que la connexion à la base de données MongoDB est réussie.
    - Un message indiquant sur quel port tourne le projet.

3. Tests des routes

    Via un outil comme PostMan, tester les différentes routes via des requêtes. La documentation Swagger est également disponible pour explorer les endpoints et voir les exemples de requêtes.

# Documentation Swagger

Pour visualiser et tester les endpoints de l'API, vous pouvez accéder à la documentation Swagger à l'URL suivante :

http://localhost:3000/RailRoad/api-docs

# Gestion des erreurs

L'API inclut une gestion des erreurs qui renvoie des messages appropriés en cas de problème, ce qui permet de diagnostiquer facilement les problèmes rencontrés lors des requêtes.