import UsersModel from "../models/UserModel.js";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export function createUser(username,email, password) {
    const hash=bcrypt.hashSync(password, 10);
    const user={username,password:hash,email};
    UsersModel.create(user).then(()=>
    {return true;});
    

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
    await UsersModel.findByIdAndUpdate(id, {deleteAt: new Date()  });
}

export async function updateUser(id, username, email, password){
    const hash=bcrypt.hashSync(password, 10);
    await UsersModel.findByIdAndUpdate(id, {username, email, password:hash});
}

