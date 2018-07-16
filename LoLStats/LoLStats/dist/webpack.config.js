var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');
module.exports = {
    entry: { main: './Client/ts/index.ts' }
    //'./Client/css/style.less'
    ,
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    //use: ['css-loader', 'less-loader']
                    use: [{
                            loader: 'css-loader'
                        }, {
                            loader: 'less-loader', options: {
                                strictMath: true
                            }
                        }]
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
        new LiveReloadPlugin({})
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        ignored: /node_modules/
    },
    output: {
        publicPath: '/wwwwroot/dist/',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'wwwroot/dist')
    }
};
//# sourceMappingURL=webpack.config.js.map