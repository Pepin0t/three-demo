import React, { useEffect, useRef, useMemo } from 'react';

import * as THREE from 'three';

import { useThree, useFrame, extend } from 'react-three-fiber';

if (typeof window !== 'undefined') {
  const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer');
  const { ShaderPass } = require('three/examples/jsm/postprocessing/ShaderPass');
  const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass');
  const { SSAOPass } = require('three/examples/jsm/postprocessing/SSAOPass');
  const { SMAAPass } = require('three/examples/jsm/postprocessing/SMAAPass');
  const { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass');

  extend({
    EffectComposer,
    RenderPass,
    ShaderPass,
    SSAOPass,
    SMAAPass,
    UnrealBloomPass,
  });
}

function Effects() {
  const { FXAAShader } = require('three/examples/jsm/shaders/FXAAShader');

  const composer = useRef();

  const {
    scene,
    gl,
    size,
    camera,
  } = useThree();

  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size]);

  useEffect(() => {
    composer.current.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => composer.current.render(), 1);

  return (
    <effectComposer
      ref={composer}
      args={[gl]}
    >
      <renderPass
        attachArray="passes"
        scene={scene}
        camera={camera}
      />
{/*      <sSAOPass
        attachArray="passes"
        args={[scene, camera]}
        kernelRadius={0.6}
        maxDistance={0.03}
      />*/}
{/*      <sMAAPass
        attachArray="passes"
        args={[size.width, size.height]}
      />*/}
      <unrealBloomPass
        attachArray="passes"
        args={[aspect, 0.7, 0.5, 0.96]}
      />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        material-uniforms-resolution-value={[1 / size.width, 1 / size.height]}
        renderToScreen
      />
    </effectComposer>
  );
}

export default React.memo(Effects);
