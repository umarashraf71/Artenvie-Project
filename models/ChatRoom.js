const mongoose = require('mongoose');

//variable to hold the schema
const {Schema} = mongoose;

const ChatRoomSchema = new Schema({
     
    artistId: {

        type: Schema.Types.ObjectId,
        ref: 'users'        
    },
    customerId: {

        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    roomId: {

        type: String
    }

});

module.exports = mongoose.model('chatroom', ChatRoomSchema);
//here chatroom will be the name of the document in the databaase
