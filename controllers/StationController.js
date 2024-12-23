import fs from "fs";
import mongoose from "mongoose";
import StationsModel from "../models/StationModel.js";
import { deleteTrain,getTrainByStationId } from "./TrainController.js";

// Création en base de donnée de la station de train avec les données fournies
// ImageLink doit correspondre au chemin de l'image enregistrer sur le server lors de la création
export function createStation(name, city, open_hour, close_hour, address, imageLink) {
    const station = {name, city, open_hour, close_hour, address, image: imageLink};
    return StationsModel.create(station);
}

export async function getAllStations() {
    return await StationsModel.find().sort({name:"asc"});
}

export async function getStationById(id) {
    return await StationsModel.findById(id);
}

export async function updateStation(id, content,filePath) {
   
    if(filePath==null){
       await StationsModel.findByIdAndUpdate(id, { $set: content }); 
    }else{
        await StationsModel.findByIdAndUpdate(id, { $set: content ,image: filePath });
    }
    return await getStationById(id);
}

export async function deleteStation(id) {
    
   
    try{

      let idsTrain=await getTrainByStationId(id);  
      idsTrain.forEach(element => {
        deleteTrain(element._id);
      }); 
      await StationsModel.findByIdAndDelete(id);
    }catch(err){
        console.log (err);
    };
    
    
}