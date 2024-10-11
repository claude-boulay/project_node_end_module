import UsersModel from "../models/UserModel.js";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export async function createUser(pseudo,email, password,role) {
    const hash=bcrypt.hashSync(password, 10);
    const user={pseudo,password:hash,email,role};
    //attente de la création en database de l'utilisateur
    await UsersModel.create(user)
    //recup de l'utilisateur créé
    let Newuser=await UsersModel.findOne({email:email})

    return Newuser;
 
}

export async function Connected(email, password){
    const user =await UsersModel.findOne({email:email});
            if(!user){
                console.log("Email not found");
                return false;
            }
            const success=bcrypt.compare(password, user.password)
            if(success){
                return user;
            }else{
               return success; 
            }
            
            
}

export async function  getUser(id){
   const User= await UsersModel.findById(id);
   return User;
}

export async function deleteUser(id){
    await UsersModel.findByIdAndDelete(id);
}

export async function updateUser(id,content){
    
    if(content.password){
        content.password=bcrypt.hashSync(content.password, 10);
    }
    
    await UsersModel.findByIdAndUpdate(id, {$set: content  });
}

