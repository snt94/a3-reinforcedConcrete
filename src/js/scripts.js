import * as THREE from 'three';
// Renderização da cena
const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const axesHelper = new THREE.AxesHelper(5);
renderer.render(scene, camera);

//Função de animação
function animate() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);


//Criação de um objeto
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xFF4444 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

