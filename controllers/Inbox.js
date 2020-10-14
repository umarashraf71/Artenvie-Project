const Chat = require('../models/Chat');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const dbConnection = require('../config/db');
//const {userAuthenticated} = require('../../helpers/authentication');
const theServer = require('../app');
const io = theServer.getIO();
const Notification = require('../models/Notification');

module.exports = {
  Inbox: (req, res) => {
    if (req.user.userType === 'Customer') {
      ChatRoom.find({ customerId: req.user.id })
        .populate('customerId')
        .populate('artistId')
        .then((chatroom) => {
          res.render('admin/inbox/index', {
            chatroom: chatroom,
            customer: true,
            artist: false,
            title: 'inbox',
          });
        });
    } else if (req.user.userType === 'Artist') {
      ChatRoom.find({ artistId: req.user.id })
        .populate('artistId')
        .populate('customerId')
        .then((chatroom) => {
          res.render('admin/inbox/index', {
            chatroom: chatroom,
            customer: false,
            artist: true,
            title: 'inbox',
          });
        });
    }
  },

  ChatInboxRoom: (req, res) => {
    Chat.find({ roomId: req.params.id })
      .lean()
      .then((chats) => {
        res.render('admin/inbox/chat', {
          chats: chats,
          username: req.user.username,
          room: req.params.id,
          reciever: req.params.reciever,
          location: false,
          title: 'chat',
        });

        io.once('connection', (socket) => {
          socket.emit('message', 'Welcome!');
          //socket.broadcast.emit('message', 'A new user has joined!')

          socket.on('join', (username, room) => {
            socket.join(room);
            socket
              .to(room)
              .broadcast.emit('message', ` ${username} has joined!`);
          });

          socket.on('sendMessage', (message, room, callback) => {
            const chatMessage = new Chat({
              message: message,
              sender: req.user.username,
              roomId: req.params.id,
              location: '',
            });

            chatMessage.save(async (error) => {
              if (error) {
                console.log('Oops, something happened');
              } else {
                const room = await ChatRoom.findOne({ roomId: req.params.id });
                const customer = await User.findById(room.customerId);
                const artist = await User.findById(room.artistId);

                if (req.user.userType == 'Artist') {
                  const n = new Notification({
                    text: message,
                    date: new Date(),
                    sender: artist.username,
                    username: customer.username,
                    roomId: req.params.id,
                  });

                  await n.save();
                } else if (req.user.userType == 'Customer') {
                  const n = new Notification({
                    text: message,
                    date: new Date(),
                    sender: customer.username,
                    username: artist.username,
                    roomId: req.params.id,
                  });

                  await n.save();
                }
              }
            });

            var today = new Date();
            var date =
              today.getFullYear() +
              '-' +
              (today.getMonth() + 1) +
              '-' +
              today.getDate();
            var time =
              today.getHours() +
              ':' +
              today.getMinutes() +
              ':' +
              today.getSeconds();
            var dateTime = date + ' ' + time;

            io.in(room).emit('received', {
              message: message,
              sender: req.user.username,
              createdAt: dateTime,
            });
            // socket.broadcast.emit('received', {message: message});
            callback();
          });

          socket.on('sendLocation', (coords, room, callback) => {
            const location = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;

            // console.log("message :" + location);

            const chatMessage = new Chat({
              message: '',
              sender: req.user.username,
              roomId: req.params.id,
              location: location,
            });

            chatMessage.save((error) => {
              if (error) {
                console.log('Oops, something happened');
              } else {
                console.log('Data has been saved');
              }
            });

            io.in(room).emit('locationMessage', {
              location: location,
              sender: req.user.username,
              createdAt: dateTime,
            });

            callback('location sent');
          });

          socket.on('disconnect', () => {
            io.emit('message', 'A user has left!');
          });
        });
      });
  },

  Contact: (req, res) => {
    let room;

    if (req.user.userType == 'Customer') {
      room = req.params.id + req.user.id; // artistId + customerId(currently logged in)

      ChatRoom.find({ roomId: room }, function (err, results) {
        const count = results.length;

        //console.log(count);

        if (count >= 1) {
          console.log('Chat Room already exists');
          res.redirect(
            '/admin/inbox/chat/' + room + '/' + req.params.username + ''
          );
        } else {
          const newChatRoom = ChatRoom({
            artistId: req.params.id,
            customerId: req.user.id,
            roomId: room,
          });

          newChatRoom.save((error) => {
            if (error) {
              console.log('Oops, something happened');
            } else {
              console.log('Chat Room has been created');
              res.redirect('/admin/inbox');
            }
          });
        }
      });
    }
    // else if (req.user.userType == "Artist")
    else {
      room = req.user.id + req.params.id; // artistId(currently logged in) + customerId

      ChatRoom.find({ roomId: room }, function (err, results) {
        const count = results.length;

        //console.log(count);

        if (count >= 1) {
          console.log('Chat Room already exists');
          res.redirect(
            '/admin/inbox/chat/' + room + '/' + req.params.username + ''
          );
        } else {
          const newChatRoom = ChatRoom({
            artistId: req.user.id,
            customerId: req.params.id,
            roomId: room,
          });

          newChatRoom.save((error) => {
            if (error) {
              console.log('Oops, something happened');
            } else {
              console.log('Chat Room has been created');
              res.redirect('/admin/inbox');
            }
          });
        }
      });
    }
  },
};
