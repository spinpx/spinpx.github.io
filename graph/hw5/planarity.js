/*
 Coding Assignment: Planarity Algorithm
 This assignment requires you to implement the algorithm described in Chapter 9.8, i.e., the planarity algorithm. You need to implement the algorithm in full details and validate the correctness of your algorithm on the following test cases:
 - Test on K5 and K3,3;
 - Test on the Tutte graph of Figure 9.25;
 - Test on a random graph generate by your program: generate a Kn (n > 10) then randomly delete a certain portion (say 70%) of the edges.
 You need to visualize the original graphs in your program but not necessary the planar embed- ding. However, if you also visualize the planar embedding, you will earn extra credits .
 */
(function() {
    //var n = 10;
    var n = parseInt(nodenum.value);

    var g = g_random_graph(n);
    p_draw(g);
})();

function p_redraw(e) {
    var n = e.target.value;
    var g = g_random_graph(n);
    p_draw(g);
}

function p_draw(g) {
    document.getElementById('p-graph').innerHTML = "Waiting...";
    document.getElementById('p-result').innerHTML = "";
    draw(g, 'p-graph');
    planarity(g);
}

function p_k5() {
    var g = g_k5();
    p_draw(g);
}

function p_k33() {
    var g = g_k33();
    p_draw(g);
}

function g_k5() {
    var k5 = new Array(5);
    for (var i = 0; i < k5.length; i++) {
        k5[i] = ranger(5);
		    k5[i].remove(i);
    }
    return k5;
}

function g_k33() {
	  var k33 = new Array(6);
	  var i;
	  for (i = 0; i < 3; i++) {
		    k33[i] = [3,4,5];
	  }
	  for (i = 3; i < 6; i++) {
		    k33[i] = [0,1,2];
	  }
	  return k33;
}

function g_tutte_graph() {
	  // TODO: draw tutte
}

function g_random_graph(n) {
	  //TRADEOFF: Set or Array
	  var i, x, y;
    g = new Array(n);
    for (i = 0; i < n; i++) {
        g[i] = ranger(n);
        g[i].remove(i);
    }

    for (i = 0; i < Math.ceil(n*(n-1)/8*3); ) {
        x = Math.floor(Math.random() * n);
        y = Math.floor(Math.random() * n);
        if (g[x].indexOf(y) >= 0){
            g[x].remove(y);
            g[y].remove(x);
            i++;
        }
    }
    return g;
}
function small_block(b) {
	  var v = 0;
	  for (var i = 0; i < b.length; i++) {
		    if (b[i].length > 0) {
			      v++;
		    }
	  }
	  return v <= 4;
}

function planarity(g) {
	  var h, c, p, gtmp, faces;
	  var blocks = split_into_blocks(g);
    console.log('there are '+ blocks.length+ ' blocks');
    p_report('there are '+ blocks.length+ ' blocks');
	  for (var i = 0; i < blocks.length; i++) {
		    // Find bridges of Gi, pick any bridge B, find a path P connecting any two of its attachment.
		    // Concat H+P.
		    // until there is not edge in Gi

		    // small block (v<=4) are plannar.
		    if (small_block(blocks[i])) {
		        console.log(i + 'th block is planar.');
		        p_report(i + 'th block is planar.');
			      continue;
		    }

		    faces = [];
		    gtmp = clone(blocks[i]);
		    // v>=3 blocks, any 2 vertices in a common cycle.
		    h = get_cycle(clone(blocks[i]));
		    faces[0] = clone(h);
		    faces[1] = clone(h);
		    c = clone(h);
		    c.push(c[0]);
		    gtmp = remove_path_edges(gtmp, c);
		    while(1) {
			      p = get_path(gtmp, h);
			      if (p.length === 0) {
				        console.log(i + 'th block is planar.');
				        p_report(i + 'th block is planar.');
                break;
			      }
			      for (var j = 1; j < p.length -1; j ++ ) {
				        h.push(p[j]);
			      }
			      gtmp = remove_path_edges(gtmp, p);

			      // check face
			      var k;
			      for (k = 0; k < faces.length; k++) {
                var fl = faces[k].indexOf(p[0]);
                var fr = faces[k].indexOf(p[p.length-1]);
				        if (fl >= 0 && fr >=0) {
					          var ftmp1 = [];
                    var ftmp2 = [];
					          // break face
                    if (fl < fr) {
                        ftmp1 = faces[k].slice(0, fl).concat(p, faces[k].slice(fr+1));
                        p.reverse();
                        ftmp2 = faces[k].slice(fl+1, fr).concat(p);
                    } else {
                        ftmp2 = faces[k].slice(fr+1, fl).concat(p);
                        p.reverse();
                        ftmp1 = faces[k].slice(0, fr).concat(p, faces[k].slice(fl+1));
                    }
                    faces[k] = ftmp1;
                    faces.push(ftmp2);
					          break;
				        }
			      }
			      if (k == faces.length) {
				        console.log('no plannar');
                p_report('The graph is no plannar!!');
				        return false;
			      }
		    }
	  }
    console.log('all blocks is planar, this graph is planar.');
    p_report('all blocks is planar, this graph is planar.');
    return true;
}

