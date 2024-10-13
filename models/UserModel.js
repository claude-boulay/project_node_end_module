import mongoose from "mongoose";

const Userschema = new mongoose.Schema({
        pseudo: {type: String, required: true,unique:true},
        password: {type: String, required: true},
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function(v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // regex pour valider l'email
                },
                message: props => `${props.value} n'est pas un email valide!`
            }
        },
        role: {type: String, required:true, enum: ["admin", "user","employée"]},
    });
const UsersModel=new mongoose.model("Users", Userschema);
export default UsersModel;
