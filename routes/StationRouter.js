import express from "express";
import {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
  deleteStation,
} from "../controllers/StationController.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import sharp from "sharp";
import fs from "fs";

const storage = multer.memoryStorage();
let dest = "uploads/";
const upload = multer({
  storage: storage,
  limits: { fileSize: 16000000 }, // 16MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!").message);
    }
    file.filename = file.originalname + ".jpg";
    cb(undefined, true);
  },
});

const router = express.Router();

// Routes des Stations

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Récupérer toutes les stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: Liste de toutes les stations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   city:
 *                     type: string
 *                   open_hour:
 *                     type: string
 *                   close_hour:
 *                     type: string
 *                   address:
 *                     type: string
 *       500:
 *         description: Erreur lors de la récupération des stations
 */
router.get("/", (req, res) => {
  // Récupère toutes les stations de la base de données
  getAllStations()
    .then((stations) => {
      res.status(200).json(stations);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error getting stations" + error.message });
    });
});

router.use(authMiddleware);

/**
 * @swagger
 * /stations/create:
 *   post:
 *     summary: Créer une nouvelle station
 *     tags: [Stations]
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
 *               city:
 *                 type: string
 *               open_hour:
 *                 type: string
 *               close_hour:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Station créée avec succès
 *       403:
 *         description: Accès interdit,  seul un administrateur peut créer une station
 *       500:
 *         description: Erreur lors de la création de la station
 */
router.post("/create", upload.single("image"), async (req, res) => {
  // Crée une nouvelle station dans la base de données
  if (req.user != undefined && req.user.role == "admin") {
    try {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize({
          width: 200,
          height: 200,
        })
        .toFormat("jpeg")
        .toBuffer();

      const outputPath = dest + `${Date.now()}-${req.file.originalname}`;
      fs.writeFileSync(outputPath, buffer);

      createStation(
        req.body.name,
        req.body.city,
        req.body.open_hour,
        req.body.close_hour,
        req.body.address,
        outputPath
      )
        .then((station) => {
          res.status(201).json(station);
        })
        .catch((error) => {
          res.status(500).json({ error: "Error creating station" });
        });
    } catch (error) {
      res.status(500).json({ error: "Error processing image" });
      throw error;
    }
  } else {
    res.status(403).json({ error: "Forbidden" }); // Forbidden (403) si l'utilisateur n'est pas administrateur
  }
});

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     summary: Mettre à jour une station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la station à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               open_hour:
 *                 type: string
 *               close_hour:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Station mise à jour avec succès
 *       403:
 *         description: Accès interdit,  seul un administrateur peut mettre à jour une station
 *       400:
 *         description: Erreur lors de la mise à jour de la station
 */
router.put("/:id", upload.single("image"), async (req, res) => {
  // Met à jour une station dans la base de données  
  if (req.user != undefined && req.user.role == "admin") {
    try { 
      let outputPath = "";
      if (req.file != null && req.file != undefined) {
        const buffer = await sharp(req.file.buffer)
          .png()
          .resize({
            width: 200,
            height: 200,
          })
          .toFormat("jpeg")
          .toBuffer();
        outputPath = dest + `${Date.now()}-${req.file.originalname}`;
        fs.writeFileSync(outputPath, buffer);
      }
      updateStation(req.params.id, req.body, req.file ? outputPath : null)
        .then((station) => {
          res.status(200).json(station);
        })
        .catch((error) => {
          res.status(500).json({ error: "Error updating station" });
        });
    } catch (error) {
      res.status(400).json({ error: "Error processing image" });
    }
  } else {
    res.status(403).json({ error: "Forbidden" }); // Forbidden (403) si l'utilisateur n'est pas administrateur
  }
});

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: Récupérer une station par ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la station à récupérer
 *     responses:
 *       200:
 *         description: Station trouvée
 *       404:
 *         description: Station non trouvée
 *       500:
 *         description: Erreur lors de la récupération de la station
 */
router.get("/:id", (req, res) => {
  // Récupère une station par son ID
  getStationById(req.params.id)
    .then((station) => {
      if (!station) {
        res.status(404).json({ error: "Station not found" });
      } else {
        res.status(200).json(station);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Error getting station" });
    });
});

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: Supprimer une station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la station à supprimer
 *     responses:
 *       200:
 *         description: Station supprimée avec succès
 *       403:
 *         description: Accès interdit,  seul un administrateur peut supprimer une station
 *       404:
 *         description: Station non trouvée
 *       500:
 *         description: Erreur lors de la suppression de la station
 */
router.delete("/:id", (req, res) => {
  // Supprime une station par son ID
  if (req.user.role == "admin") {
    deleteStation(req.params.id)
      .then(() => {
        res.status(200).json({ message: "Station deleted successfully" });
      })
      .catch((error) => {
        res.status(500).json({ error: "Error deleting station" });
      });
  } else {
    res.status(403).json({ error: "Forbidden" }); // Forbidden (403) si l'utilisateur n'est pas administrateur
  }
});

export default router;
