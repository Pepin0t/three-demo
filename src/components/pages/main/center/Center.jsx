import React, {
  // useState,
  // useEffect,
  // useRef,
  useMemo,
} from 'react';

import PropTypes from 'prop-types';

import * as THREE from 'three';
import { useLoader } from 'react-three-fiber';

import colors from '~/constants/colors';

async function delay(value) {
  return new Promise((resolve) => setTimeout(resolve, value));
}

function Render(props) {
  const {
    radius,
    color,
    rotation,
    centerParameters,
    buttonParameters,
  } = props;

  const { animated, interpolate } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const font = useMemo(() => {
    const typeface = require('three/examples/fonts/gentilis_bold.typeface.json');

    return new THREE.Font(typeface);
  }, []);

  console.log('render')

  const indent = 6.2;

  const { psss, circle: main, fragments: fff } = useMemo(() => {
    const segments = 8;
    const R = radius - indent;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);

    const hole = new THREE.Shape();
    hole.moveTo(0, 0);

    const circle = new THREE.Shape();
    circle.moveTo(0, 0);

    const fragments = [];

    for (let i = 0; i < segments; i += 1) {
      const endAngle = (2 * Math.PI) / segments;

      let divider = 1;

      if (i === 0 || i === 2 || i === 5) divider = 1.0125;
      if (i === 3) divider = 1.025;
      if (i === 1 || i === 6 || i === 7) divider = 1.05;
      if (i === 4) divider = 1.075;

      if (divider !== 1) {
        const fragment = new THREE.Shape();

        const outer = fragment.clone();
        const inner = fragment.clone();

        fragment.add(outer.absellipse(
          0,
          0,
          R,
          R,
          0,
          endAngle,
          false,
          endAngle * i,
        ));

        fragment.add(inner.absellipse(
          0,
          0,
          R / divider,
          R / divider,
          0,
          2 * Math.PI - endAngle,
          true,
          (2 * Math.PI - endAngle) * (i + 1) * -1,
        ));

        fragments.push(fragment);
      }

      shape.absellipse(
        0,
        0,
        R / divider,
        R / divider,
        0,
        endAngle,
        false,
        endAngle * i,
      );

      hole.absellipse(
        R / 20,
        0,
        R / 1.2,
        R / 1.2,
        0,
        endAngle,
        false,
        endAngle * i,
      );

      circle.absellipse(
        0,
        0,
        R / 1.3,
        R / 1.3,
        0,
        endAngle,
        false,
        endAngle * i,
      );
    }

    shape.holes.push(hole);

    return { psss: shape, circle, fragments };
  }, [radius]);

  return (
    <group>
      <animated.group
        name="center"
        position={interpolate([centerParameters], (p) => {
          const [x, y, z] = p;

          return [x, y, z];
        })}
        rotation={interpolate([centerParameters], (r) => {
          const rX = r[3];
          const rY = r[4];
          const rZ = r[5];

          return [rX, rY, rZ];
        })}
        scale={interpolate([centerParameters], (s) => {
          const sX = s[6];
          const sY = s[7];
          const sZ = s[8];

          return [sX, sY, sZ];
        })}
      >
        <animated.mesh
          // visible={false}
          receiveShadow
          onClick={(e) => e.stopPropagation()}
        >
          <extrudeBufferGeometry
            attach="geometry"
            args={[
              psss,
              {
                steps: 1,
                depth: 1,
                bevelEnabled: false,
              },
            ]}
          />
          <animated.meshLambertMaterial
            attach="material"
            color={colors.BLACK}
          />
        </animated.mesh>
        <animated.group
          name="button"
          position={[(radius - indent) / 20, 0, 0.5]}
          rotation={interpolate([buttonParameters], (r) => {
            const rX = r[3];
            const rY = r[4];
            const rZ = r[5];

            return [rX, rY, rZ];
          })}
        >
          <mesh
            receiveShadow
            position={[0, 0, -0.5]}
          >
            <extrudeBufferGeometry
              attach="geometry"
              args={[
                main,
                {
                  steps: 1,
                  depth: 1,
                  bevelEnabled: false,
                },
              ]}
            />
            <animated.meshLambertMaterial
              attach="material"
              color={colors.BLACK}
            />
          </mesh>
          <mesh
            position={[-2.5, -1, -0.4]}
          >
            <textBufferGeometry
              attach="geometry"
              args={[
                'Go?',
                {
                  font,
                  size: 2.5,
                  height: 1,
                  curveSegments: 4,
                },
              ]}
            />
            <meshBasicMaterial
              attach="material"
              color="#fff"
            />
          </mesh>
        </animated.group>
      </animated.group>
      <group
        name="fragments"
        onClick={(e) => e.stopPropagation()}
        scale={[1, 1, 1]}
      >
        {
          fff.map((fragment, i) => {
            const key = `fragment-${i}`;

            const rotationY = ((2 * Math.PI) / fff.length) * i;

            return (
              <animated.mesh
                key={key}
                castShadow
                position={[0, 0, -0.5]}
                scale={interpolate([rotation], ([,,, m]) => {
                  const scale = 1 + (0.1 * (i + 1) * m) + (1 - 1 * m);

                  return [scale, scale, 1];
                })}
                rotation={interpolate([rotation], ([, y, z, m]) => (
                  [0, y + (rotationY * m), (m * 4 * z) % (2 * Math.PI)]
                ))}
              >
                <extrudeBufferGeometry
                  attach="geometry"
                  args={[
                    fragment,
                    {
                      steps: 1,
                      depth: 0.5,
                      bevelEnabled: false,
                    },
                  ]}
                />
                <animated.meshLambertMaterial
                  attach="material"
                  color={colors.BLACK}
                />
              </animated.mesh>
            );
          })
        }
      </group>
    </group>
  );
}

