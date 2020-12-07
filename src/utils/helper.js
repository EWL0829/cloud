export const flattenArr = (arr) => {
    // reduce的第一个参数为函数，该函数的参数分别为之前的处理结果和当前的值
    // reduce的第二个参数为初始值，如果不传递，则为默认数组的第一个值
    return arr.reduce((map, item) => {
        map[item.id] = item;
        return map;
    }, {});
};

export const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key]);
};
