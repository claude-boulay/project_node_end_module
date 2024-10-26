import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { createTicket,ConfirmedTicket,getAllTicketsByUser,DeleteTicket } from "../controllers/TicketController.js";
import { validTicket } from "../middlewares/validationTicketMiddlewares.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/",validTicket, function(req, res){
    if(req.body!=undefined){
        //le prix doit être un float (peut être envoyé en string serat convertie) et la classe un nombre (string convertie en int si possible) compris entre 1 et 2; (pour 2ème classe ou 1er classe)
            createTicket(req.user.id, req.body.trainId, req.body.classe, req.body.price)
           .then((ticket) => {
            res.status(201).json(ticket);
           }).catch((error) => {
            res.status(500).send({error:"Error creating ticket, Invalid Train"});
           });
        
    }
});

router.get("/",function(req, res){
    if(req.user!=undefined){
        getAllTicketsByUser(req.user.id)
       .then((tickets) => {
        res.status(200).json(tickets);
       }).catch((err) => {
        res.status(500).send({error:"Error getting tickets"});
       })
    }else{
        res.status(401).send({error:"Unauthorized"});
    }
})

router.put("/:id",function(req, res){
    if(req.user!=undefined){
        ConfirmedTicket(req.params.id,req.user.id)
       .then((ticket) => {
        if(ticket){
          res.status(200).send("Your ticket has been confirmed");  
        }else{
            res.status(404).send({error:"Your not the owner of this ticket"});
        }
        
       }).catch((err) => {
        res.status(500).send({error:"Error confirming ticket"});
       })
    }else{
        res.status(401).send({error:"Unauthorized"});
    }
})

router.delete("/:id",function(req,res){
    if(req.user!=undefined){
        DeleteTicket(req.params.id,req.user.id)
       .then((ticket) => {
          res.status(200).send("Your ticket has been deleted");  
       }).catch((err) => { 
        res.status(404).send({error:"Your not the owner of this ticket"});
       });
    }else{
        res.status(401).send({error:"Unauthorized"});
    }
    })

export default router;