const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack')


module.exports = (env, options) => {
    console.log(`Running Webpack ${webpack.version} in 'mode': ${options.mode}`);

    exported = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader"
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
            ]
        },
        output: {
            path: __dirname + '/public',
            publicPath: '/',
            filename: 'app.js'
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: "./src/index.html",
                filename: "./index.html",
            }),
            new webpack.DefinePlugin({
            }),        
        ],
        devServer: {
            historyApiFallback: true,
            contentBase: './',
            inline: true,
            watchOptions: {
                poll: true
            },
        },
    }

    return exported;
};