import express from 'express';
import { createTrain, getTrains, getTrain, updateTrain, deleteTrain } from '../controllers/TrainController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Route pour créer un train (réservée aux administrateurs)
router.post('/', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut créer un train." });
    }

    const { name, start_station, end_station, time_of_departure } = req.body;

    createTrain(name, start_station, end_station, time_of_departure)
        .then(train => res.status(201).json(train))
        .catch(err => res.status(400).send({ error: "Erreur lors de la création du train", message: err.message }));
});

// Route pour lister tous les trains avec options de tri et de limite
router.get('/', (req, res) => {
    const { limit = 10, sortBy = 'time_of_departure', order = 'asc' } = req.query;

    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1; // 1 pour ascendant, -1 pour descendant

    getTrains(parseInt(limit), sort)
        .then(trains => res.status(200).json(trains))
        .catch(err => res.status(500).send({ error: "Erreur lors de la récupération des trains", message: err.message }));
});

// Route pour obtenir un train par son ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    getTrain(id)
        .then(train => res.status(200).json(train))
        .catch(err => res.status(404).send({ error: "Train non trouvé", message: err.message }));
});

// Route pour mettre à jour un train (réservée aux administrateurs)
router.put('/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut mettre à jour un train." });
    }

    const { id } = req.params;

    updateTrain(id, req.body)
        .then(() => res.status(200).send("Train mis à jour avec succès"))
        .catch(err => res.status(400).send({ error: "Erreur lors de la mise à jour du train", message: err.message }));
});

// Route pour supprimer un train (réservée aux administrateurs)
router.delete('/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Accès interdit : seul un administrateur peut supprimer un train." });
    }

    const { id } = req.params;

    deleteTrain(id)
        .then(() => res.status(200).send("Train supprimé avec succès"))
        .catch(err => res.status(404).send({ error: "Train non trouvé", message: err.message }));
});

export default router;