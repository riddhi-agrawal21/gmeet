const socket = io('http://localhost:3000');

const myPeer = new Peer(undefined , {
     host: '/',
     port: '3001'
 })

myPeer.on('open' , id =>{
    socket.emit('join-room', ROOM_ID , id)
}) 
const peers ={}
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
let myVideostream;
navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
}).then( stream =>{
    myVideostream = stream;
    addVideoStream( myVideo , stream)
    
    myPeer.on('call', call =>{
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream' , userVideoStream=>{
            addVideoStream( video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        //connectToNewUser(userId , stream)
        setTimeout(connectToNewUser , 1000 , userId, stream)
    })
})

// socket.on('user-disconnected', userId =>{
//    if(peers[userId])  peers[userId].close();
// } )



function connectToNewUser( userId , stream){
    const call = myPeer.call( userId , stream);
    const video = document.createElement('video')
    call.on('stream' , userVideoStream =>{
        addVideoStream(video , userVideoStream)
    })
    call.on('close' , () =>{
        video.remove();
    })

    peers[userId] = call
}

function addVideoStream(video , stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata' , () =>{
        video.play()
    })
    videoGrid.append(video)
}

const main_chat_window = document.getElementsByClassName('main_chat_window')

    var text = document.getElementById('chat-message');

    document.querySelector('html').addEventListener('keydown',  (e) =>{
    if(e.which == 13 && text.value.length !== 0){
        console.log(text.value);    
        let li = document.createElement('li');
        li.innerHTML =`<li class="user">
                        <b>You:</b>${text.value}
                        </li>`
        document.querySelector('ul').append(li);            
        socket.emit('send-chat-message', text.value);
        text.value = '';
        main_chat_window.scrollTop = main_chat_window.scrollHeight;
    }
    } )

    socket.on('createMessage' , (message) =>{
    console.log(message);
    let li = document.createElement('li');
    li.innerHTML =`<li class="user">
    <b>User:</b>${text.value}
    </li>`
    document.querySelector('ul').append(li);
    main_chat_window.scrollTop = main_chat_window.scrollHeight;
    })



    //mute-unmute
    const muteUnmute = () =>{
        const enabled = myVideostream.getAudioTracks()[0].enabled;
        if(enabled){
            myVideostream.getAudioTracks()[0].enabled = false;
            setUnmute();
        }
        else{
            myVideostream.getAudioTracks()[0].enabled = true;
            setMute();
        } 
    }

    const setUnmute= ()=>{
        const html = `
        <i class="fa-solid fa-microphone-slash"></i>
        <span>Unmute</span>
        `
        document.querySelector('.mute-button').innerHTML = html;
    }
    const setMute= ()=>{
        const html = `
        <i class="fa-solid fa-microphone"></i>
        <span>Mute</span>
        `
        document.querySelector('.mute-button').innerHTML = html;
    }

//play-stop video
const playStop = ()=>{
    const enabled = myVideostream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideostream.getVideoTracks()[0].enabled = false;
        setplay();
    }
    else {
        setstop();
        myVideostream.getVideoTracks()[0].enabled= true;
        
    }
}

const setplay = ()=>{
    const html = `
    <i class="fa-solid fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.play-button').innerHTML = html;
}
const setstop = ()=>{
    const html = `
    <i class="fa-solid fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.play-button').innerHTML = html;
}


//whiteboard 
const whiteboard = () =>{
    const click = true;
    socket.emit('whiteboard', click);

    let canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const cxt = canvas.getContext("2d");

var io = io.connect('http://localhost:3000');

var x;
var y;
var mouseDown = false;
window.onmousedown = (e) =>{
    cxt.moveTo(x,y)
    io.emit('down' , {x,y});
    mouseDown = true;
}

window.onmouseup = (e) =>{
    mouseDown = false;
}

io.on('ondraw' , ({x,y}) =>{
    cxt.lineTo(x,y);
    cxt.stroke();
})

io.on('ondown' , ({x,y}) =>{
    cxt.moveTo(x,y);
})
// e:trigger
window.onmousemove =(e) =>{
    x = e.clientX;
    y = e.clientY;
    if(mouseDown){
    io.emit( 'draw' , {x,y})   
    cxt.lineTo(x, y);
    cxt.stroke();
    }
} 

}

