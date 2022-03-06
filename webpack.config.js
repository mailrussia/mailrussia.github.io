const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    entry: {
        index: './src/index.js'
    },
    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
    output: {
        path: path.resolve(__dirname),
        filename: '[name].js',
    },
    devServer: {
        port: 4000,
    },
    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: { crypto: false, path: false, fs: false }
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            // filename: "src/demo.html",
            template: "src/index.html",
            // inject: false,
        })
    ],
}

module.exports = (env) => {

    console.log(process.env.WEBPACK_SERVE ? 'SERVING DEVELOPMENT ...' : 'BUILDING PRODUCTION ...');

    if (process.env.WEBPACK_SERVE) {
        config.devtool = 'eval-cheap-source-map';
        config.stats = {warnings: false};
    }

    return config;
}