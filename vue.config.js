
module.exports = {
    publicPath: '/',
    devServer: {
        proxy: 'http://localhost:8080/question'
    }
};