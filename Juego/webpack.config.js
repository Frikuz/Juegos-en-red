const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/client/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
     static: path.join(__dirname, 'dist'),
    hot: true,
    port: 8080
  },
  externals: {
    phaser: "Phaser"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./dist/index.html",
      inject: false
    })
  ],
  resolve: {
    extensions: [".js"]
  }
};
