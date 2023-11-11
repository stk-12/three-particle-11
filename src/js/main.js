
import { radian } from './utils';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import vertexSource from "./shader/vertexShader.glsl";
import fragmentSource from "./shader/fragmentShader.glsl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

class Particle {
  constructor(scene) {
    this.scene = scene;
    this.promiseList = [];
    this.modelPathList = [
      'model/go.glb',
      'model/number1.glb',
      'model/number2.glb',
      'model/number3.glb',
    ]
    this.countParticle = 5000;
    this.loader = new GLTFLoader();
    this.targetPositions = {};
    this.geometries = {};
  }

  init() {
    this.promiseList = this.modelPathList.map((modelPath, index) => {
      return new Promise((resolve) => {
        this.loader.load(modelPath, (gltf) => {
          const model = gltf.scene;
          const modelMesh = model.children[0];
          // メッシュを拡大
          modelMesh.scale.set(100.0, 100.0, 100.0);
          // メッシュのスケールに合わせて座標データを拡大
          const positions = modelMesh.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] *= 100.0;
            positions[i + 1] *= 100.0;
            positions[i + 2] *= 100.0;
          }
          // 座標データを更新
          modelMesh.geometry.attributes.position.needsUpdate = true;

          this._addParticlesSurface(modelMesh, `model${index}`);
          this._addRandomParticle();

          resolve();
        })
      })
    });

    Promise.all(this.promiseList).then(() => {   
      this._initParticleMesh();
      this._setAnimation();
    });
  }

  _addParticlesSurface(mesh, shapeName) {
    const sampler = new MeshSurfaceSampler(mesh).build()
    const particleSurfaceGeometry = new THREE.BufferGeometry()
    const particlesPosition = new Float32Array(this.countParticle * 3)

    for(let i = 0; i < this.countParticle; i++) {
      const newPosition = new THREE.Vector3()
      sampler.sample(newPosition)
      particlesPosition.set([
        newPosition.x, // 0 - 3
        newPosition.y, // 1 - 4
        newPosition.z // 2 - 5
      ], i * 3)
    }
    particleSurfaceGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))

    this.targetPositions[shapeName] = [...particleSurfaceGeometry.attributes.position.array];

    this.geometries[shapeName] = mesh.geometry;
  }

  _addRandomParticle() {
    const vertices = [];
    for (let i = 0; i < this.countParticle; i++) {
      const x = (Math.random() - 0.5) * (window.innerWidth * 1.2);
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * (window.innerWidth * 1.2);
      vertices.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.targetPositions.random = [...geometry.attributes.position.array];

    this.geometries['random'] = geometry;
  }

  // 頂点にパーティクルを配置
  _initParticleMesh() {
    this.particleGeometry = this.geometries.random;
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
    });
    this.particlesMesh = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );

    this.particlesMesh.rotation.x = Math.PI / 2;

    this.scene.add(this.particlesMesh);
  }

  _animateParticles(targetPositions) {
    const positions = this.particlesMesh.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i+=3) {
      // アニメーション用中間オブジェクト
      const intermediateObject = {
        x: positions[i],
        y: positions[i+1],
        z: positions[i+2]
      };

      gsap.to(intermediateObject, {
        // duration: 1.2,
        duration: 1.2 + Math.random() * 0.3, // 0.3秒のランダムな遅延
        // ease: "power4.inOut",
        ease: "expo.out",
        x: targetPositions[i],
        y: targetPositions[i+1],
        z: targetPositions[i+2],
        onUpdate: () => {
          positions[i] = intermediateObject.x;
          // positions[i] = intermediateObject.x + noise(intermediateObject.x, intermediateObject.y, intermediateObject.z);
          positions[i+1] = intermediateObject.y;
          positions[i+2] = intermediateObject.z;
          this.particlesMesh.geometry.attributes.position.needsUpdate = true;
        }
      });
    }
  }

  _setAnimation() {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section02',
        start: 'top bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          console.log('on enter');
          this._animateParticles(this.targetPositions.model3);
        },
        onLeaveBack: ()=> {
          console.log('on leaveback');
          this._animateParticles(this.targetPositions.random);
        }
      }
    });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section03',
        start: 'top bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          console.log('on enter');
          this._animateParticles(this.targetPositions.model2);
        },
        onLeaveBack: ()=> {
          console.log('on leaveback');
          this._animateParticles(this.targetPositions.model3);
        }
      }
    });

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section03',
        start: 'bottom bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          console.log('on enter');
          this._animateParticles(this.targetPositions.model1);
        },
        onLeaveBack: ()=> {
          console.log('on leaveback');
          this._animateParticles(this.targetPositions.model2);
        }
      }
    });

    const tl4 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section04',
        start: 'bottom bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          console.log('on enter');
          this._animateParticles(this.targetPositions.model0);
        },
        onLeaveBack: ()=> {
          console.log('on leaveback');
          this._animateParticles(this.targetPositions.model1);
        }
      }
    });
  }

}

class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector("#canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;

    this._init();
    this._update();
    this._addEvent();

    this.partcle = new Particle(this.scene);
    this.partcle.init();

  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = this.viewport.height / 2 / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.viewport.width / this.viewport.height,
      1,
      distance * 2
    );
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }

  _init() {
    this._setCamera();    
  }

  _update() {

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

new Main();