/*
 Split G into blcoks G1, G2 ....
 -------------------------------------------------
 - O(mn) algorithm
 -------------------------------------------------
 Form a stack S that contains all vertices.
 While S != empty do (n iterations)
 v := Pop(S)
 If G − v is disconnected then
 Split G into its extended v-components.
 -------------------------------------------------
 */
function split_into_blocks(g) {
	  var blocks = [g];
	  var com1, com2, b1, b2;
	  var i;
 	  var stk = [];
    
	  for (i = 0; i < g.length; i++) {
		    if (g[i].length > 0) {
			      stk.push(i);
		    }
	  }
	  var live_v = clone(stk);
    if (live_v.length <= 4) {
        return blocks;
    }
	  while (stk.length > 0) {
		    var v = stk.pop();
		    var component = get_component(g, 0, v);
		    if (component.length < live_v.length - 1) {
			      com1 = component.concat(v);
			      com2 = diff_arr(live_v, component);
			      b1 = clone(g);
			      b2 = clone(g);
			      for (i = 0; i < g.length; i++) {
				        b1[i] = intersect_arr(b1[i], com1);
				        b2[i] = intersect_arr(b2[i], com2);
				        if (com1.indexOf(i) < 0) {
					          b1[i] = [];
				        }
                if (com2.indexOf(i) < 0) {
					          b2[i] = [];
				        }
			      }
			      blocks = split_into_blocks(b1);
			      blocks = blocks.concat(split_into_blocks(b2));
			      break;
		    }
	  }
	  return blocks;
}

function get_component(g, v0, soft_deleted) {
	  //bfs
	  v0 = v0 || 0;
	  while (soft_deleted === v0 || g[v0].length === 0) {
		    v0 = (v0 + 1) % (g.length - 1);
	  }
	  var visited = [v0];
	  var q = [v0];
	  //console.log(v0);
	  //console.log(g);
	  while (q.length > 0) {
		    var v = q.shift();
		    for (var i = 0; i < g[v].length; i++) {
			      var k = g[v][i];
			      if (k !== soft_deleted && visited.indexOf(k) < 0) {
				        q.push(k);
				        visited.push(k);
			      }
		    }
	  }
	  return visited;
}


function get_cycle(g, v0) {
    // find a cycle H in Gi
	  v0 = v0 || 0;
	  var prev = -1;
	  while (g[v0].length === 0) {
		    v0 = (v0 + 1) % (g.length - 1);
	  }
	  var cycle = [];
	  var j = g.length;
	  while (g[v0].length > 0 && j--) {
		    cycle.push(v0);
		    for (var i = 0; i < g[v0].length; i++) {
			      if (cycle.indexOf(g[v0][i]) < 0) {
				        prev = v0;
				        v0 = g[v0][i];
				        break;
			      } else if (g[v0][i] != prev){
				        //cycle.push(cycle[0]);
                cycle = cycle.slice(cycle.indexOf(g[v0][i]));
				        return cycle;
			      }
			      if (i === g[v0].length - 1) {
				        return [];
			      }
		    }
	  }
	  return [];
}

function remove_path_edges(g, c) {
	  var u, v;
	  for (var i = 0; i < c.length - 1; i++) {
		    u = c[i];
		    //v = c[(i + 1) % (c.length)];
		    v = c[i+1];
		    g[u].remove(v);
		    g[v].remove(u);
	  }
	  return g;
}

function get_path(g, h) {
	  // bfs
	  var i, j, k, v0, v, q, visited;
	  var suc = [];
	  for (i = 0; i < h.length; i++) {
		    v0 = h[i];
		    if (g[h[i]].length > 0) {
			      q = [v0];
			      visited = [];
			      visited[v0] = true;
			      suc[v0] = -1;
			      while (q.length) {
				        v = q.shift();
				        if (h.indexOf(v) >= 0 && suc[v] >= 0) {
					          var path = [];
					          while (v !== undefined && v >= 0) {
						            path.push(v);
						            v = suc[v];
					          }
					          return path;
				        }
				        for (j = 0; j < g[v].length; j++) {
					          k = g[v][j];
					          if (!visited[k]) {
						            q.push(k);
						            suc[k] = v;
						            visited[k] = true;
					          }
				        }
			      }
		    }
	  }
	  return [];
}

function p_report(s) {
    var t = document.getElementById('p-result').innerHTML;
    t = t +  s + '\n';
    document.getElementById('p-result').innerHTML = t;
}
