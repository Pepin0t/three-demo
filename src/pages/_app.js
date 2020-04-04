import PropTypes from 'prop-types';
import Head from 'next/head';
// import Header from '~/components/common/Header/Header';

import '~/assets/styles.less';

function Wrapper(props) {
  const { children } = props;

  return (
    <div>
      {/* <Header /> */}
      {children}
    </div>
  );
}

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};


function MyApp({ Component, pageProps }) {
  return (
    <Wrapper>
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </Wrapper>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.instanceOf(Object).isRequired,
};

export default MyApp;
