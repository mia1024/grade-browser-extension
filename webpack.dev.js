const common = require("./webpack.common.js")
const {merge} = require("webpack-merge")
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin")

module.exports = merge(common, {
    mode: "development",
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        port: 9000,
    },
    devtool:"source-map",
    plugins: [
        new CopyPlugin({
                patterns: [
                    {from: "src/manifest.json", to: path.resolve(__dirname, "dist", "manifest.json")}
                ]
            }
        ),
    ]
})
