let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun3.l.google.com:19302"],
    },
  ],
};

const localVideo = document.querySelector(".my-video video");
const remoteVideo = document.querySelector(".peer-video video");
localVideo.muted = true;

//Initialize the function
const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  localVideo.srcObject = localStream;
  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });

  document
    .querySelector(".user .create-offer")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      createOffer();
    });

  document
    .querySelector(".peer .create-answer")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      createAnswer();
    });

  document.querySelector(".accept-answer").addEventListener("submit", (e) => {
    e.preventDefault();
    acceptAnswer();
  });
};

const InitializePeerConnection = () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();

  remoteVideo.srcObject = remoteStream;
  remoteVideo.addEventListener("loadedmetadata", () => {
    remoteVideo.play();
  });

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

//creating Offer SDP
const createOffer = async () => {
  InitializePeerConnection();

  peerConnection.onicecandidate = () => {
    console.log("New ICE Candidate :", peerConnection.localDescription);
    document.querySelector(".user .create-offer input").value = JSON.stringify(
      peerConnection.localDescription
    );
  };

  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer);
    console.log("Offer :", offer);
  });
};

//Accept Answer
const acceptAnswer = async () => {
  const answer = document.querySelector(".accept-answer input").value;
  console.log(JSON.parse(answer));
  await peerConnection.setRemoteDescription(JSON.parse(answer));
};

//Creating answer SDP
const createAnswer = async () => {
  InitializePeerConnection();

  const answerInput = document.querySelector(".peer .create-answer input");

  peerConnection.setRemoteDescription(JSON.parse(answerInput.value));

  peerConnection.onicecandidate = () => {
    console.log(peerConnection.localDescription);
    answerInput.value = JSON.stringify(peerConnection.localDescription);
  };

  peerConnection.createAnswer().then((answer) => {
    peerConnection.setLocalDescription(answer);
  });
};

init();
