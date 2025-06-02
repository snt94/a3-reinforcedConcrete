import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const container = document.getElementById('three-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = false;

const maxPixelRatio = 1.0;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
container.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  renderer.setSize(width, height);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();

const concreteTextureImg = new URL('../assets/concreto_textura.jpg', import.meta.url).href;
const steelTextureImg = new URL('../assets/aco_textura.jpg', import.meta.url).href;
const danoTextureImg = new URL('../assets/dano.png', import.meta.url).href;
const carbonatacaoTextureImg = new URL('../assets/carbonatacao.png', import.meta.url).href;
const ferrugemTextureImg = new URL('../assets/ferrugem.png', import.meta.url).href;

const concreteTexture = textureLoader.load(concreteTextureImg);
const steelTexture = textureLoader.load(steelTextureImg);
const danoTexture = textureLoader.load(danoTextureImg);
const carbonatacaoTexture = textureLoader.load(carbonatacaoTextureImg);
const ferrugemTexture = textureLoader.load(ferrugemTextureImg);


const concreteMaterial = new THREE.MeshStandardMaterial({
  map: concreteTexture,
  bumpMap: danoTexture,
  bumpScale: 0.0
});
const concreteGeometry = new THREE.BoxGeometry(2, 1, 1);
concreteGeometry.computeVertexNormals();

const concreteMesh = new THREE.Mesh(concreteGeometry, concreteMaterial);

scene.add(concreteMesh);

controls.target.copy(concreteMesh.position);
camera.position.z = 5;

const carbonOverlayMaterial = new THREE.MeshStandardMaterial({
  map: carbonatacaoTexture,
  transparent: true,
  opacity: 0,
});

const carbonOverlayMesh = new THREE.Mesh(concreteGeometry.clone(), carbonOverlayMaterial);
carbonOverlayMesh.position.copy(concreteMesh.position);
scene.add(carbonOverlayMesh);

const armatureMaterial = new THREE.MeshStandardMaterial({
  map: steelTexture,
  bumpMap: ferrugemTexture,
  metalness: 0.8,
  roughness: 0.3,
  bumpScale: 0
});

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
    armatureMaterial
  );
  armature.position.set(x, y, z);
  armatureGroup.add(armature);
});

armatureGroup.visible = false;
scene.add(armatureGroup);

const stirrupGroup = new THREE.Group();
const stirrupCount = 4;
const stirrupWidth = 1.525;
const stirrupDepth = 0.925;
const stirrupMaterial = new LineMaterial({
  color: 0x6391AD,
  linewidth: 0.0125,
  worldUnits: true,
});

// Função para gerar os pontos com cantos arredondados
function createRoundedStirrupPoints(width, depth, y, radius = 0.05, segments = 5) {
  const points = [];
  const halfW = width / 2;
  const halfD = depth / 2;

  const corners = [
    [-halfW + radius, -halfD + radius], // Inferior esquerdo
    [halfW - radius, -halfD + radius],  // Inferior direito
    [halfW - radius, halfD - radius],   // Superior direito
    [-halfW + radius, halfD - radius]   // Superior esquerdo
  ];

  const angles = [
    [Math.PI, 1.5 * Math.PI],     // canto inferior esquerdo
    [1.5 * Math.PI, 2 * Math.PI], // canto inferior direito
    [0, 0.5 * Math.PI],           // canto superior direito
    [0.5 * Math.PI, Math.PI]      // canto superior esquerdo
  ];

  for (let i = 0; i < 4; i++) {
    const [startAngle, endAngle] = angles[i];
    const [cx, cz] = corners[i];

    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const angle = startAngle + t * (endAngle - startAngle);
      const x = cx + radius * Math.cos(angle);
      const z = cz + radius * Math.sin(angle);
      points.push(x, y, z);
    }
  }

  // Fecha o loop
  points.push(points[0], points[1], points[2]);

  return points;
}

