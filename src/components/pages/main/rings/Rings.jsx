import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import * as THREE from 'three';

import colors from '~/constants/colors';

const MESH_COLOR = colors.WHITE;
const LINE_COLOR = colors.WHITE;

function Render(props) {
  const {
    visibility,
    position,
    rotation,
    options,
  } = props;

  const {
    radius,
    thickness,
    layers,
    elements,
  } = options;

  const { BufferGeometryUtils } = useMemo(() => (
    require('three/examples/jsm/utils/BufferGeometryUtils')
  ), []);

  const innerRadius = radius;
  const outerRadius = innerRadius + thickness;

  const {
    animated,
    interpolate,
  } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const { shape, buffer } = useMemo(() => {
    const segments = 6;

    const shapeInner = new THREE.Shape();
    const shapeOuter = new THREE.Shape();

    shapeInner.moveTo(0, 0);
    shapeOuter.moveTo(0, 0);

    for (let i = 0; i < segments; i += 1) {
      const endAngle = (2 * Math.PI) / segments;

      shapeInner.absellipse(
        0,
        0,
        innerRadius,
        innerRadius,
        0,
        endAngle,
        false,
        endAngle * i,
      );

      shapeOuter.absellipse(
        0,
        0,
        outerRadius,
        outerRadius,
        0,
        endAngle,
        false,
        endAngle * i,
      );
    }

    shapeOuter.holes.push(shapeInner);

    const innerPoints = shapeInner.getPoints();

    const innerBuf = new THREE.BufferGeometry().setFromPoints(innerPoints);

    return {
      shape: shapeOuter,
      buffer: {
        inner: innerBuf,
        // outer: outerBuf,
      },
    };
  }, [innerRadius, outerRadius]);

  const { mergedLinesGeometry: lines } = useMemo(() => {
    const line = new THREE.Shape();
    const lineGeometry = new THREE.BufferGeometry();

    // TODO
    const height = (thickness ** layers);

    line.moveTo((innerRadius * 2) + height, 0);
    line.lineTo(innerRadius, 0);

    line.closePath();

    lineGeometry.setFromPoints(line.getPoints());

    const lineGeometries = new Array(elements).fill().map((_, i) => {
      const cloneLineGeometry = lineGeometry.clone();

      return cloneLineGeometry.rotateZ(((2 * Math.PI) / elements) * i);
    });

    const mergedLinesGeometry = BufferGeometryUtils.mergeBufferGeometries(lineGeometries);

    return {
      mergedLinesGeometry,
    };
  }, [innerRadius, thickness, elements, layers, BufferGeometryUtils]);

  const { mergedConesGeometry: cones } = useMemo(() => {
    const H = 80;
    const R = 2;
    const r = R - ((H - innerRadius) / H) * R;

    const coneGeometry = new THREE.CylinderBufferGeometry(r, R, H, 3);

    coneGeometry.rotateZ(Math.PI / 2);
    coneGeometry.translate((H / 2) + innerRadius + 0.02, 0, 0);
    coneGeometry.rotateY(Math.atan(R / H));

    const coneGeometries = new Array(elements).fill().map((_, i) => {
      const cloneConeGeometry = coneGeometry.clone();

      return cloneConeGeometry.rotateZ(((2 * Math.PI) / elements) * i);
    });

    const mergedConesGeometry = BufferGeometryUtils.mergeBufferGeometries(coneGeometries);

    return {
      mergedConesGeometry,
    };
  }, [innerRadius, elements, BufferGeometryUtils]);

  return (
    <animated.group
      name="rings"
      position={visibility}
    >
      {
        new Array(layers).fill().map((_, i) => {
          const key = `layer-${i}`;

          // if (i % 2 === 1) return null;

          const scale = (outerRadius / innerRadius) ** i;

          return (
            <animated.group
              key={key}
              name="ring"
              scale={[scale, scale, 1]}
              position={interpolate([position], ([x, y]) => {
                let shiftX = x * i;
                let shiftY = y * i;

                const limit = i * 0.8;

                // TODO
                if (shiftX >= limit) shiftX = limit;
                if (shiftX <= -limit) shiftX = -limit;

                if (shiftY >= limit) shiftY = limit;
                if (shiftY <= -limit) shiftY = -limit;

                return [shiftX, shiftY, 0];
              })}
            >
              <line
                geometry={buffer.inner}
              >
                <lineBasicMaterial
                  attach="material"
                  color={LINE_COLOR}
                />
              </line>
              <mesh
                position={[0, 0, i > 0 ? -0.01 : -1.01]}
              >
                <extrudeBufferGeometry
                  attach="geometry"
                  args={[
                    shape,
                    {
                      steps: 1,
                      depth: i > 0 ? 0 : 1,
                      bevelEnabled: false,
                    },
                  ]}
                />
                <meshStandardMaterial
                  attach="material"
                  color={MESH_COLOR}
                />
              </mesh>
            </animated.group>
          );
        })
      }
      <line
        name="radial-lines"
        geometry={lines}
      >
        <lineBasicMaterial
          attach="material"
          color={LINE_COLOR}
        />
      </line>
      <animated.mesh
        name="triangle-cones"
        rotation={interpolate([rotation], ([x, y]) => {
          let xAngle = y / 50;
          let yAngle = x / -50;

          const limit = 0.015;

          if (xAngle >= limit) xAngle = limit;
          if (xAngle <= -limit) xAngle = -limit;

          if (yAngle >= limit) yAngle = limit;
          if (yAngle <= -limit) yAngle = -limit;

          return [xAngle, yAngle, 0];
        })}
        geometry={cones}
      >
        <meshBasicMaterial
          attach="material"
          color={LINE_COLOR}
        />
      </animated.mesh>
    </animated.group>
  );
}

