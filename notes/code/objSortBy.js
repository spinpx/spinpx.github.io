/**
 * @obj: target Object
 * @attr: sort by which attribute
 * @func: special compare functions
 */

var objSortBy = function(obj, attr, func){
    var compareFunc = func || function(a, b){ return (a - b);};
    return (Object.keys(obj).sort(function(a, b) {
        if (attr === undefined) {
            return compareFunc(obj[a], obj[b]);
        }
        return compareFunc(obj[a][attr], obj[b][attr]);
    }));
};

var testObj = {a: {num: 11}, b: {num: 2}, c:{num: 33}};
console.log(objSortBy(testObj, 'num'));

console.log(objSortBy(testObj, 'num', function(a, b){ return(b-a);}));

var testObj2 = {a: 11, b: 2, c: 33};
console.log(objSortBy(testObj2));
