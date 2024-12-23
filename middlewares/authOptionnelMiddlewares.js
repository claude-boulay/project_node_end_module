import fs from 'fs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

export const authOptionnelMiddlewares = (req, res, next) => {
    if(req.headers.authorization){
        const auth = req.headers.authorization;
        const secret= config().parsed.SECRET;
        const token = auth?.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, secret);

            // Ajout des informations de l'utilisateur décodées à la requête
            req.user = decoded; 
        }else{
            req.user = false;
        }
        }else{
            req.user = false;
        }
        next();
}