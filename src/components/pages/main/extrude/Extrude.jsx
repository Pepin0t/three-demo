import React, {
  // useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import PropTypes from 'prop-types';

import * as THREE from 'three';
import { useFrame } from 'react-three-fiber';

import colors from '~/constants/colors';

const MESH_COLOR = 0xcccccc;
const LINE_COLOR = colors.WHITE;

function degToRad(value) {
  return THREE.MathUtils.degToRad(value);
}

const _object3d = new THREE.Object3D();
const _color = new THREE.Color();

function Render(props) {
  const {
    visibility,
    rotation,
    position,
    options,
  } = props;

  const {
    radius,
    thickness,
    elements,
    layers,
  } = options;

  const { animated, interpolate } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const geometry = useMemo(() => {
    const innerRadius = radius;
    const outerRadius = innerRadius + thickness;

    const radians = degToRad(360 / elements);

    const k = (4 / 3) * Math.tan(Math.PI / (2 * elements));

    const innerCosRadius = innerRadius * Math.cos(radians);
    const innerSinRadius = innerRadius * Math.sin(radians);
    const outerCosRadius = outerRadius * Math.cos(radians);
    const outerSinRadius = outerRadius * Math.sin(radians);

    const shape = new THREE.Shape();

    shape.moveTo(
      innerRadius,
      0,
    );

    shape.lineTo(
      outerRadius,
      0,
    );

    shape.bezierCurveTo(
      outerRadius,
      outerRadius * k,

      outerCosRadius + (outerSinRadius * k),
      outerSinRadius - (outerCosRadius * k),

      outerCosRadius,
      outerSinRadius,
    );

    shape.lineTo(
      innerCosRadius,
      innerSinRadius,
    );

    shape.bezierCurveTo(
      innerCosRadius + (innerSinRadius * k),
      innerSinRadius - (innerCosRadius * k),

      innerRadius,
      innerRadius * k,

      innerRadius,
      0,
    );

    shape.closePath();

    const buffer = new THREE.BufferGeometry().setFromPoints(shape.getPoints());

    return {
      buffer,
      shape,
    };
  }, [radius, elements, thickness]);

  const instancedRef = useRef();

  const colorArray = useMemo(() => {
    const color = new Float32Array(layers * elements * 3);

    for (let i = 0; i < layers * elements; i += 1) {
      _color.set(MESH_COLOR);
      _color.toArray(color, i * 3);
    }

    return color;
  }, [layers, elements]);

  const { randoms, scales } = useMemo(() => {
    const _randoms = new Float32Array(layers * elements);
    const _scales = new Float32Array(layers);

    let index = -1;
    for (let i = 0; i < layers; i += 1) {
      const scale = ((radius + thickness) / radius) ** i;

      _scales[i] = scale;

      for (let j = 0; j < elements; j += 1) {
        index += 1;

        _randoms[index] = Math.random();
      }
    }

    return {
      randoms: _randoms,
      scales: _scales,
    };
  }, [layers, elements, radius, thickness]);

  useFrame(() => {
    let id = -1;

    for (let i = 0; i < layers; i += 1) {
      const scale = scales[i];

      const ranges = (k) => {
        const start = (1 / layers) * i;
        const end = start + (1 / layers) / 2;

        return {
          range: [0, start, end, 1],
          output: [0, 0, 4, 4 * randoms[k]],
        };
      };

      for (let j = 0; j < elements; j += 1) {
        id += 1;

        const positions = interpolate(
          [position],
          ranges(id),
        ).interpolate((z) => [0, 0, z * (i + 1)]);

        _object3d.position.set(...positions.getValue());
        _object3d.rotation.set(0, 0, degToRad((360 / elements) * j));
        _object3d.scale.set(scale, scale, 1);

        _object3d.updateMatrix();

        instancedRef.current.setMatrixAt(id, _object3d.matrix);
      }
    }

    // if ??
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <animated.group
      name="blocks"
      rotation={interpolate([rotation], (r) => [r / -6, r / 6, r / 3])}
      position={visibility}
    >
      {
      // <line
      //   geometry={geometry.buffer}
      // >
      //   <lineBasicMaterial
      //     attach="material"
      //     color={LINE_COLOR}
      //   />
      // </line>
      // <line
      //   position={[-0.01, 0, -0.52]}
      //   scale={[1.001, 1.001, 1]}
      //   geometry={geometry.buffer}
      // >
      //   <lineBasicMaterial
      //     attach="material"
      //     color={LINE_COLOR}
      //   />
      // </line>
      }
      <instancedMesh
        ref={instancedRef}
        args={[null, null, layers * elements]}
      >
        <extrudeBufferGeometry
          attach="geometry"
          args={[
            geometry.shape,
            {
              steps: 1,
              depth: 2,
              bevelEnabled: false,
            },
          ]}
        >
          <instancedBufferAttribute
            // ref={attributeRef}
            attachObject={['attributes', 'color']}
            args={[colorArray, 3]}
          />
        </extrudeBufferGeometry>
        <meshPhongMaterial
          attach="material"
          vertexColors={THREE.VertexColors}
        />
      </instancedMesh>
    </animated.group>
  );
}

Render.propTypes = {
  visibility: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  options: PropTypes.exact({
    radius: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    elements: PropTypes.number.isRequired,
    layers: PropTypes.number.isRequired,
  }).isRequired,
};

const MemoizedRender = React.memo(Render);

function Control(props) {
  const { options, running } = props;

  const { useSpring, config } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const visibility = useSpring({
    position: running ? [0, 0, -2.01] : [0, 0, 100],
    immediate: true,
  });

  const [layers, setLayers] = useSpring(() => ({
    position: 0,
    config: {
      friction: 50,
      mass: 10,
      tension: 150,
    },
  }));

  const camera = useSpring({
    rotation: running ? 1 : 0,
    config: config.wobbly,
  });

  useEffect(() => {
    if (running) {
      setLayers({
        to: async (next) => {
          await next({
            position: 1,
          });

          // await next({
          //   position: 0.2,
          //   config: {
          //     mass: 3,
          //     tension: 5,
          //     friction: 10,
          //     precision: 0.001,
          //   },
          // });
        },
      });
    }
  }, [running, setLayers]);

  return (
    <MemoizedRender
      visibility={visibility.position}
      position={layers.position}
      rotation={camera.rotation}
      options={options}
    />
  );
}

Control.propTypes = {
  running: PropTypes.bool.isRequired,
  options: PropTypes.exact({
    radius: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    elements: PropTypes.number.isRequired,
    layers: PropTypes.number.isRequired,
  }).isRequired,
};

export default Control;
