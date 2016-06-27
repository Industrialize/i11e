var path = require('path');
module.exports = {
    entry: './lib/web-entry.js',
    output: {
        path: path.join(__dirname, "build"),
        filename: 'i11e.js'
    },
    module: {
      loaders: [
        {
          test: path.join(__dirname, "lib"), // /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel', // 'babel-loader' is also a legal name to reference
          query: {
            presets: ['es2015']
          }
        }
      ]
    }
};
