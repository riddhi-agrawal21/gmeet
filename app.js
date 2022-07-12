const express =  require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
//setup server
//const $ = require("jquery");
app.set('view engine' , 'ejs');
app.use(express.static('public'));
app.get('/' , (req,res) =>{
    res.redirect(`/${uuidV4()}`);
});
app.get('/:room' ,(req,res) =>{
    res.render('room' , { roomId: req.params.room})
});

app.get('/:room/white-board' ,(req,res) =>{
    res.render("white-board.ejs");
});
var connections = [];
io.on('connect', socket=> {
    console.log('new user')
    socket.on( 'join-room' , (roomId , userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected',userId)
        // socket.on('disconnect', () =>{
        //     socket.broadcast.to(roomId).emit('user-disconnected', userId)
        // })
        socket.on('send-chat-message', message => {
            ///send message to same room
            console.log(message);
            // setTimeout(() => {
            //     socket.to(roomId).emit('createMessage', message);
            // }, 1000);
            io.to(roomId).emit('createmessage', message);
        })
        
    })
    socket.on('whiteboard', click =>{
        console.log('white board ');
    })
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    socket.on('draw' , (data) =>{
        connections.forEach((con) =>{
            if(con.id != socket.id){
                socket.emit('ondraw' , { x: data.x , y:data.y})
            }
        })
    } )

    socket.on('down' , (data) =>{
        connections.forEach((con) =>{
            if(con.id != socket.id){
                socket.emit('ondown' , { x: data.x , y:data.y})
            }
        })
    })
   
})

server.listen(3000)
