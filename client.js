/* Socket Server - Socket.io here */
var socket = io.connect();
var thecontext;
var colorLine = "black";

socket.on('connect', function() {
	console.log("Connected");
});

socket.on('drawing', function(drawingdata) {
	var thecanvas = document.getElementById('thecanvas');
	thecontext = thecanvas.getContext('2d');
	thecontext.beginPath();
	thecontext.strokeStyle = drawingdata.c;
	thecontext.moveTo(drawingdata.prex, drawingdata.prey);
	thecontext.lineTo(drawingdata.currx, drawingdata.curry);
	thecontext.stroke();
	thecontext.closePath();
});

socket.on('clear', function(go){
	var thecanvas = document.getElementById('thecanvas');
	thecontext = thecanvas.getContext('2d');
	thecontext.beginPath();
	thecontext.rect(0, 0, 640, 480);
	thecontext.fillStyle = "rgb(200, 200, 200)";
	thecontext.fill();
});

function ColorSelector(){
	window.open("https://job271.itp.io:9100/palette.html", "", "width=350. height=450");
}

function clearDrawing(){
	var thecanvas = document.getElementById('thecanvas');
	thecontext = thecanvas.getContext('2d');
	thecontext.beginPath();
	thecontext.rect(0, 0, 640, 480);
	thecontext.fillStyle = "rgb(255, 255, 255)";
	thecontext.fill();
	var go = 1;
	socket.emit('clear', go);
}


// Receive other folks peer ids
socket.on('peer_id', function (data) {
	console.log("Got a new peer: " + data);
	var call = peer.call(data, my_stream);

	call.on('stream', function(remoteStream) {
		console.log("Got remote stream");
		var ovideoElement = document.createElement('video');
		ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
		ovideoElement.setAttribute("autoplay", "true");
		ovideoElement.play();
		document.body.appendChild(ovideoElement);
	});
});

var my_stream = null;
var peer = null;
var peer_id = null;

function init(){

var px = 0;
var py = 0;
var cx = 0;
var cy = 0;

var thecanvas = document.getElementById('thecanvas');
thecanvas.addEventListener('mousemove', function(evt) {
	var buttonPress = evt.buttons;

	px = cx;
	py = cy;
	cx = evt.clientX;
	cy = evt.clientY;

	thecontext = thecanvas.getContext('2d');

	if (buttonPress == 1){

	thecontext.beginPath();
	thecontext.strokeStyle = colorLine;
	thecontext.moveTo(px, py);
	thecontext.lineTo(cx, cy);
	thecontext.stroke();
	thecontext.closePath();

	var thedata = {
		prex: px,
		prey: py,
		currx: cx,
		curry: cy,
		col: colorLine
	};

	socket.emit('drawing',thedata);
	}

	else{

		}
	}
);

window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
	navigator.getUserMedia({video: true, audio: true}, function(stream) {
			my_stream = stream;
			var videoElement = document.getElementById('myvideo');
			videoElement.src = window.URL.createObjectURL(stream) || stream;
			videoElement.play();

			// Register for an API Key:	http://peerjs.com/peerserver
			//var peer = new Peer({key: 'YOUR API KEY'});
			// The Peer Cloud Server doesn't seem to be operational, I setup a server on a Digital Ocean instance for our use, you can use that with the following constructor:
			// can setup a user name
			peer = new Peer({host: 'job271.itp.io', port: 9000, path: '/'});

			peer.on('error', function(err){
				console.log(err);
			});

			// Get an ID from the PeerJS server
			peer.on('open', function(id) {
			  console.log('My peer ID is: ' + id);
			  peer_id = id;
				socket.emit('peer_id', peer_id);
			});

			peer.on('call', function(incoming_call) {
				console.log("Got a call!");
				incoming_call.answer(my_stream); // Answer the call with our stream from getUserMedia
				incoming_call.on('stream', function(remoteStream) {  // we receive a getUserMedia stream from the remote caller
					// And attach it to a video object
					var ovideoElement = document.createElement("video");
					ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
					ovideoElement.setAttribute("autoplay", "true");
					ovideoElement.play();
					document.body.appendChild(ovideoElement);

				});
			});


		}, function(err) {
			console.log('Failed to get local stream' ,err);
	});
 }

}


window.addEventListener('load', init);
