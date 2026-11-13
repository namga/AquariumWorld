import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createAquarium(host) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b8e4e7');
  scene.fog = new THREE.Fog('#b8e4e7', 13, 25);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  camera.position.set(0, 5.1, 10.6);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = .055;
  controls.minDistance = 6.4;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI * .49;
  controls.minPolarAngle = Math.PI * .16;
  controls.enablePan = false;

  scene.add(new THREE.HemisphereLight(0xe7ffff, 0x456a52, 2.0));
  const key = new THREE.DirectionalLight(0xfff4d9, 3.2);
  key.position.set(-4, 9, 6); key.castShadow = true; key.shadow.mapSize.set(1024,1024); scene.add(key);
  const blueFill = new THREE.PointLight(0x75d8ef, 22, 16); blueFill.position.set(3,5,-3); scene.add(blueFill);

  const root = new THREE.Group(); scene.add(root);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xc9f5f5, transparent: true, opacity: .12, roughness: .08, metalness: 0, transmission: .25, thickness: .15, side: THREE.DoubleSide, depthWrite: false });
  const glassEdge = new THREE.MeshStandardMaterial({ color: 0x1c3441, metalness: .65, roughness: .3 });
  const frame = new THREE.Group(); root.add(frame);
  // Dark metal aquarium frame and glass walls
  const tankW=10, tankH=4.8, tankD=4.8, x=tankW/2, y=tankH/2, z=tankD/2;
  const barGeo = new THREE.BoxGeometry(.09,.09,.09);
  function bar(a,b){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v);const m=new THREE.Mesh(new THREE.BoxGeometry(.075,d.length(),.075),glassEdge);m.position.copy(v.add(w).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;frame.add(m)}
  for(const xx of [-x,x]) for(const zz of [-z,z]) bar([xx,0,zz],[xx,tankH,zz]);
  for(const yy of [0,tankH]){bar([-x,yy,-z],[x,yy,-z]);bar([-x,yy,z],[x,yy,z]);bar([-x,yy,-z],[-x,yy,z]);bar([x,yy,-z],[x,yy,z]);}
  const waterGeo=new THREE.BoxGeometry(9.78,4.55,4.58);
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x76dce5,transparent:true,opacity:.13,roughness:.1,metalness:0,side:THREE.DoubleSide,depthWrite:false});
  const water=new THREE.Mesh(waterGeo,waterMat);water.position.y=2.38;root.add(water);
  const sandMat=new THREE.MeshStandardMaterial({color:0xc5b28a,roughness:.95});
  const sand=new THREE.Mesh(new THREE.BoxGeometry(9.8,.28,4.6),sandMat);sand.position.y=.12;sand.receiveShadow=true;root.add(sand);
  const substrate=new THREE.Mesh(new THREE.BoxGeometry(9.65,.12,4.45),new THREE.MeshStandardMaterial({color:0x526c50,roughness:1}));substrate.position.y=.31;root.add(substrate);

  // Natural rocks and driftwood
  const rockMats=[0x777e70,0x8c8977,0x5c716b,0xa49b83].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.96}));
  function rock(px,py,pz,s,idx=0){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),rockMats[idx%rockMats.length]);m.position.set(px,py,pz);m.scale.set(1,.65+Math.random()*.3,.85);m.rotation.set(Math.random(),Math.random()*3,Math.random());m.castShadow=true;m.receiveShadow=true;root.add(m)}
  [[-3.8,.55,-1.3,.9,0],[-3.1,.48,-1.8,.55,1],[3.9,.5,-1.3,.85,2],[3.2,.48,-1.7,.5,0],[-2.7,.43,1.55,.45,3],[2.7,.43,1.6,.5,1]].forEach(a=>rock(...a));
  const woodMat=new THREE.MeshStandardMaterial({color:0x76533b,roughness:.9});
  function branch(a,b,r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,d.length(),8),woodMat);mesh.position.copy(va.add(vb).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;root.add(mesh)}
  branch([-1.9,.45,-.6],[-.5,2.0,-.3],.18);branch([-.9,1.2,-.4],[-1.8,2.25,-.5],.10);branch([-.7,1.7,-.4],[.25,2.65,-.55],.09);branch([-.4,1.9,-.35],[.4,2.2,-.3],.08);

  // Fine-leaf aquatic plants
  const greens=[0x258b55,0x4aab68,0x78bb68,0x167c61,0x9acb75].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.7,side:THREE.DoubleSide}));
  const plantGroups=[];
  function plant(px,pz,count,height){const g=new THREE.Group();g.position.set(px,.36,pz);root.add(g);for(let i=0;i<count;i++){const h=height*(.55+Math.random()*.65),angle=i/count*Math.PI*2+Math.random()*.4;const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(Math.cos(angle)*.35,h*.65,Math.sin(angle)*.35),new THREE.Vector3(Math.cos(angle)*(.45+Math.random()*.3),h,Math.sin(angle)*(.45+Math.random()*.3)));const pts=curve.getPoints(10);const geo=new THREE.BufferGeometry().setFromPoints(pts);const stem=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x398e5b}));g.add(stem);const leaf=new THREE.Mesh(new THREE.SphereGeometry(.105,7,6),greens[Math.floor(Math.random()*greens.length)]);leaf.scale.set(.65,Math.max(1,h*2.2),.28);leaf.position.copy(pts[6]);leaf.rotation.z=-.3;g.add(leaf);}plantGroups.push(g)}
  plant(-4,-1.4,19,2.25);plant(-3.5,1.2,13,1.65);plant(4,-1.2,17,2.2);plant(3.5,1.3,12,1.7);plant(-1.8,-1.9,12,1.1);plant(2,-1.9,10,1.2);
  // Carpet plants
  const carpetMat=new THREE.MeshStandardMaterial({color:0x3d9a61,roughness:.85});
  for(let i=0;i<170;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.055+Math.random()*.045,5,4),carpetMat);m.position.set((Math.random()-.5)*9.3,.38+Math.random()*.025,(Math.random()-.5)*4.2);m.scale.y=.35;root.add(m)}

  // Fish models assembled from procedural geometry; no external models/textures.
  const fishMats=[0xf29b51,0xf1c95e,0x4ec7c6,0xe88a9c,0x7aa8e8,0xe8e3c9,0xef7d43];
  const fishMeshes=[];
  function makeFish(color,index){const group=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color,roughness:.32,metalness:.08});const body=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),mat);body.scale.set(1.35,.72,.66);body.castShadow=true;group.add(body);
    const tailShape=new THREE.Shape();tailShape.moveTo(0,0);tailShape.lineTo(-.56,.36);tailShape.lineTo(-.48,0);tailShape.lineTo(-.56,-.36);tailShape.closePath();const tail=new THREE.Mesh(new THREE.ShapeGeometry(tailShape),mat);tail.position.x=-.39;tail.position.z=0;group.add(tail);group.userData.tail=tail;
    const fin=new THREE.Mesh(new THREE.ConeGeometry(.13,.38,5),mat);fin.position.set(-.05,.28,0);fin.rotation.z=Math.PI;group.add(fin);
    const eyeMat=new THREE.MeshBasicMaterial({color:0xffffff});const pupilMat=new THREE.MeshBasicMaterial({color:0x152b35});for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),eyeMat);eye.position.set(.27,.08,side*.205);group.add(eye);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.027,7,7),pupilMat);pupil.position.set(.3,.08,side*.245);group.add(pupil)}
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(.055,.42,.48),new THREE.MeshStandardMaterial({color:index%2?0xffffff:0xf8d58a,roughness:.5}));stripe.position.set(-.08,0,0);group.add(stripe);
    group.userData.phase=Math.random()*Math.PI*2;group.userData.speed=.45+Math.random()*.45;group.userData.radius=.8+Math.random()*2.5;group.userData.baseY=1.45+Math.random()*1.7;group.userData.offset=Math.random()*Math.PI*2;return group;}
  function setFishCount(n){while(fishMeshes.length<n){const i=fishMeshes.length;const f=makeFish(fishMats[i%fishMats.length],i);fishMeshes.push(f);root.add(f)}while(fishMeshes.length>n){root.remove(fishMeshes.pop())}}
  setFishCount(3);

  // Floating bubbles
  const bubbleMat=new THREE.MeshPhysicalMaterial({color:0xe8ffff,transparent:true,opacity:.42,roughness:.08,metalness:0});
  const bubbles=[];for(let i=0;i<32;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.045,8,7),bubbleMat);b.position.set((Math.random()-.5)*8,.5+Math.random()*4,(Math.random()-.5)*3.5);b.userData.speed=.35+Math.random()*.6;b.userData.phase=Math.random()*7;bubbles.push(b);root.add(b)}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x9b927e,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.42;scene.add(floor);

  const clock=new THREE.Clock();let raf=0;
  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function animate(){raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();
    fishMeshes.forEach((f,i)=>{const u=f.userData;const a=t*u.speed+u.offset;f.position.set(Math.sin(a)*u.radius, u.baseY+Math.sin(a*1.7)*.24, Math.cos(a*.72)*1.35);const dx=Math.cos(a)*u.radius*u.speed,dz=-Math.sin(a*.72)*.97;f.rotation.y=Math.atan2(dx,dz);f.rotation.z=Math.sin(t*4+u.phase)*.045;u.tail.rotation.y=Math.sin(t*12+u.phase)*.5;});
    bubbles.forEach(b=>{b.position.y+=b.userData.speed*.012;if(b.position.y>4.5){b.position.y=.45;b.position.x=(Math.random()-.5)*8}b.position.x+=Math.sin(t*1.3+b.userData.phase)*.0015});
    plantGroups.forEach((g,i)=>{g.rotation.z=Math.sin(t*.8+i)*.018});controls.update();renderer.render(scene,camera)}
  animate();
  return {setFishCount,resetView(){camera.position.set(0,5.1,10.6);controls.target.set(0,2.1,0);controls.update()},zoom(delta){camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()),delta);controls.update()},destroy(){cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();host.removeChild(renderer.domElement)}};
}
