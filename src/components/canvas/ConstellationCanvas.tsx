import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { LoreNode, TESUniverseData } from '../../types/lore';
import { createProceduralSkyMesh } from './skyrimSkyShader';

interface ConstellationCanvasProps {
  data: TESUniverseData;
  selectedNode: LoreNode | null;
  onSelectNode: (node: LoreNode | null) => void;
  activeRealm: string | null;
  filterType: string | null;
  searchQuery: string;
}

function createSkyrimStarTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 64;
  const cy = 64;

  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 54);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.2, colorHex);
  grad.addColorStop(0.5, colorHex + '40');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 48, cy);
  ctx.lineTo(cx + 48, cy);
  ctx.moveTo(cx, cy - 48);
  ctx.lineTo(cx, cy + 48);
  ctx.stroke();

  ctx.strokeStyle = colorHex + 'bb';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 20);
  ctx.lineTo(cx + 20, cy + 20);
  ctx.moveTo(cx - 20, cy + 20);
  ctx.lineTo(cx + 20, cy - 20);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSectorHaloSprite(colorHex: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, colorHex + '50');
    grad.addColorStop(0.35, colorHex + '22');
    grad.addColorStop(0.75, colorHex + '08');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(260, 260, 1);
  return sprite;
}

function createSectorHeadingSprite(heading: string, colorHex: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '700 24px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colorHex;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 10;
    ctx.fillText(heading, 256, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(80, 20, 1);
  return sprite;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  data,
  selectedNode,
  onSelectNode,
  activeRealm,
  filterType,
  searchQuery,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<LoreNode | null>(null);

  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 780));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const skyUpdaterRef = useRef<((time: number, camPos: THREE.Vector3) => void) | null>(null);
  const nodeSpritesRef = useRef<Map<string, { sprite: THREE.Sprite; textSprite: THREE.Sprite; node: LoreNode }>>(new Map());
  const edgeLinesRef = useRef<Array<{ line: THREE.Line; sourceId: string; targetId: string; isCrossRealm: boolean; baseColor: THREE.Color }>>([]);
  const sectorHeadingsRef = useRef<Array<{ sprite: THREE.Sprite; realmKey: string }>>([]);
  const activeRingRef = useRef<THREE.Mesh | null>(null);

  const flyToTarget = useCallback((targetPos: THREE.Vector3, distance = 65) => {
    targetLookAtRef.current.copy(targetPos);
    targetCamPosRef.current.set(targetPos.x, targetPos.y, targetPos.z + distance);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      const pos = new THREE.Vector3(...selectedNode.position);
      flyToTarget(pos, 55);
    }
  }, [selectedNode, flyToTarget]);

  useEffect(() => {
    if (!selectedNode && activeRealm && data.metadata.realms[activeRealm]) {
      const realm = data.metadata.realms[activeRealm];
      const pos = new THREE.Vector3(...realm.center);
      flyToTarget(pos, 230);
    } else if (!selectedNode && !activeRealm) {
      flyToTarget(new THREE.Vector3(0, 0, 0), 780);
    }
  }, [activeRealm, selectedNode, data, flyToTarget]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.00025);
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 7000);
    camera.position.set(0, 0, 780);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x020409, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const proceduralSky = createProceduralSkyMesh();
    scene.add(proceduralSky.mesh);
    skyUpdaterRef.current = proceduralSky.update;

    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1500;
      starPositions[i + 2] = (Math.random() - 0.5) * 350;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    const headingsList: Array<{ sprite: THREE.Sprite; realmKey: string }> = [];
    Object.entries(data.metadata.realms).forEach(([key, info]) => {
      const halo = createSectorHaloSprite(info.color);
      halo.position.set(info.center[0], info.center[1], info.center[2] - 30);
      scene.add(halo);

      const headingText = info.heading || info.name.toUpperCase();
      const headingSprite = createSectorHeadingSprite(headingText, info.color);
      headingSprite.position.set(info.center[0], info.center[1] + 110, info.center[2]);
      scene.add(headingSprite);
      headingsList.push({ sprite: headingSprite, realmKey: key });
    });
    sectorHeadingsRef.current = headingsList;

    const nodeMap = new Map<string, LoreNode>();
    data.nodes.forEach(n => nodeMap.set(n.id, n));

    const edgesList: Array<{ line: THREE.Line; sourceId: string; targetId: string; isCrossRealm: boolean; baseColor: THREE.Color }> = [];

    data.edges.forEach(edge => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const points = [
        new THREE.Vector3(...src.position),
        new THREE.Vector3(...tgt.position),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const isCrossRealm = Boolean(edge.is_cross_realm || src.realm !== tgt.realm);
      const baseColor = new THREE.Color(src.color);

      const lineMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: isCrossRealm ? 0.08 : 0.32,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      edgesList.push({ line, sourceId: edge.source, targetId: edge.target, isCrossRealm, baseColor });
    });
    edgeLinesRef.current = edgesList;

    const starTextureCache = new Map<string, THREE.CanvasTexture>();
    const getStarTexture = (color: string) => {
      let tex = starTextureCache.get(color);
      if (!tex) {
        tex = createSkyrimStarTexture(color);
        starTextureCache.set(color, tex);
      }
      return tex;
    };

    const spritesMap = new Map<string, { sprite: THREE.Sprite; textSprite: THREE.Sprite; node: LoreNode }>();

    data.nodes.forEach(node => {
      const tex = getStarTexture(node.color);
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.95,
      });

      const sprite = new THREE.Sprite(spriteMat);
      const size = node.importance >= 12 ? 13 : (node.importance >= 10 ? 10 : 7.5);
      sprite.scale.set(size, size, 1);
      sprite.position.set(...node.position);
      sprite.userData = { node };

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const lctx = labelCanvas.getContext('2d');
      if (lctx) {
        lctx.fillStyle = 'rgba(0,0,0,0)';
        lctx.fillRect(0, 0, 256, 64);
        lctx.font = '600 20px Cinzel, serif';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        lctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        lctx.shadowBlur = 6;
        lctx.fillStyle = '#f8fafc';
        lctx.fillText(node.name, 128, 32);
      }
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const textSpriteMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        opacity: 0.88,
      });
      const textSprite = new THREE.Sprite(textSpriteMat);
      textSprite.scale.set(16, 4.0, 1);
      textSprite.position.set(node.position[0], node.position[1] - (size * 0.45 + 3.0), node.position[2]);

      scene.add(sprite);
      scene.add(textSprite);
      spritesMap.set(node.id, { sprite, textSprite, node });
    });
    nodeSpritesRef.current = spritesMap;

    const ringGeo = new THREE.RingGeometry(5.2, 6.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc89b3c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const activeRing = new THREE.Mesh(ringGeo, ringMat);
    activeRing.visible = false;
    scene.add(activeRing);
    activeRingRef.current = activeRing;

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const spritesToTest = Array.from(spritesMap.values())
        .filter(v => v.sprite.visible)
        .map(v => v.sprite);
      const intersects = raycaster.intersectObjects(spritesToTest);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.node as LoreNode;
        setHoveredNode(hitNode);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'default';
      }

      if (!isDragging) return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const panSpeed = (camera.position.z / 780) * 0.75;
      targetCamPosRef.current.x -= deltaX * panSpeed;
      targetCamPosRef.current.y += deltaY * panSpeed;

      targetCamPosRef.current.x = Math.max(-850, Math.min(850, targetCamPosRef.current.x));
      targetCamPosRef.current.y = Math.max(-850, Math.min(850, targetCamPosRef.current.y));

      targetLookAtRef.current.x = targetCamPosRef.current.x;
      targetLookAtRef.current.y = targetCamPosRef.current.y;
    };

    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'default';
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const spritesToTest = Array.from(spritesMap.values())
        .filter(v => v.sprite.visible)
        .map(v => v.sprite);
      const intersects = raycaster.intersectObjects(spritesToTest);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.node as LoreNode;
        onSelectNode(hitNode);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.55;
      targetCamPosRef.current.z = Math.max(45, Math.min(1300, targetCamPosRef.current.z + zoomFactor));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId = 0;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      if (skyUpdaterRef.current) {
        skyUpdaterRef.current(elapsedTime, camera.position);
      }

      camera.position.lerp(targetCamPosRef.current, 0.08);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
      camera.lookAt(currentLookAtRef.current.x, currentLookAtRef.current.y, 0);

      if (starPoints) {
        starPoints.rotation.y = elapsedTime * 0.005;
      }

      if (activeRingRef.current && activeRingRef.current.visible) {
        activeRingRef.current.rotation.z += 0.02;
      }

      const camDist = camera.position.z;
      const showMinorLabels = camDist < 520 || activeRealm !== null;
      const showSectorHeadings = camDist > 340;

      sectorHeadingsRef.current.forEach(({ sprite }) => {
        sprite.visible = showSectorHeadings;
      });

      spritesMap.forEach(({ textSprite, node, sprite }) => {
        if (!sprite.visible) return;
        const isMajor = node.importance >= 11;
        textSprite.visible = showMinorLabels || isMajor;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      starTextureCache.forEach(tex => tex.dispose());
      renderer.dispose();
    };
  }, [data, onSelectNode, activeRealm]);

  useEffect(() => {
    const activeId = selectedNode?.id || hoveredNode?.id || null;

    if (activeRingRef.current) {
      if (selectedNode) {
        activeRingRef.current.position.set(...selectedNode.position);
        (activeRingRef.current.material as THREE.MeshBasicMaterial).color.setStyle(selectedNode.color);
        activeRingRef.current.visible = true;
      } else {
        activeRingRef.current.visible = false;
      }
    }

    const visibleNodeIds = new Set<string>();
    const spritesMap = nodeSpritesRef.current;
    data.nodes.forEach(node => {
      const entry = spritesMap.get(node.id);
      if (!entry) return;

      let isVisible = true;
      if (activeRealm && node.realm !== activeRealm) {
        isVisible = false;
      }
      if (filterType && node.type !== filterType) {
        isVisible = false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const match =
          node.name.toLowerCase().includes(query) ||
          node.summary.toLowerCase().includes(query) ||
          node.realm_name.toLowerCase().includes(query);
        if (!match) isVisible = false;
      }

      entry.sprite.visible = isVisible;
      entry.textSprite.visible = isVisible;
      if (isVisible) {
        visibleNodeIds.add(node.id);
      }
    });

    const activeNode = selectedNode || hoveredNode;
    edgeLinesRef.current.forEach(({ line, sourceId, targetId, isCrossRealm, baseColor }) => {
      const mat = line.material as THREE.LineBasicMaterial;
      const bothVisible = visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      line.visible = bothVisible;
      if (!bothVisible) return;

      if (activeId && (sourceId === activeId || targetId === activeId)) {
        if (activeNode) {
          mat.color.setStyle(activeNode.color);
        } else {
          mat.color.setHex(0xc89b3c);
        }
        mat.opacity = 1.0;
      } else if (activeId) {
        mat.color.copy(baseColor);
        mat.opacity = isCrossRealm ? 0.03 : 0.12;
      } else {
        mat.color.copy(baseColor);
        mat.opacity = isCrossRealm ? 0.08 : 0.32;
      }
    });
  }, [selectedNode, hoveredNode, activeRealm, filterType, searchQuery, data]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        touchAction: 'none',
      }}
    >
      {hoveredNode && !selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0a0f1d',
            border: '1px solid #1c2742',
            padding: '8px 16px',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: hoveredNode.color,
              boxShadow: `0 0 8px ${hoveredNode.color}`,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '14px',
              color: '#f8fafc',
              letterSpacing: '0.04em',
            }}
          >
            {hoveredNode.name}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: hoveredNode.color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {hoveredNode.type}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            • {hoveredNode.realm_name}
          </span>
        </div>
      )}
    </div>
  );
};
