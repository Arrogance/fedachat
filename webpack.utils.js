const path = require('path');
const fs = require('fs');

exports.getEntry = () => {
    const ROUTES_PATH = path.resolve(__dirname, './src/pages');
    const routesArray = fs.readdirSync(ROUTES_PATH);
    let result = {};

    for (let item of routesArray) {
        result[item] = `@/pages/${item}/${item}.js`;
    }

    return result;
};
