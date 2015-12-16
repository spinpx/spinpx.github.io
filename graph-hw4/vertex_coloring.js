/*
 Coding Assignment: Vertex Coloring
 
 In this assignment, you are required to implement the algorithm described in Chapter 8.6, i.e., the vertex coloring problem.
 
 Requirements:
 
 • Generate a random graph with n(> 10) vertices and n(n − 1)/4 edges (you can do so by
 first generating a Kn and then delete a random half of its edges);
 
 • Implement the algorithm described in page 132-133 of the book (implement the algebraic
 device);
 
 • Output your final coloring scheme.
 
 You need to visualize both the generated graph and the coloring results: each vertex should receive one color and each independent set of vertices should receive the same color. Please verify the correctness of your output by examining the chromatic number. Use the code framework from the previous assignments.


 Set Operation in JS.
 http://www.2ality.com/2015/01/es6-set-operations.html

 */

(function(){
    //var n = 10;
    var n = parseInt(nodenum.value);
    vetex_coloring(n);
})();

function redraw(e) {
    var n = e.target.value;
    document.getElementById('graph').innerHTML = "Waiting...";
    console.log(n);
    vetex_coloring(n);
}

function vetex_coloring (n) {
    var graph = generate_random_graph(n);
    console.log(graph);
    
    var vetex_covering = logic_cal(g);
    console.log(vetex_covering);

    var independent_set = get_independent_sets(vetex_covering);
    console.log(independent_set);

    //c = ranger(n);
    var label = label_colors(independent_set, n);
    console.log(label);

    draw(graph, label);
}

function set_union(a, b) {
    return new Set([...a, ...b]);
}

function set_intersect(a, b) {
    return new Set([...a].filter(x => b.has(x)));
}

function set_diff(a, b) {
    return new Set([...a].filter(x => !b.has(x)));
}

function set_eq(a, b) {
    if (a.size != b.size) {
        return false;
    }

    return (set_diff(a, b).size === 0);
}

function ranger(n) {
    return Array.apply(null, {length: n}).map(Number.call, Number);
}

function generate_random_graph(n) {
    var i, x, y;
    g = new Array(n);
    one2n = ranger(n);
    for (i = 0; i < n; i++) {
        g[i] = new Set(one2n);
        g[i].delete(i);
    }

    for (i = 0; i < Math.ceil(n*(n-1)/4); ) {
        x = Math.floor(Math.random() * n);
        y = Math.floor(Math.random() * n);
        if (g[x].has(y)){
            g[x].delete(y);
            g[y].delete(x);
            i++;
        }
    }

    return g;
}

function arr_has_obj(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        if (set_eq(arr[i], obj)) {
            return true;
        }
    }
    return false;
}

function sort_by_size(a, b) {
    return a.size - b.size;
}

function sort_by_size2(a, b) {
    return b.size - a.size;
}

function logic_cal(g) {
    var i, j, c, tmp, new_covering;
    var covering = [new Set([0]), g[0]];
    for (i = 1; i < g.length; i++) {
        new_covering = [];
        for (j=0; j<covering.length; j++) {
            c = covering[j];
            // logic product
            tmp = set_union(new Set([i]), c);
            if (!arr_has_obj(new_covering, tmp)) {
                // logic sum
                new_covering.push(tmp);
            }
            tmp = set_union(g[i], c);
            if (!arr_has_obj(new_covering, tmp)) {
                new_covering.push(tmp);
            }
        }
        covering = new_covering;
    }

    covering.sort(sort_by_size);
    return covering;
}

function get_independent_sets(c) {
    var full_set = c[c.length-1]; // we are sure maximum vetex covering set is full.
    for (var i = 0; i < c.length; i++) {
        c[i] = set_diff(full_set, c[i]);
    }
    return c;
}

function label_colors(s, n) {
    var max_set, fin;
    var label = new Array(n);
    for (var l = 0; l < n; l ++) {
        label[l] = -1;
    }
    for (var i = 0; i < n; i++) {
        max_set = s.shift();
        for (var v of max_set) {
            label[v] = i;
        }
        // every node is assigned
        if (label.indexOf(-1) == -1) {
            break;
        }

        for (var j = 0; j < s.length; j++) {
            s[j] = set_diff(s[j], max_set);
        }

        s.sort(sort_by_size2);
    }
    return label;
}


function draw(g, c) {
    var s = "strict graph { ";
    s+= colorful(c);
    for (var i = 0; i < g.length; i++) {
        for (var v of g[i]) {
            s += (i + " -- " + v + ';');
        }
    }
    s+= '}';
    document.getElementById('graph').innerHTML = Viz(s);
}

