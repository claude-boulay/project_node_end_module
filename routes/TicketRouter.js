import express from "express";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import { createTicket,ConfirmedTicket,getAllTicketsByUser } from "../controllers/TicketController.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/", function(req, res){
    if(req.body!=undefined){
        
            createTicket(req.user.id, req.body.trainId, req.body.dateDeparture, req.body.dateArrival)
           .then((ticket) => {
            res.status(201).json(ticket);
           }).catch((err) => {
            res.status(500).send({error:"Error creating ticket"});
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
        confirmedTicket(req.params.id,req.user.id)
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