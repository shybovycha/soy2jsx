const flatten = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc.concat(flatten(e)), []) : arr;

const deepCopy = (obj) => {
    if (Array.isArray(obj)) return [].slice.apply(obj);

    return Object.assign({}, obj);
};

module.exports = { flatten, deepCopy };
