import * as path from 'path';
import * as webpack from 'webpack';
import WebpackNotifierPlugin from 'webpack-notifier';
import webpackMerge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';

const TARGET = process.env.NPM_TARGET_EVENT;
console.log(`target event is ${TARGET}`);

let outputFileName = 'app';
outputFileName += TARGET === 'prod' ? '.min.js' : '.js';

const mainConfig: webpack.Configuration = {
    entry: [
        'babel-polyfill', './index.jsx'
    ],
    output: {
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new WebpackNotifierPlugin()
    ],
    resolve: {
        modules: [
            path.resolve('.'),
            path.resolve('script'),
            path.resolve('script', 'views'),
            'node_modules'
        ],
        extensions: ['.js', '.jsx', '.ts', 'tsx', '.json']
    }
};

switch(TARGET) {
    case 'build': {
        webpackMerge(mainConfig, {
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: outputFileName,
                sourceMapFilename: '[file].map'
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        loaders: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    config: {
                                        path: 'postcss.config.js'
                                    }
                                }
                            },
                            'sass-loader'
                        ]
                    },
                    {
                        test: /\.less$/,
                        loaders: ['style-loader', 'css-loader', 'less-loader']
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader']
                    },
                    {
                        test: /\.(eot|ttf|svg|gif|png|jpg|otf|woff|woff2)$/,
                        loader: 'url-loader'
                    }
                ]
            },
            watchOptions: {
                poll: true
            },
            plugins: [
                new HtmlWebpackPlugin({
                    title: 'auth-flow',
                    template: 'index-template.ejs'
                })
            ]
        });

        break;
    }
    case 'dev': {
        webpackMerge(mainConfig, {
            devtool: 'eval-source-map',
            output: {
                filename: 'bundle.js',
                sourceMapFilename: '[file].map'
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        loaders: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    config: {
                                        path: 'postcss.config.js'
                                    }
                                }
                            },
                            'sass-loader'
                        ]
                    },
                    {
                        test: /\.less$/,
                        loaders: ['style-loader', 'css-loader', 'less-loader']
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader']
                    },
                    {
                        test: /\.(eot|ttf|svg|gif|png|jpg|otf|woff|woff2)$/,
                        loader: 'url-loader'
                    }
                ]
            },
            devServer: {
                contentBase: path.resolve(__dirname),
                historyApiFallback: true
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify('development')
                }),
                new FriendlyErrorsWebpackPlugin()
            ]
        });

        break;
    }
    case 'prod':
    default: {
        webpackMerge(mainConfig, {
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: outputFileName
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        loaders: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    config: {
                                        path: 'postcss.config.js'
                                    }
                                }
                            },
                            'sass-loader'
                        ],
                    },
                    {
                        test: /\.less$/,
                        loaders: ['style-loader', 'css-loader', 'less-loader']
                    },
                    {
                        test: /\.css$/,
                        use: ['style-loader', 'css-loader']
                    },
                    {
                        test: /\.(eot|ttf|svg|gif|png|jpg|otf|woff|woff2)$/,
                        loader: 'file-loader'
                    }
                ]
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                new HtmlWebpackPlugin({
                    title: 'auth-flow',
                    template: 'index-template.ejs'
                }),
                new webpack.optimize.AggressiveMergingPlugin(),
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
                new CompressionPlugin({
                    asset: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: /\.js$|\.css$|\.html$/,
                    threshold: 10240,
                    minRatio: 0
                }),
                new UglifyJsPlugin({
                    parallel: true,
                    uglifyOptions: {
                        compress: {
                            unsafe: true,
                            unsage_compos: true
                        },
                        output: {
                            comments: false
                        },
                        ie8: true
                    },
                    exclude: [/\.min\.js$/gi]
                })
            ]
        });
    }
}

export default mainConfig;