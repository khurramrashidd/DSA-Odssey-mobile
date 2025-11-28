import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

// DOM Element References
const loadingScreen = document.getElementById('loading-screen');
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarMainContent = document.getElementById('sidebar-main-content');
const sidebarDetailsView = document.getElementById('sidebar-details-view');
const backToMainBtn = document.getElementById('back-to-main-btn');
const infoBox = document.getElementById('info-box');
const statsPanel = document.getElementById('stats-panel');
const searchBox = document.getElementById('search-box');
const topicFilter = document.getElementById('topic-filter');
const togglePathBtn = document.getElementById('toggle-path-btn');
const openAiModalBtn = document.getElementById('open-ai-modal-btn');
const aiModalOverlay = document.getElementById('ai-modal-overlay');
const aiModalCloseBtn = document.getElementById('ai-modal-close-btn');
const aiModalProblemName = document.getElementById('ai-modal-problem-name');
const getCodeBtn = document.getElementById('get-code-btn');
const languageInput = document.getElementById('language-input');
const solutionContainer = document.getElementById('solution-container');

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const interactiveStarsGroup = new THREE.Group();
scene.add(interactiveStarsGroup);

let journeyPath = null, cameraTarget = null, isAnimatingCamera = false;
let currentProblemName = null;

function addSun() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    scene.add(sunLight);
    const textureLoader = new THREE.TextureLoader();
    const textureFlare0 = textureLoader.load("https://unpkg.com/three@0.157.0/examples/textures/lensflare/lensflare0.png");
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, sunLight.color));
    sunLight.add(lensflare);
}

function addGalaxy() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const starVertices = [], starColors = [];
    const baseColor = new THREE.Color("#FFFFFF"), accentColor = new THREE.Color("#ADD8E6");
    const galaxyParams = { count: 30000, radius: 150, branches: 4, spin: 1.5, randomness: 0.5, randomnessPower: 3 };
    for (let i = 0; i < galaxyParams.count; i++) {
        const radius = Math.random() * galaxyParams.radius;
        const spinAngle = radius * galaxyParams.spin;
        const branchAngle = (i % galaxyParams.branches) / galaxyParams.branches * Math.PI * 2;
        const randomX = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
        const randomY = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * 0.2;
        const randomZ = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
        const x = Math.cos(branchAngle + spinAngle) * radius + randomX, y = randomY, z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        starVertices.push(x, y, z);
        const color = baseColor.clone().lerp(accentColor, Math.random() * 0.2);
        starColors.push(color.r, color.g, color.b);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const galaxy = new THREE.Points(starGeometry, starMaterial);
    window.galaxy = galaxy;
    scene.add(galaxy);
}

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
function onPointerClick(event) {
    if (isAnimatingCamera || aiModalOverlay.style.display === 'flex') return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveStarsGroup.children);
    if (intersects.length > 0) {
        const dayData = intersects[0].object.userData;
        currentProblemName = dayData.problems[0].name;
        infoBox.innerHTML = `<h3>Day ${dayData.day}</h3><ul>${dayData.problems.map(p => `<li><div class="problem-details"><div class="planet-title">Planet Name:</div><a href="${p.link}" class="gfg-link" target="_blank">${p.name} ${p.emojis.join(' ')}</a><a href="${p.twitterPostLink}" class="twitter-link" target="_blank">View Post on 𝕏</a></div><span class="difficulty ${p.difficulty.toLowerCase()}">${p.difficulty}</span></li>`).join('')}</ul> <p class="notes">${dayData.problems[0].notes || ''}</p>`;
        sidebarMainContent.style.display = 'none';
        sidebarDetailsView.style.display = 'block';

        // **NEW:** Automatically open the sidebar if it's collapsed
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebarToggleBtn.classList.add('active');
        }
    }
}
window.addEventListener('click', onPointerClick);

async function init() {
    const response = await fetch('/api/journey-data');
    const journeyData = await response.json();
    const allTopics = new Set();
    journeyData.forEach((day, i) => {
        const geometry = new THREE.SphereGeometry(1.5, 30, 30);
        const material = new THREE.MeshStandardMaterial({ color: day.color, emissive: day.color, emissiveIntensity: 3, transparent: true });
        const star = new THREE.Mesh(geometry, material);
        const branchAngle = (i % 4 / 4) * Math.PI * 2;
        const distanceFromCenter = 20 + Math.random() * 100;
        const spinAngle = distanceFromCenter * 0.5;
        const x = Math.cos(branchAngle + spinAngle) * distanceFromCenter, y = (Math.random() - 0.5) * 5, z = Math.sin(branchAngle + spinAngle) * distanceFromCenter;
        star.position.set(x, y, z);
        star.userData = day;
        star.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
        interactiveStarsGroup.add(star);
        day.problems[0].topics.forEach(topic => allTopics.add(topic));
    });
    allTopics.forEach(topic => { topicFilter.innerHTML += `<option value="${topic}">${topic}</option>`; });
    const points = interactiveStarsGroup.children.slice().sort((a, b) => a.userData.day - b.userData.day).map(star => star.position);
    journeyPath = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x00f6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    journeyPath.visible = false;
    scene.add(journeyPath);
    const stats = { easy: 0, medium: 0, hard: 0 };
    const topics = {};
    journeyData.forEach(day => {
        const problem = day.problems[0];
        stats[problem.difficulty.toLowerCase()]++;
        problem.topics.forEach(topic => { topics[topic] = (topics[topic] || 0) + 1; });
    });
    const topTopic = Object.entries(topics).sort((a, b) => b[1] - a[1])[0];
    statsPanel.innerHTML = `<h3>Journey Statistics</h3><p>Total Problems: <span>${journeyData.length}</span></p><p>Easy: <span>${stats.easy}</span></p><p>Medium: <span>${stats.medium}</span></p><p>Hard: <span>${stats.hard}</span></p><p>Top Topic: <span>${topTopic[0]} (${topTopic[1]})</span></p>`;
    loadingScreen.style.opacity = '0';
    loadingScreen.addEventListener('transitionend', () => loadingScreen.remove());
    addSun(); addGalaxy();
}

