const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const registerButton = document.getElementById('registerButton');
const userNameInput = document.getElementById('userName');
const logDiv = document.getElementById('log');
const cameraSelect = document.getElementById('cameraSelect');

let labeledFaceDescriptors = [];

// IndexedDB setup
const DB_NAME = 'catracaDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject('Erro ao abrir o banco de dados:' + event.target.errorCode);
    };
  });
}

async function addUser(name, descriptor) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const user = { name: name, descriptor: JSON.stringify(Array.from(descriptor)) };
  return new Promise((resolve, reject) => {
    const request = store.add(user);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Erro ao adicionar usuário:' + event.target.errorCode);
  });
}

async function loadLabeledFaceDescriptors() {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => {
      labeledFaceDescriptors = event.target.result.map(data => {
        const descriptorArray = new Float32Array(JSON.parse(data.descriptor));
        return new faceapi.LabeledFaceDescriptors(data.name, [descriptorArray]);
      });
      resolve(labeledFaceDescriptors);
    };
    request.onerror = (event) => reject('Erro ao carregar descritores:' + event.target.errorCode);
  });
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models') // Changed to ssdMobilenetv1 for better detection
]).then(startVideo).catch(err => {
  console.error('Erro ao carregar modelos do Face-API:', err);
  logDiv.innerText = 'Erro ao carregar modelos do Face-API. Verifique o console para detalhes.';
});

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    canvas.style.display = 'block';
    setupCameraSelection();
  } catch (err) {
    console.error('Erro ao iniciar a câmera:', err);
    logDiv.innerText = 'Erro ao iniciar a câmera. Verifique se o navegador tem permissão para acessar a câmera.';
  }
}

async function setupCameraSelection() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');

  cameraSelect.innerHTML = '';

  videoDevices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.innerText = device.label || `Câmera ${cameraSelect.options.length + 1}`;
    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener('change', async () => {
    const selectedDeviceId = cameraSelect.value;
    const constraints = {
      video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  });

  if (videoDevices.length > 0) {
    cameraSelect.value = videoDevices[0].deviceId;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: videoDevices[0].deviceId } } });
    video.srcObject = stream;
  }
}

registerButton.addEventListener('click', async () => {
  const userName = userNameInput.value.trim();
  if (!userName) {
    logDiv.innerText = 'Por favor, insira um nome de usuário.';
    return;
  }

  const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (detections) {
    await addUser(userName, detections.descriptor);
    logDiv.innerText = `Usuário ${userName} cadastrado com sucesso!`;
    userNameInput.value = ''; // Clear input
  } else {
    logDiv.innerText = 'Nenhum rosto detectado. Certifique-se de que seu rosto está visível na câmera.';
  }
});

video.addEventListener('play', () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    // Draw video frame to canvas
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    if (resizedDetections) {
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
  }, 100);
}); 