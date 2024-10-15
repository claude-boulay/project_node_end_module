import TrainModel from "../models/TrainModel.js";
import mongoose from "mongoose";

export async function createTrain(name, start_station, end_station, time_of_departure) {
    const train = { name, start_station, end_station, time_of_departure };

    try {
        const newTrain = await TrainModel.create(train);
        return newTrain; 
    } catch (error) {
        // Gestion des erreurs
        if (error.name === 'ValidationError') {
            throw new Error("Champs requis manquants");
        }
        throw new Error("Erreur lors de la création du train");
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
        throw new Error("Train non trouvé");
    }
    return train;
}

export async function deleteTrain(id) {
    const result = await TrainModel.findByIdAndDelete(id);
    if (!result) {
        throw new Error("Train non trouvé");
    }
}

export async function updateTrain(id, content) {
    const train = await TrainModel.findById(id);
    if (!train) {
        throw new Error("Train non trouvé");
    }
    await TrainModel.findByIdAndUpdate(id, { $set: content }, { new: true });
}