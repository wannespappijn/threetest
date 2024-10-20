import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import gasVertexShader from "./shaders/gas/vertex.glsl?raw";
import gasFragmentShader from "./shaders/gas/fragment.glsl?raw";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  1,
  100
);
camera.position.set(6, 2, 10);
scene.add(camera);

// Add orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Load texture for planets
const texture = new THREE.TextureLoader().load("assets/baked-l.jpg");
texture.flipY = false; // Fixes the flip issue
const material = new THREE.MeshBasicMaterial({ map: texture });

const gasMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
  },
  vertexShader: gasVertexShader,
  fragmentShader: gasFragmentShader,
});

const loader = new GLTFLoader();
loader.load(
  "assets/planets.glb",
  (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // Check if the mesh is the Circle
        if (child.name === "Circle") {
          child.material = gasMaterial; // Apply gas material to Circle
        } else {
          child.material = material; // Apply texture material to other meshes
        }
        console.log(child.name); // Log the name of the mesh
      }
    });
    console.log(gltf); // Log the GLTF object
    scene.add(gltf.scene); // Add the loaded model to the scene
  },
  (error) => {
    console.error("An error happened while loading the GLTF model:", error);
  }
);

// Animation loop
const draw = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(draw);
};

// Handle window resize
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  // Update camera
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Start the animation loop
draw();
