'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import './GridScan.css';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uScanOpacity;
uniform float uNoise;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

float smoother01(float a, float b, float x) {
  float t = clamp((x - a) / max(1e-5, b - a), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));
  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;
  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;

  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;

  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;
    vec3 h = ro + rd * t;
    float depthBoost = smoothstep(0.0, 3.0, h.z);
    h.xy += skew * 0.15 * depthBoost;
    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }

  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);
  float fade = exp(-dist * 2.0);

  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;
  float lineX = 1.0 - smoothstep(halfPx * wx, halfPx * wx + wx, ax);
  float lineY = 1.0 - smoothstep(halfPx * wy, halfPx * wy + wy, ay);
  float primaryMask = max(lineX, lineY);

  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);
  float lineX2 = 1.0 - smoothstep(halfPx * wx2, halfPx * wx2 + wx2, ax2);
  float lineY2 = 1.0 - smoothstep(halfPx * wy2, halfPx * wy2 + wy2, ay2);
  float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
  float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
  float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
  float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
  float altMask = max(lineX2, lineY2) * edgeGate;
  float lineMask = max(primaryMask, altMask);

  float dur = max(0.05, uScanDuration);
  float del = max(0.0, uScanDelay);
  float cycle = dur + del;
  float tCycle = mod(iTime, cycle);
  float phase = clamp((tCycle - del) / dur, 0.0, 1.0);
  float scanZ = phase * 2.0;
  float dz = abs(hit.z - scanZ);
  float widthScale = max(0.1, uScanGlow);
  float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
  float taper = clamp(uPhaseTaper, 0.0, 0.49);
  float headFade = smoother01(0.0, taper, phase);
  float tailFade = 1.0 - smoother01(1.0 - taper, 1.0, phase);
  float phaseWindow = headFade * tailFade;
  float combinedPulse = lineBand * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);
  float sigmaA = sigma * 2.0;
  float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
  float combinedAura = (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

  float lineVis = lineMask;
  vec3 gridCol = uLinesColor * lineVis * fade;
  vec3 scanCol = uScanColor * combinedPulse;
  vec3 scanAura = uScanColor * combinedAura;
  color = gridCol + scanCol + scanAura;

  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);

  float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
  fragColor = vec4(color, alpha);
}

void main() {
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

function srgbColor(hex: string) {
  return new THREE.Color(hex).convertSRGBToLinear();
}

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  className?: string;
}

export default function GridScan({
  lineThickness = 1,
  linesColor = '#2F293A',
  scanColor = '#FF9FFC',
  scanOpacity = 0.4,
  gridScale = 0.1,
  enablePost = true,
  bloomIntensity = 0.6,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanPhaseTaper = 0.9,
  scanDuration = 2.0,
  scanDelay = 2.0,
  className = '',
}: GridScanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);
  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));

  // Mouse tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onMove = (e: MouseEvent) => {
      if (timer) { clearTimeout(timer); timer = null; }
      const r = el.getBoundingClientRect();
      lookTarget.current.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onLeave = () => {
      timer = setTimeout(() => lookTarget.current.set(0, 0), 250);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); if (timer) clearTimeout(timer); };
  }, []);

  // Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const uniforms = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio()) },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0 },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) },
      uGridScale: { value: gridScale },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity },
      uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness },
      uPhaseTaper: { value: scanPhaseTaper },
      uScanDuration: { value: scanDuration },
      uScanDelay: { value: scanDelay },
    };

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true, depthWrite: false, depthTest: false });
    materialRef.current = material;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    if (enablePost) {
      const composer = new EffectComposer(renderer);
      composerRef.current = composer;
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new BloomEffect({ intensity: 1.0 });
      bloom.blendMode.opacity.value = Math.max(0, bloomIntensity);
      const chroma = new ChromaticAberrationEffect({ offset: new THREE.Vector2(chromaticAberration, chromaticAberration), radialModulation: true, modulationOffset: 0 });
      const pass = new EffectPass(camera, bloom, chroma);
      pass.renderToScreen = true;
      composer.addPass(pass);
    }

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio());
      if (composerRef.current) composerRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Smooth damp helper
    const smoothDamp = (cur: THREE.Vector2, tgt: THREE.Vector2, vel: THREE.Vector2, dt: number) => {
      const omega = 2 / 0.15;
      const x = omega * dt;
      const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = cur.clone().sub(tgt);
      const tmp = vel.clone().addScaledVector(change, omega).multiplyScalar(dt);
      vel.sub(tmp.clone().multiplyScalar(omega)).multiplyScalar(exp);
      cur.copy(tgt.clone().add(change.add(tmp).multiplyScalar(exp)));
    };

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      smoothDamp(lookCurrent.current, lookTarget.current, lookVel.current, dt);
      material.uniforms.uSkew.value.set(lookCurrent.current.x * 0.15, -lookCurrent.current.y * 0.2);
      material.uniforms.uTilt.value = lookCurrent.current.x * 0.05;
      material.uniforms.iTime.value = now / 1000;

      renderer.clear(true, true, true);
      if (composerRef.current) composerRef.current.render(dt); else renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose();
      if (composerRef.current) { composerRef.current.dispose(); composerRef.current = null; }
      renderer.dispose();
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, [lineThickness, linesColor, scanColor, gridScale, scanOpacity, noiseIntensity, bloomIntensity, scanGlow, scanSoftness, scanPhaseTaper, scanDuration, scanDelay, chromaticAberration, enablePost]);

  return <div ref={containerRef} className={`gridscan ${className}`} />;
}
