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

describe("Stations routes", () => {
   
    describe("Test des droits d'un utilisateur lambda sur les stations", () => {
         before(async () => {
        // Création d'un utilisateur pour les tests
        const response = await request.post("/RailRoad/users/register").send({
            pseudo: "testuser",
            email: "testuser@example.com",
            password: "Password5@"
        });
        const token = response.body.token;
        const decoded = jwt.verify(token, secret);
        id = decoded.id; 
        headers = {

            // Ajout du token dans les headers pour les requêtes suivantes
            Authorization: `Bearer ${token}`,  
        };
        });
        after(async () => {
            await User.findOneAndDelete({ email: "testuser@example.com" });
        });
        it("Test d'accès à la liste des stations avec un token lambda", async () => {
            const response = await request.get("/RailRoad/stations").set(headers);
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
        });
        it("Test d'accès à la création d'une station avec un token lambda", async () => {
            const response = await request.post("/RailRoad/stations/create").send({
                name: "Test Station",
                description: "Test description",
                image: "test.jpg"
            }).set(headers);
            expect(response.status).to.equal(403);
            expect(response.body.error).to.be.equal("Forbidden");
        });
        it("Test de modification d'une station avec un token lambda", async () => {
            const response = await request.put("/RailRoad/stations/1").send({
                name: "Test Station Modifié",
                description: "Test description modifiée"
            }).set(headers);
            expect(response.status).to.equal(403);
            expect(response.body.error).to.be.equal("Forbidden");
        });
        it("Test de suppression d'une station avec un token lambda", async () => {
            const response = await request.delete("/RailRoad/stations/1").set(headers);
            expect(response.status).to.equal(403);
            expect(response.body.error).to.be.equal("Forbidden");
        });
    })
})