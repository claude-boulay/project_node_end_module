import { expect } from "chai";
import supertest from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { createUser, getUser, deleteUser, Connected, updateUser } from "../controllers/UserController.js";
import User from "../models/UserModel.js";
import "mocha";
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

let headers = {};
let id = null;
const secret = config().parsed.SECRET;

const request = supertest(app);

describe("User routes", () => {
    describe("Connexion et création utilisateur", () => {

        // Nettoyage après les tests pour supprimer l'utilisateur de test
        after(async () => {
            await User.findOneAndDelete({ email: "testuser@example.com" });
        });

        // Test de la création d'un nouvel utilisateur
        it("Création d'un utilisateur", async () => {
            const response = await request.post("/RailRoad/users/register").send({
                pseudo: "testuser",
                email: "testuser@example.com",
                password: "Password5@"
            });
            expect(response.status).to.equal(201);
            expect(response.body.token);
        });
        
        // Test de la connexion avec l'utilisateur créé
        it("Connexion avec un utilisateur", async () => {
            const response = await request.post("/RailRoad/users/login").send({
                email: "testuser@example.com",
                password: "Password5@"
            });
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("token");
        });
    });

    describe("Gestion des utilisateurs", () => {

        // Avant les tests, on enregistre un utilisateur admin et on stocke son token
        before(async () => {
            const response = await request.post("/RailRoad/users/register").send({
                email: "admin@example.com",
                password: "Password5@",
                pseudo: "admin",
            });
            const token = response.body.token;
            const decoded = jwt.verify(token, secret);

            // Récupération de l'ID de l'utilisateur
            id = decoded.id; 
            headers = {

                // Ajout du token dans les headers pour les requêtes suivantes
                Authorization: `Bearer ${token}`,  
            };
        });

        // Nettoyage après les tests pour supprimer l'utilisateur admin et fermer la connexion à la base de données
        after(async () => {
            await User.findOneAndDelete({ email: "admin" });
            await mongoose.connection.close();
        });

        // Test de la récupération d'un utilisateur
        it("Récupération d'un utilisateur", async () => {
            const response = await request.get("/RailRoad/users/" + id).set(headers);
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an("object");
            expect(response.body.pseudo).to.be.equal("admin");
            expect(response.body.email).to.be.equal("admin@example.com");
        });

        // Test de la mise à jour d'un utilisateur
        it("Mise à jour d'un utilisateur", async () => {
            const response = await request.put("/RailRoad/users/" + id).set(headers).send({
                pseudo: "newadmin",
                email: "newadmin@example.com",
                password: "NewPassword5@"
            });
            expect(response.status).to.equal(201);
            expect(response.text).to.be.equal("User updated successfully");
        });

        // Test de la suppression d'un utilisateur
        it("Suppression d'un utilisateur", async () => {
            const response = await request.delete("/RailRoad/users/" + id).set(headers);
            expect(response.status).to.equal(200);
            expect(response.text).to.be.equal("User deleted successfully");
        });
    });
});
