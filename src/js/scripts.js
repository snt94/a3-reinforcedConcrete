import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const textureLoader = new THREE.TextureLoader();
const concreteTextureImg = new URL('../assets/concreto_textura.jpg', import.meta.url).href;
const concreteTexture = textureLoader.load(concreteTextureImg);
const material = new THREE.MeshBasicMaterial({
  map: concreteTexture,
  color: 0xffffff
});

const concreteGeometry = new THREE.BoxGeometry(2, 1, 1);
const concreteMesh = new THREE.Mesh(concreteGeometry, material);

scene.add(concreteMesh);

const originalColor = new THREE.Color().copy(concreteMesh.material.color);

controls.target.copy(concreteMesh.position);
camera.position.z = 5;

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

const stirrupGroup = new THREE.Group();
const stirrupCount = 2;
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

function animate() {
  controls.target.set(0, 0, 0);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

const dmgSlider = document.getElementById('damageSlider');
const rustSlider = document.getElementById('rustSlider');
const carbonSlider = document.getElementById('carbonSlider');
const toggleBtn = document.getElementById('toggleStructure');
const resetBtn = document.getElementById('resetVisuals');

dmgSlider.addEventListener('input', () => {
  const value = dmgSlider.value;
  const rustIntensity = value / 100;
  const darkness = 1 - rustIntensity;
  concreteMesh.material.color.setRGB(
    1 * darkness,
    1 * darkness,
    1 * darkness
  );

  armatureGroup.children.forEach(bar => {
    const rustColor = new THREE.Color().lerpColors(
      new THREE.Color(0x808080),
      new THREE.Color(0x8B0000),
      rustIntensity
    );
    bar.material.color = rustColor;
  });
});

rustSlider.addEventListener('input', () => {
  const intensity = rustSlider.value / 100;
  armatureGroup.children.forEach(bar => {
    const rustColor = new THREE.Color().lerpColors(
      new THREE.Color(0x808080),
      new THREE.Color(0x8B0000),
      intensity
    );
    bar.material.color = rustColor;
  });
});

carbonSlider.addEventListener('input', () => {
  const intensity = carbonSlider.value / 100;
  const lightening = 1 - 0.5 * intensity;
  concreteMesh.material.color.setRGB(
    1 * lightening,
    1 * lightening,
    1 * lightening
  );
});

toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  concreteMesh.visible = !isWireframe;
  concreteWireframe.visible = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
});

resetBtn.addEventListener('click', () => {
  concreteMesh.material.color.copy(originalColor);
  armatureGroup.children.forEach(bar => {
    bar.material.color.set(0x808080);
  });
  slider.value = 0;
});
