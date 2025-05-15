import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSG } from 'three-csg-ts';

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

let isWireframe = false;

const material = new THREE.MeshBasicMaterial({
  map: concreteTexture,
  color: 0xffffff
});

const concreteGeometry = new THREE.BoxGeometry(2, 1, 1);
const concreteMesh = new THREE.Mesh(concreteGeometry, material);

const holeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
const hole1 = new THREE.Mesh(holeGeometry);
hole1.position.set(-0.7, 0, -0.4);
hole1.rotation.z = Math.PI / 2;

const hole2 = hole1.clone();
hole2.position.z = 0.4;

const hole3 = hole1.clone();
hole3.position.x = 0.7;
hole3.position.z = -0.4;

const hole4 = hole1.clone();
hole4.position.z = 0.4;

let resultMesh = CSG.subtract(concreteMesh, hole1);
resultMesh = CSG.subtract(resultMesh, hole2);
resultMesh = CSG.subtract(resultMesh, hole3);
resultMesh = CSG.subtract(resultMesh, hole4);

scene.add(resultMesh);
resultMesh.material = material;

const originalColor = new THREE.Color().copy(resultMesh.material.color);

controls.target.copy(resultMesh.position);
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
const stirrupCount = 6;
const stirrupWidth = 1.4;
const stirrupHeight = 0.8;
const stirrupDepth = 0.6;
const stirrupMaterial = new THREE.LineBasicMaterial({ color: 0x303030 });

for (let i = 0; i < stirrupCount; i++) {
  const y = -0.45 + (i / (stirrupCount - 1)) * 0.9;

  const stirrupShape = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-stirrupWidth / 2, y, -stirrupDepth / 2),
    new THREE.Vector3(stirrupWidth / 2, y, -stirrupDepth / 2),
    new THREE.Vector3(stirrupWidth / 2, y, stirrupDepth / 2),
    new THREE.Vector3(-stirrupWidth / 2, y, stirrupDepth / 2),
  ]);

  const stirrupLine = new THREE.LineLoop(stirrupShape, stirrupMaterial);
  stirrupGroup.add(stirrupLine);
}

stirrupGroup.visible = false;
scene.add(stirrupGroup);

function animate() {
  controls.target.set(0, 0, 0);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

const slider = document.getElementById('damageSlider');
const rustSlider = document.getElementById('rustSlider');
const carbonSlider = document.getElementById('carbonSlider');
const toggleBtn = document.getElementById('toggleStructure');
const resetBtn = document.getElementById('resetVisuals');

slider.addEventListener('input', () => {
  const value = slider.value;
  const rustIntensity = value / 100;
  const darkness = 1 - rustIntensity;
  resultMesh.material.color.setRGB(
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
  resultMesh.material.color.setRGB(
    1 * lightening,
    1 * lightening,
    1 * lightening
  );
});

toggleBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  resultMesh.material.wireframe = isWireframe;
  armatureGroup.visible = isWireframe;
  stirrupGroup.visible = isWireframe;
});

resetBtn.addEventListener('click', () => {
  resultMesh.material.color.copy(originalColor);
  armatureGroup.children.forEach(bar => {
    bar.material.color.set(0x808080);
  });
  slider.value = 0;
});
