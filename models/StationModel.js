import mongoose from "mongoose";

const StationsSchema = new mongoose.Schema({
    name: {type: String, required: true,unique: true},
    city: {type: String, required: true},
    open_hour: {type: String, required: true},
    close_hour: {type: String, required: true},
    address: {type: String, required: true, unique: true},
    image:{type: String, required: true},
})

const StationsModel=new mongoose.model("Station", StationsSchema);
export default StationsModel;