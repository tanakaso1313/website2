/* Rotating 3D preview of a Liminal Objects piece (prototype).
   Each piece is a lattice of cubic cells (about 23 mm apart in the real objects). A shape is given as its
   front view, top row first ('#' = cell, '.' = empty), extruded `depth` cells back. Neighbouring cells
   share bars, so the preview has the same single-bar grid as the real piece.
   The lacquer color follows the product page's color chips: hover previews, a click keeps it. */
import * as THREE from 'three';

export const SHAPES = {
    // Worked out from the product photos and listed dimensions, confirmed by the studio (30 Sep 2026).
    // LO / HORSE has no shape yet, so its page shows no preview.
    'LO / 01': { depth: 3, rows: ['#####', '#####', '#####', '###..', '###..'], color: 'rgb(116, 251, 76)' },
    'LO / 02': { depth: 3, rows: Array(6).fill('#####'), color: 'rgb(234, 51, 35)' },
    'LO / 03': { depth: 5, rows: Array(5).fill('#####'), color: 'rgb(0, 30, 255)' },
    'LO / 04': { depth: 3, rows: Array(10).fill('###'), color: 'rgb(234, 51, 35)' },
    'LO / 05': { depth: 3, rows: [...Array(4).fill('..#####'), ...Array(5).fill('#####..')], color: 'rgb(203, 203, 203)' },
    'LO / 06': { depth: 3, rows: [...Array(6).fill('###...'), ...Array(4).fill('######')], color: 'rgb(110, 86, 58)' },
    'LO / 07': { depth: 2, rows: ['##########', '##########', ...Array(6).fill('##......##'), '##########', '##########'], color: 'rgb(203, 203, 203)' },
    // LO / 23: a 5 x 5 block with a 5 x 6 block on top, tilted about 12 degrees; the top block's lower-right
    // corner sinks about half a cell into the block below, where the two are joined (read from the photos).
    'LO / 23': { parts: [
        { rows: Array(5).fill('#####'), depth: 3 },
        { rows: Array(6).fill('#####'), depth: 3, rotate: -12, pivot: [5, 0], at: [4.7, 4.5] },
    ], color: 'rgb(0, 30, 255)' },
};

const BAR = 0.06;   // bar thickness as a share of one cell; set by eye against the product photos

export function mount(el, shape, opts = {}) {
    const room = opts.room || 1;   // >1 leaves more space around the piece
    // A piece is one block, or several blocks (`parts`), each optionally tilted in the front plane.
    // Bars are collected per block (shared bars merge within a block), then placed in piece space.
    const parts = shape.parts || [{ rows: shape.rows, depth: shape.depth }];
    const bars = [];                       // { mid: Vector3, axis: 0|1|2, rot: radians about the front axis }
    let nCells = 0;
    const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const part of parts) {
        const h = part.rows.length, d = part.depth, rot = THREE.MathUtils.degToRad(part.rotate || 0);
        const pivot = part.pivot || [0, 0], at = part.at || [0, 0];
        const place = (x, y, z) => {        // block coords -> piece coords: turn about the pivot, then move it to `at`
            const dx = x - pivot[0], dy = y - pivot[1], c = Math.cos(rot), sn = Math.sin(rot);
            return new THREE.Vector3(at[0] + dx * c - dy * sn, at[1] + dx * sn + dy * c, z);
        };
        const edges = new Map();
        const add = (a, b) => edges.set(a.join(',') + '|' + b.join(','), [a, b]);
        part.rows.forEach((row, r) => [...row].forEach((ch, x) => {
            if (ch !== '#') return;
            const y = h - 1 - r;
            for (let z = 0; z < d; z++) {
                nCells++;
                for (const [dy, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) add([x, y + dy, z + dz], [x + 1, y + dy, z + dz]);
                for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) add([x + dx, y, z + dz], [x + dx, y + 1, z + dz]);
                for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) add([x + dx, y + dy, z], [x + dx, y + dy, z + 1]);
            }
        }));
        for (const [a, b] of edges.values()) {
            const pa = place(...a), pb = place(...b);
            min.min(pa).min(pb); max.max(pa).max(pb);
            bars.push({ mid: pa.add(pb).multiplyScalar(0.5), axis: a[0] !== b[0] ? 0 : a[1] !== b[1] ? 1 : 2, rot });
        }
    }
    const size = max.clone().sub(min), centre = min.clone().add(max).multiplyScalar(0.5);
    const W = size.x, H = size.y, D = size.z;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdcd9d2, 1.3));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(6, 14, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4;
    const R = Math.max(W, H, D);
    Object.assign(sun.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 60 });
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.12 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const material = new THREE.MeshStandardMaterial({ color: shape.color, roughness: 0.42, metalness: 0 });
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, bars.length);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1);
    bars.forEach((bar, i) => {
        s.set(bar.axis === 0 ? 1 + BAR : BAR, bar.axis === 1 ? 1 + BAR : BAR, bar.axis === 2 ? 1 + BAR : BAR);
        q.setFromAxisAngle(Z, bar.rot);
        m4.compose(bar.mid.sub(centre), q, s); mesh.setMatrixAt(i, m4);
    });
    const piece = new THREE.Group(); piece.add(mesh); scene.add(piece);
    // float the piece clear of the floor so it can turn over completely without touching it
    const radius0 = Math.hypot(W, H, D) / 2; piece.position.y = radius0 + 0.3;

    // frame the piece: distance from its bounding sphere, looking slightly down
    const radius = radius0, target = new THREE.Vector3(0, piece.position.y, 0);
    function resize() {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
        const fit = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.aspect < 1 ? 1.25 / camera.aspect ** 0.5 : 1.05) * room;
        camera.position.set(0, target.y + fit * 0.32, fit); camera.lookAt(target); camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(el); resize();

    // Turns slowly on its own. Dragging turns it freely in any direction (over the top, underneath).
    // On phones a drag that starts sideways turns the piece; one that starts up or down scrolls the page.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spin = reduced ? 0 : 0.0035, Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0), dq = new THREE.Quaternion();
    piece.quaternion.setFromAxisAngle(Y, -0.5);
    let drag = null, resumeAt = 0;
    el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
        // rotate about the screen's axes, so up always means "tip the top away" whatever the current angle
        piece.quaternion.premultiply(dq.setFromAxisAngle(Y, dx * 0.01));
        piece.quaternion.premultiply(dq.setFromAxisAngle(X, dy * 0.01));
    });
    const release = () => { drag = null; resumeAt = performance.now() + 2500; };
    el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release);
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(el);
    renderer.setAnimationLoop((t) => {
        if (!visible) return;
        if (!drag && t > resumeAt) piece.quaternion.premultiply(dq.setFromAxisAngle(Y, spin));
        renderer.render(scene, camera);
    });

    // color follows the chips
    let chosen = shape.color;
    const setColor = (c) => material.color.set(c);
    document.addEventListener('click', (e) => { const c = e.target.closest('.color-chip'); if (c) { chosen = c.style.backgroundColor; setColor(chosen); } });
    document.addEventListener('mouseover', (e) => { const c = e.target.closest('.color-chip'); if (c) setColor(c.style.backgroundColor); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('.color-chip')) setColor(chosen); });
    return { cells: nCells, bars: bars.length, setColor, piece };
}
