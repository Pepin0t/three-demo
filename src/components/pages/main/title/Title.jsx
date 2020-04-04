import React, { Suspense, useMemo } from 'react';

import { Canvas, useLoader, useUpdate } from 'react-three-fiber';
import { FontLoader, Vector3 } from 'three';

import styles from './Title.less';

function RenderTitle({
  children,
  ...props
}) {
  const font = useLoader(FontLoader, 'fonts/helvetiker_regular.typeface.json');

  const mesh = useUpdate(
    (current) => {
      const s = current;

      s.geometry.computeBoundingBox();
      const box = s.geometry.boundingBox.getSize(new Vector3());

      s.position.x = box.x / -2;
    },
    // [children],
  );

  const config = useMemo(
    () => ({
      font,
      size: 30,
      height: 1,
      curveSegments: 32,
      // bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 2.5,
      bevelOffset: 0,
      bevelSegments: 8,
    }),
    [font],
  );

  return (
    <group
      {...props}
    >
      <mesh
        ref={mesh}
        position={[0, (config.size / -2), 0]}
        // scale={[1, 1, 1]}
      >
        <textGeometry attach="geometry" args={[children, config]} />
        <meshStandardMaterial
          attach="material"
          color="#959595"
        />
      </mesh>
    </group>
  );
}

function Title() {
  return (
    <div className={styles.Title}>
      <Canvas camera={{ position: [0, 0, 100] }} orthographic>
        <ambientLight intensity={1} />
        {
          // <pointLight position={[-70, 0, 40]} />
        }
        <Suspense fallback={null}>
          <RenderTitle position={[0, 0, 0]}>
            Main
          </RenderTitle>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Title;
