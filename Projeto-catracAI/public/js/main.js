const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const log = document.getElementById('log');
const context = canvas.getContext('2d');

const DB_NAME = 'catracaDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      reject('Erro ao abrir o banco de dados:' + event.target.errorCode);
    };
  });
}

async function loadLabeledFaceDescriptors() {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (event) => {
      const users = event.target.result;
      const labeledDescriptors = users.map(user => {
        const descriptorArray = new Float32Array(JSON.parse(user.descriptor));
        return new faceapi.LabeledFaceDescriptors(user.name, [descriptorArray]);
      });
      resolve(labeledDescriptors);
    };
    request.onerror = (event) => reject('Erro ao carregar descritores:' + event.target.errorCode);
  });
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(startVideo).catch(err => {
  console.error('Erro ao carregar modelos do Face-API:', err);
  log.textContent = 'Erro ao carregar modelos do Face-API. Veja o console para detalhes.';
});

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    setupCameraSelection();
  } catch (err) {
    console.error('Erro ao acessar câmera:', err);
    log.textContent = 'Erro ao acessar câmera. Verifique permissões.';
  }
}

async function setupCameraSelection() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  cameraSelect.innerHTML = '';

  videoDevices.forEach((device, i) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Câmera ${i + 1}`;
    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener('change', async () => {
    const deviceId = cameraSelect.value;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
    video.srcObject = stream;
  });

  if (videoDevices.length > 0) {
    cameraSelect.value = videoDevices[0].deviceId;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: videoDevices[0].deviceId } } });
    video.srcObject = stream;
  }
}

video.addEventListener('play', async () => {
  const labeledDescriptors = await loadLabeledFaceDescriptors();
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

  setInterval(async () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) {
      log.textContent = 'Nenhum rosto detectado';
      return;
    }

    const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

    results.forEach((result, i) => {
      const box = detections[i].detection.box;
      context.strokeStyle = '#00FF00';
      context.lineWidth = 2;
      context.strokeRect(box.x, box.y, box.width, box.height);

      context.fillStyle = '#00FF00';
      context.font = '16px Arial';
      context.fillText(result.toString(), box.x, box.y - 5);

      if (result.label !== 'unknown') {
        const timestamp = new Date().toLocaleTimeString();
        log.textContent = `Reconhecido: ${result.label} - ${timestamp}`;
         addLog(result.label, 'Reconhecimento facial');
      } else {
        log.textContent = 'Usuário desconhecido';
      }
      
    });
  }, 1000);
});

async function addLog(name, action = 'Reconhecimento facial') {
    const db = await openDatabase();
    const transaction = db.transaction(['logs'], 'readwrite');
    const store = transaction.objectStore('logs');
  
    const logEntry = {
      name,
      action,
      timestamp: new Date().toISOString()
    };
  
    return new Promise((resolve, reject) => {
      const request = store.add(logEntry);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.errorCode);
    });
  }
  