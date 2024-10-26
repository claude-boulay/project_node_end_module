import TrainModel from "../models/TrainModel.js";
import mongoose from "mongoose";


export async function createTrain(name, start_station, end_station, time_of_departure) {
    // Vérifier que time of departure sois bien d'un format ISO adéquat ex 2024-10-22T14:30:00
    time_of_departure = new Date(time_of_departure);
    
    const train = { name, start_station, end_station, time_of_departure };

    try {
        const newTrain = await TrainModel.create(train);
        return newTrain; 
    } catch (error) {
        // Gestion des erreurs
        if (error.name === 'ValidationError') {
            throw new Error("Required fields missing: " + error);
        }
        throw new Error("Error creating the train");
    }
}

export async function getTrains(limit = 10, sort = {}) {
    const trains = await TrainModel.find()
        .sort(sort)
        .limit(limit)
        .populate('start_station', 'name') // Récupère le nom de la gare de départ
        .populate('end_station', 'name'); // Récupère le nom de la gare d'arrivée
    return trains;
}

export async function getTrain(id) {
    const train = await TrainModel.findById(id)
        .populate('start_station', 'name')
        .populate('end_station', 'name');
    if (!train) {
        throw new Error("Train not found");
    }
    return train;
}

export async function deleteTrain(id) {
    const result = await TrainModel.findByIdAndDelete(id);
    if (!result) {
        throw new Error("Train not found");
    }
}

export async function updateTrain(id, content) {
    const train = await TrainModel.findById(id);
    if (!train) {
        throw new Error("Train not found");
    }

    // Mettre à jour et retourner le train mis à jour
    const updatedTrain = await TrainModel.findByIdAndUpdate(id, { $set: content }, { new: true });
    return updatedTrain;
    res.status(200).json(updatedTrain);
}


export async function getTrainByStationId(id){
    const trains = await TrainModel.find({
        $or: [
            { start_station: new mongoose.Types.ObjectId(id) },
            { end_station: new mongoose.Types.ObjectId(id) }
        ]
    }) 
    return trains;
}
