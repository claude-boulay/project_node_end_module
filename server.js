import express from 'express';
import fs from "fs";
import mongoose from 'mongoose';
import YAML from 'yaml';
import { Server } from "socket.io";
import UserRouter from './routes/UserRouter.js';

const BdUrl = "mongodb+srv://ClaudeB:Cyberbouffon5@cluster0.nc5na.mongodb.net/RailRoad";
const app = express();
const Port = 3000;

// Connexion à MongoDB
mongoose.connect(BdUrl)
    .then(() => {
        console.log("MongoDB connected");
        const server = app.listen(Port, () => console.log(`Server running on port ${Port}`));
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Arrêter le processus si la connexion échoue
    });

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Middleware pour gérer les erreurs de syntaxe JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send({ error: 'Invalid JSON syntax' }); // Retourner un message d'erreur
    }
    next(); // Passer à la suite si ce n'est pas une erreur de syntaxe JSON
});

// Routes pour la gestion des utilisateurs
app.use("/RailRoad/users", UserRouter);

// Middleware pour gérer les routes non trouvées (404)
app.use((req, res, next) => {
    res.status(404).send("Page not found");
});

export default app;
