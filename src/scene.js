import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { actors } from "./scenarios.js";
export function createOffice(canvas, onInteract, onFailure) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#b9cbd1");
  scene.fog = new THREE.Fog("#b9cbd1", 24, 48);
  const camera = new THREE.PerspectiveCamera(49, 1, 0.08, 80),
    room = new THREE.Group();
  scene.add(room);
  const materials = new Map();
  function mat(c, o = {}) {
    const k = c + JSON.stringify(o);
    if (!materials.has(k))
      materials.set(
        k,
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.76, ...o }),
      );
    return materials.get(k);
  }
  function mesh(geo, m, x, y, z, p = room) {
    const a = new THREE.Mesh(geo, m);
    a.position.set(x, y, z);
    a.castShadow = a.receiveShadow = true;
    p.add(a);
    return a;
  }
  function box(x, y, z, w, h, d, c, p = room, o = {}) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat(c, o), x, y, z, p);
  }
  function cyl(x, y, z, r, rt, h, c, p = room) {
    return mesh(new THREE.CylinderGeometry(r, rt, h, 32), mat(c), x, y, z, p);
  }
  function ball(x, y, z, r, c, p = room, sx = 1, sy = 1, sz = 1) {
    const a = mesh(new THREE.SphereGeometry(r, 20, 14), mat(c), x, y, z, p);
    a.scale.set(sx, sy, sz);
    return a;
  }
  // Batch stationary geometry by material. Keep animated joints and interactive props separate.
  function batch(root, exclude = [], recursive = true) {
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert(),
      groups = new Map(),
      list = [];
    const collect = (o) => {
      if (!o.isMesh || o.userData.action) return;
      let p = o;
      while (p && p !== root) {
        if (exclude.includes(p)) return;
        p = p.parent;
      }
      list.push(o);
    };
    if (recursive) root.traverse(collect);
    else root.children.forEach(collect);
    for (const o of list) {
      const key = o.material.uuid + o.castShadow + o.receiveShadow;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    for (const items of groups.values()) {
      if (items.length < 2) continue;
      const geos = items.map((o) =>
        o.geometry
          .clone()
          .applyMatrix4(
            new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld),
          ),
      );
      const geo = mergeGeometries(geos);
      geos.forEach((g) => g.dispose());
      if (!geo) continue;
      const m = new THREE.Mesh(geo, items[0].material);
      m.castShadow = items[0].castShadow;
      m.receiveShadow = items[0].receiveShadow;
      for (const o of items) {
        o.removeFromParent();
        o.geometry.dispose();
      }
      root.add(m);
    }
  }
  scene.add(new THREE.HemisphereLight("#dbe9f4", "#7d5a37", 2.3));
  const sun = new THREE.DirectionalLight("#ffe3ab", 4);
  sun.position.set(-4, 7, -7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -9,
    right: 9,
    top: 9,
    bottom: -9,
    near: 0.5,
    far: 25,
  });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#e7eeff", 1.3);
  fill.position.set(2, 4, 7);
  scene.add(fill);
  box(0, -0.12, 0, 16, 0.22, 16, "#927457");
  for (let z = -7; z < 8; z += 0.45)
    for (let x = -7; x < 8; x += 2) {
      box(
        x,
        0.001,
        z,
        1.985,
        0.015,
        0.44,
        Math.floor(x + z) % 3 === 0 ? "#987855" : "#a38665",
      );
    }
  // Segmented oval walls and wainscoting.
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2,
      x = Math.sin(a) * 6.8,
      z = Math.cos(a) * 5.5;
    if (z < -4.3 || z > 4.6 || (x < -5.8 && z > -2.8 && z < -0.8)) continue;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = a;
    room.add(g);
    box(0, 2.5, 0, 1.13, 5, 0.22, "#e0d2b8", g);
    box(0, 0.6, 0.14, 1.1, 1.2, 0.12, "#e7dfce", g);
    box(0, 0.15, 0.23, 1.13, 0.17, 0.1, "#f6efdd", g);
    box(0, 1.25, 0.2, 1.13, 0.08, 0.12, "#fff1d6", g);
    box(0, 4.7, 0.2, 1.15, 0.16, 0.2, "#f2e5ce", g);
    for (const dx of [-0.5, 0.5])
      box(dx, 0.63, 0.24, 0.028, 0.86, 0.05, "#cdbb96", g);
  }
  // Actual openings, outdoor lawn and trees give the window view depth.
  box(0, 0.32, -5.55, 10.5, 0.64, 0.24, "#dfd2b9");
  box(0, 4.9, -5.55, 10.5, 0.6, 0.24, "#dfd2b9");
  box(0, 4.7, -5.25, 11, 0.17, 0.45, "#f7e7c9");
  box(0, -0.03, -17, 40, 0.1, 22, "#6c8e63");
  for (let i = 0; i < 22; i++) {
    const x = (i - 11) * 1.3,
      z = -11 - Math.sin(i * 7) * 3;
    box(x, 1, z, 0.18, 2, 0.18, "#70634c");
    ball(x, 2.8, z, 1.8, i % 2 ? "#698769" : "#7e9b72");
  }
  for (const x of [-3.45, -1.73, 0, 1.73, 3.45]) {
    const glass = box(x, 2.65, -5.36, 1.52, 3.5, 0.025, "#d3e9e5", room, {
      transparent: true,
      opacity: 0.1,
      roughness: 0.05,
    });
    glass.castShadow = false;
    for (const dx of [-0.8, 0.8])
      box(x + dx, 2.65, -5.13, 0.105, 3.85, 0.21, "#f5e9d0");
    for (const yy of [0.74, 4.57, 2.5, 3.54, 1.49])
      box(x, yy, -5.11, 1.68, 0.07, 0.19, "#f7edd7");
    box(x, 2.65, -5.05, 0.055, 3.8, 0.08, "#f7edd7");
    box(x, 0.62, -5.05, 1.83, 0.14, 0.5, "#f6e7cb");
  }
  for (const x of [-4.5, 4.5]) {
    for (let j = 0; j < 9; j++) {
      const a = cyl(
        x + (j - 4) * 0.105,
        2.68,
        -4.92,
        0.09,
        0.11,
        3.95,
        j % 2 ? "#bc9250" : "#d1aa66",
      );
      a.scale.z = 0.8;
    }
    box(x, 1.9, -4.75, 1.05, 0.14, 0.11, "#a67a36");
  }
  cyl(0, 4.73, -4.93, 0.045, 0.045, 10.6, "#b7924a").rotation.z = Math.PI / 2;
  const rug = cyl(0, 0.033, 0.25, 3.75, 3.75, 0.035, "#243f54");
  rug.scale.z = 0.77;
  for (const r of [3.57, 3.45, 2]) {
    const o = mesh(
      new THREE.TorusGeometry(r, 0.023, 8, 100),
      mat("#bd9c60"),
      0,
      0.06,
      0.25,
    );
    o.rotation.x = -Math.PI / 2;
    o.scale.y = 0.77;
  }
  function textTexture(
    lines,
    bg = "#173142",
    fg = "#e6ca85",
    w = 1024,
    h = 512,
  ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.fillStyle = fg;
    lines.forEach((s, i) => {
      ctx.font = `${i === 0 ? 32 : i === 1 ? 60 : 26}px Georgia`;
      ctx.fillText(s, w / 2, 90 + i * 110);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const mark = mesh(
    new THREE.CircleGeometry(1.12, 64),
    new THREE.MeshStandardMaterial({
      map: textTexture(["★  ★  ★", "THE PEOPLE", "THE PRESIDENCY"]),
      roughness: 1,
    }),
    0,
    0.062,
    0.25,
  );
  mark.rotation.x = -Math.PI / 2;
  const desk = new THREE.Group();
  room.add(desk);
  desk.position.z = 3.2;
  box(0, 1.16, 0, 3.9, 0.19, 1.72, "#624331", desk);
  box(0, 1.27, 0, 4.03, 0.055, 1.82, "#a27a50", desk);
  box(0, 1.3, -0.08, 2.06, 0.035, 0.97, "#283e3e", desk);
  for (const x of [-1.43, 1.43]) {
    box(x, 0.62, 0, 0.78, 1.07, 1.45, "#624533", desk);
    box(x, 0.12, 0, 0.9, 0.13, 1.6, "#483324", desk);
  }
  box(0, 0.63, -0.68, 2.2, 1.04, 0.12, "#795039", desk);
  for (const x of [-1.42, -0.68, 0, 0.68, 1.42]) {
    box(x, 0.66, -0.771, 0.56, 0.73, 0.04, "#92704c", desk);
    box(x, 0.66, -0.801, 0.44, 0.61, 0.035, "#654731", desk);
  }
  cyl(0, 0.65, -0.85, 0.22, 0.22, 0.06, "#bc9657", desk).rotation.x =
    Math.PI / 2;
  const chair = new THREE.Group();
  room.add(chair);
  chair.position.set(0, 0, 4.53);
  box(0, 0.63, 0, 0.9, 0.2, 0.8, "#342d29", chair);
  box(0, 1.19, 0.25, 0.91, 1.05, 0.15, "#342d29", chair);
  cyl(0, 0.28, 0, 0.07, 0.07, 0.5, "#9f8a60", chair);
  for (const x of [-0.52, 0.52])
    box(x, 0.94, 0, 0.12, 0.08, 0.7, "#765436", chair);
  const folder = box(0.38, 1.34, -0.04, 0.67, 0.035, 0.85, "#d0b27b", desk);
  folder.rotation.y = -0.13;
  folder.userData.action = "document";
  const paper = mesh(
    new THREE.PlaneGeometry(0.53, 0.7),
    new THREE.MeshStandardMaterial({
      map: textTexture(
        ["EXECUTIVE OFFICE", "BRIEFING", "FOR YOUR DECISION"],
        "#eee6d2",
        "#273b48",
        512,
        512,
      ),
    }),
    0.38,
    1.365,
    -0.04,
    desk,
  );
  paper.rotation.set(-Math.PI / 2, 0, -0.13);
  paper.userData.action = "document";
  box(-1.3, 1.36, 0.1, 0.49, 0.13, 0.38, "#252a29", desk);
  const receiver = box(-1.3, 1.47, 0.1, 0.57, 0.09, 0.15, "#1d2626", desk);
  receiver.rotation.y = -0.13;
  receiver.userData.action = "aide";
  for (let k = 0; k < 9; k++)
    box(
      -1.42 + (k % 3) * 0.07,
      1.431,
      0.11 + Math.floor(k / 3) * 0.055,
      0.04,
      0.013,
      0.025,
      "#999d8c",
      desk,
    );
  cyl(1.39, 1.43, 0.05, 0.095, 0.08, 0.28, "#ae8848", desk);
  for (const x of [1.35, 1.4, 1.44])
    box(x, 1.62, 0.05, 0.018, 0.32, 0.018, "#223544", desk).rotation.z =
      x - 1.4;
  box(-0.3, 1.34, -0.48, 0.54, 0.06, 0.12, "#be9b59", desk);
  const screenFrame = box(-3.4, 1.47, 1.25, 1.66, 1.02, 0.12, "#252e30");
  screenFrame.rotation.y = 0.32;
  const screen = mesh(
    new THREE.PlaneGeometry(1.53, 0.87),
    new THREE.MeshBasicMaterial({
      map: textTexture([
        "EXECUTIVE BRIEF",
        "ECONOMY  •  55",
        "AWAITING YOUR FIRST DIRECTIVE",
      ]),
    }),
    -3.375,
    1.47,
    1.33,
  );
  screen.rotation.y = 0.32;
  screen.userData.action = "record";
  box(-3.4, 0.74, 1.25, 0.12, 1.4, 0.12, "#85744e");
  box(-3.4, 0.08, 1.25, 0.75, 0.1, 0.55, "#524d3d");
  const entry = new THREE.Group();
  entry.position.set(-5.82, 0, -1.75);
  entry.rotation.y = Math.PI / 2;
  room.add(entry);
  box(0, 1.65, -0.05, 1.9, 3.3, 0.25, "#594c39", entry);
  for (const x of [-1, 1])
    box(x, 1.75, 0.13, 0.14, 3.5, 0.18, "#f3e3c7", entry);
  box(0, 3.52, 0.13, 2.2, 0.18, 0.18, "#f3e3c7", entry);
  const hinge = new THREE.Group();
  hinge.position.set(-0.92, 0, 0.2);
  entry.add(hinge);
  box(0.9, 1.65, 0, 1.8, 3.28, 0.13, "#e6dcc7", hinge);
  for (const y of [0.75, 2.22]) {
    box(0.9, y, 0.08, 1.45, 1.12, 0.04, "#cfc1a5", hinge);
    box(0.9, y, 0.11, 1.26, 0.94, 0.03, "#eee2cb", hinge);
  }
  ball(1.65, 1.4, 0.18, 0.065, "#b6964c", hinge);
  function flag(x, z, us) {
    cyl(x, 1.75, z, 0.035, 0.035, 3.5, "#ae8c43");
    ball(x, 3.54, z, 0.08, "#c7a85e");
    cyl(x, 0.08, z, 0.23, 0.25, 0.13, "#8b713d");
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 300;
    const ctx = c.getContext("2d");
    ctx.fillStyle = us ? "#ede7d8" : "#213b56";
    ctx.fillRect(0, 0, 400, 300);
    if (us) {
      ctx.fillStyle = "#ab4748";
      for (let i = 0; i < 13; i += 2)
        ctx.fillRect(0, (i * 300) / 13, 400, 300 / 13);
      ctx.fillStyle = "#2c4363";
      ctx.fillRect(0, 0, 170, 164);
      ctx.fillStyle = "#eee9d8";
      for (let j = 0; j < 5; j++)
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(15 + i * 28, 14 + j * 31, 3, 0, 7);
          ctx.fill();
        }
    } else {
      ctx.strokeStyle = "#cdb56c";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(200, 150, 78, 0, 7);
      ctx.stroke();
      ctx.font = "100px Georgia";
      ctx.textAlign = "center";
      ctx.fillStyle = "#d1b86b";
      ctx.fillText("★", 200, 183);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(0.93, 1.56, 16, 10),
      pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++)
      pos.setZ(i, Math.sin(pos.getX(i) * 17) * 0.045);
    geo.computeVertexNormals();
    mesh(
      geo,
      new THREE.MeshStandardMaterial({
        map: tex,
        side: THREE.DoubleSide,
        roughness: 1,
      }),
      x + 0.43,
      2.45,
      z,
    ).rotation.y = -0.12;
  }
  flag(-3.75, -3.35, true);
  flag(3.75, -3.35, false);
  for (const x of [-5, 5]) {
    cyl(x, 0.3, -3.65, 0.28, 0.2, 0.55, "#dad0b6");
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4;
      ball(
        x + Math.sin(a) * 0.25,
        0.85 + i * 0.033,
        -3.65 + Math.cos(a) * 0.2,
        0.3,
        i % 2 ? "#4f7053" : "#668262",
        room,
        0.35,
        1.7,
        0.27,
      ).rotation.z = Math.sin(a) * 0.9;
    }
  }
  const sofa = new THREE.Group();
  sofa.position.set(4.6, 0, 0.25);
  sofa.rotation.y = -Math.PI / 2;
  room.add(sofa);
  box(0, 0.44, 0, 2.6, 0.5, 0.92, "#d1c7ad", sofa);
  box(0, 0.89, -0.39, 2.65, 0.66, 0.22, "#d8cbb0", sofa);
  for (const x of [-1.32, 1.32]) box(x, 0.71, 0, 0.2, 0.7, 1, "#c5b89d", sofa);
  for (const x of [-0.85, 0, 0.85])
    box(x, 0.725, 0.02, 0.81, 0.16, 0.72, "#e5d8bc", sofa);
  cyl(3.15, 0.54, 0.25, 0.5, 0.5, 0.12, "#8c6b45");
  cyl(3.15, 0.28, 0.25, 0.065, 0.09, 0.5, "#6d5035");
  // Persistent crowd responds to unrest outside the window.
  const crowd = new THREE.Group();
  room.add(crowd);
  for (let i = 0; i < 12; i++) {
    const x = -3 + i * 0.5,
      z = -7.3 - Math.sin(i) * 0.4;
    box(x, 0.47, z, 0.18, 0.5, 0.13, i % 2 ? "#43515c" : "#866953", crowd);
    ball(x, 0.82, z, 0.11, "#bd9473", crowd);
    box(x + 0.14, 1.1, z, 0.38, 0.22, 0.03, "#e6dfc8", crowd);
    box(x + 0.14, 0.81, z, 0.022, 0.5, 0.02, "#806a46", crowd);
  }
  crowd.visible = false;
  batch(crowd);
  batch(room, [hinge, crowd]);
  batch(hinge);
  const npcGroup = new THREE.Group();
  room.add(npcGroup);
  let npcs = [],
    selected = null,
    arriveAt = 0,
    mode = "intro",
    view = "desk",
    last = performance.now(),
    elapsed = 0,
    destroyed = false;
  function person(id, index) {
    const a = actors[id],
      g = new THREE.Group();
    npcGroup.add(g);
    const torso = new THREE.Group();
    g.add(torso);
    box(0, 1.19, 0, 0.48, 0.67, 0.25, a.suit, torso);
    cyl(0, 0.91, 0, 0.25, 0.22, 0.14, a.suit, torso).scale.z = 0.58;
    ball(0, 1.44, 0, 0.26, a.suit, torso, 1.05, 0.38, 0.65);
    box(0, 1.35, 0.136, 0.16, 0.37, 0.02, "#e4e5dd", torso);
    for (const s of [-1, 1])
      box(s * 0.12, 1.36, 0.158, 0.1, 0.37, 0.025, a.suit, torso).rotation.z =
        s * -0.23;
    if (id !== "jensen")
      box(
        0,
        1.3,
        0.163,
        0.048,
        0.32,
        0.025,
        id === "sam" ? "#75817b" : "#96704e",
        torso,
      );
    cyl(0, 1.61, 0, 0.075, 0.08, 0.18, a.skin, torso);
    const head = new THREE.Group();
    head.position.y = 1.82;
    torso.add(head);
    ball(0, 0, 0, 0.185, a.skin, head, 0.83, 1.16, 0.86);
    ball(0, 0.105, -0.02, 0.18, a.hair, head, 0.87, 0.58, 0.92);
    box(0, 0.025, -0.13, 0.255, 0.19, 0.1, a.hair, head);
    for (const s of [-1, 1]) {
      ball(s * 0.148, -0.012, 0, 0.037, a.skin, head, 0.65, 1, 0.7);
      ball(s * 0.06, 0.003, 0.144, 0.019, "#f5eddc", head, 1, 0.65, 0.4);
      ball(s * 0.06, 0.003, 0.152, 0.01, "#30322d", head, 1, 1, 0.4);
      box(
        s * 0.06,
        0.044,
        0.146,
        0.051,
        0.013,
        0.014,
        a.hair,
        head,
      ).rotation.z = s * -0.08;
    }
    ball(0, -0.034, 0.157, 0.03, a.skin, head, 0.7, 1, 1.05);
    box(0, -0.1, 0.139, 0.07, 0.011, 0.011, "#926a58", head);
    if (id === "jensen") {
      for (const s of [-1, 1])
        mesh(
          new THREE.TorusGeometry(0.043, 0.006, 6, 16),
          mat("#343734"),
          s * 0.06,
          0.01,
          0.171,
          head,
        ).scale.y = 0.7;
      box(0, 0.01, 0.172, 0.04, 0.008, 0.01, "#343734", head);
    }
    if (id === "energy" || id === "governor")
      ball(0, 0.025, -0.105, 0.185, a.hair, head, 1.04, 1.2, 0.6);
    const arms = [],
      legs = [];
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.285, 1.44, 0);
      torso.add(arm);
      arms.push(arm);
      box(0, -0.27, 0, 0.15, 0.52, 0.17, a.suit, arm).rotation.z = s * 0.04;
      ball(0, -0.56, 0.017, 0.078, a.skin, arm, 0.78, 1.35, 0.7);
      const leg = new THREE.Group();
      leg.position.set(s * 0.13, 0.85, 0);
      g.add(leg);
      legs.push(leg);
      box(0, -0.36, 0, 0.18, 0.74, 0.2, a.suit, leg);
      box(0, -0.79, 0.05, 0.21, 0.11, 0.34, "#302e2a", leg);
    }
    for (const part of [head, torso, ...arms, ...legs]) batch(part, [], false);
    const marker = mesh(
      new THREE.TorusGeometry(0.36, 0.012, 6, 48),
      new THREE.MeshBasicMaterial({
        color: a.color,
        transparent: true,
        opacity: 0.65,
      }),
      0,
      0.035,
      0,
      g,
    );
    marker.rotation.x = -Math.PI / 2;
    g.position.set(-5.4, 0, -1.75);
    g.visible = false;
    g.traverse((o) => {
      if (o.isMesh) o.userData.actor = id;
    });
    return {
      id,
      g,
      head,
      arms,
      legs,
      target: new THREE.Vector3(
        index === 0 ? -0.9 : 0.95,
        0,
        index === 0 ? 0.2 : -0.25,
      ),
      marker,
      torso,
      index,
    };
  }
  const camTarget = new THREE.Vector3(),
    lookTarget = new THREE.Vector3(),
    look = new THREE.Vector3(0, 1.3, 0),
    pointer = new THREE.Vector2(),
    ray = new THREE.Raycaster();
  const positions = {
    intro: [
      [3.1, 2.9, 4.4],
      [-0.2, 1.2, -1.4],
    ],
    desk: [
      [0, 2.03, 5.7],
      [0, 1.4, -1.65],
    ],
    visitors: [
      [0.2, 1.88, 3.2],
      [0, 1.42, -0.6],
    ],
    window: [
      [2.1, 2.3, 2],
      [-2.6, 1.7, -3.5],
    ],
    briefing: [
      [1, 2.35, 4.85],
      [0.2, 1.15, 2.4],
    ],
  };
  camera.position.fromArray(positions.intro[0]);
  let drag = null,
    moved = false,
    yaw = 0;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX };
    moved = false;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (drag && Math.abs(e.clientX - drag.x) > 5) {
      moved = true;
      yaw = THREE.MathUtils.clamp((e.clientX - drag.x) / 350, -0.55, 0.55);
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    drag = null;
    if (moved) return;
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray
      .intersectObjects([room], true)
      .find((h) => h.object.userData.actor || h.object.userData.action);
    if (hit)
      onInteract(hit.object.userData.actor || hit.object.userData.action);
  });
  canvas.addEventListener("pointercancel", () => (drag = null));
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    onFailure(
      "The 3D view paused. You can continue the complete episode in briefing mode.",
    );
  });
  function resize() {
    const r = canvas.getBoundingClientRect(),
      w = Math.max(1, r.width),
      h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.clearViewOffset();
    if (w > 850 && !cinematic)
      camera.setViewOffset(
        w,
        h,
        mode === "intro" ? -w * 0.13 : w * 0.16,
        0,
        w,
        h,
      );
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  let cinematic = false,
    reactionAt = -10000,
    reactionDelta = {};
  Object.defineProperty(canvas, "officeStats", {
    get: () => ({
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      visitors: npcs.length,
      crowdVisible: crowd.visible,
    }),
  });
  observer.observe(canvas);
  resize();
  function frame(now) {
    if (destroyed) return;
    requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.06);
    last = now;
    elapsed += dt;
    const p = positions[mode === "intro" ? "intro" : view];
    camTarget.fromArray(p[0]);
    lookTarget.fromArray(p[1]);
    if (mode !== "intro" && view === "visitors" && camera.aspect < 1) {
      camTarget.x = 0;
      camTarget.z = Math.max(
        camTarget.z,
        1.55 /
          (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect),
      );
    }
    if (mode === "intro" && !reduced) {
      camTarget.x += Math.sin(elapsed * 0.11) * 0.22;
      camTarget.y += Math.sin(elapsed * 0.16) * 0.07;
    }
    lookTarget.x += yaw;
    camera.position.lerp(camTarget, reduced ? 1 : 1 - Math.exp(-dt * 3.1));
    look.lerp(lookTarget, reduced ? 1 : 1 - Math.exp(-dt * 4));
    camera.lookAt(look);
    const t = (now - arriveAt) / 1000;
    hinge.rotation.y = THREE.MathUtils.lerp(
      hinge.rotation.y,
      t < 4.5 && mode !== "intro" && !reduced ? -1.13 : 0,
      reduced ? 1 : Math.min(1, dt * 3),
    );
    for (const n of npcs) {
      const p = reduced
        ? 1
        : THREE.MathUtils.clamp((t - n.index * 0.75) / 3.5, 0, 1);
      n.g.visible = mode !== "intro" && p > 0;
      n.g.position.lerpVectors(new THREE.Vector3(-5.4, 0, -1.75), n.target, p);
      const walk = p < 1;
      n.g.rotation.y = walk ? 1.05 : 0;
      n.legs.forEach(
        (l, i) =>
          (l.rotation.x = walk ? Math.sin(t * 8 + i * Math.PI) * 0.38 : 0),
      );
      n.arms.forEach((a, i) => {
        a.rotation.x = walk
          ? -Math.sin(t * 8 + i * Math.PI) * 0.28
          : !reduced && n.id === selected
            ? Math.sin(elapsed * 2.1 + i) * 0.07 - 0.13
            : 0;
        a.rotation.z = walk ? 0 : i === 0 ? 0.07 : -0.07;
      });
      n.torso.position.y = !reduced
        ? Math.sin(elapsed * 2 + n.index) * 0.008
        : 0;
      n.head.rotation.y = !reduced
        ? n.id === selected
          ? Math.sin(elapsed * 0.5) * 0.07
          : n.index
            ? -0.12
            : 0.12
        : 0;
      n.marker.visible = n.id === selected;
      const reactionTime = (now - reactionAt) / 1000;
      n.head.rotation.x = 0;
      if (!walk && !reduced && reactionTime < 5) {
        const interest = ["sam", "jensen"].includes(n.id)
          ? "economy"
          : n.id === "governor"
            ? "approval"
            : "morality";
        const positive = (reactionDelta[interest] || 0) >= 0;
        if (positive) n.head.rotation.x = Math.sin(reactionTime * 5) * 0.1;
        else n.head.rotation.y = Math.sin(reactionTime * 4.5) * 0.17;
      }
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return {
    enter(ids) {
      mode = "playing";
      view = "desk";
      selected = ids[0];
      arriveAt = performance.now();
      for (const n of npcs) {
        npcGroup.remove(n.g);
        n.g.traverse((o) => {
          if (o.isMesh) {
            o.geometry.dispose();
            if (o.material.isMeshBasicMaterial) o.material.dispose();
          }
        });
      }
      npcs = ids.map(person);
      resize();
    },
    select(id) {
      selected = id;
      view = "visitors";
    },
    react(delta) {
      reactionDelta = delta;
      reactionAt = performance.now();
    },
    cinema(enabled) {
      cinematic = enabled;
      resize();
    },
    view(id) {
      if (positions[id]) view = id;
    },
    intro() {
      mode = "intro";
      resize();
    },
    update(state) {
      const t = textTexture([
        "EXECUTIVE BRIEF",
        `ECONOMY  ${state.stats.economy} / 100`,
        state.stats.unrest >= 40
          ? "PUBLIC OPPOSITION RISING"
          : state.step > 0
            ? "YOUR DIRECTIVES ARE IN MOTION"
            : "AWAITING YOUR FIRST DIRECTIVE",
      ]);
      screen.material.map.dispose();
      screen.material.map = t;
      screen.material.needsUpdate = true;
      crowd.visible = state.stats.unrest >= 40;
      sun.color.set(state.stats.unrest >= 40 ? "#ffc18c" : "#ffe3ab");
      sun.intensity = state.step === 2 ? 3.1 : 4;
    },
    get ready() {
      return renderer.info.render.calls > 0;
    },
    dispose() {
      destroyed = true;
      observer.disconnect();
      renderer.dispose();
    },
  };
}
