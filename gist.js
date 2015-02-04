(function() {
    // 每个 item 的一些信息    
    var items = [];
    // tag 的映射
    var tags_hash = {};
    // current tag
    var curTag = undefined;
    
    var getQuery = function (url) {
        var obj = {};        
        url = url.split('#')[0] || '';        
        if (typeof url === 'string') {
            if (url.indexOf('?') != -1) {
                var afterStr = decodeURIComponent(url.split('?')[1]);
                afterArr = afterStr.split('&');
                for (var i = 0, len = afterArr.length; i < len; i++) {
                    var pairs = afterArr[i].split('=');
                    obj[pairs[0]] = pairs[1];
                }
                return obj;
            } else {
                return obj;
            }                        
        } else {
            return obj;
        }
    };
    
    var getArgs = function() {
        return getQuery(window.location.href);        
    };
    
    var storeItem = function(data, index) {
        var item = {};
        var tags = ['Untitled'];

        if (data.description.length > 0) {
            tags = data.description.split(/\s*#\s*/);                
        }
        // every files
        for(var f in data.files) {
            tags.push(data.files[f].language);
        }
        // creat tag map
        for (var i=1; i<tags.length; i++) {
            var tt = tags[i] = tags[i].trim();
            if(tags_hash[tt] == undefined) {
                tags_hash[tt] = [index];
            } else {
                tags_hash[tt].push(index);
            }
        }
        // store info
        item.html_url = data.html_url;
        item.tags = tags;
        item.created_at = data.created_at.split('T')[0];
        items.push(item);
        
        return item;
    };
    
    var genGistItem = function(item) {
        if (item.html !== undefined) {
            return item.html;
        }
        var node = '<li><code>'
                + item.created_at
                + '</code> » <a href = "' + item.html_url
                + '" class="gist-link" target="_blank">'
                + item.tags[0]
                + '</a> <span class="gist-tags">'
                + genTagsLink(item.tags)
                + '</span></li>';
        // cache
        item.html = node;
        return node;
    };
    
    var genTagsLink = function(ts) {
        var linkString = '';
        if (ts.length > 1) {
            linkString = '/ ';
            for(var i = 1; i < ts.length; i++) {
                linkString = linkString + '<a href = "#" data-tag="'+ ts[i] + '">' + ts[i] + '</a>'+' / ';               
            }
        }
        return linkString;
    };
    
    $(document).ready(function() {
        $(function() {   
            //var url = 'https://api.github.com/users/spinpx/gists';
            var url = './test.json';
            var target = $("#gist-list");
            var loading = $('#gist-loading');
            var title = $('h1.title');
            var backAll = $('<span class="gist-tags back-to-all">/ <a href = "#">back to All</a> /</span>');
            
            var args = getArgs();
            curTag = args.tag;
                        
            if (curTag !== undefined) {
                title.text('My Gists - Tag:' + curTag);
                target.prepend(backAll);
            }

            $.ajax({
                url: url,
                dataType: 'jsonp',
                timeout: 10000,
                success: function(res) {
                    var data = res.data;
                    var len = data.length;
                    for (var i=0; i < len; i++) {
                        var result = storeItem(data[i], i);
                        if (curTag === undefined || (items[i].tags.indexOf(curTag) >= 0)){
                            target.append(genGistItem(result));
                        }
                    }
                    
                    loading.hide();

                    if (curTag !== undefined && tags_hash[curTag] == undefined) {
                        target.html("<p>没有这个 tag 哦！</p>").prepend(backAll);
                    }
                    
                    // tags cloud
                    var table = $('#table-of-contents');
                    var tagTable = '<h2>Tags Cloud</h2><div class="gist-table">';
                    for (var t in tags_hash) {
                        var size = tags_hash[t].length/len;                        
                        tagTable += ('<a href="#" class="gist-tag-table" style="font-size:'
                                     + Math.log10(size*100)
                                     + 'em" data-tag="'
                                     + t + '">' + t + '</a>');
                    }
                    tagTable += '</div>';
                    table.append(tagTable);
                    
                    $(window).scroll(function() {                        
                    });
                }
            });
            
            $('#content').on('click', '.gist-tags a, .gist-table a', function(e) {
                curTag = $(e.currentTarget).data('tag');
                target.html('');
                var indexs = tags_hash[curTag];
                if(curTag === undefined) {
                    for(var i = 0; i < items.length; i++) {
                        target.append(genGistItem(items[i]));
                    }
                    title.text('My Gists');
                    $('.back-to-all').remove();
                }
                else {
                    for(var j=0; j < indexs.length; j++){
                        target.append(genGistItem(items[indexs[j]]));
                    }                
                    title.text('My Gists - Tag:' + curTag);
                    target.prepend(backAll);                    
                }
                e.preventDefault();
            });
            
        });
    });
})();
