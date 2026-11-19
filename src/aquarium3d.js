import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createAquarium(host) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#8fcbd2');
  scene.fog = new THREE.Fog('#8fcbd2', 16, 30);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  camera.position.set(0, 5.1, 10.6);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.physicallyCorrectLights = true;
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

  scene.add(new THREE.HemisphereLight(0xe7fbff, 0x304b3c, 1.65));
  const key = new THREE.DirectionalLight(0xfff5df, 3.8);
  key.position.set(-3, 10, 4); key.castShadow = true; key.shadow.mapSize.set(2048,2048); key.shadow.camera.left=-8; key.shadow.camera.right=8; key.shadow.camera.top=8; key.shadow.camera.bottom=-8; scene.add(key);
  const blueFill = new THREE.PointLight(0x55cce5, 15, 18); blueFill.position.set(3,5,-3); scene.add(blueFill);
  const rimLight = new THREE.DirectionalLight(0x9fe8d5, 1.1); rimLight.position.set(4,4,-7); scene.add(rimLight);

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
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x8bdde5,transparent:true,opacity:.075,roughness:.045,metalness:0,ior:1.333,thickness:.7,side:THREE.DoubleSide,depthWrite:false});
  const water=new THREE.Mesh(waterGeo,waterMat);water.position.y=2.38;root.add(water);
  const sandMat=new THREE.MeshStandardMaterial({color:0xc5b28a,roughness:.95});
  const sand=new THREE.Mesh(new THREE.BoxGeometry(9.8,.28,4.6),sandMat);sand.position.y=.12;sand.receiveShadow=true;root.add(sand);
  const substrate=new THREE.Mesh(new THREE.BoxGeometry(9.65,.12,4.45),new THREE.MeshStandardMaterial({color:0x526c50,roughness:1}));substrate.position.y=.31;root.add(substrate);

  // Natural aquascape: irregular stones, textured wood and botanical leaf meshes.
  const rockMats=[0x59665d,0x77796d,0x465b58,0x928b78].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.94}));
  const rockGeo=new THREE.IcosahedronGeometry(1,3);
  function rock(px,py,pz,size,idx=0){
    const geo=rockGeo.clone(); const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i);const n=1+Math.sin(v.x*9+v.y*5)*.045+Math.cos(v.z*11-v.y*4)*.035;pos.setXYZ(i,v.x*n,v.y*n,v.z*n)}
    geo.computeVertexNormals();const m=new THREE.Mesh(geo,rockMats[idx%rockMats.length]);m.position.set(px,py,pz);m.scale.set(size*(.9+Math.random()*.25),size*(.55+Math.random()*.22),size*(.72+Math.random()*.2));m.rotation.set(Math.random()*.5,Math.random()*3,Math.random()*.35);m.castShadow=true;m.receiveShadow=true;root.add(m);
    const fleckMat=new THREE.MeshStandardMaterial({color:0xb3ad91,roughness:1});
    for(let k=0;k<5;k++){const f=new THREE.Mesh(new THREE.SphereGeometry(size*.025,6,5),fleckMat);f.position.set(px+(Math.random()-.5)*size,py+Math.random()*size*.25,pz+(Math.random()-.5)*size);root.add(f)}
  }
  [[-3.8,.55,-1.3,.9,0],[-3.1,.48,-1.8,.55,1],[3.9,.5,-1.3,.85,2],[3.2,.48,-1.7,.5,0],[-2.7,.43,1.55,.45,3],[2.7,.43,1.6,.5,1]].forEach(a=>rock(...a));
  const woodMat=new THREE.MeshStandardMaterial({color:0x65452f,roughness:.82});
  function branch(a,b,r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.55,r,d.length(),12,4),woodMat);mesh.position.copy(va.add(vb).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
  branch([-1.9,.45,-.6],[-.5,2.0,-.3],.19);branch([-.9,1.2,-.4],[-1.8,2.25,-.5],.105);branch([-.7,1.7,-.4],[.25,2.65,-.55],.095);branch([-.4,1.9,-.35],[.4,2.2,-.3],.08);branch([-1.35,1.55,-.48],[-2.35,1.92,-.35],.065);

  const greens=[0x236d45,0x398b54,0x62a96a,0x176b58,0x86b86a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.72,side:THREE.DoubleSide}));
  const plantGroups=[];
  function makeLeaf(length,width,material){
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(width*.8,length*.28,width*.48,length*.72);shape.quadraticCurveTo(width*.2,length,0,length*1.04);shape.quadraticCurveTo(-width*.2,length,-width*.48,length*.72);shape.quadraticCurveTo(-width*.8,length*.28,0,0);
    const geo=new THREE.ShapeGeometry(shape,8);const leaf=new THREE.Mesh(geo,material);leaf.rotation.x=-Math.PI/2;leaf.castShadow=true;return leaf;
  }
  function plant(px,pz,count,height){
    const g=new THREE.Group();g.position.set(px,.36,pz);root.add(g);
    for(let i=0;i<count;i++){
      const angle=i/count*Math.PI*2+Math.random()*.45,h=height*(.55+Math.random()*.65),lean=.22+Math.random()*.42;
      const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(Math.cos(angle)*lean*.45,h*.58,Math.sin(angle)*lean*.45),new THREE.Vector3(Math.cos(angle)*lean,h,Math.sin(angle)*lean));
      const pts=curve.getPoints(12);const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.012,5,false),new THREE.MeshStandardMaterial({color:0x39764a,roughness:.85}));g.add(stem);
      const leaf=makeLeaf(h*.48,.12+Math.random()*.07,greens[Math.floor(Math.random()*greens.length)]);leaf.position.copy(pts[5]);leaf.rotation.z=-angle;leaf.rotation.y=angle;leaf.scale.setScalar(.7+Math.random()*.5);g.add(leaf);
      const leaf2=makeLeaf(h*.42,.1,greens[Math.floor(Math.random()*greens.length)]);leaf2.position.copy(pts[8]);leaf2.rotation.y=angle+Math.PI*.7;leaf2.rotation.z=.18;g.add(leaf2);
    }
    plantGroups.push(g);
  }
  plant(-4,-1.4,22,2.25);plant(-3.5,1.2,17,1.65);plant(4,-1.2,21,2.2);plant(3.5,1.3,16,1.7);plant(-1.8,-1.9,13,1.1);plant(2,-1.9,12,1.2);
  // Dense foreground carpet made from tiny, flattened leaf blades rather than round pebbles.
  const carpetMat=new THREE.MeshStandardMaterial({color:0x3c8050,roughness:.9,side:THREE.DoubleSide});
  const carpetGeo=new THREE.PlaneGeometry(.075,.16);carpetGeo.rotateX(-Math.PI/2);
  const carpet=new THREE.InstancedMesh(carpetGeo,carpetMat,320);const dummy=new THREE.Object3D();
  for(let i=0;i<320;i++){dummy.position.set((Math.random()-.5)*9.2,.39,(Math.random()-.5)*4.1);dummy.rotation.set(0,Math.random()*Math.PI,0);dummy.scale.set(.55+Math.random()*.8,.5+Math.random(),.7+Math.random()*.8);dummy.updateMatrix();carpet.setMatrixAt(i,dummy.matrix)}
  carpet.instanceMatrix.needsUpdate=true;carpet.receiveShadow=true;root.add(carpet);

  // Colorful fish artwork sourced from the user's supplied YUMY project.
  // Transparent PNG sprites replace the former low-poly procedural fish.
  // Keep the scene/studio state declared independently from the fish renderer.
  const fishMeshes=[];
  const invertMeshes=[];
  const extraPlantGroups=[];
  const decorGroups=[];
  const studioObjects=new Map();
  let selectedStudioKey=null, studioEnabled=false, dragState=null;
  let growthDays=0;
  const fishTextureLoader=new THREE.TextureLoader();
  const fishTextureCache=new Map();
  const fishAspect={ 'minnow.png':2.21,'blue-tang.png':1.84,'yellow-tang.png':1.68,'player_0.png':1.50,'player_5.png':1.50,'clownfish.png':1.59,'lionfish.png':1.08,'grouper.png':2.05,'shark.png':1.65,'moray.png':1.44,'manta.png':1.59 };
  const fishArtwork={
    guppy:'minnow.png', neon:'blue-tang.png', gold:'yellow-tang.png',
    angelfish:'player_0.png', clown:'clownfish.png', discus:'player_5.png',
    betta:'lionfish.png', tang:'blue-tang.png', lionfish:'lionfish.png',
    grouper:'grouper.png', shark:'shark.png', moray:'moray.png', manta:'manta.png'
  };
  function fishTexture(file){
    if(!fishTextureCache.has(file)){
      const base=(import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './';
      const tex=fishTextureLoader.load(`${base}assets/fish/${file}`);
      tex.colorSpace=THREE.SRGBColorSpace;
      tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      fishTextureCache.set(file,tex);
    }
    return fishTextureCache.get(file);
  }
  function makeFish(color,index){
    const group=new THREE.Group();
    group.userData.phase=Math.random()*Math.PI*2;
    group.userData.speed=.32+Math.random()*.35;
    group.userData.radius=.8+Math.random()*2.5;
    group.userData.baseY=1.35+Math.random()*1.75;
    group.userData.offset=Math.random()*Math.PI*2;
    group.userData.sprite=null;
    group.userData.species='guppy';
    return group;
  }
  function applyFishArtwork(group,species,index){
    const file=fishArtwork[species]||'minnow.png';
    group.userData.species=species;
    while(group.children.length){
      const old=group.children[0];
      group.remove(old);
      if(old.material){old.material.map?.dispose();old.material.dispose();}
    }
    const texture=fishTexture(file);
    const spriteMap=texture.clone();
    spriteMap.wrapS=THREE.RepeatWrapping;
    const material=new THREE.SpriteMaterial({
      map:spriteMap,transparent:true,alphaTest:.035,depthWrite:false,side:THREE.DoubleSide,
      color:0xffffff,toneMapped:false
    });
    const sprite=new THREE.Sprite(material);
    const dimensions=texture.image;
    const aspect=dimensions?.width&&dimensions?.height?dimensions.width/dimensions.height:(fishAspect[file]||1.6);
    const width=species==='betta'?1.45:species==='clown'?1.45:1.65;
    sprite.scale.set(width,width/aspect,1);
    sprite.position.set(0,0,0);
    group.add(sprite);
    group.userData.sprite=sprite;
    group.userData.textureFile=file;
  }
  function setFishCount(n){
    while(fishMeshes.length<n){
      const i=fishMeshes.length;
      const f=makeFish(0xffffff,i);
      fishMeshes.push(f);root.add(f);
    }
    while(fishMeshes.length>n){root.remove(fishMeshes.pop())}
  }
  setFishCount(3);

  function makeInvert(kind,index){
    const group=new THREE.Group();
    const shellMat=new THREE.MeshStandardMaterial({color:kind==='crab'?0xe66b42:kind==='snail'?0xc88a43:0xe7d8c4,roughness:.48});
    const darkMat=new THREE.MeshStandardMaterial({color:0x5b4634,roughness:.7});
    if(kind==='shrimp'){
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.48,5,10),new THREE.MeshStandardMaterial({color:index%2?0xe98b72:0xe9d9c9,roughness:.42}));
      body.rotation.z=Math.PI/2;group.add(body);
      for(let i=0;i<5;i++){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.018,.012,.22,5),shellMat);leg.position.set(-.18+i*.09,-.16,.05);leg.rotation.z=.45;group.add(leg)}
      for(let i=0;i<2;i++){const feeler=new THREE.Mesh(new THREE.CylinderGeometry(.009,.006,.3,5),darkMat);feeler.position.set(.25,.12,(i-.5)*.08);feeler.rotation.z=-.55;group.add(feeler)}
    }else if(kind==='snail'){
      const foot=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshStandardMaterial({color:0xd4c39b}));foot.scale.set(1.4,.42,.72);group.add(foot);
      const shell=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),shellMat);shell.position.set(-.02,.19,0);shell.scale.set(1,.9,.95);group.add(shell);
      const spiral=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,6,20),darkMat);spiral.position.set(.04,.2,.22);group.add(spiral);
      for(let i=0;i<2;i++){const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.18,6),shellMat);stalk.position.set(.22,.18,(i-.5)*.14);stalk.rotation.z=-.5;group.add(stalk)}
    }else{
      const body=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),shellMat);body.scale.set(1.2,.55,1);group.add(body);
      for(const side of [-1,1])for(let i=0;i<3;i++){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.025,.018,.28,6),shellMat);leg.position.set(side*.25,-.08,(i-1)*.15);leg.rotation.z=side*.7;group.add(leg)}
      for(const side of [-1,1]){const claw=new THREE.Mesh(new THREE.SphereGeometry(.095,8,7),shellMat);claw.position.set(side*.38,.03,.24);group.add(claw)}
      const eye=new THREE.Mesh(new THREE.SphereGeometry(.035,7,6),darkMat);eye.position.set(.12,.16,.15);group.add(eye);
    }
    group.userData.phase=Math.random()*6;group.userData.kind=kind;group.position.set((Math.random()-.5)*7,.48,(Math.random()-.5)*3);
    return group;
  }
  function setSpecies(ids, ages=[], layout={}){
    const list=Array.isArray(ids)?ids:[];
    for(const key of [...studioObjects.keys()])if(key.startsWith('fish:')||key.startsWith('invert:'))studioObjects.delete(key);
    const fishEntries=list.map((id,index)=>({id,index})).filter(x=>!['shrimp','snail','crab'].includes(x.id));
    const fishIds=fishEntries.map(x=>x.id);
    setFishCount(Math.max(0,fishIds.length));
    fishMeshes.forEach((f,i)=>{studioObjects.set(`fish:${fishIds[i]}:${fishEntries[i].index}`,f)});
    fishMeshes.forEach((f,i)=>{
      f.userData.ageDays=Number(ages[fishEntries[i].index]??growthDays)||0;
      f.userData.studioKey=`fish:${fishIds[i]}:${fishEntries[i].index}`;
      const species=fishIds[i];
      applyFishArtwork(f,species,i);
      const saved=layout[f.userData.studioKey];
      if(saved){f.position.set(saved.x,saved.y,saved.z);f.rotation.y=saved.ry||0;f.scale.setScalar(saved.scale||1);}
      const t=clock.getElapsedTime(),u=f.userData;
      const baseline=new THREE.Vector3(Math.sin(t*u.speed+u.offset)*u.radius,u.baseY+Math.sin((t*u.speed+u.offset)*1.7)*.24,Math.cos((t*u.speed+u.offset)*.72)*1.35);
      u.studioOffset=saved?f.position.clone().sub(baseline):new THREE.Vector3();
    });
    while(invertMeshes.length){const old=invertMeshes.pop();root.remove(old)}
    ['shrimp','snail','crab'].forEach(kind=>{
      const indices=list.map((id,i)=>id===kind?i:-1).filter(i=>i>=0);
      indices.forEach((originalIndex,i)=>{
        const item=makeInvert(kind,i);item.userData.ageDays=Number(ages[originalIndex]??growthDays)||0;item.userData.studioKey=`invert:${kind}:${originalIndex}`;
        const saved=layout[item.userData.studioKey];if(saved){item.position.set(saved.x,saved.y,saved.z);item.rotation.y=saved.ry||0;item.scale.setScalar(saved.scale||1)}
        invertMeshes.push(item);root.add(item);studioObjects.set(item.userData.studioKey,item);
      });
    });
    applyGrowth();
  }
  function applyGrowth(){
    fishMeshes.forEach((f,i)=>{
      const age=Number(f.userData.ageDays??growthDays)||0;
      const factor=1+Math.min(age,45)*.006;
      f.scale.setScalar(factor);
      f.traverse(o=>{
        if(o.isMesh&&o.material&&o.material.color){
          if(!o.material.userData.baseColor)o.material.userData.baseColor=o.material.color.clone();
          const ageTint=Math.min(.24,age*.004);
          o.material.color.copy(o.material.userData.baseColor).lerp(new THREE.Color(0x70c7a1),ageTint);
        }
      });
    });
    invertMeshes.forEach(o=>{const age=Number(o.userData.ageDays??growthDays)||0;o.scale.setScalar(1+Math.min(age,45)*.004)});
    [...plantGroups,...extraPlantGroups].forEach(g=>{
      g.scale.set(1,1+Math.min(growthDays,60)*.006,1);
      g.traverse(o=>{
        if(o.isMesh&&o.material&&o.material.color){
          if(!o.material.userData.baseColor)o.material.userData.baseColor=o.material.color.clone();
          o.material.color.copy(o.material.userData.baseColor).lerp(new THREE.Color(0x72b66b),Math.min(.22,growthDays*.003));
        }
      });
    });
  }
  function setGrowth(days){growthDays=Math.max(0,Number(days)||0);applyGrowth()}
  function setEnvironment(plantIds=[],decorIds=[],layout={}){
    extraPlantGroups.forEach(g=>root.remove(g));extraPlantGroups.length=0;
    decorGroups.forEach(g=>root.remove(g));decorGroups.length=0;
    for(const key of [...studioObjects.keys()])if(key.startsWith('plant:')||key.startsWith('decor:'))studioObjects.delete(key);
    const plantTypes={javafern:[15,1.5],vallisneria:[22,2.4],anubias:[12,1.1],redplant:[18,1.8],moss:[25,.65],hornwort:[24,2.1]};
    plantIds.forEach((id,index)=>{
      const spec=plantTypes[id];if(!spec)return;
      const g=new THREE.Group();g.position.set(-3.4+(index%4)*2.2,.36,(index%2?1.35:-1.55));root.add(g);
      for(let j=0;j<spec[0];j++){
        const h=spec[1]*(.55+Math.random()*.6),a=j/spec[0]*Math.PI*2;
        const pts=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(Math.cos(a)*.22,h*.6,Math.sin(a)*.22),new THREE.Vector3(Math.cos(a)*.4,h,Math.sin(a)*.4)).getPoints(9);
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:id==='redplant'?0xb75e69:id==='moss'?0x79b86a:0x398f5d})));
        const leafMat=new THREE.MeshStandardMaterial({color:id==='redplant'?0x9f4e55:id==='moss'?0x79b86a:id==='javafern'?0x4b9e5e:0x32945c,roughness:.68,side:THREE.DoubleSide});
        const leaf=makeLeaf(id==='anubias'?.34:.48,id==='anubias'?.2:.11,leafMat);leaf.position.copy(pts[5]);leaf.rotation.y=a;leaf.rotation.z=(j%2?-.22:.22);g.add(leaf);
      }
      const key=`plant:${id}:${index}`;
      g.userData.studioKey=key;extraPlantGroups.push(g);studioObjects.set(key,g);
      const saved=layout[key];if(saved){g.position.set(saved.x,saved.y,saved.z);g.rotation.y=saved.ry||0;g.scale.setScalar(saved.scale||1)}
    });
    decorIds.forEach((id,index)=>{
      const g=new THREE.Group();g.position.set(-2.8+(index%4)*1.8,.4,(index%2?1.5:-1.5));root.add(g);
      if(id==='coral'||id==='redcoral'){
        const mat=new THREE.MeshStandardMaterial({color:id==='redcoral'?0xc75d54:0xe5a2a0,roughness:.65});
        for(let j=0;j<7;j++){const h=.35+Math.random()*.55;const limb=new THREE.Mesh(new THREE.CylinderGeometry(.035,.09,h,7),mat);limb.position.set((Math.random()-.5)*.35,h/2,Math.random()*.2);limb.rotation.z=(Math.random()-.5)*.8;g.add(limb);const tip=new THREE.Mesh(new THREE.SphereGeometry(.07,7,6),mat);tip.position.copy(limb.position);tip.position.y+=h/2;g.add(tip)}
      }else if(id==='cave'){
        const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.65,1),rockMats[2]);rock.scale.set(1,.7,.85);g.add(rock);
        const hole=new THREE.Mesh(new THREE.CircleGeometry(.24,20),new THREE.MeshBasicMaterial({color:0x182a2b}));hole.position.set(0,.1,.5);g.add(hole);
      }else if(id==='temple'){
        const stone=new THREE.Mesh(new THREE.BoxGeometry(.8,.65,.55),new THREE.MeshStandardMaterial({color:0xb6a98d,roughness:.9}));stone.position.y=.3;g.add(stone);
        const roof=new THREE.Mesh(new THREE.ConeGeometry(.62,.38,4),new THREE.MeshStandardMaterial({color:0x8e9c8d}));roof.position.y=.82;roof.rotation.y=Math.PI/4;g.add(roof);
        const door=new THREE.Mesh(new THREE.BoxGeometry(.18,.34,.03),new THREE.MeshBasicMaterial({color:0x263b3a}));door.position.set(0,.17,.29);g.add(door);
      }else if(id==='driftwood'){
        const wood=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.1,8),woodMat);wood.rotation.z=Math.PI/2.7;wood.position.y=.45;g.add(wood);
      }
      const key=`decor:${id}:${index}`;
      g.userData.studioKey=key;decorGroups.push(g);studioObjects.set(key,g);
      const saved=layout[key];if(saved){g.position.set(saved.x,saved.y,saved.z);g.rotation.y=saved.ry||0;g.scale.setScalar(saved.scale||1)}
    });
  }


  // Aquascape Studio: touch/mouse selection and ground-plane dragging.
  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.38);
  const hitPoint=new THREE.Vector3();
  const selectableRoot=o=>{
    let node=o;
    while(node&&node.parent!==root)node=node.parent;
    return node&&node.parent===root?node:null;
  };
  function pointerToRay(event){
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
    pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer,camera);
  }
  function pickStudioObject(event){
    pointerToRay(event);
    const hits=raycaster.intersectObjects([...studioObjects.values()],true);
    if(!hits.length)return null;
    const node=selectableRoot(hits[0].object);
    if(!node)return null;
    return [...studioObjects.entries()].find(([,obj])=>obj===node)||null;
  }
  function setStudioMode(enabled){
    studioEnabled=!!enabled;
    controls.enabled=!studioEnabled;
    host.classList.toggle('studio-active',studioEnabled);
    renderer.domElement.style.cursor=studioEnabled?'crosshair':'grab';
    if(!studioEnabled){
      const t=clock.getElapsedTime();
      fishMeshes.forEach(f=>{
        const u=f.userData;
        const baseline=new THREE.Vector3(Math.sin(t*u.speed+u.offset)*u.radius,u.baseY+Math.sin((t*u.speed+u.offset)*1.7)*.24,Math.cos((t*u.speed+u.offset)*.72)*1.35);
        u.studioOffset=f.position.clone().sub(baseline);
      });
      dragState=null;selectedStudioKey=null;
    }
  }
  function selectStudioObject(key){selectedStudioKey=studioObjects.has(key)?key:null;return selectedStudioKey;}
  function getSelectedStudioKey(){return selectedStudioKey;}
  function rotateSelected(delta){
    const obj=studioObjects.get(selectedStudioKey);if(!obj)return false;
    obj.rotation.y+=delta;return true;
  }
  function scaleSelected(factor){
    const obj=studioObjects.get(selectedStudioKey);if(!obj)return false;
    const next=THREE.MathUtils.clamp(obj.scale.x*factor,.35,2.8);
    obj.scale.setScalar(next);return true;
  }
  function removeSelected(){
    const obj=studioObjects.get(selectedStudioKey);if(!obj)return null;
    const key=selectedStudioKey;root.remove(obj);studioObjects.delete(key);selectedStudioKey=null;return key;
  }
  function getStudioLayout(){
    const out={};
    for(const [key,obj] of studioObjects.entries()){
      out[key]={x:obj.position.x,y:obj.position.y,z:obj.position.z,ry:obj.rotation.y,scale:obj.scale.x};
    }
    return out;
  }
  function onPointerDown(event){
    if(!studioEnabled)return;
    const found=pickStudioObject(event);
    if(!found){selectedStudioKey=null;return}
    selectedStudioKey=found[0];
    pointerToRay(event);
    if(raycaster.ray.intersectPlane(groundPlane,hitPoint)){
      dragState={key:found[0],offsetX:found[1].position.x-hitPoint.x,offsetZ:found[1].position.z-hitPoint.z,pointerId:event.pointerId};
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
  }
  function onPointerMove(event){
    if(!studioEnabled||!dragState)return;
    pointerToRay(event);
    if(raycaster.ray.intersectPlane(groundPlane,hitPoint)){
      const obj=studioObjects.get(dragState.key);if(!obj)return;
      obj.position.x=THREE.MathUtils.clamp(hitPoint.x+dragState.offsetX,-4.55,4.55);
      obj.position.z=THREE.MathUtils.clamp(hitPoint.z+dragState.offsetZ,-2.05,2.05);
    }
    event.preventDefault();
  }
  function onPointerUp(){dragState=null}
  renderer.domElement.addEventListener('pointerdown',onPointerDown);
  renderer.domElement.addEventListener('pointermove',onPointerMove);
  renderer.domElement.addEventListener('pointerup',onPointerUp);
  renderer.domElement.addEventListener('pointercancel',onPointerUp);

  // Floating bubbles
  const bubbleMat=new THREE.MeshPhysicalMaterial({color:0xe8ffff,transparent:true,opacity:.42,roughness:.08,metalness:0});
  const bubbles=[];for(let i=0;i<32;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.045,8,7),bubbleMat);b.position.set((Math.random()-.5)*8,.5+Math.random()*4,(Math.random()-.5)*3.5);b.userData.speed=.35+Math.random()*.6;b.userData.phase=Math.random()*7;bubbles.push(b);root.add(b)}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x9b927e,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.42;scene.add(floor);

  const clock=new THREE.Clock();let raf=0;
  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function animate(){raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();
    if(!studioEnabled)fishMeshes.forEach((f,i)=>{const u=f.userData;const a=t*u.speed+u.offset;f.position.set(Math.sin(a)*u.radius, u.baseY+Math.sin(a*1.7)*.24, Math.cos(a*.72)*1.35).add(u.studioOffset||new THREE.Vector3());const dx=Math.cos(a)*u.radius*u.speed,dz=-Math.sin(a*.72)*.97;f.rotation.y=0;f.rotation.z=Math.sin(t*2.1+u.phase)*.025;if(u.sprite?.material?.map){u.sprite.material.map.repeat.x=dx<0?-1:1;u.sprite.material.map.offset.x=dx<0?1:0;}});
    if(!studioEnabled)invertMeshes.forEach((o,i)=>{const u=o.userData;o.position.x+=Math.sin(t*.35+u.phase)*.0018;o.rotation.y=Math.sin(t*.7+u.phase)*.12;if(u.kind==='shrimp')o.position.y=.42+Math.sin(t*1.4+u.phase)*.035;});
    bubbles.forEach(b=>{b.position.y+=b.userData.speed*.012;if(b.position.y>4.5){b.position.y=.45;b.position.x=(Math.random()-.5)*8}b.position.x+=Math.sin(t*1.3+b.userData.phase)*.0015});
    plantGroups.forEach((g,i)=>{g.rotation.z=Math.sin(t*.8+i)*.018});controls.update();renderer.render(scene,camera)}
  animate();
  return {setQuality(level){const settings={low:{pixel:1,shadows:false},medium:{pixel:1.35,shadows:true},high:{pixel:1.7,shadows:true},ultra:{pixel:2,shadows:true}};const q=settings[level]||settings.high;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,q.pixel));renderer.shadowMap.enabled=q.shadows;resize();},setFishCount,setSpecies,setGrowth,setEnvironment,setStudioMode,selectStudioObject,getSelectedStudioKey,rotateSelected,scaleSelected,removeSelected,getStudioLayout,capturePhoto(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.88)},resetView(){camera.position.set(0,5.1,10.6);controls.target.set(0,2.1,0);controls.update()},zoom(delta){camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()),delta);controls.update()},destroy(){cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('pointercancel',onPointerUp);renderer.dispose();host.removeChild(renderer.domElement)}};
}
