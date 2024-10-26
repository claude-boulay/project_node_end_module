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
    // Vérifie si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Access denied: Only admin can create a train." });
    }

    try {
        const { name, start_station, end_station, time_of_departure } = req.body;

        // Vérifie si les gares de départ et d'arrivée sont identiques
        if (start_station === end_station) {
            return res.status(400).json({ error: "Departure and arrival stations cannot be the same." });
        }

        // Vérifie s'il existe déjà un train avec les mêmes informations
        const existingTrain = await TrainModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            start_station, 
            end_station, 
            time_of_departure 
        });
        
        if (existingTrain) {
            return res.status(400).json({ error: "A train with the same name, stations, and schedule already exists." });
        }

        const train = await createTrain(name, start_station, end_station, time_of_departure);
        return res.status(201).json({ 
            message: "Train successfully created",
            id: train._id
        });
    } catch (err) {
        return res.status(400).json({ error: "Error creating the train", message: err.message });
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
router.get('/', async (req, res) => {
    try {
        const { limit = 10, sortBy = 'time_of_departure', order = 'asc' } = req.query;

        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1; // 1 pour ascendant, -1 pour descendant

        // Récupération des trains depuis la base de données
        const trains = await TrainModel.find()
            .limit(parseInt(limit))
            .sort(sort)
            .populate('start_station')   // Récupère la station de départ
            .populate('end_station');    // Récupère la station d'arrivée

        res.status(200).json(trains);
    } catch (err) {
        res.status(500).send({ error: "Error fetching trains", message: err.message });
    }
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

    // Récupération du train par son ID
    getTrain(id)
        .then(train => res.status(200).json(train))
        .catch(err => res.status(404).send({ error: "Train not found", message: err.message }));
});

/**
 * @swagger
 * /trains/{id}:
 *   put:
 *     summary: Mettre à jour un train
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
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
    // Vérifie si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Access denied: Only admin can update a train." });
    }

    try {
        const { id } = req.params;
        const { name, start_station, end_station, time_of_departure } = req.body;

        // Récupère les données actuelles du train
        const existingTrainData = await TrainModel.findById(id);
        if (!existingTrainData) {
            return res.status(404).json({ error: "Train not found." });
        }

        // Utilise les données actuelles si elles ne sont pas fournies dans la requête
        const updatedName = name || existingTrainData.name;
        const updatedStartStation = start_station || existingTrainData.start_station;
        const updatedEndStation = end_station || existingTrainData.end_station;
        const updatedTimeOfDeparture = time_of_departure || existingTrainData.time_of_departure;

        // Vérifie si les gares de départ et d'arrivée sont identiques
        if (updatedStartStation === updatedEndStation) {
            return res.status(400).json({ error: "Departure and arrival stations cannot be the same." });
        }

        // Vérifie si un autre train avec les mêmes données existe déjà
        const existingTrain = await TrainModel.findOne({
            name: { $regex: new RegExp(`^${updatedName}$`, 'i') },
            start_station: updatedStartStation,
            end_station: updatedEndStation,
            time_of_departure: updatedTimeOfDeparture,
            _id: { $ne: id } // Exclut le train actuel de la recherche
        });

        if (existingTrain) {
            return res.status(400).json({ error: "A train with the same name, stations, and schedule already exists." });
        }

        // Met à jour le train dans la base de données
        const updatedTrain = await updateTrain(id, updatedName, updatedStartStation, updatedEndStation, updatedTimeOfDeparture);

        res.status(200).json({ message: "Train successfully updated", id: updatedTrain._id });
    } catch (err) {
        res.status(400).json({ error: "Error updating the train", message: err.message });
    }
});

/**
 * @swagger
 * /trains/{id}:
 *   delete:
 *     summary: Supprimer un train
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Erreur lors de la suppression du train
 */
router.delete('/:id', authMiddleware, (req, res) => {
    // Vérifie si l'utilisateur est un administrateur
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Access denied: Only admin can delete a train." });
    }

    const { id } = req.params;

    deleteTrain(id)
        .then(() => res.status(200).json({ message: "Train successfully deleted" }))
        .catch(err => res.status(404).send({ error: "Train not found", message: err.message }));
});

export default router;
