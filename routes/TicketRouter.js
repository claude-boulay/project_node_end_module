import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { createTicket, ConfirmedTicket, getAllTicketsByUser, DeleteTicket } from "../controllers/TicketController.js";
import { validTicket } from "../middlewares/validationTicketMiddlewares.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Créer un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainId:
 *                 type: string
 *               classe:
 *                 type: integer
 *                 description: 1 pour 1ère classe, 2 pour 2ème classe
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Ticket créé avec succès
 *       500:
 *         description: Erreur lors de la création du ticket, train invalide
 */
router.post("/", validTicket, function(req, res) {
    if (req.body != undefined) {
        createTicket(req.user.id, req.body.trainId, req.body.classe, req.body.price)
        .then((ticket) => {
            res.status(201).json(ticket);
        }).catch((error) => {
            res.status(500).send({error: "Error creating ticket, Invalid Train"});
        });
    }
});

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Récupérer tous les tickets de l'utilisateur connecté
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tickets
 *       500:
 *         description: Erreur lors de la récupération des tickets
 *       401:
 *         description: Non autorisé
 */
router.get("/", function(req, res) {
    if (req.user != undefined) {
        getAllTicketsByUser(req.user.id)
        .then((tickets) => {
            res.status(200).json(tickets);
        }).catch((err) => {
            res.status(500).send({error: "Error getting tickets"});
        });
    } else {
        res.status(401).send({error: "Unauthorized"});
    }
});

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Confirmer un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à confirmer
 *     responses:
 *       200:
 *         description: Ticket confirmé avec succès
 *       404:
 *         description: L'utilisateur n'est pas le propriétaire du ticket
 *       500:
 *         description: Erreur lors de la confirmation du ticket
 *       401:
 *         description: Non autorisé
 */
router.put("/:id", function(req, res) {
    if (req.user != undefined) {
        ConfirmedTicket(req.params.id, req.user.id)
        .then((ticket) => {
            if (ticket) {
                res.status(200).send("Your ticket has been confirmed");
            } else {
                res.status(404).send({error: "You're not the owner of this ticket"});
            }
        }).catch((err) => {
            res.status(500).send({error: "Error confirming ticket"});
        });
    } else {
        res.status(401).send({error: "Unauthorized"});
    }
});

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Supprimer un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à supprimer
 *     responses:
 *       200:
 *         description: Ticket supprimé avec succès
 *       404:
 *         description: L'utilisateur n'est pas le propriétaire du ticket
 *       500:
 *         description: Erreur lors de la suppression du ticket
 *       401:
 *         description: Non autorisé
 */
router.delete("/:id", function(req, res) {
    if (req.user != undefined) {
        DeleteTicket(req.params.id, req.user.id)
        .then((ticket) => {
            res.status(200).send("Your ticket has been deleted");
        }).catch((err) => {
            res.status(404).send({error: "You're not the owner of this ticket"});
        });
    } else {
        res.status(401).send({error: "Unauthorized"});
    }
});

export default router;
