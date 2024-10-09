import { expect } from "chai";
import supertest from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import { createUser,getUser,deleteUser,Connected,updateUser } from "../controllers/UserController.js";
import User from "../models/UserModel.js";

let headers = {};
let id=null;

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
            expect(response.body.token).to.exists();
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
                email: "admin@example.com",
                password: "admin",
                username: "admin",
            });
            const token = response.body.token;
            id = response.body.id;
            headers = {
                Authorization: `Bearer ${token}`,
            };
        });
        
        after(async () => {
            await User.findOneAndRemove({email: "admin"});
            await mongoose.connection.close();
        })

        it("Récupération d'un utilisateur", async () => {
           const response = await request.get("/RailRoad/users/"+id).set(headers);
           expect(response.status).to.equal(200);
           expect(response.body).to.be.an("object");
           expect(response.body.username).to.be.equal("admin");
           expect(response.body.email).to.be.equal("admin@example.com");

        });

        it("Mise à jour d'un utilisateur", async () => {
            const response = await request.put("/RailRoad/users/"+id).set(headers).send({
                username: "newadmin",
                email: "newadmin@example.com",
                password: "newpassword",
            });
            expect(response.status).to.equal(201);
            expect(response.body).to.be.equal("User updated successfully");
        });
        it("Suppression d'un utilisateur", async () => {
            const response = await request.delete("/RailRoad/users/"+id).set(headers);
            expect(response.status).to.equal(200);
            expect(response.body).to.be.equal("User deleted successfully");
        });
    });
});