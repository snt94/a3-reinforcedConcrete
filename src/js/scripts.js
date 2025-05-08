import * as THREE from 'three';


// Renderização da cena
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Eixos para referência
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Luz (necessária se usar materiais com iluminação)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Carrega a textura
const textureLoader = new THREE.TextureLoader();
// const concreteTexture = textureLoader.load(concreteTextureImg);
const concreteTextureImg = new URL('../assets/concreto_textura.jpg', import.meta.url).href;
const concreteTexture = textureLoader.load(concreteTextureImg);

// Material com textura e cor moduladora
const material = new THREE.MeshBasicMaterial({ map: concreteTexture });

// Geometria
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Função de animação
function animate() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);


// Slider de desgaste do concreto
const slider = document.getElementById('damageSlider');

slider.addEventListener('input', () => {
  const value = slider.value;
  const darkness = 1 - value / 100;
  cube.material.color.setRGB(darkness, 0.27 * darkness, 0.27 * darkness);
});

//Textura de rachaduras na estrutura
const crackTextureImg = new URL('../assets/rachaduras.jpg', import.meta.url).href;
const crackTexture = textureLoader.load(crackTextureImg);
material.alphaMap = crackTexture;
material.transparent = true;

// Criar cilindros representando a armadura
const armatureMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const armature = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), armatureMaterial);
armature.position.set(0, 0, 0);
scene.add(armature);

// Atualizar a cor com base no slider
slider.addEventListener('input', () => {
  const value = slider.value;
  const rustIntensity = value / 100;
  const rustColor = new THREE.Color().lerpColors(
    new THREE.Color(0x808080), // cinza
    new THREE.Color(0x8B0000), // vermelho escuro (ferrugem)
    rustIntensity
  );
  armature.material.color = rustColor;
});