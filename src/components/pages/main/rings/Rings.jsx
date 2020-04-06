import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import * as THREE from 'three';

import { useFrame } from 'react-three-fiber';

import colors from '~/constants/colors';

const MESH_COLOR = colors.WHITE;
const LINE_COLOR = colors.WHITE;

const object = new THREE.Object3D();
const _color = new THREE.Color();

function Render(props) {
  const { animated, interpolate } = require('react-spring/three');
  const { BufferGeometryUtils } = require('three/examples/jsm/utils/BufferGeometryUtils');

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


  const innerRadius = radius;
  const outerRadius = innerRadius + thickness;


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

    const height = new Array(layers).fill(thickness).reduce((acc, el, i) => (
      acc + el * ((outerRadius / innerRadius) ** i)
    ), 0);

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
  }, [innerRadius, outerRadius, thickness, elements, layers, BufferGeometryUtils]);

  const { mergedConesGeometry: cones } = useMemo(() => {
    const H = new Array(layers).fill(thickness).reduce((acc, el, i) => (
      acc + el * ((outerRadius / innerRadius) ** i)
    ), innerRadius);

    const R = 15;
    const r = R - (H / (H + innerRadius)) * R;

    const coneGeometry = new THREE.CylinderBufferGeometry(r, R, H, 3);

    coneGeometry.rotateZ(Math.PI / 2);
    coneGeometry.translate((H / 2) + innerRadius - 0.2, 0, 0);
    coneGeometry.rotateY(Math.atan(R / (H + innerRadius)));

    const coneGeometries = new Array(elements).fill().map((_, i) => {
      const cloneConeGeometry = coneGeometry.clone();

      return cloneConeGeometry.rotateZ(((2 * Math.PI) / elements) * i);
    });

    const mergedConesGeometry = BufferGeometryUtils.mergeBufferGeometries(coneGeometries);

    return {
      mergedConesGeometry,
    };
  }, [innerRadius, outerRadius, layers, elements, thickness, BufferGeometryUtils]);

  // --------------------------------------------
  const instancedRef = useRef();
  const attributeRef = useRef();
  const roundLinesRef = useRef();

  const colorArray = useMemo(() => {
    const color = new Float32Array(layers * 3);

    for (let i = 0; i < layers; i += 1) {
      _color.set(0xcccccc);
      _color.toArray(color, i * 3);
    }

    return color;
  }, [layers]);

  useFrame(() => {
    const { count } = instancedRef.current;

    const { x, y } = instancedRef.current.position;

    const roundLines = roundLinesRef.current.children;

    for (let i = 0; i < count; i += 1) {
      const scale = (outerRadius / innerRadius) ** i;

      let shiftX = x * i * 1.5;
      let shiftY = y * i * 1.5;

      const limit = i * 2;

      // TODO
      if (shiftX >= limit) shiftX = limit;
      if (shiftX <= -limit) shiftX = -limit;

      if (shiftY >= limit) shiftY = limit;
      if (shiftY <= -limit) shiftY = -limit;

      object.position.set(shiftX - x, shiftY - y, -2.01);
      object.scale.set(scale, scale, 1);
      object.updateMatrix();

      instancedRef.current.setMatrixAt(i, object.matrix);

      roundLines[i].position.set(shiftX, shiftY, 0);
      roundLines[i].scale.set(scale, scale, 1);
    }

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <animated.group
      name="rings"
      position={visibility}
    >
      <group
        ref={roundLinesRef}
        name="round-lines"
      >
        {
          new Array(layers).fill().map((_, i) => {
            const key = `line-${i}`;

            // USE INSTANCED SOMETHING... !!!

            return (
              <line
                key={key}
                geometry={buffer.inner}
              >
                <lineBasicMaterial
                  attach="material"
                  color={LINE_COLOR}
                />
              </line>
            );
          })
        }
      </group>
      <animated.instancedMesh
        name="ring"
        ref={instancedRef}
        args={[null, null, layers]}
        position={position}
      >
        <extrudeBufferGeometry
          attach="geometry"
          args={[
            shape,
            {
              steps: 1,
              depth: 2,
              bevelEnabled: false,
            },
          ]}
        >
          <instancedBufferAttribute
            ref={attributeRef}
            attachObject={['attributes', 'color']}
            args={[colorArray, 3]}
          />
        </extrudeBufferGeometry>
        <meshPhongMaterial
          attach="material"
          vertexColors={THREE.VertexColors}
        />
      </animated.instancedMesh>
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
          let xAngle = y / 25;
          let yAngle = x / -25;

          const limit = 0.030;

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
    position: running ? [0, 1000, 0] : [0, 0, 0],
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
