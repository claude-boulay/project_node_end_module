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

router.get("/", (req, res) => {
  // Récupère toutes les stations de la base de données
  // ...
  getAllStations()
    .then((stations) => {
      res.status(200).json(stations);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error getting stations" + error.message });
    });
});
router.use(authMiddleware);
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

router.put("/:id", upload.single("image"), async (req, res) => {
  // Met à jour une station dans la base de données
  //...

 
  if (req.user!=undefined && req.user.role == "admin") {
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

router.get("/:id", (req, res) => {
  // Récupère une station par son ID
  //...
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

router.delete("/:id", (req, res) => {
  // Supprime une station par son ID
  //...
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
