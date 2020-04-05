const path = require('path');

module.exports = {
	'extends': [
		'airbnb',
		'airbnb/hooks'
	],
  'rules': {
    'global-require': 0,
    'no-console': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension' : 0,
    'react/jsx-props-no-spreading' : 0,
    'react/jsx-fragments' : 0,
    'jsx-a11y/anchor-is-valid': 0,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['~', path.resolve(__dirname, 'src')]
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    }
  },
  env: {
    browser: true,
    node: true
  }
}