function colorful(c) {
    var colors = [
    '#800000', '#008000', '#808000', '#000080', '#800080', '#008080',
    '#c0c0c0', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff',
    '#00ffff', '#ffffff', '#000000', '#00005f', '#000087', '#0000af', '#0000d7',
    '#0000ff', '#005f00', '#005f5f', '#005f87', '#005faf', '#005fd7', '#005fff',
    '#008700', '#00875f', '#008787', '#0087af', '#0087d7', '#0087ff', '#00af00',
    '#00af5f', '#00af87', '#00afaf', '#00afd7', '#00afff', '#00d700', '#00d75f',
    '#00d787', '#00d7af', '#00d7d7', '#00d7ff', '#00ff00', '#00ff5f', '#00ff87',
    '#00ffaf', '#00ffd7', '#00ffff', '#5f0000', '#5f005f', '#5f0087', '#5f00af',
    '#5f00d7', '#5f00ff', '#5f5f00', '#5f5f5f', '#5f5f87', '#5f5faf', '#5f5fd7',
    '#5f5fff', '#5f8700', '#5f875f', '#5f8787', '#5f87af', '#5f87d7', '#5f87ff',
    '#5faf00', '#5faf5f', '#5faf87', '#5fafaf', '#5fafd7', '#5fafff', '#5fd700',
    '#5fd75f', '#5fd787', '#5fd7af', '#5fd7d7', '#5fd7ff', '#5fff00', '#5fff5f',
    '#5fff87', '#5fffaf', '#5fffd7', '#5fffff', '#870000', '#87005f', '#870087',
    '#8700af', '#8700d7', '#8700ff', '#875f00', '#875f5f', '#875f87', '#875faf',
    '#875fd7', '#875fff', '#878700', '#87875f', '#878787', '#8787af', '#8787d7',
    '#8787ff', '#87af00', '#87af5f', '#87af87', '#87afaf', '#87afd7', '#87afff',
    '#87d700', '#87d75f', '#87d787', '#87d7af', '#87d7d7', '#87d7ff', '#87ff00',
    '#87ff5f', '#87ff87', '#87ffaf', '#87ffd7', '#87ffff', '#af0000', '#af005f',
    '#af0087', '#af00af', '#af00d7', '#af00ff', '#af5f00', '#af5f5f', '#af5f87',
    '#af5faf', '#af5fd7', '#af5fff', '#af8700', '#af875f', '#af8787', '#af87af',
    '#af87d7', '#af87ff', '#afaf00', '#afaf5f', '#afaf87', '#afafaf', '#afafd7',
    '#afafff', '#afd700', '#afd75f', '#afd787', '#afd7af', '#afd7d7', '#afd7ff',
    '#afff00', '#afff5f', '#afff87', '#afffaf', '#afffd7', '#afffff', '#d70000',
    '#d7005f', '#d70087', '#d700af', '#d700d7', '#d700ff', '#d75f00', '#d75f5f',
    '#d75f87', '#d75faf', '#d75fd7', '#d75fff', '#d78700', '#d7875f', '#d78787',
    '#d787af', '#d787d7', '#d787ff', '#d7af00', '#d7af5f', '#d7af87', '#d7afaf',
    '#d7afd7', '#d7afff', '#d7d700', '#d7d75f', '#d7d787', '#d7d7af', '#d7d7d7',
    '#d7d7ff', '#d7ff00', '#d7ff5f', '#d7ff87', '#d7ffaf', '#d7ffd7', '#d7ffff',
    '#ff0000', '#ff005f', '#ff0087', '#ff00af', '#ff00d7', '#ff00ff', '#ff5f00',
    '#ff5f5f', '#ff5f87', '#ff5faf', '#ff5fd7', '#ff5fff', '#ff8700', '#ff875f',
    '#ff8787', '#ff87af', '#ff87d7', '#ff87ff', '#ffaf00', '#ffaf5f', '#ffaf87',
    '#ffafaf', '#ffafd7', '#ffafff', '#ffd700', '#ffd75f', '#ffd787', '#ffd7af',
    '#ffd7d7', '#ffd7ff', '#ffff00', '#ffff5f', '#ffff87', '#ffffaf', '#ffffd7',
    '#ffffff', '#080808', '#121212', '#1c1c1c', '#262626', '#303030', '#3a3a3a',
    '#444444', '#4e4e4e', '#585858', '#626262', '#6c6c6c', '#767676', '#808080',
    '#8a8a8a', '#949494', '#9e9e9e', '#a8a8a8', '#b2b2b2', '#bcbcbc', '#c6c6c6',
    '#d0d0d0', '#dadada', '#e4e4e4', '#eeeeee'
    ];
    //colors = ['yellow', 'red', 'blue', 'green', ''];
    var s = "node[style=filled];";
    for (var k in c) {
        s+= k + "[fillcolor=\"" + colors[c[k]] +"\"];";
    }
    return s;
}
