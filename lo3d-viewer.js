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
    'LO / 02': { depth: 3, rows: Array(6).fill('#####'), color: 'rgb(255, 72, 36)' },
    'LO / 03': { depth: 5, rows: Array(5).fill('#####'), color: 'rgb(0, 30, 255)' },
    'LO / 04': { depth: 3, rows: Array(10).fill('###'), color: 'rgb(255, 72, 36)' },
    'LO / 05': { depth: 3, rows: [...Array(4).fill('..#####'), ...Array(5).fill('#####..')], color: 'rgb(203, 203, 203)' },
    'LO / 06': { depth: 3, rows: [...Array(6).fill('###...'), ...Array(4).fill('######')], color: 'rgb(110, 86, 58)' },
    'LO / 07': { depth: 2, rows: ['##########', '##########', ...Array(6).fill('##......##'), '##########', '##########'], color: 'rgb(203, 203, 203)' },
    // LO / 23: a 5 x 5 block with a 5 x 6 block on top, tilted about 12 degrees. Both ends of the top block's
    // base line up with the bottom block's sides; its lower-right corner sinks into the block below (Dom).
    'LO / 23': { parts: [
        { rows: Array(5).fill('#####'), depth: 3 },
        // lower-left corner straight above the bottom block's left edge; tilted 12 degrees, its lower-right corner
        // lands on the right edge (5 cos 12 = 4.9) and half a cell into the block below (5.54 - 5 sin 12 = 4.5)
        { rows: Array(6).fill('#####'), depth: 3, rotate: -12, pivot: [0, 0], at: [0, 5.54] },
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
    const baseMin = min.clone(), baseMax = max.clone();   // the first (base) block: where width and depth are measured
    for (const [pi, part] of parts.entries()) {
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
            if (pi === 0) { baseMin.min(pa).min(pb); baseMax.max(pa).max(pb); }
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
    // Color accuracy first: most of the look comes from the material's own color (emissive), so faces show
    // the chip's value; a little light adds just enough shading to read the lattice in 3D.
    // Measured against the swatches with a screenshot test (typical face within a few percent).
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbfbfbf, 0.1));
    const sun = new THREE.DirectionalLight(0xffffff, 0.16);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4;
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.12 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const material = new THREE.MeshLambertMaterial({ color: shape.color, emissive: shape.color, emissiveIntensity: 0.93 });
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
    // Shadow light: aimed at the spot on the floor where the piece's shadow falls, from well above the piece,
    // with an area wide enough for the shadow at any angle (the piece's radius, stretched by the slanted light).
    // A fixed area around the middle of the floor clipped the shadow when the piece turned.
    const sunDir = new THREE.Vector3(6, 14, 9).normalize();
    const shadowAt = new THREE.Vector3(-sunDir.x / sunDir.y * piece.position.y, 0, -sunDir.z / sunDir.y * piece.position.y);
    sun.target.position.copy(shadowAt); scene.add(sun.target);
    sun.position.copy(shadowAt).addScaledVector(sunDir, radius0 * 6);
    const reach = radius0 * 1.9 + 1;
    Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 0.5, far: radius0 * 12 });
    sun.shadow.camera.updateProjectionMatrix();

    // frame the piece: distance from its bounding sphere, looking slightly down
    const radius = radius0, target = new THREE.Vector3(0, piece.position.y, 0);
    function resize() {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
        const fit = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.aspect < 1 ? 1.25 / camera.aspect ** 0.5 : 1.05) * room;
        camera.position.set(0, target.y + fit * 0.32, fit); camera.lookAt(target); camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(el); resize();

    // Turns slowly on its own and gently rocks forward and back, so the top and underside come into view.
    // Mouse: dragging turns it freely in any direction.
    // Finger: normally only sideways movement turns it and up/down scrolls the page. A tap "holds" the piece
    // (thin outline): while held, a finger turns it in any direction and the page doesn't scroll there.
    // A tap outside, or scrolling it off screen, lets go.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spin = reduced ? 0 : 0.0035, Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0), dq = new THREE.Quaternion();
    piece.quaternion.setFromAxisAngle(Y, -0.5);
    const touchNote = el.querySelector('.n-touch'), touchText = touchNote ? touchNote.textContent : '';
    let drag = null, resumeAt = 0, lastRock = 0, held = false;
    const hold = (on) => {
        held = on; el.classList.toggle('held', on);
        el.style.touchAction = on ? 'none' : '';          // while held the finger belongs to the piece, not the page
        if (touchNote) touchNote.textContent = on ? 'Holding · tap outside to let go' : touchText;
    };
    el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
        // rotate about the screen's axes, so up always means "tip the top away" whatever the current angle
        piece.quaternion.premultiply(dq.setFromAxisAngle(Y, dx * 0.01));
        if (e.pointerType !== 'touch' || held) piece.quaternion.premultiply(dq.setFromAxisAngle(X, dy * 0.01));
    });
    el.addEventListener('pointerup', (e) => {
        // a short, still touch is a tap: it takes hold of the piece, or lets go if already held
        if (drag && e.pointerType === 'touch' && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8 && performance.now() - drag.t0 < 350) hold(!held);
    });
    document.addEventListener('pointerdown', (e) => { if (held && !el.contains(e.target)) hold(false); }, true);
    new IntersectionObserver(([en]) => { if (!en.isIntersecting && held) hold(false); }).observe(el);
    const release = () => { drag = null; resumeAt = performance.now() + 2500; };
    el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release);
    let visible = true, onFrame = () => {};
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(el);
    renderer.setAnimationLoop((t) => {
        if (!visible) return;
        if (!drag && t > resumeAt) {
            piece.quaternion.premultiply(dq.setFromAxisAngle(Y, spin));
            const rock = reduced ? 0 : 0.45 * Math.sin(t / 3200);      // radians, about 26 degrees each way
            piece.quaternion.premultiply(dq.setFromAxisAngle(X, rock - lastRock)); lastRock = rock;
        }
        renderer.render(scene, camera); onFrame();
    });

    // color follows the chips
    let chosen = shape.color;
    const setColor = (c) => { material.color.set(c); material.emissive.set(c); };
    document.addEventListener('click', (e) => { const c = e.target.closest('.color-chip'); if (c) { chosen = c.style.backgroundColor; setColor(chosen); } });
    document.addEventListener('mouseover', (e) => { const c = e.target.closest('.color-chip'); if (c) setColor(c.style.backgroundColor); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('.color-chip')) setColor(chosen); });
    // ---- Dimension lines in mm, like a technical drawing, so the piece reads at its real size.
    // The numbers are the product page's listed dimensions (opts.dims), never computed from the model. An object
    // has no fixed height or depth (it can rest on any side), so the three listed numbers are matched to the
    // model's three edges in whichever arrangement fits: two edges along the base block, one over the whole piece,
    // at about 23.3 mm a cell. If no arrangement fits within 8%, nothing is shown and the mismatch is logged.
    const CELL_MM = 23.3, labels = [];
    if (opts.dims) {
        const edges = [baseMax.x - baseMin.x, baseMax.z - baseMin.z, max.y - min.y];   // width, depth, height of the model
        const listed = Object.values(opts.dims);
        const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
        const err = (pm) => Math.max(...pm.map((li, i) => Math.abs(listed[li] / CELL_MM - edges[i]) / edges[i]));
        const best = perms.reduce((a, b) => (err(b) < err(a) ? b : a));
        const mm = best.map((li) => listed[li]);
        if (err(best) > 0.08) {
            console.error('3D preview: listed dimensions do not match the model, so none are shown:',
                listed.join(' / '), 'mm vs model', edges.map((e) => (e * CELL_MM).toFixed(0)).join(' / '), 'mm');
        } else {
            const L = (x, y, z) => new THREE.Vector3(x, y, z).sub(centre);          // piece coords -> centred
            const gap = 0.7, tick = 0.25, pts = [], lines = new THREE.Group();
            const seg = (a, b) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
            const dim = (a, b, tickDir, text) => {
                seg(a, b);
                seg(a.clone().addScaledVector(tickDir, -tick), a.clone().addScaledVector(tickDir, tick));
                seg(b.clone().addScaledVector(tickDir, -tick), b.clone().addScaledVector(tickDir, tick));
                const span = document.createElement('span'); span.className = 'dim'; span.textContent = `${text} mm`;
                el.appendChild(span); labels.push({ span, at: a.clone().add(b).multiplyScalar(0.5) });
            };
            const x0 = baseMin.x, x1 = baseMax.x, z0 = baseMin.z, z1 = baseMax.z, y0 = min.y, y1 = max.y;
            const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(1, 0, 0), front = new THREE.Vector3(0, 0, 1);
            dim(L(x0, y0 - gap, z1), L(x1, y0 - gap, z1), up, mm[0]);            // width: under the front edge
            dim(L(x1 + gap, y0 - gap, z0), L(x1 + gap, y0 - gap, z1), side, mm[1]); // depth: under the right side
            dim(L(max.x + gap, y0, z1), L(max.x + gap, y1, z1), front, mm[2]);   // height: clear of the piece's furthest edge
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
            lines.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })));
            piece.add(lines);
        }
    }
    const v = new THREE.Vector3();
    function placeLabels() {
        if (!labels.length) return;
        const w = el.clientWidth, h = el.clientHeight;
        for (const { span, at } of labels) {
            v.copy(at).applyMatrix4(piece.matrixWorld).project(camera);
            span.style.transform = `translate(-50%, -50%) translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h}px)`;
        }
    }
    onFrame = placeLabels;

    return { cells: nCells, bars: bars.length, setColor, piece, dims: labels.length };
}
