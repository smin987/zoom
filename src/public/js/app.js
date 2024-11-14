const socket = io()

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")
const call = document.getElementById("call")

call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection
let myDataChannel

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCamera.label === camera.label) {
                option.selected = true
            }
            camerasSelect.appendChild(option)
        })
    } catch (e) {
        console.log(e)
    }
}

async function getMedia(deviceId) {
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    }
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints,
        )
        myFace.srcObject = myStream
        if (!deviceId) {
            await getCameras()
        }
    } catch (e) {
        console.log(e)
    }
}

function handleMuteClick() {
    // console.log(myStream.getVideoTracks())
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (!muted) {
        muteBtn.innerText = "Unmute"
        muted = true
    } else {
        muteBtn.innerText = "Mute"
        muted = false
    }
}

function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value)
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video")
        videoSender.replaceTrack(videoTrack)
    }
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true
    call.hidden = false
    await getMedia()
    makeConnection()
}

async function handleWelcomeSubmit(event) {
    event.preventDefault()
    const input = welcomeForm.querySelector("input")
    await initCall()
    socket.emit("join_room", input.value,)
    roomName = input.value
    input.value = ""
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)

// Socket Code

// PeerA
socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat")
    myDataChannel.addEventListener("message", (event) => console.log(event.data))
    console.log("made data channel")
    const offer = await myPeerConnection.createOffer()
    myPeerConnection.setLocalDescription(offer)
    console.log("sent the offer")
    socket.emit("offer", offer, roomName)
})

// PeerB
socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) =>
            console.log(event.data)
        );
    });
    console.log("Received the offer")
    myPeerConnection.setRemoteDescription(offer)
    const answer = await myPeerConnection.createAnswer()
    myPeerConnection.setLocalDescription(answer)
    socket.emit("answer", answer, roomName)
    console.log("send the answer")
})

// PeerA
socket.on("answer", (answer) => {
    console.log("Received the answer")
    myPeerConnection.setRemoteDescription(answer)
})

socket.on("ice", (ice) => {
    console.log("Received candidate")
    myPeerConnection.addIceCandidate(ice)
})

// RTC Code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        // 실제 서비스 개발시에는 stunServer를 직접 개발해야함
        iceServers: [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ],
        }],
    })
    myPeerConnection.addEventListener("icecandidate", handleIce)
    myPeerConnection.addEventListener("track", handleAddTrack)
    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream)
    })
}

function handleIce(data) {
    console.log("sent candidate")
    socket.emit("ice", data.candidate, roomName)
}

function handleAddTrack(data) {
    const peerFace = document.getElementById("peerFace")
    peerFace.srcObject = data.streams[0]
}

// phone에서 test를 위해 다음의 패키지를 설치한다.
// npm i -g localtunnel
// 설치후 명령어 실행
// lt --port 3000

// 도전과제
// 1. StunServer 설치하기
// https://github.com/coturn/coturn, 참고 https://kid-dev.tistory.com/10
// 2. dataChannel 만들기
// https://developer.mozilla.org/ko/docs/Web/API/WebRTC_API/Using_data_channels
