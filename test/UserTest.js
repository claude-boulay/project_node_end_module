import { expect } from "chai";
import supertest from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { createUser,getUser,deleteUser,Connected,updateUser } from "../controllers/UserController.js";
import User from "../models/UserModel.js";

let headers = {};

const request = supertest(app);

describe("User routes", () => {

    describe("Connexion et création utilisateur", () => {
        after(async () => {
                await User.findOneAndRemove({email: "testuser@example.com"});
                })
        it("Création d'un utilisateur", async () => {
            const response = await request.post("/RailRoad/users/register").send({
                username: "testuser",
                email: "testuser@example.com",
                password: "testpassword"
            });
            expect(response.status).to.equal(201);
            expect(response.body).to.have.property("message", "User created successfully");
        });

        it("Connexion avec un utilisateur", async () => {
            const response= await request.post("/RailRoad/users/login").send({
                email: "testuser@example.com",
                password: "testpassword"
            });
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("token");
        });    
    });

    describe("Gestion des utilisateurs", () => {
        before(async () => {
            // Connect to the local database
            await connect();
    
            // Register a user and store the token in the headers
            const response = await request.post("RailRoad/users/register").send({
                email: "admin",
                password: "admin",
                username: "admin",
            });
            const token = response.body.token;
    
            headers = {
                Authorization: `Bearer ${token}`,
            };
        });
        
        after(async () => {
            await User.findOneAndRemove({email: "admin"});
            await mongoose.connection.close();
        })

        it("Récupération d'un utilisateur", async () => {
           const response = await request.get("/RailRoad/users/5f7661007985850011469624").set(
        });
    });
});