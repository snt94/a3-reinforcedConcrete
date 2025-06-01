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

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

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

const carbonOverlayMaterial = new THREE.MeshStandardMaterial({
  map: carbonatacaoTexture,
  transparent: true,
  opacity: 0,
});

const concreteGeometry = new THREE.BoxGeometry(2, 1, 1);
concreteGeometry.computeVertexNormals(); // bgl normal sei la tbm
const concreteMesh = new THREE.Mesh(concreteGeometry, concreteMaterial);

scene.add(concreteMesh);

controls.target.copy(concreteMesh.position);
camera.position.z = 5;

const carbonOverlayMesh = new THREE.Mesh(concreteGeometry.clone(), carbonOverlayMaterial);
carbonOverlayMesh.position.copy(concreteMesh.position);
scene.add(carbonOverlayMesh);

const armatureMaterial = new THREE.MeshStandardMaterial({
  map: steelTexture,
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


// debounce
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

  armatureGroup.children.forEach(bar => {
    const rustColor = new THREE.Color().lerpColors(
      new THREE.Color(0x808080),
      new THREE.Color(0x8B0000),
    );
    bar.material.color = rustColor;
  });
}));

// Slider desgaste de armaduras
rustSlider.addEventListener('input', (e) => {
  const intensity = parseFloat(e.target.value); // 0 a 100
  const t = intensity / 100; // Normaliza de 0 a 1

  armatureGroup.children.forEach(bar => {
    const material = bar.material;

    
    const baseColor = new THREE.Color(0xb0b0b0); // Aço cinza claro
    const rustColor = new THREE.Color(0x8B0000); // Ferrugem escura
    const finalColor = baseColor.clone().lerp(rustColor, t);
    material.color.copy(finalColor);

    
    material.map = steelTexture;
    material.map.needsUpdate = true;

    
    material.bumpMap = t > 0 ? ferrugemTexture : null;
    material.bumpScale = t * 0.15;

    
    material.roughness = 0.3 + t * 0.5;
    material.metalness = 0.8 - t * 0.6;

    material.needsUpdate = true;
  });
});

// Slider carbonatação
carbonSlider.addEventListener('input', debounce(() => {
  const intensity = carbonSlider.value / 100;
  carbonOverlayMaterial.opacity = intensity * 0.7;
}, 50));


// Slider Ver Estrutura
toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  concreteMesh.visible = !isWireframe;
  concreteWireframe.visible = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
  carbonOverlayMesh.visible = !isWireframe;
});


// Slider resetar
resetBtn.addEventListener('click', () => {
  // Reset dano visual no concreto
  concreteMaterial.bumpScale = 0;
  concreteMaterial.needsUpdate = true;

  // Reset carbonatação
  carbonOverlayMaterial.opacity = 0;
  carbonOverlayMaterial.needsUpdate = true;

  // Reset armaduras
  armatureGroup.children.forEach(bar => {
    const material = bar.material;

    
    material.map = steelTexture; // textura base do aço
    material.color.set(0xb0b0b0); // cinza do aço — essencial se `map` for nulo ou sem cor

    // Reset de textura de ferrugem (bumpMap)
    material.bumpMap = ferrugemTexture;
    material.bumpMap.needsUpdate = true;

    material.bumpScale = 0;
    material.metalness = 0.8;
    material.roughness = 0.3;
    material.transparent = false;
    material.opacity = 1.0;

    material.needsUpdate = true;
  });

  // Reset sliders para 0
  dmgSlider.value = 0;
  rustSlider.value = 0;
  carbonSlider.value = 0;

  // Dispara os eventos para atualizar a aparência na UI
  dmgSlider.dispatchEvent(new Event('input'));
  rustSlider.dispatchEvent(new Event('input'));
  carbonSlider.dispatchEvent(new Event('input'));
});

animate();