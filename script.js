import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, plane, controls;

function init() {
    setupScene();
    setupCamera();
    setupRenderer();
    createPlane();
    addAxesHelper();
    loadFontAndCreateLabels();
    setupControls();
    setupEventListeners();
    animate();
}

function setupScene() {
    scene = new THREE.Scene();
}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -15, 0); // Stand at the origin
    camera.up.set(0, 0, 1); // Head aligned with the Z-axis
    camera.lookAt(0, 1, 0); // Look towards the positive Y-axis
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function createPlane() {
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            colorFront: { value: new THREE.Color(0xFFA500) }, // Orange front
            colorBack: { value: new THREE.Color(0x008080) }  // Teal back
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 colorFront;
            uniform vec3 colorBack;
            varying vec3 vNormal;
            void main() {
                // Check which side is visible and set color accordingly
                gl_FragColor = vec4(gl_FrontFacing ? colorFront : colorBack, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
    plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.set(0, 0, 0);
    scene.add(plane);
}

function addAxesHelper() {
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);
}

function loadFontAndCreateLabels() {
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        createAxisLabel('X', 'red', 2, 0, 0);
        createAxisLabel('Y', 'green', 0, 2, 0);
        createAxisLabel('Z', 'blue', 0, 0, 2);
    });
}

function createAxisLabel(label, color, x, y, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'Bold 140px Arial';
    context.fillStyle = color;
    context.fillText(label, 0, 140);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.5, 1);
    sprite.position.set(x, y, z);
    scene.add(sprite);
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0); // Set the target to look towards the positive Y-axis
    controls.update();
}

function setupEventListeners() {
    document.getElementById("yaw").addEventListener("input", updateRotation);
    document.getElementById("pitch").addEventListener("input", updateRotation);
    document.getElementById("roll").addEventListener("input", updateRotation);
    document.getElementById("grid").addEventListener("change", toggleGrid);
    document.getElementById("reset").addEventListener("click", resetRotation);
}

function updateRotation() {
    const yaw = Math.round(document.getElementById("yaw").value);
    const pitch = Math.round(document.getElementById("pitch").value);
    const roll = Math.round(document.getElementById("roll").value);

    // Apply rotation in the correct order: Yaw (Z), Pitch (X), Roll (Y)
    plane.rotation.set(THREE.MathUtils.degToRad(pitch), THREE.MathUtils.degToRad(roll), THREE.MathUtils.degToRad(yaw));

    // Update the displayed values
    document.getElementById("yaw-val").textContent = `Yaw: ${yaw}° `;
    document.getElementById("pitch-val").textContent = `Pitch: ${pitch}° `;
    document.getElementById("roll-val").textContent = `Roll: ${roll}° `;
}

function toggleGrid() {
    const grid = scene.getObjectByName("grid");
    if (grid) {
        scene.remove(grid);
    } else {
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.name = "grid";
        scene.add(gridHelper);
    }
}

function resetRotation() {
    const duration = 1; // Duration of the animation in seconds

    // Animate the plane rotation
    gsap.to(plane.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: duration,
        onUpdate: updateRotation
    });

    // Animate the camera position and orientation
    gsap.to(camera.position, {
        x: 0,
        y: -15,
        z: 0,
        duration: duration,
        onUpdate: () => {
            camera.lookAt(0, 1, 0);
            controls.update();
        }
    });

    // Reset the input values
    document.getElementById("yaw").value = 0;
    document.getElementById("pitch").value = 0;
    document.getElementById("roll").value = 0;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();
