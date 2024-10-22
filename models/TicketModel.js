import mongoose from "mongoose";


import UserModel from './UserModel.js';
import TrainModel from "./TrainModel.js"; 

const TicketSchema = new mongoose.Schema({
    TrainId: { type:mongoose.Schema.Types.ObjectId,ref:"Train",required:true},
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    class: { type: String, required: true,enum:[1,2] },
    status: { type: String, required: true, enum: ["pending", "confirmed", "canceled"] },
});

const TicketModel = mongoose.model("Ticket", TicketSchema);
export default TicketModel;