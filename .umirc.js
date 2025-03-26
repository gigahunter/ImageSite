/*
var js = `export default {};
`;

var fs = require('fs');
fs.writeFile('./src/config.js', js, function(err) {
  if (err) {
    throw err;
  }
});
*/

export default {
  es5ImcompatibleVersions: true,
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: {
          immer: true,
        },
        antd: true,
        routes: {
          exclude: [
            /model\.(j|t)sx?$/,
            /service\.(j|t)sx?$/,
            /models\//,
            /components\//,
            /services\//,
            /assets\//,
          ],
        },
        dll: {
          exclude: [],
          include: [
            'dva',
            'dva/router',
            'dva/saga',
            'dva/fetch',
            'antd/es',
            'tui-code-snippet',
            'jimp',
          ],
        },
      },
    ],
  ],

  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    fabric: 'window.fabric',
  },

  proxy: {
    '/api': {
      //target: 'http://localhost/imageweb_MOTC/api',
      target: "http://localhost:5500/api",
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
};
