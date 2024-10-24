import express from 'express';
import { createTrain, getTrains, getTrain, updateTrain, deleteTrain } from '../controllers/TrainController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import TrainModel from '../models/TrainModel.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trains
 *   description: API pour gérer les trains
 */

/**
 * @swagger
 * /trains:
 *   post:
 *     summary: Créer un train
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_station:
 *                 type: string
 *               end_station:
 *                 type: string
 *               time_of_departure:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - name
 *               - start_station
 *               - end_station
 *               - time_of_departure
 *     responses:
 *       201:
 *         description: Train créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       403:
 *         Accès interdit : seul un administrateur peur créer un train.
 *       400:
 *         description: Erreur lors de la création du train
 */
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut créer un train." });
    }

    try {
        const { name, start_station, end_station, time_of_departure } = req.body;

        // // Vérification si les gares de départ et d'arrivée sont les mêmes
        // if (start_station === end_station) {
        //     return res.status(400).json({ error: "La gare de départ ne peut pas être la même que celle d'arrivée." });
        // }

        // Vérification de l'existence d'un train avec le même nom (insensible à la casse), même station et même horaire
        const existingTrain = await TrainModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            start_station, 
            end_station, 
            time_of_departure 
        });
        
        if (existingTrain) {
            return res.status(400).json({ error: "Un train avec le même nom, les mêmes stations et le même horaire existe déjà." });
        }

        const train = await createTrain(name, start_station, end_station, time_of_departure);
        return res.status(201).json({ 
            message: "Train créé avec succès",
            id: train._id 
        });
    } catch (err) {
        return res.status(400).json({ error: "Erreur lors de la création du train", message: err.message });
    }
});

/**
 * @swagger
 * /trains:
 *   get:
 *     summary: Lister tous les trains
 *     tags: [Trains]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Limite le nombre de trains retournés
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *         description: Champ par lequel trier les résultats
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *         description: Ordre de tri ('asc' ou 'desc')
 *     responses:
 *       200:
 *         description: Liste des trains
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   start_station:
 *                     type: string
 *                   end_station:
 *                     type: string
 *                   time_of_departure:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erreur lors de la récupération des trains
 */
router.get('/', (req, res) => {
    const { limit = 10, sortBy = 'time_of_departure', order = 'asc' } = req.query;

    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1; // 1 pour ascendant, -1 pour descendant

    getTrains(parseInt(limit), sort)
        .then(trains => res.status(200).json(trains))
        .catch(err => res.status(500).send({ error: "Erreur lors de la récupération des trains", message: err.message }));
});

/**
 * @swagger
 * /trains/{id}:
 *   get:
 *     summary: Obtenir un train par son ID
 *     tags: [Trains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du train
 *     responses:
 *       200:
 *         description: Détails du train
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 start_station:
 *                   type: string
 *                 end_station:
 *                   type: string
 *                 time_of_departure:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Train non trouvé
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;

    getTrain(id)
        .then(train => res.status(200).json(train))
        .catch(err => res.status(404).send({ error: "Train non trouvé", message: err.message }));
});

/**
 * @swagger
 * /trains/{id}:
 *   put:
 *     summary: Mettre à jour un train
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []  # Si tu utilises une authentification par token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du train à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_station:
 *                 type: string
 *               end_station:
 *                 type: string
 *               time_of_departure:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Train mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       403:
 *         Accès interdit : seul un administrateur peur mettre à jour un train.
 *       404:
 *         description: Train non trouvé
 *       400:
 *         description: Erreur lors de la mise à jour du train
 */
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut mettre à jour un train." });
    }

    try {
        const { id } = req.params;
        const { name, start_station, end_station, time_of_departure } = req.body;

        // // Vérification si les gares de départ et d'arrivée sont les mêmes
        // if (start_station === end_station) {
        //     return res.status(400).json({ error: "La gare de départ ne peut pas être la même que celle d'arrivée." });
        // }

       // Vérification de l'existence d'un autre train avec le même nom, mêmes stations mais un horaire différent
        const existingTrain = await TrainModel.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        start_station, 
        end_station, 
        time_of_departure: { $ne: time_of_departure },  // L'horaire doit être différent
        _id: { $ne: id }  // Exclure le train actuel de la vérification
    });
    
    if (existingTrain) {
        return res.status(400).json({ error: "Un train avec le même nom, les mêmes stations et un horaire différent existe déjà." });
    }

    const updatedTrain = await updateTrain(id, { name, start_station, end_station, time_of_departure });
    return res.status(200).json({ 
        message: "Train mis à jour avec succès",
        id: updatedTrain._id 
    });
    } catch (err) {
        return res.status(400).json({ error: "Erreur lors de la mise à jour du train", message: err.message });
    }
});

/**
 * @swagger
 * /trains/{id}:
 *   delete:
 *     summary: Supprimer un train
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []  # Si tu utilises une authentification par token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du train à supprimer
 *     responses:
 *       200:
 *         description: Train supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         Accès interdit : seul un administrateur peur supprimer un train.
 *       404:
 *         description: Train non trouvé
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut supprimer un train." });
    }

    const { id } = req.params;
    try {
        await deleteTrain(id);
        return res.status(200).json({ message: "Train supprimé avec succès" });
    } catch (err) {
        return res.status(404).send({ error: "Train non trouvé", message: err.message });
    }
});

export default router;
