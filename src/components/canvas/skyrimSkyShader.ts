import * as THREE from 'three';

export const skyrimSkyVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyrimSkyFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uCameraOffset;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.1 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  float domainWarpedFbm(vec2 p, float time) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, time * 0.01)),
      fbm(p + vec2(5.2, 1.3 - time * 0.008))
    );
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2)),
      fbm(p + 3.0 * q + vec2(8.3, 2.8))
    );
    return fbm(p + 3.5 * r);
  }

  void main() {
    vec2 uv = vUv;
    uv.x += uCameraOffset.x * 0.0003;
    uv.y += uCameraOffset.y * 0.00015;

    vec3 skyBase = mix(vec3(0.008, 0.012, 0.024), vec3(0.015, 0.02, 0.04), uv.y);

    float starGrid = 180.0;
    vec2 sId = floor(uv * starGrid);
    float sRand = hash(sId);
    float star = 0.0;
    if (sRand > 0.96) {
      vec2 sFrac = fract(uv * starGrid) - 0.5;
      float sDist = length(sFrac);
      float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + sRand * 6.28);
      star = smoothstep(0.08, 0.01, sDist) * twinkle * (sRand - 0.96) * 25.0;
    }
    vec3 starsColor = vec3(0.85, 0.9, 1.0) * star;

    float xPos = (uv.x - 0.5) * 2.4;
    float yPos = (uv.y - 0.45) * 2.2;

    vec2 coord = vec2(xPos * 2.4, yPos * 2.0);
    float cloud = domainWarpedFbm(coord, uTime);

    float mageDist = length(vec2((xPos + 0.55) * 1.1, yPos - 0.15));
    float mageMask = smoothstep(0.68, 0.05, mageDist);
    vec3 mageCore = vec3(0.18, 0.65, 0.92);
    vec3 mageOuter = vec3(0.04, 0.18, 0.42);
    vec3 mageViolet = vec3(0.38, 0.22, 0.68);
    vec3 mageColor = mix(mageOuter, mageCore, cloud * 1.2) + mageViolet * pow(cloud, 3.0) * 0.4;
    mageColor *= mageMask * 0.85;

    float warriorDist = length(vec2(xPos * 1.05, yPos - 0.22));
    float warriorMask = smoothstep(0.72, 0.08, warriorDist);
    vec3 warriorCore = vec3(0.92, 0.62, 0.16);
    vec3 warriorFlame = vec3(0.78, 0.25, 0.06);
    vec3 warriorDeep = vec3(0.35, 0.04, 0.06);
    vec3 warriorColor = mix(warriorDeep, warriorFlame, cloud * 1.1) + warriorCore * pow(cloud, 2.8) * 0.6;
    warriorColor *= warriorMask * 0.95;

    float thiefDist = length(vec2((xPos - 0.58) * 1.1, yPos - 0.15));
    float thiefMask = smoothstep(0.68, 0.06, thiefDist);
    vec3 thiefCore = vec3(0.16, 0.78, 0.48);
    vec3 thiefOuter = vec3(0.02, 0.28, 0.18);
    vec3 thiefShadow = vec3(0.28, 0.14, 0.52);
    vec3 thiefColor = mix(thiefOuter, thiefCore, cloud * 1.15) + thiefShadow * pow(cloud, 3.0) * 0.4;
    thiefColor *= thiefMask * 0.85;

    vec3 nebulaTotal = mageColor + warriorColor + thiefColor;

    float mHeight1 = 0.16 + 0.06 * sin(uv.x * 12.0) * cos(uv.x * 24.0) + 0.03 * sin(uv.x * 48.0);
    float mHeight2 = 0.12 + 0.04 * cos(uv.x * 16.0 + 1.2) * sin(uv.x * 32.0);
    float mHeight3 = 0.07 + 0.02 * sin(uv.x * 70.0 + 0.5);

    vec3 finalColor = skyBase + starsColor + nebulaTotal;

    if (uv.y < mHeight1) {
      float snowMist = smoothstep(0.08, mHeight1, uv.y) * 0.25;
      vec3 mountain1 = mix(vec3(0.025, 0.035, 0.06), vec3(0.12, 0.16, 0.24), snowMist);
      finalColor = mix(mountain1, finalColor, smoothstep(mHeight1 - 0.003, mHeight1, uv.y));
    }

    if (uv.y < mHeight2) {
      float mist = smoothstep(0.03, mHeight2, uv.y) * 0.18;
      vec3 mountain2 = mix(vec3(0.012, 0.018, 0.032), vec3(0.08, 0.1, 0.16), mist);
      finalColor = mix(mountain2, finalColor, smoothstep(mHeight2 - 0.002, mHeight2, uv.y));
    }

    if (uv.y < mHeight3) {
      vec3 mountain3 = vec3(0.005, 0.008, 0.014);
      finalColor = mix(mountain3, finalColor, smoothstep(mHeight3 - 0.002, mHeight3, uv.y));
    }

    float valleyFog = smoothstep(0.24, 0.08, uv.y) * 0.18;
    finalColor += vec3(0.08, 0.12, 0.2) * valleyFog;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createProceduralSkyMesh(): { mesh: THREE.Mesh; update: (time: number, camPos: THREE.Vector3) => void } {
  const width = 3600;
  const height = 2800;
  const geo = new THREE.PlaneGeometry(width, height, 64, 1);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const curve = -Math.pow(x / 75.0, 2.0);
    pos.setZ(i, curve);
  }
  geo.computeVertexNormals();

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uCameraOffset: { value: new THREE.Vector2(0, 0) },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: skyrimSkyVertexShader,
    fragmentShader: skyrimSkyFragmentShader,
    uniforms,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, -220);

  return {
    mesh,
    update: (time: number, camPos: THREE.Vector3) => {
      uniforms.uTime.value = time;
      uniforms.uCameraOffset.value.set(camPos.x, camPos.y);
      mesh.position.x = camPos.x * 0.35;
      mesh.position.y = camPos.y * 0.35;
    },
  };
}
