const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // Import MiniCssExtractPlugin
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/accessibility.js", // Your JS entry file
  output: {
    filename: "accessibility.bundle.js", // JS bundle
    path: path.resolve(__dirname, "dist"), // Output directory for both JS and CSS
    library: "AccessibilityTool", // Expose the bundle as a global object
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS to a separate file
          "css-loader", // Load the CSS
        ],
      },
    ],
  },
  optimization: {
    minimize: true, // Minimize the JS bundle
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "accessibility.bundle.css", // Name of the CSS file
    }),
  ],
  mode: "production", // Set mode to production for optimization
};
