import UsersModel from "../models/UserModel.js";
import bcrypt from "bcrypt";

export async function createUser(pseudo, email, password, role) {
    // Hash du mot de passe avec bcrypt
    const hash = bcrypt.hashSync(password, 10);
    const user = { pseudo, password: hash, email, role };

    // Création de l'utilisateur en base de données
    return await UsersModel.create(user);
}

export async function Connected(email, password) {
    if (!password) {
        throw new Error("Please provide your password");
    }

    // Recherche de l'utilisateur par email
    const user = await UsersModel.findOne({ email });

    if (!user) {
        throw new Error("Email not found");
    }

    // Comparaison du mot de passe
    const success = await bcrypt.compare(password, user.password);

    if (success) {
        return user;
    } else {
        throw new Error("Invalid password");
    }
}

export async function getUser(id) {
    // Récupération de l'utilisateur par ID
    return await UsersModel.findById(id);
}

export async function deleteUser(id) {
    // Suppression de l'utilisateur par ID
    return await UsersModel.findByIdAndDelete(id);
}

export async function updateUser(id, content) {
    // Hash du mot de passe si présent dans la mise à jour
    if (content.password) {
        content.password = bcrypt.hashSync(content.password, 10);
    }

    // Mise à jour de l'utilisateur en base de données
    return await UsersModel.findByIdAndUpdate(id, { $set: content });
}
