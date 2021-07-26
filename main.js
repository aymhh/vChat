import './stylesheet.css';

import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4HDuJzJKITVFjApCQcCQy11_QSRE3X7k",
  authDomain: "vchat-90d66.firebaseapp.com",
  projectId: "vchat-90d66",
  storageBucket: "vchat-90d66.appspot.com",
  messagingSenderId: "462641439592",
  appId: "1:462641439592:web:d7c71e3dca80b20e3becdd",
  measurementId: "G-BL2RDETRWQ"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const db = new Localbase("vChatDataBase");
const cookieUsername = Cookies.get('cookieUsername');
const cookieIcon = Cookies.get('cookieIcon');

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('hostStream');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const joinCallInput = document.getElementById("joinCallInput");
const answerButton = document.getElementById('joinFunction');
const remoteVideo = document.getElementById('guestStream');



// 1. Setup media sources
webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
}

// 2. Create an offer
callButton.onclick = async () => {
  // Reference Firestore collections for signaling
  const callDoc = firestore.collection('calls').doc();
  const offerCandidates = callDoc.collection('offerCandidates');
  const answerCandidates = callDoc.collection('answerCandidates');

  callInput.value = callDoc.id;

  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  

  // Create the actual offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    hostname: cookieUsername,
    hostpfp: cookieIcon
  };

  await callDoc.set({ offer });


  // Listen for remote answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  // When answered, add candidate to peer connection
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

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  const callId = joinCallInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
    guestname: cookieUsername,
    guestpfp: cookieIcon
  };

  await callDoc.update({ answer });

  // updating guest with host
  const guestIconChat = document.getElementById("guestIconChat")
  guestIconChat.src = callData.offer.hostpfp
  const guestBGChat = document.getElementById("guestBGChat")
  guestBGChat.src = callData.offer.hostpfp

  // updating host with guest
  const hostIconChat = document.getElementById("hostIconChat")
  hostIconChat.src = callData.request.guestpfp
  const hostBGChat = document.getElementById("hostBGChat")
  hostBGChat.src = callData.request.guestpfp

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


db.collection('users').doc({ username: cookieUsername }).get().then(doc => {
  document.getElementById("hostIconChat").src = doc[`icon`];
  document.getElementById("hostBGChat").src = doc[`icon`];
})

// mic button
const muteButton = document.getElementById("muteFunction")
muteButton.addEventListener("click", function (e) {
  const micOpen = "micOpenLogo.png"
  const micClose = "micClosedLogo.png"
  let micImageSrc = document.getElementById("micImage").src
  if (micImageSrc.endsWith(micOpen)) {
    document.getElementById("muteFunction").title = "you are currenly muted! click here if you want to be unmuted!"
    return document.getElementById("micImage").src = `./assets/images/${micClose}`
  } else if (micImageSrc.endsWith(micClose)) {
    document.getElementById("muteFunction").title = "you are currenly unmuted! click here if you want to be muted!"
    return document.getElementById("micImage").src = `./assets/images/${micOpen}`
  }
}); 


// camera button
const cameraButton = document.getElementById("camFunction")
cameraButton.addEventListener("click", function (e) {
  const camOpen = "cameraOnLogo.png"
  const camClose = "cameraOffLogo.png"
  let camImageSrc = document.getElementById("camImage").src

  if (camImageSrc.endsWith(camOpen)) {
    cameraButton.title = "your camera is currenly off! click here if you want to turn it on!"
    return document.getElementById("camImage").src = `./assets/images/${camClose}`
  } else if (camImageSrc.endsWith(camClose)) {
    cameraButton.title = "your camera is currenly on! click here if you want to turn it off!"
    return document.getElementById("camImage").src = `./assets/images/${camOpen}`
  }
});
