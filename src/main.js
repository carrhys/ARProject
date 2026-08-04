import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const TARGET_WIDTH = 600;
const TARGET_HEIGHT = 994;
const TARGET_ASPECT = TARGET_HEIGHT / TARGET_WIDTH;

const container = document.querySelector("#ar-container");
const launchScreen = document.querySelector("#launch-screen");
const scannerUI = document.querySelector("#scanner-ui");
const statusPill = document.querySelector("#status-pill");
const startButton = document.querySelector("#start-button");
const stopButton = document.querySelector("#stop-button");
const errorPanel = document.querySelector("#error-panel");
const errorMessage = document.querySelector("#error-message");

let mindarThree = null;
let foodPlane = null;
let foodMaterial = null;
let revealStartedAt = null;
let isRunning = false;

const setStatus = (message) => {
  statusPill.textContent = message;
};

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const startReveal = () => {
  if (!foodPlane || !foodMaterial) return;

  foodPlane.visible = true;
  foodPlane.scale.setScalar(0.86);
  foodPlane.position.z = 0.04;
  foodMaterial.opacity = 0;
  revealStartedAt = performance.now();
  setStatus("The feast has arrived ✦");
};

const updateReveal = (time) => {
  if (revealStartedAt === null || !foodPlane || !foodMaterial) return;

  const duration = 1250;
  const progress = Math.min((time - revealStartedAt) / duration, 1);
  const easedScale = easeOutBack(progress);
  const easedOpacity = 1 - Math.pow(1 - progress, 3);

  foodMaterial.opacity = easedOpacity;
  const scale = 0.86 + (1 - 0.86) * easedScale;
  foodPlane.scale.setScalar(scale);
  foodPlane.position.z = 0.04 + (0.012 - 0.04) * easedOpacity;

  if (progress >= 1) {
    foodMaterial.opacity = 1;
    foodPlane.scale.setScalar(1);
    foodPlane.position.z = 0.012;
    revealStartedAt = null;
  }
};

const showError = (error) => {
  console.error(error);
  scannerUI.classList.add("is-hidden");
  stopButton.classList.add("is-hidden");
  launchScreen.classList.add("is-hidden");
  errorPanel.classList.remove("is-hidden");

  const message = error instanceof Error ? error.message : String(error);
  errorMessage.textContent =
    message.includes("mind") || message.includes("404")
      ? "The compiled MindAR target file is missing. Add assets/targets.mind and reload."
      : message || "Camera access or AR initialization failed.";
};

const createAR = async () => {
  const textureLoader = new THREE.TextureLoader();
  const foodTexture = await textureLoader.loadAsync("./assets/food-overlay.png");
  foodTexture.colorSpace = THREE.SRGBColorSpace;

  mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/targets.mind",
    uiLoading: "no",
    uiScanning: "no",
    uiError: "no"
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const anchor = mindarThree.addAnchor(0);

  const geometry = new THREE.PlaneGeometry(1, TARGET_ASPECT);
  foodMaterial = new THREE.MeshBasicMaterial({
    map: foodTexture,
    transparent: true,
    opacity: 0,
    alphaTest: 0.015,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  foodPlane = new THREE.Mesh(geometry, foodMaterial);
  foodPlane.visible = false;
  foodPlane.renderOrder = 10;
  anchor.group.add(foodPlane);

  anchor.onTargetFound = () => {
    startReveal();
  };

  anchor.onTargetLost = () => {
    revealStartedAt = null;
    if (foodMaterial) foodMaterial.opacity = 0;
    if (foodPlane) foodPlane.visible = false;
    setStatus("Move the camera back to the empty leaf");
  };

  await mindarThree.start();

  renderer.setAnimationLoop((time) => {
    updateReveal(time);
    renderer.render(scene, camera);
  });
};

const startAR = async () => {
  if (isRunning) return;

  startButton.disabled = true;
  startButton.textContent = "Starting camera…";
  errorPanel.classList.add("is-hidden");

  try {
    await createAR();
    isRunning = true;
    launchScreen.classList.add("is-hidden");
    scannerUI.classList.remove("is-hidden");
    stopButton.classList.remove("is-hidden");
    setStatus("Point at the empty plantain leaf");
  } catch (error) {
    isRunning = false;
    showError(error);
  } finally {
    startButton.disabled = false;
    startButton.textContent = "Start AR";
  }
};

const stopAR = async () => {
  if (!mindarThree) return;

  try {
    mindarThree.renderer.setAnimationLoop(null);
    await mindarThree.stop();
  } finally {
    isRunning = false;
    mindarThree = null;
    foodPlane = null;
    foodMaterial = null;
    revealStartedAt = null;
    scannerUI.classList.add("is-hidden");
    stopButton.classList.add("is-hidden");
    launchScreen.classList.remove("is-hidden");
  }
};

startButton.addEventListener("click", startAR);
stopButton.addEventListener("click", stopAR);
