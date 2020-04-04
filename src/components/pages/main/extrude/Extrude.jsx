import React, {
  // useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import PropTypes from 'prop-types';

import * as THREE from 'three';

import colors from '~/constants/colors';

const MESH_COLOR = colors.WHITE;
const LINE_COLOR = colors.WHITE;

function degToRad(value) {
  return THREE.MathUtils.degToRad(value);
}

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

  return (
    <animated.group
      name="blocks"
      rotation={interpolate([rotation], (r) => [r / -6, r / 6, r / 3])}
      position={visibility}
    >
      {
        new Array(layers).fill().map((_, i, arr) => {
          const scale = ((radius + thickness) / radius) ** i;

          const ranges = () => {
            const start = (1 / arr.length) * i;
            const end = start + (1 / arr.length) / 2;

            return {
              range: [0, start, end, 1],
              output: [0, 0, 4, 4 * Math.random()],
            };
          };

          return new Array(elements).fill().map((__, j) => {
            const key = `element-${i}-${j}`;

            return (
              <animated.group
                key={key}
                position={position
                  .interpolate(ranges())
                  .interpolate((x) => [0, 0, x * (i + 1)])}
                rotation={[0, 0, degToRad((360 / elements) * j)]}
                scale={[scale, scale, 1]}
              >
                <line
                  geometry={geometry.buffer}
                >
                  <lineBasicMaterial
                    attach="material"
                    color={LINE_COLOR}
                  />
                </line>
                <line
                  position={[-0.01, 0, -1.02]}
                  scale={[1.001, 1.001, 1]}
                  geometry={geometry.buffer}
                >
                  <lineBasicMaterial
                    attach="material"
                    color={LINE_COLOR}
                  />
                </line>
                <mesh
                  position={[0, 0, -1.01]}
                >
                  <extrudeBufferGeometry
                    attach="geometry"
                    args={[
                      geometry.shape,
                      {
                        steps: 1,
                        depth: 1,
                        bevelEnabled: false,
                      },
                    ]}
                  />
                  <meshLambertMaterial
                    attach="material"
                    color={MESH_COLOR}
                  />
                </mesh>
              </animated.group>
            );
          });
        })
      }
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
    position: running ? [0, 0, 0] : [0, 0, 100],
    immediate: true,
  });

  const layers = useSpring({
    position: running ? 1 : 0,
    config: {
      friction: 50,
      mass: 10,
      tension: 150,
    },
  });

  const camera = useSpring({
    rotation: running ? 1 : 0,
    config: config.wobbly,
  });

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
