import mongoose from "mongoose";

const Userschema = new mongoose.Schema({
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        deleteAt: {type: Date, default: null}
      
    });
const UsersModel=new mongoose.model("Users", Userschema);
export default UsersModel;
