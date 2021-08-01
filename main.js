// By: Ameer Al-Shamaa
// On: 28/07/2021

// import meta data

import './stylesheet.css'; // imports the CSS 

import firebase from 'firebase/app'; // module importing
import 'firebase/firestore'; // module importing


// data  base informaiton

const firebaseConfig = {
  apiKey: "AIzaSyB4HDuJzJKITVFjApCQcCQy11_QSRE3X7k",
  authDomain: "vchat-90d66.firebaseapp.com",
  projectId: "vchat-90d66",
  storageBucket: "vchat-90d66.appspot.com",
  messagingSenderId: "462641439592",
  appId: "1:462641439592:web:d7c71e3dca80b20e3becdd",
  measurementId: "G-BL2RDETRWQ"
};

// if there is no data on the firebase, create them with the firebaseConfig variable
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// some constant setups for databases
const firestore = firebase.firestore();
const db = new Localbase("vChatDataBase");
const cookieUsername = Cookies.get('cookieUsername');
const cookieIcon = Cookies.get('cookieIcon');

// stun servers for intitalizing the connection
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State for events
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements, collecing the buttons and input fields from the webpage
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('hostStream');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const joinCallInput = document.getElementById("joinCallInput");
const answerButton = document.getElementById('joinFunction');
const remoteVideo = document.getElementById('guestStream');
const muteButton = document.getElementById("muteFunction")
const cameraButton = document.getElementById("camFunction")
const scrollDownElement = document.getElementById("scrollDown")


// setup media sources
window.onload = async () => {
  alert("🚨 you must grant the website access to your webcam and microphone to use this page.")
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // when the "get media" button is clicked hten the browser will ask to the users to fetch their webcam and mic
  remoteStream = new MediaStream(); 
  
  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // update users objects with the fected streams from before
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  // allows access ot the next buttons
  callButton.disabled = false;
  answerButton.disabled = false;
}

// creating a call room/offer when the second button is pressed.
callButton.onclick = async () => {
  // reference firestore collections for signaling
  const callDoc = firestore.collection('calls').doc(); // fetching the documents
  const offerCandidates = callDoc.collection('offerCandidates'); // fetching the documents
  const answerCandidates = callDoc.collection('answerCandidates'); // fetching the documents

  // inserts the updated invite code into the input feild to invite others
  callInput.value = callDoc.id;

  // get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());

}

  

  // create the actual offer using the generated code from line 96
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  // updates the document with the call room creation data
  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    hostname: cookieUsername,
    hostpfp: cookieIcon
  };

  // updates the document with the offer object which was made line 110
  await callDoc.set({ offer });


  // listen for remote answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  // when answered, add candidate to peer connection
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        console.log(change.doc.data())
        pc.addIceCandidate(candidate);
      };
    });
  });
};

// answer the call with the unique ID
// Similar steps happen here just like creating data, just this time with the guest's information BUT as an answer to the offer
answerButton.onclick = async () => {
  const callId = joinCallInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');

  // creates the user object
  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  // fetch's the data
  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  // updates the document with the guest answer data
  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
    guestname: cookieUsername,
    guestpfp: cookieIcon
  };

  // updates the document with the guest data
  await callDoc.update({ answer });

  // updating guest icons with host icons
  const guestIconChat = document.getElementById("guestIconChat")
  guestIconChat.src = callData.offer.hostpfp
  const guestBGChat = document.getElementById("guestBGChat")
  guestBGChat.src = callData.offer.hostpfp

  // add user's the the call based on the data from the collection information
  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      };
    });
  });
};

// fetch's the host's data and applies it to the host
db.collection('users').doc({ username: cookieUsername }).get().then(doc => {
  document.getElementById("hostIconChat").src = doc[`icon`];
  document.getElementById("hostBGChat").src = doc[`icon`];
})


answerButton.addEventListener("click", function (e) {
  if(joinCallInput.value.length === 0) {
    alert("you must input an id")
  }
})