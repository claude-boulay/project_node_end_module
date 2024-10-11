import mongoose from "mongoose";

const Userschema = new mongoose.Schema({
        pseudo: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        role: {type: String, required:true, enum: ["admin", "user"]},
    });
const UsersModel=new mongoose.model("Users", Userschema);
export default UsersModel;
