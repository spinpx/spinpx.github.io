/*
Max-flow Min-cut Algorithm: Edmonds and Karps (1970)
This assignment requires you to implement the algorithm described in Chapter 11 (page 197 - page 202) to solve the max flow problem.
Requirements:
- Generate a directed graph with n vertices (n > 8) (you can used the graphs in Figure 11.2 or Figure 11.7);
- Implement the algorithm by iteratively finding the f-incrementing paths and updating the flow function;
- Validate your algorithm by randomly changing the capacity or direction of arcs and run your algorithm again, do this for at least 3 times (each time your modify the network you need to compute a maximum flow).
You need to visualize the resulting network with flow (in red) and capacity (in blue), manually check the correctness if necessary.
*/

(function() {
    var g = g_11_7();
    var f = maxflow(g);
    di_draw(g, f, 'f-graph');
})();

function maxflow(g) {
    var s = 0;
    var t = g.length - 1;
    var f = init_flow(g.length);
    var gf = get_residual_graph(g, f);
    /*
     while there exists augmenting path P {
        f = agument (f, c, P)
        update gf
     }
     return f
     */
    var label, path;
    while (1) {
        var tmp = find_path_bfs(g, gf);
        label = tmp[0];
        path = tmp[1];
        console.log(path);
        if (label === 0) {
            break;
        }
        // update flow
        var u, v;
        for (var i = 0; i < path.length-1; i++) {
            f[path[i]][path[i+1]] =  f[path[i]][path[i+1]] + label;
            // reverse?
            //f[path[i+1]][path[i]] =  f[path[i+1]][path[i]] - label;
        }
        gf = get_residual_graph(g, f);
    }
    return f;
}

function init_flow(n) {
    var f = [];
    for (var i = 0; i < n; i++) {
        f[i] = new Array(n);
        for(var j = 0; j < n; j++) {
            f[i][j] = 0;
        }
    }
    return f;
}

function get_residual_graph(g, f) {
    var gf = [];
    var i, j;

    for (i=0; i<g.length; i++) {
        gf[i] = new Array(g.length);
        for (j=0; j<g.length; j++) {
            gf[i][j] = Infinity;
        }
    }
    for (i = 0; i < g.length; i++) {
        for (j = 0; j < g.length; j++) {
            if (isFinite(g[i][j])) {
                gf[i][j] = g[i][j] - f[i][j];
                gf[j][i] = f[i][j];
            }
        }
    }
    return gf;
}

function find_path_bfs(g, gf) {
    // find a path from s to t.
    var s = 0;
    var t = g.length - 1;
    // label method?
    var suc = new Array(g.length);
    var label = [];
    for (var k = 0; k < g.length; k++) {
        suc[k] = -1;
        label[k] = Infinity;
    }
	  var q = [s];
	  while (q.length > 0) {
		    var v = q.shift();
		    for (var i = 0; i < g.length; i++) {
            if (isFinite(g[v][i]) && suc[i] === -1 && gf[v][i] > 0) {
                console.log(i);
                suc[i] = v;
                label[i] = Math.min(label[v], gf[v][i]);
                if (i != t) {
                    q.push(i);
                } else {
                    var path  = [];
                    var vt = t;
                    while (vt >= 0) {
                        path.unshift(vt);
                        vt = suc[vt];
                    }
                    return [label[t], path];
                }
            }
		    }
	  }
    return [0, []];
}

function g_11_7() {
	var g = [
		[Infinity, 6, Infinity, 4, Infinity, Infinity, Infinity],
		[Infinity, Infinity, Infinity, 1, 3, Infinity, Infinity],
		[Infinity, 3,Infinity, Infinity, Infinity, 5, Infinity],
		[Infinity, Infinity, 5, Infinity, Infinity, 1, 4],
		[Infinity, Infinity, Infinity, Infinity, Infinity, 2, Infinity],
		[Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, 5],
		[Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity]
	];
	return g;
}
function get_label (i, len) {
	var label = '';
	if (i === 0) {
		label = 's';
	} else if (i == len-1) {
		label = 't';
	} else {
		label = 'v' + i;
	}
	return label;
}
function di_draw(g, f, t) {
    t = t || 'f-graph';
	console.log('draw pic ...');
    var s = "strict digraph { rankdir=LR;";
    for (var i = 0; i < g.length; i++) {
        for (var j = 0; j < g[i].length; j++) {
			if (isFinite(g[i][j])) {
          s += (get_label(i, g.length) + " -> " + get_label(j, g.length) + '[label = "' + g[i][j] + '(' + f[i][j] + ')' + '"];');
			}
        }
    }
    s += '}';
    document.getElementById(t).innerHTML = Viz(s);
}
