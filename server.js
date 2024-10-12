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
mongoose.connect(BdUrl).then((result) => {
    console.log("MongoDB connected");
    // Démarrage du serveur une fois la connexion établie
    const server = app.listen(Port, () => console.log(`Server running on port ${Port}`));
});

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Routes pour la gestion des utilisateurs
app.use("/RailRoad/users", UserRouter);

// Middleware pour gérer les routes non trouvées (404)
app.use((req, res, next) => {
    res.status(404).send("Page not found");
});

export default app;
