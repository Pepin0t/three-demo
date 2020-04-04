import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import Router from 'next/router';

import { Canvas, useFrame, useThree, useResource, useUpdate, useLoader, useCamera } from 'react-three-fiber';

import { FontLoader, Vector3 } from 'three';

import useKeyboard from '~/hooks/useKeyboard';
import useGamepad from '~/hooks/useGamepad';
import useThrottledState from '~/hooks/useThrottledState';

function truncate(value) {
  return Math.trunc(value * 10) / 10;
}

function Text({ children }) {
  const font = useLoader(FontLoader, 'fonts/helvetiker_regular.typeface.json');

  const config = useMemo(
    () => ({
      font,
      size: 4,
      height: 1,
      curveSegments: 32,
    }),
    [font],
  );

  // const text = useUpdate((mesh) => {
  //   const MESH = mesh;

  //   MESH.geometry.computeBoundingBox();
  //   const box = MESH.geometry.boundingBox.getSize(new Vector3());

  //   MESH.position.x = box.x / -2; // ???
  //   MESH.position.y = config.size / -2;
  //   MESH.position.z = 6.7;
  // }, [children]);

  return (
    <mesh
      // ref={text}
      position={[0, (config.size / -2), 6.7]}
    >
      <textBufferGeometry attach="geometry" args={[children, config]} />
      <meshStandardMaterial
        attach="material"
        color="#959595"
      />
    </mesh>
  );
}

function Box(props) {
  const { active, color } = props;

  return (
    <mesh
      onClick={() => Router.push('/user/[id]', '/user/a')}
      onPointerOver={() => { props.onPointerOver(); }}
      onPointerOut={() => { props.onPointerOut(); }}
    >
      <boxBufferGeometry attach="geometry" args={[15, 15, 15]} />
      <meshStandardMaterial
        attach="material"
        color={active ? '#2b6c76' : color}
      />
    </mesh>
  );
}

function Render(props) {
  const { active, position } = props;

  const group = useRef();

  const [initialPosition] = useState(position);
  // const [text, setText] = useState(1);
  const [text, setText] = useThrottledState(1, 200);

  const keys = useKeyboard();
  const gpIndex = useGamepad();

  // console.log('render')

  useFrame(() => {
    if (!active) return;

    const rotation = 0.02;
    const speed = 0.6;

    function left() {
      group.current.position.x -= speed;
    }

    function right() {
      group.current.position.x += speed;
    }

    function up() {
      group.current.position.y += speed;
    }

    function down() {
      group.current.position.y -= speed;
    }

    if (keys.length) {
      if (keys.includes(37)) {
        // left

        left();
      }

      if (keys.includes(39)) {
        // right

        right();
      }

      if (keys.includes(38)) {
        // up

        up();
      }

      if (keys.includes(40)) {
        // down

        down();
      }
    } else if (gpIndex !== null) {
      const gp = navigator.getGamepads()[gpIndex];

      const { buttons, axes } = gp;

      const [
        X,
        CIRCLE,
        SQUARE,
        TRIANGLE,
        L1,
        R1,
        L2,
        R2,
        SHARE,
        OPTIONS,
        L_TRIGGER,
        R_TRIGGER,
        UP,
        DOWN,
        LEFT,
        RIGHT,
        START,
        PAD,
      ] = buttons;

      if (X.pressed) {
        // console.log('X');
      }
      if (TRIANGLE.pressed) {
        // console.log('TRIANGLE');
      }
      if (SQUARE.pressed) {
        // console.log('SQUARE');
      }
      if (CIRCLE.pressed) {
        // console.log('CIRCLE');
      }
      if (L1.touched) {
        // decrement();

        setText(text - 1);

        // console.log('L1');
      }
      if (R1.pressed) {
        // increment();

        setText(text + 1);

        // console.log('R1');
      }
      if (L2.pressed) {
        // console.log('L2');
      }
      if (R2.pressed) {
        // console.log('R2');
      }
      if (SHARE.pressed) {
        // console.log('SHARE');
      }
      if (OPTIONS.pressed) {
        // console.log('OPTIONS');
      }
      if (L_TRIGGER.pressed) {
        // console.log('L_TRIGGER');
      }
      if (R_TRIGGER.pressed) {
        // console.log('R_TRIGGER');
      }
      if (UP.pressed) {
        up();
      }
      if (DOWN.pressed) {
        down();
      }
      if (LEFT.pressed) {
        left();
      }
      if (RIGHT.pressed) {
        right();
      }
      if (START.pressed) {
        // console.log('START');
      }
      if (PAD.pressed) {
        //
      }

      const L_X = truncate(axes[0]);
      const L_Y = truncate(axes[1]);
      const R_X = truncate(axes[2]);
      const R_Y = truncate(axes[3]);

      group.current.position.x += speed * (Math.abs(L_X) > 0.2 ? L_X : 0);
      group.current.position.y += speed * (Math.abs(L_Y) > 0.2 ? L_Y : 0) * -1;

      group.current.rotation.y += rotation * 2 * (Math.abs(R_X) > 0.2 ? R_X : 0);
      group.current.rotation.x += rotation * 2 * (Math.abs(R_Y) > 0.2 ? R_Y : 0);
    }
  });

  return (
    <group
      ref={group}
      position={initialPosition}
      scale={[0.5, 0.5, 0.5]}
    >
      <Box
        {...props}
        onPointerOver={props.onPointerOver}
        onPointerOut={props.onPointerOut}
      />
      <Text>
        {text.toString()}
      </Text>
    </group>
  );
}

export default Render;
