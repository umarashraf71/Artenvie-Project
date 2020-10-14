const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageForminput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')



//##############################################################################//
                //EVENT TO LISTEN WELCOME IN THE CLIENT CONSOLE
//##############################################################################//

socket.on('message', (message) => {
    console.log(message);
})



//##############################################################################//
                        //EMIT THE EVENT OF JOIN ROOM
//##############################################################################//

let username = document.getElementById("hidden-username").value;
let room = document.getElementById("hidden-room").value;

socket.emit('join', username, room);




//##############################################################################//
                        //FOR AUTOMATIC SCROLL IN CHATBOX
//##############################################################################//


//when chat page loads up amke the scrollbar of chat at the bottom
$('#messages').scrollTop($('#messages')[0].scrollHeight);


//function for auto scrolling
const autoscroll = () =>{

let messageBody = document.querySelector('#messages');
messageBody.scrollTop = messageBody.scrollHeight;

}



//##############################################################################//
        //LISTENER TO GET INPUT DATA ON SUBMIT AND EMIT IT TO THE SERVER
//##############################################################################//

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, room, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageForminput.value = ''
        $messageForminput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
});




//##############################################################################//
   //SOCKET LISTENER TO SHOW MESSAGE DATA FROM SERVER TO THE CLIENT SIDE
//##############################################################################//

socket.on("received", data => {

    let h6 = document.createElement("h6");
    h6.classList.add("author");

    let li = document.createElement("li");
    li.classList.add("received_msg_text");
    
    let span = document.createElement("span");
    span.classList.add("time_date");
    
    $messages.appendChild(h6).append(data.sender);
    $messages.appendChild(li).append(data.message);
    $messages.appendChild(span).append(moment(data.createdAt).format('LLL'));

    autoscroll();

    console.log("Hello bingo!");


  });




//##############################################################################//
    //LISTENER TO GET LOCATION ON BUTTON CLICK AND THEN EMIT IT TO THE SERVER
//##############################################################################//

//getting and sending the user location
document.querySelector('#send-location').addEventListener('click', ()=>{

    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser');
    }

    //disable the location button after one clicked
    $sendLocationButton.setAttribute('disabled', 'disabled');


    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position);

        socket.emit('sendLocation',  {

            latitude: position.coords.latitude,
            longitude: position.coords.longitude

        }, room, (msg)=>{

            console.log(msg);
            $sendLocationButton.removeAttribute('disabled');
        });

    });

});


 
//##############################################################################//
        //SOCKET LISTENER TO SHOW LOCATION DATA FROM SERVER TO THE CLIENT
//##############################################################################//


socket.on("locationMessage", data => {

    let h6 = document.createElement("h6");
    h6.classList.add("author");

    let li = document.createElement("li");
    li.classList.add("received_msg_text");

    let anchor = document.createElement("a");
    anchor.textContent = "My Location";
    anchor.href = data.location;
    
    let span = document.createElement("span");
    span.classList.add("time_date");
    
    $messages.appendChild(h6).append(data.sender);
    li.appendChild(anchor);
    $messages.appendChild(li);
    $messages.appendChild(span).append(moment(data.createdAt).format('LLL'));
    
    autoscroll();

    console.log("Hello bingo!");


  });




  




// //##############################################################################//
//             //EVENT TO LISTEN FOR ONLINE CLIENT IN THE CLIENT CONSOLE
// //##############################################################################//

// socket.on("online", data => {

//     let h6 = document.createElement("h6");
//     h6.classList.add("online");

//     $messages.appendChild(h6).append(data.onlineUser + " is now online in chat");

//     autoscroll();

//   });




// //##############################################################################//
//             //EVENT TO LISTEN FOR OFFLINE CLIENT IN THE CLIENT CONSOLE
// //##############################################################################//

// socket.on("offline", data => {

//     let h6 = document.createElement("h6");
//     h6.classList.add("offline");

//     $messages.appendChild(h6).append(data.offlineUser + " is now offline in chat");

//     autoscroll();

//   });


