import React from 'react';

import Title from '~/components/pages/main/title/Title';
import Scene from '~/components/pages/main/scene/Scene';

import styles from './Main.less';

export async function getStaticProps() {
  const data = 'kuku';

  return {
    props: {
      data,
    },
  };
}

function Main() {
  return (
    <div className={styles.Main}>
      {
        // <Title />
      }
      <Scene />
    </div>
  );
}

export default Main;
