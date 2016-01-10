/*
In this project, you are required to implement the Markov Cluster Algorithm introduced by Stijn van Dongen. See also in the following website: http://micans.org/mcl/. I am attaching the presentation slides (in pdf) for your reference.
Please implement the algorithm as described in the thesis and the presentation slides and test your algorithm on the example graphs included in the four files in folder: test graphs. The graph formats are self-explanatory in each individual files, e.g., “1 0:0.50000000” means vertex 1 has a link with vertex 0 where the weight of the link is 0.5.

You need to visualize the final clustering results in your program, one color per cluster. Please also visualize the attractors as in the example of website. Test on different parameter sets of expansion and inflation and analyze your results/discoveries in a report.

 */
(function() {
    var g = small_example();
    mcl(g);
})(); 

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
    e = e || 2;
    r = r || 2;
    g = add_self_loop(g);
    g = mtx_normalize(g);
    var prev_g = [];
    show_mtx(g);
    while (!mtx_eq(prev_g, g)) {
        prev_g = g;
        g = clone(g);
        g = expansion(g, e);
        var ttt = clone(g);
        show_mtx(ttt);
        g = inflation(g, r);
        show_mtx(g);
        //break;
    }

    draw(g);
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

function draw(g) {
    
}

function new_matrix(d) {
    
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
