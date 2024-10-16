import express from 'express';
import { createStation, getAllStations, getStationById, updateStation,deleteStation } from '../controllers/StationController.js';
import multer from'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();


// Routes des Stations

router.get('/', (req, res) => {
    // Récupère toutes les stations de la base de données
    // ...
    getAllStations().then((stations) => {
        res.status(200).json(stations);
    }).catch((error) => {
        res.status(500).json({ error: "Error getting stations"+error.message });
    });
   
});

router.post('/create',upload.single("image"), (req, res) => {
    // Crée une nouvelle station dans la base de données
    // ...
    
    createStation(req.body.name, req.body.city, req.body.open_hour, req.body.close_hour, req.body.address, req.file.path).then((station) => {
        res.status(201).json(station);
    }).catch((error) => {
        res.status(500).json({error: "Error creating station"})
    });
});

router.put("/:id",upload.single("image"),(req,res)=>{
    // Met à jour une station dans la base de données
    //...
    
    updateStation(req.params.id, req.body, req.file? req.file.path : null).then((station) => {
        res.status(200).json(station);
    }).catch((error) => {
        res.status(500).json({error: "Error updating station"+error.message});
    });
})

router.get('/:id', (req, res) => {
    // Récupère une station par son ID
    //...
    getStationById(req.params.id).then((station) => {
        if (!station) {
            res.status(404).json({ error: "Station not found" });
        } else {
            res.status(200).json(station);
        }
    }).catch((error) => {
        res.status(500).json({ error: "Error getting station" });
    });
})

router.delete('/:id', (req, res) => {
    // Supprime une station par son ID
    //...
    deleteStation(req.params.id).then(() => {
        res.status(200).json({ message: "Station deleted successfully" });
    }).catch((error) => {
        res.status(500).json({ error: "Error deleting station" });
    });
    
});

export default router;