import { expect } from "chai";
import supertest from "supertest";
import app from "../server.js";
import Train from "../models/TrainModel.js"; 
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

const request = supertest(app);
let trainId = null; // Pour stocker l'ID du train créé
let token = null; // Pour stocker le token d'admin
const secret = config().parsed.SECRET;

before(async () => {
    // Se connecter en tant qu'administrateur pour obtenir un token
    const loginResponse = await request.post("/RailRoad/users/login").send({
        email: "steven@gmail.com",
        password: "Steven@123" 
    });
    token = loginResponse.body.token; // Sauvegarder le token

    // Créer un train de test avant de commencer les tests
    const trainResponse = await request.post("/RailRoad/trains")
        .set('Authorization', `Bearer ${token}`) // Ajouter le token dans les headers
        .send({
            name: "Train EXP",
            start_station: "6717525ff9c5d5597fe74e76", // ID de la station de départ
            end_station: "671a361b34570d76745d8b9d", // ID de la station d'arrivée
            time_of_departure: "2024-10-22T14:20:00"
        });

    trainId = trainResponse.body.id; // Sauvegarder l'ID du train pour les tests suivants
});

describe("Train routes", () => {
    after(async () => {
        // Nettoyer la base de données après les tests
        await Train.deleteMany(); // Supprimer les trains créés durant les tests
    });

    it("Récupération de tous les trains", async () => {
        const response = await request.get("/RailRoad/trains");
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
        expect(response.body).to.have.length.greaterThan(0); // Vérifie qu'il y a des trains dans la réponse
    });

    it("Récupération d'un train spécifique", async () => {
        const response = await request.get(`/RailRoad/trains/${trainId}`);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("object");
        expect(response.body.name).to.equal("Train EXP"); // Vérifie que le nom du train est correct
    });
});
