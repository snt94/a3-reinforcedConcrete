import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const container = document.getElementById('three-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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


//Carregamento de Texturas
const textureLoader = new THREE.TextureLoader();

const concreteTextureImg = new URL('../assets/concreto_textura.jpg', import.meta.url).href;
const steelTextureImg = new URL('../assets/aco_textura.jpg', import.meta.url).href;
const danoTextureImg = new URL('../assets/dano.png', import.meta.url).href;
const carbonatacaoTextureImg = new URL('../assets/carbonatacao.jpg', import.meta.url).href;
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
concreteGeometry.computeVertexNormals(); // bgl normal sei la tbm
const concreteMesh = new THREE.Mesh(concreteGeometry, concreteMaterial);

scene.add(concreteMesh);

controls.target.copy(concreteMesh.position);
camera.position.z = 5;

const armatureMaterial = new THREE.MeshStandardMaterial({
  map: steelTexture,
  metalness: 0.8,
  roughness: 0.3,
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
    armatureMaterial.clone()
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


dmgSlider.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  concreteMaterial.bumpScale = value * 1.5; // Deixa o dano visível
  concreteMaterial.needsUpdate = true;
  
  armatureGroup.children.forEach(bar => {
    const rustColor = new THREE.Color().lerpColors(
      new THREE.Color(0x808080),
      new THREE.Color(0x8B0000),
    );
    bar.material.color = rustColor;
  });
});

rustSlider.addEventListener('input', () => {
  const intensity = rustSlider.value / 100;

  armatureGroup.children.forEach(bar => {
    // Mantém a textura base do aço
    bar.material.map = steelTexture;

    // Ajuste gradual de cor com leve avermelhamento
    const baseColor = new THREE.Color(0x808080);
    const rustTint = new THREE.Color(0x8B3A3A); // tom enferrujado mais ameno
    const finalColor = baseColor.clone().lerp(rustTint, intensity);

    bar.material.color = finalColor;

    // Aplica a textura de ferrugem como alphaMap se houver intensidade
    bar.material.alphaMap = intensity > 0 ? ferrugemTexture : null;
    // bar.material.transparent = intensity > 0;
    bar.material.needsUpdate = true;
  });
});

carbonSlider.addEventListener('input', () => {
  const intensity = carbonSlider.value / 100;

  // Combina textura de concreto com carbonatação como overlay
  if (intensity > 0) {
    concreteMaterial.map = concreteTexture;
    concreteMaterial.alphaMap = carbonatacaoTexture;
    concreteMaterial.transparent = true;
    concreteMaterial.opacity = 1 - 0.3 * intensity; // ajustável
  } else {
    concreteMaterial.alphaMap = null;
    concreteMaterial.transparent = false;
    concreteMaterial.opacity = 1;
  }

  concreteMaterial.needsUpdate = true;
});

//Botões de "Ver Estrutura" e "Resetar"

toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  concreteMesh.visible = !isWireframe;
  concreteWireframe.visible = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
});

resetBtn.addEventListener('click', () => {
  // Reset concreto
  concreteMaterial.map = concreteTexture;
  concreteMaterial.bumpMap = null;
  concreteMaterial.alphaMap = null;
  concreteMaterial.opacity = 1;
  concreteMaterial.transparent = false;
  concreteMaterial.needsUpdate = true;

  // Reset armaduras
  armatureGroup.children.forEach(bar => {
    bar.material.map = steelTexture;
    bar.material.color.set(0x808080);
    bar.material.alphaMap = null;
    bar.material.transparent = false;
    bar.material.needsUpdate = true;
  });

  // Reset sliders
  dmgSlider.value = 0;
  rustSlider.value = 0;
  carbonSlider.value = 0;
});



function animate() {
  requestAnimationFrame(animate);
  controls.target.set(0, 0, 0);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

animate();