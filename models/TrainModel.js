import mongoose from "mongoose";

import StationsModel from './StationModel.js'; 

const TrainSchema = new mongoose.Schema({
    name: { type: String, required: true },
    start_station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true }, 
    end_station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    time_of_departure: { type: Date, required: true },
});

const TrainModel = mongoose.model("Train", TrainSchema);
export default TrainModel;
