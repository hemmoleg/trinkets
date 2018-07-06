var path = require('path');

module.exports = {
    entry: './wwwroot/js/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        
        ignored: /node_modules/
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'wwwroot/dist')
    }
};
