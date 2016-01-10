from optparse import OptionParser
import re
import json

parser = OptionParser()
parser.add_option("-f", dest="input_file", help="input file")
parser.add_option("-o", dest="output_file", help="output file")

(options, args) = parser.parse_args()
if options.input_file is None:
    parser.print_help()
    exit()
if options.output_file is None:
    options.output_file = options.input_file + ".json"

graph = {}
dim = None
meet_start = False
s = ""
with open(options.input_file) as tt:
    for l in tt:
        if (dim is None):
            m = re.match("dimensions\s+(\d+)x.+", l)
            if m:
                dim = int(m.group(1))

        if meet_start:
            s += l
            if re.search('\$', l):
                m = re.match("(\d+)\s+((\s*[0-9\.\:]+\s*)+)", s)
                if m:
                    idx = int(m.group(1))
                    nebs = m.group(2)
                    nebs = nebs.split()
                    graph[idx] = {}
                    for v in nebs:
                        v2 = v.split(':')
                        if (len(v2) == 1):
                            graph[idx][int(v)] = 1
                        else:
                            graph[idx][int(v2[0])] = float(v2[1])
                s = ''

        if not meet_start and re.search('^begin', l):
            print('start...')
            meet_start = True
with open(options.output_file, mode='w') as output_f:
    output_f.write(json.dumps({'dim': dim, 'graph': graph}))
