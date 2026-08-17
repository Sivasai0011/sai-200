/**
 * RoadVision AI - 3D Smart City & Environment Builder (Three.js)
 */

class CityBuilder {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.trafficLights = [];
        this.streetLamps = [];
        this.rainParticles = null;
        this.snowParticles = null;
        this.weatherMode = 'clear'; // clear, rain, fog, snow, thunder
        this.timeOfDay = 'night'; // day, sunset, night
        this.lightningTimer = 0;

        // Texture cache
        this.textures = {};

        this.initProceduralTextures();
    }

    initProceduralTextures() {
        // Road texture
        const roadCanvas = document.createElement('canvas');
        roadCanvas.width = 512;
        roadCanvas.height = 512;
        const ctx = roadCanvas.getContext('2d');

        // Asphalt background
        ctx.fillStyle = '#181b20';
        ctx.fillRect(0, 0, 512, 512);

        // Asphalt texture noise
        ctx.fillStyle = '#222730';
        for (let i = 0; i < 4000; i++) {
            const rx = Math.random() * 512;
            const ry = Math.random() * 512;
            ctx.fillRect(rx, ry, 2, 2);
        }

        // White outer lane lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(20, 0); ctx.lineTo(20, 512);
        ctx.moveTo(492, 0); ctx.lineTo(492, 512);
        ctx.stroke();

        // Yellow double center line
        ctx.strokeStyle = '#ffb700';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(250, 0); ctx.lineTo(250, 512);
        ctx.moveTo(262, 0); ctx.lineTo(262, 512);
        ctx.stroke();

        // White dashed lane markers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.setLineDash([30, 30]);
        ctx.beginPath();
        ctx.moveTo(135, 0); ctx.lineTo(135, 512);
        ctx.moveTo(377, 0); ctx.lineTo(377, 512);
        ctx.stroke();

        this.textures.road = new THREE.CanvasTexture(roadCanvas);
        this.textures.road.wrapS = THREE.RepeatWrapping;
        this.textures.road.wrapT = THREE.RepeatWrapping;

        // Building window texture
        const bCanvas = document.createElement('canvas');
        bCanvas.width = 256;
        bCanvas.height = 256;
        const bCtx = bCanvas.getContext('2d');
        bCtx.fillStyle = '#0b0f19';
        bCtx.fillRect(0, 0, 256, 256);

        // Window grid
        for (let y = 10; y < 256; y += 24) {
            for (let x = 10; x < 256; x += 24) {
                const rand = Math.random();
                if (rand > 0.4) {
                    const opacity = Math.random() * 0.8 + 0.2;
                    bCtx.fillStyle = rand > 0.85 ? `rgba(0, 240, 255, ${opacity})` : (rand > 0.7 ? `rgba(0, 255, 136, ${opacity})` : `rgba(255, 200, 100, ${opacity})`);
                    bCtx.fillRect(x, y, 14, 16);
                }
            }
        }
        this.textures.building = new THREE.CanvasTexture(bCanvas);
        this.textures.building.wrapS = THREE.RepeatWrapping;
        this.textures.building.wrapT = THREE.RepeatWrapping;
    }

    buildCityGrid() {
        const cityGroup = new THREE.Group();

        // Ground Plane (Grass / Sub-base)
        const groundGeo = new THREE.PlaneGeometry(600, 600);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x05080e,
            roughness: 0.9,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        cityGroup.add(ground);

        // Grid parameters
        const blockSize = 60;
        const roadWidth = 24;
        const gridCount = 5; // 5x5 blocks
        const offset = (gridCount * (blockSize + roadWidth)) / 2 - (blockSize + roadWidth) / 2;

        // Build Roads
        for (let i = -3; i <= 3; i++) {
            const pos = i * (blockSize + roadWidth);

            // Horizontal Road (Z axis)
            const hRoadGeo = new THREE.PlaneGeometry(600, roadWidth);
            const hRoadMat = new THREE.MeshStandardMaterial({
                map: this.textures.road.clone(),
                roughness: 0.4,
                metalness: 0.3
            });
            hRoadMat.map.repeat.set(25, 1);
            const hRoad = new THREE.Mesh(hRoadGeo, hRoadMat);
            hRoad.rotation.x = -Math.PI / 2;
            hRoad.position.set(0, 0.01, pos);
            hRoad.receiveShadow = true;
            cityGroup.add(hRoad);

            // Vertical Road (X axis)
            const vRoadGeo = new THREE.PlaneGeometry(roadWidth, 600);
            const vRoadMat = new THREE.MeshStandardMaterial({
                map: this.textures.road.clone(),
                roughness: 0.4,
                metalness: 0.3
            });
            vRoadMat.map.repeat.set(1, 25);
            const vRoad = new THREE.Mesh(vRoadGeo, vRoadMat);
            vRoad.rotation.x = -Math.PI / 2;
            vRoad.position.set(pos, 0.015, 0);
            vRoad.receiveShadow = true;
            cityGroup.add(vRoad);
        }

        // Build City Blocks & Buildings
        const blockCenters = [-168, -84, 0, 84, 168];
        for (let bx of blockCenters) {
            for (let bz of blockCenters) {
                this.buildCityBlock(cityGroup, bx, bz, blockSize);
            }
        }

        // Build Intersections & Traffic Signals
        for (let ix of blockCenters) {
            for (let iz of blockCenters) {
                // Shift to intersection coordinates
                const intX = ix + 42;
                const intZ = iz + 42;
                if (Math.abs(intX) <= 180 && Math.abs(intZ) <= 180) {
                    this.buildIntersectionSignals(cityGroup, intX, intZ);
                }
            }
        }

        // Add Street Lamps along main roads
        for (let x = -200; x <= 200; x += 50) {
            for (let z = -200; z <= 200; z += 50) {
                if ((Math.abs(x) % 84 === 42) !== (Math.abs(z) % 84 === 42)) {
                    this.addStreetLamp(cityGroup, x + 10, z + 10);
                }
            }
        }

        this.scene.add(cityGroup);
        this.initWeatherSystems();
    }

    buildCityBlock(group, centerX, centerZ, size) {
        // Sidewalk Base
        const swGeo = new THREE.BoxGeometry(size, 0.4, size);
        const swMat = new THREE.MeshStandardMaterial({ color: 0x1e2532, roughness: 0.7 });
        const sidewalk = new THREE.Mesh(swGeo, swMat);
        sidewalk.position.set(centerX, 0.2, centerZ);
        sidewalk.receiveShadow = true;
        group.add(sidewalk);

        // Subdivide block into 4 buildings or park
        const subPositions = [
            { x: centerX - 14, z: centerZ - 14, w: 24, d: 24 },
            { x: centerX + 14, z: centerZ - 14, w: 24, d: 24 },
            { x: centerX - 14, z: centerZ + 14, w: 24, d: 24 },
            { x: centerX + 14, z: centerZ + 14, w: 24, d: 24 }
        ];

        subPositions.forEach((sp, idx) => {
            // Random chance for a futuristic plaza/park
            if (Math.random() < 0.15) {
                this.buildPlaza(group, sp.x, sp.z, sp.w, sp.d);
                return;
            }

            const height = Math.floor(Math.random() * 70) + 35;
            const bGeo = new THREE.BoxGeometry(sp.w, height, sp.d);

            const buildMat = new THREE.MeshStandardMaterial({
                color: 0x111827,
                map: this.textures.building,
                roughness: 0.2,
                metalness: 0.8
            });
            buildMat.map.repeat.set(1, Math.floor(height / 10));

            const building = new THREE.Mesh(bGeo, buildMat);
            building.position.set(sp.x, height / 2 + 0.4, sp.z);
            building.castShadow = true;
            building.receiveShadow = true;
            group.add(building);
            this.buildings.push(building);

            // Roof Neon Edge Trim / Helipad
            if (height > 60) {
                const roofFrameGeo = new THREE.BoxGeometry(sp.w + 0.4, 1.2, sp.d + 0.4);
                const roofMat = new THREE.MeshBasicMaterial({
                    color: (idx % 2 === 0) ? 0x00f0ff : 0x00ff88,
                    wireframe: true
                });
                const roofTrim = new THREE.Mesh(roofFrameGeo, roofMat);
                roofTrim.position.set(sp.x, height + 0.4, sp.z);
                group.add(roofTrim);

                // Add rooftop neon beacon light
                const beaconLight = new THREE.PointLight(idx % 2 === 0 ? 0x00f0ff : 0x00ff88, 1.5, 30);
                beaconLight.position.set(sp.x, height + 3, sp.z);
                group.add(beaconLight);
            }
        });
    }

    buildPlaza(group, x, z, w, d) {
        // Cyberpunk Park / Plaza
        const plazaGeo = new THREE.BoxGeometry(w, 0.2, d);
        const plazaMat = new THREE.MeshStandardMaterial({ color: 0x0a192f, roughness: 0.5 });
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.position.set(x, 0.5, z);
        group.add(plaza);

        // Glowing Holographic Center Monument
        const monGeo = new THREE.CylinderGeometry(2, 4, 12, 8);
        const monMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
        const monument = new THREE.Mesh(monGeo, monMat);
        monument.position.set(x, 6.5, z);
        group.add(monument);

        // Monument point light
        const pLight = new THREE.PointLight(0x00f0ff, 2, 25);
        pLight.position.set(x, 7, z);
        group.add(pLight);
    }

    buildIntersectionSignals(group, x, z) {
        // Traffic Light Pole Assembly
        const poleGroup = new THREE.Group();
        poleGroup.position.set(x, 0, z);

        const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 10, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x222b3a, metalness: 0.9, roughness: 0.2 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 5;
        poleGroup.add(pole);

        // Signal Box
        const boxGeo = new THREE.BoxGeometry(1.2, 3.5, 1.2);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x0d131d });
        const signalBox = new THREE.Mesh(boxGeo, boxMat);
        signalBox.position.set(0, 9, 0);
        poleGroup.add(signalBox);

        // Status Emissive Lights (Red, Yellow, Green)
        const lightGeo = new THREE.SphereGeometry(0.35, 12, 12);
        
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const redSphere = new THREE.Mesh(lightGeo, redMat);
        redSphere.position.set(0, 10, 0.6);
        poleGroup.add(redSphere);

        const yellowMat = new THREE.MeshBasicMaterial({ color: 0x221100 });
        const yellowSphere = new THREE.Mesh(lightGeo, yellowMat);
        yellowSphere.position.set(0, 9, 0.6);
        poleGroup.add(yellowSphere);

        const greenMat = new THREE.MeshBasicMaterial({ color: 0x002211 });
        const greenSphere = new THREE.Mesh(lightGeo, greenMat);
        greenSphere.position.set(0, 8, 0.6);
        poleGroup.add(greenSphere);

        group.add(poleGroup);

        this.trafficLights.push({
            group: poleGroup,
            redMat, yellowMat, greenMat,
            state: 'red',
            timer: Math.random() * 5
        });
    }

    addStreetLamp(group, x, z) {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(x, 0, z);

        const postGeo = new THREE.CylinderGeometry(0.15, 0.2, 8, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.y = 4;
        lampGroup.add(post);

        const bulbGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(0, 8, 0);
        lampGroup.add(bulb);

        const light = new THREE.PointLight(0x00f0ff, 1.2, 20);
        light.position.set(0, 7.8, 0);
        lampGroup.add(light);

        group.add(lampGroup);
        this.streetLamps.push(light);
    }

    initWeatherSystems() {
        // Rain Particle System
        const rainCount = 4000;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = new Float32Array(rainCount * 3);

        for (let i = 0; i < rainCount * 3; i += 3) {
            rainPos[i] = (Math.random() - 0.5) * 500;
            rainPos[i + 1] = Math.random() * 120;
            rainPos[i + 2] = (Math.random() - 0.5) * 500;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({
            color: 0x00d8ff,
            size: 0.6,
            transparent: true,
            opacity: 0.6
        });
        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);

        // Snow Particle System
        const snowCount = 3000;
        const snowGeo = new THREE.BufferGeometry();
        const snowPos = new Float32Array(snowCount * 3);

        for (let i = 0; i < snowCount * 3; i += 3) {
            snowPos[i] = (Math.random() - 0.5) * 500;
            snowPos[i + 1] = Math.random() * 120;
            snowPos[i + 2] = (Math.random() - 0.5) * 500;
        }

        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.9,
            transparent: true,
            opacity: 0.8
        });
        this.snowParticles = new THREE.Points(snowGeo, snowMat);
        this.snowParticles.visible = false;
        this.scene.add(this.snowParticles);
    }

    setWeather(mode) {
        this.weatherMode = mode;
        this.rainParticles.visible = (mode === 'rain' || mode === 'thunder');
        this.snowParticles.visible = (mode === 'snow');

        if (mode === 'fog') {
            this.scene.fog = new THREE.FogExp2(0x0a101d, 0.015);
        } else if (mode === 'thunder') {
            this.scene.fog = new THREE.FogExp2(0x050a14, 0.02);
        } else if (mode === 'rain') {
            this.scene.fog = new THREE.FogExp2(0x0b1320, 0.008);
        } else if (mode === 'snow') {
            this.scene.fog = new THREE.FogExp2(0x1a2436, 0.01);
        } else {
            this.scene.fog = new THREE.FogExp2(0x06090e, 0.003);
        }
    }

    setDayNight(time) {
        this.timeOfDay = time;
        const ambientLight = this.scene.getObjectByName('ambientLight');
        const dirLight = this.scene.getObjectByName('dirLight');

        if (time === 'day') {
            this.scene.background = new THREE.Color(0x87ceeb);
            if (this.scene.fog) this.scene.fog.color.setHex(0xa0c8e6);
            if (ambientLight) ambientLight.intensity = 1.2;
            if (dirLight) {
                dirLight.intensity = 2.0;
                dirLight.color.setHex(0xffffff);
            }
        } else if (time === 'sunset') {
            this.scene.background = new THREE.Color(0x2c1638);
            if (this.scene.fog) this.scene.fog.color.setHex(0x3d1d49);
            if (ambientLight) ambientLight.intensity = 0.5;
            if (dirLight) {
                dirLight.intensity = 1.0;
                dirLight.color.setHex(0xff7733);
            }
        } else { // night
            this.scene.background = new THREE.Color(0x06090e);
            if (this.scene.fog) this.scene.fog.color.setHex(0x06090e);
            if (ambientLight) ambientLight.intensity = 0.25;
            if (dirLight) {
                dirLight.intensity = 0.4;
                dirLight.color.setHex(0x3355aa);
            }
        }
    }

    update(delta) {
        // Traffic Signal Cycle
        this.trafficLights.forEach(tl => {
            tl.timer += delta;
            if (tl.timer > 6) {
                tl.timer = 0;
                if (tl.state === 'green') {
                    tl.state = 'yellow';
                    tl.greenMat.color.setHex(0x002211);
                    tl.yellowMat.color.setHex(0xffb700);
                } else if (tl.state === 'yellow') {
                    tl.state = 'red';
                    tl.yellowMat.color.setHex(0x221100);
                    tl.redMat.color.setHex(0xff0055);
                } else {
                    tl.state = 'green';
                    tl.redMat.color.setHex(0x220011);
                    tl.greenMat.color.setHex(0x00ff88);
                }
            }
        });

        // Rain animation
        if (this.rainParticles && this.rainParticles.visible) {
            const pos = this.rainParticles.geometry.attributes.position.array;
            for (let i = 1; i < pos.length; i += 3) {
                pos[i] -= 160 * delta;
                if (pos[i] < 0) pos[i] = 120;
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Snow animation
        if (this.snowParticles && this.snowParticles.visible) {
            const pos = this.snowParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i] += Math.sin(pos[i + 1] * 0.05) * 5 * delta;
                pos[i + 1] -= 30 * delta;
                if (pos[i + 1] < 0) pos[i + 1] = 120;
            }
            this.snowParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Thunderstorm lightning effect
        if (this.weatherMode === 'thunder') {
            this.lightningTimer += delta;
            if (this.lightningTimer > 4 + Math.random() * 6) {
                this.lightningTimer = 0;
                const dirLight = this.scene.getObjectByName('dirLight');
                if (dirLight) {
                    const origInt = dirLight.intensity;
                    dirLight.intensity = 4.5;
                    setTimeout(() => { dirLight.intensity = origInt; }, 80);
                    setTimeout(() => { dirLight.intensity = 3.5; }, 140);
                    setTimeout(() => { dirLight.intensity = origInt; }, 220);
                }
                if (window.soundEngine) window.soundEngine.playAlert('high');
            }
        }
    }
}

window.CityBuilder = CityBuilder;
