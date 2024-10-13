import UsersModel from "../models/UserModel.js";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export async function createUser(pseudo, email, password, role) {
    const hash = bcrypt.hashSync(password, 10);
    const user = { pseudo, password: hash, email, role };

    try {
        const newUser = await UsersModel.create(user);
        return newUser; 
    } catch (error) {
        // Gestion des erreurs
        if (error.name === 'ValidationError') {
            throw new Error("Champs requis manquants : " + error.message);
        }
        if (error.code === 11000) {
            throw new Error("Cet email ou pseudo est déjà pris");
        }
        throw new Error("Erreur lors de la création de l'utilisateur");
    }
}

export async function Connected(email, password) {
    if (!password) {
        throw new Error("Veuillez renseigner votre mot de passe");
    }

    const user = await UsersModel.findOne({ email: email });

    if (!user) {
        throw new Error("Email non trouvé");
    }

    const success = await bcrypt.compare(password, user.password);

    if (success) {
        return user;
    } else {
        throw new Error("Mot de passe invalide");
    }
}

export async function  getUser(id){
    const User= await UsersModel.findById(id);
    return User;
}

export async function deleteUser(id){
    await UsersModel.findByIdAndDelete(id);
}

export async function updateUser(id,content){
    if(content.password){
        content.password=bcrypt.hashSync(content.password, 10);
    }
    await UsersModel.findByIdAndUpdate(id, {$set: content  });
}

