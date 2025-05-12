import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cena, câmera e controle
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Textura e material do bloco de concreto
const textureLoader = new THREE.TextureLoader();
const concreteTextureImg = new URL('../assets/concreto_textura.jpg', import.meta.url).href;
const concreteTexture = textureLoader.load(concreteTextureImg);

let isWireframe = false; // Evita o erro

// Material com textura de concreto
const material = new THREE.MeshBasicMaterial({
  map: concreteTexture,
  color: 0xffffff // Mantém textura visível nas 6 faces
});


const geometry = new THREE.BoxGeometry(2, 1, 1);
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Salva a cor original do bloco (para reset)
const originalColor = new THREE.Color().copy(cube.material.color);

// Posicionamento da câmera
controls.target.copy(cube.position);
camera.position.z = 5;

// Armaduras internas (4 barras)
const armatureMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const armatureGroup = new THREE.Group();
const armaturePositions = [
  [-0.7, 0, -0.4],
  [-0.7, 0, 0.4],
  [0.7, 0, -0.4],
  [0.7, 0, 0.4],
];

armaturePositions.forEach(([x, y, z]) => {
  const armature = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.2),
    armatureMaterial.clone()
  );
  armature.position.set(x, y, z);
  armatureGroup.add(armature);
});

armatureGroup.visible = false;
scene.add(armatureGroup);

// Grupo para os estribos (anéis)
const stirrupGroup = new THREE.Group();

const stirrupCount = 6; // número de estribos ao longo do eixo Y
const stirrupWidth = 1.4;
const stirrupHeight = 0.8;
const stirrupDepth = 0.6;
const stirrupMaterial = new THREE.LineBasicMaterial({ color: 0x303030 });

for (let i = 0; i < stirrupCount; i++) {
  const y = -0.45 + (i / (stirrupCount - 1)) * 0.9; // distribuído de -0.45 a +0.45 (altura do bloco)

  const stirrupShape = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-stirrupWidth / 2, y, -stirrupDepth / 2),
    new THREE.Vector3(stirrupWidth / 2, y, -stirrupDepth / 2),
    new THREE.Vector3(stirrupWidth / 2, y, stirrupDepth / 2),
    new THREE.Vector3(-stirrupWidth / 2, y, stirrupDepth / 2),
  ]);

  const stirrupLine = new THREE.LineLoop(stirrupShape, stirrupMaterial);
  stirrupGroup.add(stirrupLine);
}

stirrupGroup.visible = false; // só aparece junto da estrutura
scene.add(stirrupGroup);


// Animação
function animate() {
  controls.target.set(0, 0, 0);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Interações UI
const slider = document.getElementById('damageSlider');
const toggleBtn = document.getElementById('toggleStructure');
const resetBtn = document.getElementById('resetVisuals');

slider.addEventListener('input', () => {
  const value = slider.value;
  const rustIntensity = value / 100;

  // Aplicar escurecimento no concreto: reduz o RGB de 1 até 0.27
  const darkness = 1 - rustIntensity;
  cube.material.color.setRGB(
    1 * darkness,
    1 * darkness,
    1 * darkness
  );

  // Atualiza todas as barras com ferrugem
  armatureGroup.children.forEach(bar => {
    const rustColor = new THREE.Color().lerpColors(
      new THREE.Color(0x808080),
      new THREE.Color(0x8B0000),
      rustIntensity
    );
    bar.material.color = rustColor;
  });
});

toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  cube.material.wireframe = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
});


resetBtn.addEventListener('click', () => {
  // Restaura cor original do bloco
  cube.material.color.copy(originalColor);

  // Restaura cor das barras
  armatureGroup.children.forEach(bar => {
    bar.material.color.set(0x808080);
  });

  slider.value = 0;
});
