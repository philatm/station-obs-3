import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { Socket } from 'net';


//connection to pump
const ip = '192.168.244.233';
const port = 5000;

let arrayMessage = [];
let intervalId = null;
// Get data from remote pump
// let client = new Socket();
// client.connect(port, ip, function() {
// 	console.log('Connected');
// });

// client.on('data', function(data) {
// 	let time = new Date();
// 	console.log(time.toLocaleTimeString() + " " + data);
//   let msgData = data.toString().split(' ')[0];
//   let message = { date: time, sensorData: msgData};
//   const jsonMessage = JSON.stringify(message);
//   sendMessage(jsonMessage);
// });

// client.on('error', function(e) {
// 	console.log('Error:\n' + e);
// })

// client.on('close', function() {
// 	console.log('Connection closed');
// });


// faker data
const generateData = () => {
  
  let time = new Date();
  let data = [];
  for (let i = 0; i < 10; i++) {
    data[i] = (i + Math.random()) * 10;  
  }
  let number = (Math.random()*100) + 1;
  let message = { date: time, sensorData: data}; 
  arrayMessage.push(message);
  const jsonMessage = JSON.stringify(message);
  sendMessage(jsonMessage); 
  
}
// Create the https server
const server = createServer();
// Create instance of the websocket server
const wss = new WebSocketServer({ noServer: true });

// Take note of client or users connected
const users = new Set();

/*For the first connection "/request" path
 We take note of the clients that initiated connection and saved it in our list
 */
wss.on("connection", function connection(socket) {
  console.log("wss:: User connected");
  const userRef = {
    socket: socket,
    connectionDate: Date.now(),
  };
  const jsonMessage = JSON.stringify(arrayMessage);
  socket.send(jsonMessage);
  console.log("Adding to set");
  users.add(userRef);

  socket.on('close', () => {
    users.delete(userRef);
  });

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.action === 'start') {
      if (!intervalId) {
        intervalId = setInterval(generateData, 1000);
        console.log("Data generation started");
      }
    } else if (data.action === "stop") {
      if(intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        arrayMessage = [];
        console.log("Data generation stoped")
      }
    }
  });
});

/*
This is the part where we create the two paths.  
Initial connection is on HTTP but is upgraded to websockets
The two path "/request" and "/sendSensorData" is defined here
*/
server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  console.log(`Path name ${pathname}`);

  if (pathname === "/request") {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
//Open the server port in 8080
server.listen(8080);

//function to send websocket messages to user
const sendMessage = (message) => {
  // console.log("Sending messages to users!");
  for (const user of users) {
    user.socket.send(message);
  }
};