Render.propTypes = {
  radius: PropTypes.number.isRequired,
};

const MemoizedRender = React.memo(Render);

function Control(props) {
  const {
    radius,
    centerClicked,
    setCenterClicked,
    setRunning,
  } = props;

  const { useSpring, config } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const cylinder = useSpring({
    color: centerClicked ? '#ff4444' : '#555',
    // immediate: true,
  });

  // ff4444

  const [fragments, setFragments] = useSpring(() => ({
    from: {
      rotation: [0, 0, 0, 1],
    },
    to: async (next) => {
      async function loop(stopped) {
        if (stopped) return;

        const run = await next({
          rotation: [0, 2 * Math.PI, 2 * Math.PI, 1],
        });

        loop(!run);
      }

      loop();
    },
    config: {
      duration: 20000,
    },
    reset: true,
  }));

  const [center, setCenter] = useSpring(() => ({
    parameters: [
      0, 0, -1, // x, y, z
      0, 0, 0, // rX, rY, rZ
      1, 1, 1, // sX, sY, sZ
    ],
  }));

  const [button, setButton] = useSpring(() => ({
    from: {
      parameters: [
        0, 0, 0,
        0, 0, 0,
        1, 1, 1,
      ],
    },
    reset: true,
    config: {
      duration: 3000,
    },
  }));

  function onClick() {
    if (centerClicked) {
      setRunning(false);
    } else {
      setTimeout(() => {
        setRunning(true);
      }, 1500);

      setCenter(() => ({
        to: async (next) => {
          await next({
            parameters: [
              0, 0, -1,
              0, 0, 0.2,
              0.8, 0.8, 1,
            ],
            config: {
              ...config.gentle,
              friction: 5,
            },
          });

          await next({
            parameters: [
              0, 0, -1,
              0, 0, 0,
              1.6, 1.6, 1,
            ],
            config: {
              friction: 20,
              tension: 250,
            },
          });
        },
      }));

      setButton(() => ({
        to: async (next) => {
          await delay(400);

          async function loop(stopped) {
            if (stopped) return;

            const run = await next({
              parameters: [
                0, 0, 0,
                0, 2 * Math.PI, 0,
                1, 1, 1,
              ],
            });

            await loop(!run);
          }

          await loop();
        },
      }));

      setFragments(() => ({
        reset: false,
        to: async (next) => {
          await next({
            rotation: [0, 0, 2 * Math.PI, 0],
            config: {
              mass: 12,
              tension: 40,
              friction: 30,
            },
          });
        },
      }));
    }

    setCenterClicked(((state) => !state));
  }

  return (
    <group
      onClick={onClick}
      // onPointerOver={() => setHovered(true)}
      // onPointerLeave={() => setHovered(false)}
    >
      <MemoizedRender
        radius={radius}
        color={cylinder.color}
        rotation={fragments.rotation}
        centerParameters={center.parameters}
        buttonParameters={button.parameters}
      />
    </group>
  );
}

Control.propTypes = {
  radius: PropTypes.number.isRequired,
  centerClicked: PropTypes.bool.isRequired,
  setCenterClicked: PropTypes.func.isRequired,
  setRunning: PropTypes.func.isRequired,
};

export default Control;