function highlightStars(filterText, filterType) {
    let singleMatch = null; let matchCount = 0;
    interactiveStarsGroup.children.forEach(star => {
        const problem = star.userData.problems[0];
        const isMatch = !filterText || (filterType === 'topic' ? problem.topics.includes(filterText) : problem.name.toLowerCase().includes(filterText.toLowerCase()));
        star.material.opacity = isMatch ? 1.0 : 0.15;
        if (isMatch) { matchCount++; singleMatch = star; }
    });
    if (matchCount === 1 && singleMatch) {
        const offset = new THREE.Vector3(0, 5, 20);
        cameraTarget = singleMatch.position.clone().add(offset);
        controls.target.copy(singleMatch.position);
        isAnimatingCamera = true;
    } else { isAnimatingCamera = false; cameraTarget = null; controls.target.set(0, 0, 0); }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (isAnimatingCamera && cameraTarget) {
        camera.position.lerp(cameraTarget, 0.05);
        if (camera.position.distanceTo(cameraTarget) < 0.1) isAnimatingCamera = false;
    } else {
        const time = Date.now() * 0.0005;
        camera.position.x = Math.sin(time * 0.1) * 100;
        camera.position.z = Math.cos(time * 0.1) * 100;
        camera.lookAt(scene.position);
    }
    interactiveStarsGroup.children.forEach(star => {
        star.position.add(star.userData.velocity);
        if (star.position.length() > 120) star.position.negate();
        if (star.material.opacity > 0.5) star.scale.setScalar(1 + Math.sin(Date.now() * 0.001 + star.position.x) * 0.1);
    });
    if (window.galaxy) window.galaxy.rotation.y += 0.0003;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

searchBox.addEventListener('input', (e) => highlightStars(e.target.value, 'search'));
topicFilter.addEventListener('change', (e) => highlightStars(e.target.value, 'topic'));
togglePathBtn.addEventListener('click', () => {
    journeyPath.visible = !journeyPath.visible;
    togglePathBtn.innerText = journeyPath.visible ? 'Hide Journey Path' : 'Show Journey Path';
});
// **UPDATED:** The button now toggles its own 'active' state
sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebarToggleBtn.classList.toggle('active');
});
backToMainBtn.addEventListener('click', () => {
    sidebarDetailsView.style.display = 'none';
    sidebarMainContent.style.display = 'block';
});

openAiModalBtn.addEventListener('click', () => {
    if (currentProblemName) {
        aiModalProblemName.textContent = `Problem: ${currentProblemName}`;
        solutionContainer.innerHTML = '<div class="solution-card">Enter a language and click "Generate Solution" to see the AI-generated code.</div>';
        languageInput.value = '';
        aiModalOverlay.style.display = 'flex';
    }
});

aiModalCloseBtn.addEventListener('click', () => { aiModalOverlay.style.display = 'none'; });

getCodeBtn.addEventListener('click', async () => {
    const selectedLanguage = languageInput.value.trim();
    if (!currentProblemName) { solutionContainer.innerHTML = '<div class="solution-card">Error: No problem selected.</div>'; return; }
    if (!selectedLanguage) { solutionContainer.innerHTML = '<div class="solution-card">Please enter a programming language.</div>'; return; }

    solutionContainer.innerHTML = `<div class="solution-card"><h4>Fetching Solution...</h4><div class="spinner"></div></div>`;
    getCodeBtn.disabled = true;

    try {
        const response = await fetch('/api/get-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problem_name: currentProblemName, language: selectedLanguage }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        let html = '';
        if (data.code_solution) {
            html += `<div class="solution-card"><h4>Code</h4><pre>${data.code_solution}</pre></div>`;
        }
        if (data.explanation) {
             // Basic formatting for explanation
            const formattedExplanation = data.explanation
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\n/g, '<br>'); // Newlines
            html += `<div class="solution-card"><h4>Explanation</h4><div class="explanation-content">${formattedExplanation}</div></div>`;
        }
        solutionContainer.innerHTML = html || '<div class="solution-card">No solution found.</div>';

    } catch (error) {
        console.error("Error fetching code solution:", error);
        solutionContainer.innerHTML = `<div class="solution-card"><h4>Error</h4><p>Sorry, an error occurred: ${error.message}</p></div>`;
    } finally {
        getCodeBtn.disabled = false;
    }
});

init();
animate();