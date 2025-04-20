const webpack = require('webpack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "asset/resource"
      }
    ]
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(qcms_bg\.wasm|openjpeg\.wasm)$/
    })
  ]
};