Render.propTypes = {
  options: PropTypes.exact({
    radius: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    layers: PropTypes.number.isRequired,
    elements: PropTypes.number.isRequired,
  }).isRequired,
};

const MemoizedRender = React.memo(Render);

function Control(props) {
  const {
    centerClicked,
    running,
    setRunning,
    options,
  } = props;

  const {
    useSpring,
    config,
  } = useMemo(() => (
    require('react-spring/three')
  ), []);

  const visibility = useSpring({
    position: running ? [0, 0, 100] : [0, 0, 0],
    immediate: true,
  });

  const [rings, setRings] = useSpring(() => ({
    position: [0, 0, 0],
    config: {
      ...config.gentle,
      friction: 9,
    },
  }));

  const [cones, setCones] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: {
      ...config.gentle,
    },
  }));

  useEffect(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    function handleMouseMove({ offsetX, offsetY }) {
      const x = ((screenWidth / 2) - offsetX) / 1000;
      const y = ((screenHeight / 2) - offsetY) / -1000;

      setRings(() => ({
        position: [x, y, 0],

        // TEMP
        config: {
          ...config.gentle,
          friction: 9,
        },
      }));

      setCones(() => ({
        rotation: [x, y, 0],

        // TEMP
        config: {
          ...config.gentle,
        },
        onRest: undefined,
      }));
    }

    if (centerClicked) {
      setRings({
        position: [0, 0, 0],
        config: { duration: 200 },
      });

      setCones({
        rotation: [0, 0, 0],
        config: { duration: 200 },
        onRest() {
          setTimeout(() => {
            // setRunning(true);
          }, 0);
        },
      });
    } else {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (!centerClicked) {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [centerClicked, setRings, setCones, setRunning, config.gentle]);

  return (
    <MemoizedRender
      visibility={visibility.position}
      position={rings.position}
      rotation={cones.rotation}
      options={options}
    />
  );
}

Control.propTypes = {
  centerClicked: PropTypes.bool.isRequired,
  running: PropTypes.bool.isRequired,
  setRunning: PropTypes.func.isRequired,
  options: PropTypes.exact({
    radius: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    layers: PropTypes.number.isRequired,
    elements: PropTypes.number.isRequired,
  }).isRequired,
};

export default Control;
