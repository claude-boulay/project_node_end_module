import fs from 'fs';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;
    const secret = fs.readFileSync(".env", "utf8").trim(); // Assurez-vous d'utiliser .trim() pour éviter les espaces

    const token = auth?.split(" ")[1];

    if (!token) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Ajouter les informations de l'utilisateur décodées à la requête
        next();
    } catch (e) {
        return res.status(401).send("Unauthorized");
    }
};
