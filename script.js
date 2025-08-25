// Setup básico
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Luz direcional
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);

// Criar chão simples
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({color: 0x444444});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// Criar cubo que será o "botão"
const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshStandardMaterial({color: 0x28a745});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, -5);
scene.add(cube);

// Posição inicial da câmera
camera.position.set(0, 1.6, 0);

// Controle do ângulo da câmera
let yaw = 0;
let pitch = 0;

const sensitivity = 0.002;

let isPointerLocked = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Solicita Pointer Lock ao clicar na tela
renderer.domElement.addEventListener('click', () => {
  if (!isPointerLocked) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', (event) => {
  if (!isPointerLocked) return;
  yaw -= event.movementX * sensitivity;
  pitch -= event.movementY * sensitivity;
  pitch = clamp(pitch, -Math.PI/2 + 0.1, Math.PI/2 - 0.1);
});

const button3D = document.getElementById('button3D');
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

function updateButtonPosition() {
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(cube.matrixWorld);
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  const toCube = new THREE.Vector3();
  toCube.subVectors(cube.position, camera.position);
  const dot = cameraDirection.dot(toCube);

  if (dot > 0) {
    button3D.style.display = 'block';
    button3D.style.left = `${x}px`;
    button3D.style.top = `${y}px`;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const dist = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
    if (dist < 50) {
      button3D.disabled = false;
      button3D.style.opacity = '1';
      button3D.style.cursor = 'pointer';
    } else {
      button3D.disabled = true;
      button3D.style.opacity = '0.4';
      button3D.style.cursor = 'not-allowed';
    }
  } else {
    button3D.style.display = 'none';
  }
}

function animate() {
  requestAnimationFrame(animate);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  updateButtonPosition();

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// Fechar modal ao clicar no X
closeModalBtn.addEventListener('click', () => {
  loginModal.style.display = 'none';
  // Tenta pedir pointer lock de novo para continuar controle
  renderer.domElement.requestPointerLock();
});

// Fechar modal clicando fora da área do conteúdo
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
    renderer.domElement.requestPointerLock();
  }
});

// Formulário de login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  if (username && password) {
    alert(`Bem-vindo, ${username}! Login simulado com sucesso.`);
    loginModal.style.display = 'none';
    renderer.domElement.requestPointerLock();
  } else {
    alert('Preencha usuário e senha!');
  }
});

// Criar partículas para as estrelas
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 500; // quantidade de estrelas
const positions = [];

for (let i = 0; i < starsCount; i++) {
  // espalhar as estrelas num espaço grande em volta da câmera
  const x = (Math.random() - 0.5) * 200;
  const y = Math.random() * 100 + 10; // acima do chão (y positivo)
  const z = (Math.random() - 0.5) * 200;
  positions.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starsGeometry, starsMaterial);

scene.add(stars);

const imageOverlay = document.getElementById('imageOverlay');
const closeImageBtn = document.getElementById('closeImageBtn');

button3D.addEventListener('click', () => {
  if (!button3D.disabled) {
    imageOverlay.style.display = 'flex';
    // Sair do pointer lock para interagir com a imagem
    isPointerLocked = false;
    document.exitPointerLock();
  }
});

closeImageBtn.addEventListener('click', () => {
  imageOverlay.style.display = 'none';
});
