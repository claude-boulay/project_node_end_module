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
router.post('/register', (req, res) => {
    let parsedBody = req.body;

    // Si l'utilisateur est connecté et que l'utilisateur est admin, il peut créer un nouvel utilisateur avec le rôle désiré
    // Sinon, l'utilisateur créé sera un utilisateur ordinaire
    if (req.user != false && req.user.role === 'admin') {

        // Vérifie que seuls les rôles autorisés dans l'énum de Role sont utilisés
        if (parsedBody.role == 'admin' || parsedBody.role == 'user' || parsedBody.role == 'employée') {
            createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, parsedBody.role).then((user) => {

                // Si succès de la création d'un utilisateur, renvoie un token JWT, sinon c'est que l'utilisateur existe déjà
                if (user) {
                    const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
                    res.status(201).send({ token });
                    res.end();
                } else {
                    res.status(400).send("Cet email ou pseudo est déjà pris");
                    res.end();
                }
            }).catch((err) => {
                res.status(400).send("Erreur lors de la création de l'utilisateur", err.message);
                res.end();
            });
        } else {
            res.status(400).send("Rôle invalide");
            res.end();
        }
    } else {
        createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, "user").then((user) => {

            // Si succès de la création d'un utilisateur, renvoie un token JWT, sinon c'est que l'utilisateur existe déjà
            if (user) {
                const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
                res.status(201).send({ token });
                res.end();
            } else {
                res.status(400).send("Cet email ou pseudo est déjà pris");
                res.end();
            }
        }).catch((err) => {
            res.status(400).send("Erreur lors de la création de l'utilisateur");
            res.end();
        });
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
    if (req.user.id != req.params.id && req.user.role == "user") {
        res.status(403).send({ error: "Interdit : vous n'êtes pas autorisé à accéder aux données de cet utilisateur. Seul le propriétaire peut accéder à ses propres données." });
        
        // Arrête l'exécution de la requête et envoie une réponse avec le code de statut 403 (Interdit) et un message dans le corps de la réponse
        res.end();  
    } else {
        getUser(req.params.id).then((user) => {
            res.status(200).json(user);
            res.end();
        }).catch((err) => {
            res.status(404).send({ error: "Utilisateur non trouvé" });
            res.end();
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