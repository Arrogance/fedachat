const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');
const PATHS = {
    src: path.resolve(__dirname, 'src'),
    server: path.resolve(__dirname, 'server'),
    style: path.resolve(__dirname, 'style'),
    build: path.resolve(__dirname, 'public'),
    images: path.join(__dirname, 'images')
};

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        app: PATHS.src + '/app.js'
    },
    output: {
        path: PATHS.build,
        filename: 'app.js'
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.common.js'
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: '/.js(?.*)?$/i'
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    process.env.NODE_ENV === 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: 'css-loader'
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader'
                    }
                ]
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'url-loader?limit=10000&mimetype=image/svg+xml'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: PATHS.images, to: path.join(PATHS.build, 'images') }
        ]),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin()
    ],
    devServer: {
        contentBase: PATHS.build,
        disableHostCheck: true,
        host: '0.0.0.0',
        compress: true,
        port: 9000
    }
};