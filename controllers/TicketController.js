import TicketModel from "../models/TicketModel.js";
import TrainModel from "../models/TrainModel.js";

export async function createTicket(UserId, TrainId,classe,price) {

    const train =await TrainModel.findById(TrainId);//cela engendrera une erreur si le train n'est pas trouvé
    const ticket = {UserId, TrainId,class:classe,price,status:"pending"};
    let result=await TicketModel.create(ticket);
    return result;
}

export async function getAllTicketsByUser(user_id) {
    return await TicketModel.find({UserId:user_id}).populate('TrainId','name');
}

export async function ConfirmedTicket(id,id_user) {
     const ticket= await TicketModel.findById(id);
     if(ticket. UserId!=id_user){
        return false
     }else{
         await TicketModel.findByIdAndUpdate(id,{status:"confirmed"})
        return true;
     }
    
}

export async function DeleteTicket(id,id_user) {
    const ticket= await TicketModel.findById(id);
    if(ticket. UserId!=id_user){
       return false
    }else{
        await TicketModel.findByIdAndDelete(id);
       return true;
    }
}
