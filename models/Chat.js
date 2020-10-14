const mongoose = require('mongoose');

//variable to hold the schema
const { Schema } = mongoose;

const ChatSchema = new Schema(
    
    {
        message: {

            type: String        
        },
        sender: {

            type: String
        },
        roomId: {

            type: String
        },
        location: {

            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Chat', ChatSchema);
//here categories will be the name of the document in the databaase
