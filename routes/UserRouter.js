import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { getUser, updateUser, deleteUser, createUser, Connected } from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import { authOptionnelMiddlewares } from '../middlewares/authOptionnelMiddlewares.js';
import { validUser } from '../middlewares/validationUserMiddlewares.js';

// Obtention de la clé secrète du fichier .env
const secret = config().parsed.SECRET;

// Permet de savoir si l'utilisateur est connecté sur les routes où cela est optionnel 
const router = express.Router();

// Vérifie que les données envoyées sont valides (email et mot de passe soumis à un regex, etc...)
router.use(authOptionnelMiddlewares);
router.use(validUser);

// Routes des utilisateurs
router.post('/register', async (req, res) => {
    let parsedBody = req.body;

    if (req.user != false && req.user.role === 'admin') {
        if (parsedBody.role == 'admin' || parsedBody.role == 'user' || parsedBody.role == 'employée') {
            try {
                const user = await createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, parsedBody.role);
                const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
                return res.status(201).send({ token });
            } catch (err) {
                // Utilisation correcte de res.status()
                return res.status(400).send("Erreur lors de la création de l'utilisateur: " + err.message);
            }
        } else {
            return res.status(400).send("Rôle invalide");
        }
    } else {
        try {
            const user = await createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, "user");
            const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
            return res.status(201).send({ token, id: user._id });
        } catch (err) {
            // Utilisation correcte de res.status()
            return res.status(400).send("Erreur lors de la création de l'utilisateur: " + err.message);
        }
    }
});

router.post('/login', (req, res) => {
    let body = req.body;
    Connected(body.email, body.password).then((user) => {
        if (user) {
            const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
            res.status(200).send({ token });
            res.end();
        } else {
            res.status(401).send({ error: "Identifiants invalides" });
            res.end();
        }
    }).catch((err) => {
        res.status(401).send({ error: "Identifiants invalides", "admin": err.message });
        res.end();
    });
});

router.use(authMiddleware);
router.get('/:id', (req, res) => {
    // Vérifie si l'utilisateur connecté n'est pas le propriétaire et n'est pas admin
    if (req.user.id !== req.params.id && req.user.role === "user") {
        return res.status(403).send({ 
            error: "Interdit : vous n'êtes pas autorisé à accéder aux données de cet utilisateur. Seul le propriétaire peut accéder à ses propres données." 
        });
    } else {
        getUser(req.params.id).then((user) => {
            if (!user) {
                // Si l'utilisateur n'existe pas, renvoie un message d'erreur
                return res.status(404).send({ error: "Utilisateur inexistant" });
            }
            // Si l'utilisateur est trouvé, renvoie ses données
            res.status(200).json(user);
        }).catch((err) => {
            // En cas d'erreur inattendue, renvoie une erreur générique
            res.status(500).send({ error: "Erreur lors de la récupération de l'utilisateur" });
        });
    }
});

router.put('/:id', (req, res) => {
    if (req.user.id != req.params.id && req.user.role != "admin") {
        res.status(403).send({ error: "Interdit : vous n'êtes pas autorisé à accéder aux données de cet utilisateur. Seul le propriétaire peut accéder à ses propres données." });
        res.end();  
        
        // Quitte la fonction immédiatement sans exécuter de code restant
        return;  
    } else {
        updateUser(req.params.id, req.body).then(() => {
            res.status(201).send("Utilisateur mis à jour avec succès");
            res.end();
        }).catch((err) => {
            res.status(400).send({ error: "Données invalides", err: err.message });
            res.end();
        });
    }
});

router.delete('/:id', (req, res) => {
    if (req.user.id != req.params.id) {
        res.status(403).send({ error: "Interdit : vous n'êtes pas autorisé à accéder aux données de cet utilisateur. Seul le propriétaire peut accéder à ses propres données." });
        res.end(); 
        return;
    } else {
        deleteUser(req.params.id).then(() => {
            res.status(200).send("Utilisateur supprimé avec succès");
            res.end();
        }).catch((err) => {
            res.status(404).send({ error: "Utilisateur non trouvé" });
            res.end();
        });
    }
});

export default router;