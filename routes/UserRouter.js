import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { getUser, updateUser, deleteUser, createUser, Connected } from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import { authOptionnelMiddlewares } from '../middlewares/authOptionnelMiddlewares.js';
import { validUser } from '../middlewares/validationUserMiddlewares.js';

// Obtention de la clé secrète du fichier .env
config(); 
const secret = config().parsed.SECRET;

// Permet de savoir si l'utilisateur est connecté sur les routes où cela est optionnel 
const router = express.Router();

// Vérifie que les données envoyées sont valides (email et mot de passe soumis à un regex, etc...)
router.use(authOptionnelMiddlewares);
router.use(validUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /RailRoad/users/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides ou utilisateur déjà existant
 */
router.post('/register', validUser, (req, res) => {
    let parsedBody = req.body;
    if (req.user && req.user.role === 'admin') {
        if (['admin', 'user', 'employée'].includes(parsedBody.role)) {
            createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, parsedBody.role)
                .then((user) => {
                    const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
                    res.status(201).send({ token });
                })
                .catch((err) => {
                    res.status(400).send({ error: "Error creating the user", message: err.message });
                });
        } else {
            res.status(400).send({ error: "Invalid role." });
        }
    } else {
        createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, "user")
            .then((user) => {
                const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
                res.status(201).send({ token, id: user._id });
            })
            .catch((err) => {
                res.status(400).send({ error: "Error creating the user", message: err.message });
            });
    }
});

/**
 * @swagger
 * /RailRoad/users/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie, retourne un token
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', (req, res) => {
    let body = req.body;
    Connected(body.email, body.password)
        .then((user) => {
            const token = jwt.sign({ id: user._id, pseudo: user.pseudo, role: user.role }, secret, { expiresIn: '1h' });
            res.status(200).send({ token });
        })
        .catch((err) => {
            res.status(401).send({ error: "Invalid data", "admin": err.message });
        });
});

/**
 * @swagger
 * /RailRoad/users/{id}:
 *   get:
 *     summary: Obtenir les détails d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur retournés
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', (req, res) => {
    getUser(req.params.id)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(404).send({ error: "User not found" });
        });
});

/**
 * @swagger
 * /RailRoad/users/{id}:
 *   put:
 *     summary: Mettre à jour les informations d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Informations de l'utilisateur mises à jour avec succès
 *       400:
 *         description: Données invalides
 */
router.put('/:id', (req, res) => {
    updateUser(req.params.id, req.body).then(() => {
        res.status(201).send("User successfully updated");
    }).catch((err) => {
        res.status(400).send({ error: "Invalid data" });
    });
});

/**
 * @swagger
 * /RailRoad/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id', (req, res) => {
    deleteUser(req.params.id).then(() => {
        res.status(200).send("User successfully deleted");
    }).catch((err) => {
        res.status(404).send({ error: "User not found", message: err.message });
    });
});

export default router;