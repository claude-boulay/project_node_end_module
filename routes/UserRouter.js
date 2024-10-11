import express from 'express';
import fs from 'fs';
import { getUser,updateUser,deleteUser,createUser,Connected } from '../controllers/UserController.js';
import jwt from 'jsonwebtoken';
import { urlencoded } from 'express';
import { authMiddleware } from '../middlewares/authMiddlewares.js';
import { config } from 'dotenv';
import { authOptionnelMiddlewares } from '../middlewares/authOptionnelMiddlewares.js';
//obtention de la clé secret du fichier.env
const secret= config().parsed.SECRET;

const router = express.Router();
router.use(authOptionnelMiddlewares);
// User routes
router.post('/register',(req,res)=>{
    
    let parsedBody=req.body;
    //si l'utilisateur est connecté et que l'utilisateur est admin, il peut créer un nouvel utilisateur avec le role désirée
    //sinon l'utilisateur crée serat un utilisateur ordinaire
    if(req.user!=false && req.user.role==='admin'){
        
        createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, parsedBody.role).then((user) => {
            //si succés de la création d'un utilisateur renvoie d'un token jwt
            const token=jwt.sign({id:user._id,pseudo:user.pseudo,role:user.role}, secret, { expiresIn: '1h' });
            res.status(201).send(token);
            res.end();
        }).catch((err) => {
            console.log(err.message);
            res.status(400).send("Error creating user");
            res.end();
        });
    }else{
       
        createUser(parsedBody.pseudo, parsedBody.email, parsedBody.password, "user").then((user) => {
            //si succés de la création d'un utilisateur renvoie d'un token jwt
            console.log(user);
            const token=jwt.sign({id:user._id,pseudo:user.pseudo,role:user.role}, secret, { expiresIn: '1h' });
            res.status(201).send(token);
            res.end();
        }).catch((err) => {
            console.log(err.message);
            res.status(400).send("Error creating user");
            res.end();
        });
    }
        
      
         

});

router.post('/login',(req,res)=>{
    let body=req.body;
    Connected(body.email, body.password).then((user) => {       
        if(user){
            
            const secret=fs.readFileSync(".env","utf8");
           
            const token=jwt.sign({id:user._id,pseudo:user.pseudo,role:user.role}, secret, { expiresIn: '1h' });
            res.status(200).send(token);
            res.end();  
        }else{
            res.status(401).send({error: "Invalid credentials"});
            res.end();
        }
        
    }).catch((err) => {
        res.status(401).send({error: "Invalid credentials", "admin":err.message});
        res.end();
    });
});

router.use(authMiddleware);
router.get('/:id',(req,res)=>{
    
    if(req.user.id!=req.params.id && req.user.role=="user"){
        res.status(403).send({error: "Forbidden you are not authorized to access this user's data. Only the owner can access his/her own data. "});
        res.end();  // stop the execution of the request and send a response with status code 403 (Forbidden) and a message in the response body
          // exit the function immediately without executing any remaining code
    }else{
       getUser(req.params.id).then((user) => {
        console.log(user);
        res.status(200).json(user);
        res.end();
    }).catch((err) => {
        res.status(404).send({error: "User not found"});
        res.end();
    }); 
    }
    
} );


router.put('/:id',(req,res)=>{
    if(req.user.id!=req.params.id && req.user.role!="admin"){
        res.status(403).send({error: "Forbidden you are not authorized to access this user's data. Only the owner can access his/her own data. "});
        res.end();  // stop the execution of the request and send a response with status code 403 (Forbidden) and a message in the response body
        return;  // exit the function immediately without executing any remaining code
    }else{
        updateUser(req.params.id, req.body).then(() => {
            res.status(201).send("User updated successfully");
            res.end();
        }).catch((err) => {
            res.status(400).send({error: "Invalid data "});
            res.end();
        });
    }

});

router.delete('/:id',(req,res)=>{
    if(req.user.id!=req.params.id){
        res.status(403).send({error: "Forbidden you are not authorized to access this user's data. Only the owner can access his/her own data. "});
        res.end();  // stop the execution of the request and send a response with status code 403 (Forbidden) and a message in the response body
        return;  // exit the function immediately without executing any remaining code
    }else{
        deleteUser(req.params.id).then(() => {
            res.status(200).send("User deleted successfully");
            res.end();
        }).catch((err) => {
            res.status(404).send({error: "User not found"});
            res.end();
        });
    }
 });




export default router;