import TicketModel from "../models/TicketModel";

export async function createTicket(user_id, train_id,classe,price) {
    const ticket = {user_id, train_id,class:classe,price,status:"pending"};
    result=await TicketModel.create(ticket);
    return result;
}

export async function getAllTicketsByUser(user_id) {
    return await TicketModel.find({user_id}).populate('train_id','name');
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
