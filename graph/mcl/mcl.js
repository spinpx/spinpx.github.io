/*
In this project, you are required to implement the Markov Cluster Algorithm introduced by Stijn van Dongen. See also in the following website: http://micans.org/mcl/. I am attaching the presentation slides (in pdf) for your reference.
Please implement the algorithm as described in the thesis and the presentation slides and test your algorithm on the example graphs included in the four files in folder: test graphs. The graph formats are self-explanatory in each individual files, e.g., “1 0:0.50000000” means vertex 1 has a link with vertex 0 where the weight of the link is 0.5.

You need to visualize the final clustering results in your program, one color per cluster. Please also visualize the attractors as in the example of website. Test on different parameter sets of expansion and inflation and analyze your results/discoveries in a report.

 */
var MCL = {
    current: 'honey',
    exp_p: 2,
    inf_p: 2,
    epochs: 50
};

(function() {
    start_mcl(MCL.current);
})();

function start_mcl(name) {
    var file_name = name + '.mci.json';
    var ajax = new Ajax();
    var url = 'http://sub.spinpx.com/graph/mcl/test_graphs/';
    url = './test_graphs/';
    if (MCL[name]) {
        mcl(MCL[name]);
    } else {
        ajax.get(url + file_name).always(function( response, xhr ) {
            console.log(response)
            var m = new_matrix(response);
            console.log(m)
            MCL[name] = m; // cache
            mcl(m);
        });
    }
}

function mcl(g, e, r) {
   /*
    arguments:
    @g: undirected graph
    @e: power parameter,  default:2
    @r: inflation parameter,  default:2

    @return:

    Algorithm:
    1. Input is an un-directed graph, power parameter e, and inflation parameter r.
    2. Create the associated matrix
    3. Add self loops to each node (optional)
    4. Normalize the matrix
    5. Expand by taking the e-th power of the matrix
    6. Inflate by taking inflation of the resulting matrix with parameter r
    7. Repeat steps 5 and 6 until a steady state is reached (convergence).
    8. Interpret resulting matrix to discover clusters.
    */
    e = e || MCL.exp_p;
    r = r || MCL.inf_p;
    var raw_g = clone(g);
    g = clone(g);

    g = add_self_loop(g);
    g = mtx_normalize(g);
    var prev_g = [];
    //show_mtx(g);
    var epochs = MCL.epochs;
    while (!mtx_eq(prev_g, g) && epochs--) {
        prev_g = g;
        g = clone(g);
        g = expansion(g, e);
        g = inflation(g, r);
        //show_mtx(g);
        //break;
    }
    var groups = {};
    for(var i = 0; i < g.length; i++) {
        for (var j = 0; j < g.length; j++) {
            if (g[i][j] > 1e-4) {
                groups[j] = i;
            }
        }
    }
    draw(raw_g, groups);
}


function expansion (g, e) {
    /*
     responsity: for allowing flow to connect different regions of the graph.
     arguments:
     @e: power
     @return: A^{e}
     */
    var tmp = clone(g);
    for (var i = 1; i < e; i++) {
        tmp = mtx_mul(tmp, g);
    }
    return tmp;
}

function inflation (g, r) {
    /*
     responsity: forboth strengthening and weakening of current.
     arguments:
     @r: power coefficient
     @return: rm = m^r / sum (m^r)
     */
    g = mtx_scale(g, r);
    g = mtx_normalize(g);
    return g;
}

function small_example() {
    // example in the slide. p21
    var g = [
        [0, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 0],
        [1, 1, 0, 0]
    ];
    return g;
}

function new_matrix(d) {
    /*
     read graph from json dict
     @d: dict
     @return: a graph (mtrix)
     */
    var m = new Array(d.dim);
    var i, j;
    for(i = 0; i < d.dim; i++) {
        m[i] = new Array(d.dim);
        for(j = 0; j < d.dim; j++) {
            m[i][j] = 0;
        }
    }
    for(i = 0; i < d.dim; i++) {
        for(j = 0; j < d.dim; j++) {
            if (d.graph[i] && d.graph[i][j]) {
                m[i][j] = d.graph[i][j];
                m[j][i] = d.graph[i][j];
            }
        }
    }
    return m;
}

function mtx_normalize(m) {
    var sum = new Array(m.length);
    var i, j;
    for (i = 0; i < m.length; i++) {
        sum[i] = 0;
        for (j = 0; j < m.length; j++) {
            sum[i] += m[j][i];
        }
    }

    for (i = 0; i < m.length; i++) {
        for (j = 0; j < m.length; j++) {
            m[i][j] = m[i][j] / sum[j];
        }
    }
    return m;
}

function add_self_loop(m) {
    console.log(m)
    if (m[0][0] === 0) {
        for (var i = 0; i < m.length; i++) {
            m[i][i] = 1;
        }
    }
    return m;
}

function mtx_eq(m1, m2) {
    if (m1.length != m2.length) {
        return false;
    }
    for (var i = 0; i < m1.length; i++) {
        if (m1[i].length != m2[i].length) {
            return false;
        }
        for(var j = 0; j < m1.length; j++) {
            if (Math.abs(m1[i][j] - m2[i][j]) > 1e-4) {
                return false;
            }
        }
    }
    return true;
}

function mtx_scale(m, k) {
    for (var i = 0; i < m.length; i++) {
        for(var j = 0; j < m.length; j++) {
            m[i][j] = Math.pow(m[i][j], k);
        }
    }
    return m;
}

function mtx_mul(m1, m2) {
    var m = new Array(m1.length);
    for(var i = 0; i < m1.length; i++) {
        m[i] = new Array(m2[0].length);
        for(var j = 0; j < m2[0].length; j++) {
            m[i][j] = 0;
            for(var k = 0; k < m1[0].length; k++) {
                m[i][j] += (m1[i][k] * m2[k][j]);
            }
        }
    }
    return m;
}

function clone(src) {
    var result;
    if (src === null || typeof(src) != "object") {
		    result = src;
    } else if (src.constructor == Array || src.constructor == Object){ 
	      result = new src.constructor();
	      for (var i in src) {
            result[i] = clone(src[i]);
	      }
    } else{ //Date,Regex
        result =  new src.constructor(src);
    }
    return result;
}

function show_mtx(m) {
    console.log('[');
    for(var i = 0; i < m.length; i++) {
        console.log(m[i]);
    }
    console.log('];');
}

function switch_data(e) {
    var name = e.target.value;
    MCL.current = name;
    var prev = document.getElementById('current-data');
    prev.removeAttribute('id');
    e.target.setAttribute('id', 'current-data');
    var m = start_mcl(name);
    
}

function update_para(e) {
    var p = e.target.value;
    var t = e.target.id;
    MCL[t] = p;
    mcl(MCL[MCL.current]);
}

function draw(g, c) {
    var s = "strict graph { rankdir=LR;  splines=false;";
    if (g.length > 30) {
        s += "ranksep = 0.1; nodesep = 0.2;"; 
    }
    if (g.length > 50) {
        s += "node[height=0.02, width=0.02, fontsize=8];  size=\"14,15!\"";
    }
    s+= colorful(c);
    for (var i = 0; i < g.length; i++) {
        for (var j = 0; j < g[i].length; j++) {
            if (i == j) {
                continue;
            }
            if (g[i][j] > 0) {
                s += (i + " -- " + j + ';');
            }
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