// Estribos
for (let i = 0; i < stirrupCount; i++) {
  const y = -0.45 + (i / (stirrupCount - 1)) * 0.9;

  const points = createRoundedStirrupPoints(stirrupWidth, stirrupDepth, y, 0.05, 6);

  const stirrupGeometry = new LineGeometry();
  stirrupGeometry.setPositions(points);

  const stirrupLine = new Line2(stirrupGeometry, stirrupMaterial);
  stirrupLine.computeLineDistances();
  stirrupGroup.add(stirrupLine);
}

stirrupGroup.visible = false;
scene.add(stirrupGroup);

// Wireframe separado do bloco
const wireframeGeometry = new THREE.WireframeGeometry(concreteGeometry);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const concreteWireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
let isWireframe = false;
concreteWireframe.visible = false;
scene.add(concreteWireframe);


// Sliders
const dmgSlider = document.getElementById('damageSlider');
const rustSlider = document.getElementById('rustSlider');
const carbonSlider = document.getElementById('carbonSlider');
const toggleBtn = document.getElementById('toggleStructure');
const resetBtn = document.getElementById('resetVisuals');


// debounce pra melhor performance em geral
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Slider dano
let damageTimeout;
dmgSlider.addEventListener('input', debounce((e) => {
  const value = parseFloat(e.target.value);

  clearTimeout(damageTimeout);
  damageTimeout = setTimeout(() => {
    concreteMaterial.bumpScale = value * 1.5;
  }, 30);
}));



// Slider Ferrugem
let targetRust = 0;
let currentRust = 0;

rustSlider.addEventListener('input', (e) => {
  targetRust = parseFloat(e.target.value) / 100;
  currentRust = THREE.MathUtils.lerp(currentRust, targetRust, 0.05);
  const lerpSpeed = 0.05;
  currentRust += (targetRust - currentRust) * lerpSpeed;

  armatureGroup.children.forEach(bar => {
    const material = bar.material;

    if (currentRust > 0.001) {
      material.map = steelTexture;
      material.bumpMap = ferrugemTexture;
      material.bumpScale = currentRust * 0.05;

      const rustColor = new THREE.Color(0x8B4513);
      const baseColor = new THREE.Color(0xb0b0b0);
      const blendedColor = baseColor.clone().lerp(rustColor, currentRust);
      material.color.copy(blendedColor);

      material.roughness = 0.4 + currentRust * 0.3;
      material.metalness = 0.7 - currentRust * 0.5;
    } else {
      material.map = steelTexture;
      material.bumpMap = null;
      material.color.set(0xb0b0b0);
      material.bumpScale = 0;
      material.roughness = 0.4;
      material.metalness = 0.7;
    }

    material.needsUpdate = true;
  });
});

// Slider carbonatação
carbonSlider.addEventListener('input', debounce(() => {
  const intensity = carbonSlider.value / 100;
  carbonOverlayMaterial.opacity = intensity * 0.7;
}, 50));

// Slider 'Ver Estrutura'
toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  concreteMesh.visible = !isWireframe;
  concreteWireframe.visible = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
  carbonOverlayMesh.visible = !isWireframe;
});

// Slider 'resetar'
resetBtn.addEventListener('click', () => {
  concreteMaterial.bumpScale = 0;
  concreteMaterial.needsUpdate = true;

  carbonOverlayMaterial.opacity = 0;
  carbonOverlayMaterial.needsUpdate = true;

  armatureGroup.children.forEach(bar => {
    const material = bar.material;
    material.map = steelTexture;
    material.bumpMap = null;
    material.bumpScale = 0;
    material.color.set(0xb0b0b0);
    material.roughness = 0.4;
    material.metalness = 0.7;
    material.needsUpdate = true;
    targetRust = 0;
    currentRust = 0;
  });

  dmgSlider.value = 0;
  rustSlider.value = 0;
  carbonSlider.value = 0;

  dmgSlider.dispatchEvent(new Event('input'));
  rustSlider.dispatchEvent(new Event('input'));
  carbonSlider.dispatchEvent(new Event('input'));
});

// Animação
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();