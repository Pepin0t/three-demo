import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Suspense,
} from 'react';

import * as THREE from 'three';

import { Canvas, useThree } from 'react-three-fiber';

import Center from '~/components/pages/main/center/Center';
import Rings from '~/components/pages/main/rings/Rings';
import Extrude from '~/components/pages/main/extrude/Extrude';
import Effects from '~/components/pages/main/effects/Effects';

import styles from './Scene.less';

function Controls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');

    const controls = new OrbitControls(camera, gl.domElement);

    return () => {
      controls.dispose();
    };
  }, [camera, gl]);

  return null;
}

function Render(props) {
  const { options } = props;
  const { radius } = options;

  const { useSpring, animated, config } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const [centerClicked, setCenterClicked] = useState(false);
  const [running, setRunning] = useState(false);

  const [scene, setScene] = useSpring(() => ({
    position: [0, 0, 0],
    config: config.molasses,
  }));

  const [cameraParameters, setCameraParameters] = useSpring(() => ({
    position: [0, 0, 35],
    rotation: [0, 0, 0],
    fov: 75,
  }));

  useEffect(() => {
    if (running) {
      setCameraParameters({
        to: async (next) => {
          await next({
            position: [5, 0, 35],
            rotation: [0, 0, -0.2],
            fov: 85,
            config: {
              // ...config.slow,
              // friction: 60,
            },
          });

          await next({
            position: [-5, 0, -120],
            rotation: [0, Math.PI, Math.PI / 8],
            fov: 50,
            config: {
              mass: 12,
              tension: 4,
              friction: 20,
              precision: 0.00001,
            },
          });
        },
      });
    }
  }, [running, setCameraParameters]);

  useEffect(() => {
    function handleMouseMove({ offsetX, offsetY }) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const x = ((screenWidth / 2) - offsetX) / 200;
      const y = ((screenHeight / 2) - offsetY) / -200;

      setScene({ position: [x, y, 0] });
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setScene]);

  // useFrame(({ camera }) => {
  //   if (running) {
  //     camera.position.set(...cameraParameters.position.getValue());
  //     camera.rotation.set(...cameraParameters.rotation.getValue());
  //     camera.fov = cameraParameters.fov.getValue();

  //     camera.updateProjectionMatrix();
  //   }
  // });

  return (
    <React.Fragment>
      <animated.scene
        position={scene.position}
      >
        <Extrude
          options={options}
          running={running}
        />
        <Rings
          options={options}
          centerClicked={centerClicked}
          running={running}
          setRunning={setRunning}
        />
        <Center
          radius={radius}
          centerClicked={centerClicked}
          setCenterClicked={setCenterClicked}
          setRunning={setRunning}
        />
        <Effects />
      </animated.scene>
    </React.Fragment>
  );
}

function Scene() {
  const [loading, setLoading] = useState(true);
  const [pixelRatio, setPixelRatio] = useState();

  const [options] = useState({
    radius: 12,
    thickness: 1.8,
    elements: 32,
    layers: 16,
  });

  const canvas = useRef();
  const directionalLight = useRef();

  useEffect(() => {
    setPixelRatio(window.devicePixelRatio);
  }, []);

  function onPointerOver() {
    canvas.current.style.cursor = 'pointer';
  }

  function onPointerOut() {
    canvas.current.style.cursor = null;
  }

  return (
    <div className={styles.Scene}>
      {
        // !loading
        // && (
        //   <div
        //     className={styles.circle}
        //     // onClick={() => console.log('click')}
        //     // onMouseEnter={() => console.log('enter')}
        //     // onMouseLeave={() => console.log('leave')}
        //   />
        // )
      }
      <div
        ref={canvas}
        className={styles.wrapper}
      >
        {
          loading
          && (
            <div className={styles.loading}>
              Loading...
            </div>
          )
        }
        <Canvas
          onPointerMove={undefined}
          onMouseMove={undefined}
          onWheel={undefined}

          shadowMap
          gl={{ antialias: false, alpha: false }}
          pixelRatio={pixelRatio}
          camera={{ position: [0, 0, 35], fov: 75 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.Uncharted2ToneMapping;
            gl.setClearColor(new THREE.Color(0xeeeeee));

            setLoading(false);
          }}
        >
          {/*<Controls />*/}
          <directionalLight
            castShadow
            position={[0, 0, 20]}
            color={0xbbbbbb}
            intensity={0.7}
          />
          <directionalLight
            position={[0, 0, -30]}
            color={0x55aacc}
            intensity={0.7}
          />
          <hemisphereLight position={[0, 0, 30]} args={[0x55aacc, 0x999999, 0.4]} />
          <Suspense fallback={null}>
            <Render
              onPointerOver={onPointerOver}
              onPointerOut={onPointerOut}
              options={options}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

// 0x55aacc

export default Scene;
