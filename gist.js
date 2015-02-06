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
            var url = 'https://api.github.com/users/spinpx/gists';            
            //var url = 'http://cnmpp902.gitcafe.io/test.json';
            var list = $('#gist-list');
            var nav = $('#tags-nav');
            var loading = $('#loading');            
            
            var args = getArgs();
            curTag = args.tag;
                        
            if (curTag !== undefined) {
                
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
                            list.append(genGistItem(result));
                        }
                    }
                    loading.hide();
                    
                    var tagsNav = '';
                    var sizeAll = 0;
                    var prevSize = 0;
                    for (var t in tags_hash) {
                        var size = tags_hash[t].length;
                        sizeAll += size;
                        var c = '';
                        if (t === curTag) {
                            c = ' class="current" ';
                        }
                        var tagStr = ('<a href="#"' + c + 'data-tag="'
                                        + t + '">' + t +'(' + size + ')' + '</a>');
                        if (size <= prevSize) {
                            tagsNav += tagStr;
                        } else {
                            tagsNav = tagStr + tagsNav;
                        }                        
                    }
                    var c = '';
                    if (curTag === undefined) {
                        c = ' class="current" ';
                    }
                    tagsNav = ('<a href="#"' + c + '>All(' + sizeAll + ')</a>') + tagsNav;
                    
                    nav.append(tagsNav);
                    
                    $(window).scroll(function() {                        
                    });
                }
            });
            
            $('#container').on('click', '.gist-tags a, #tags-nav a', function(e) {
                var ele = $(e.currentTarget);
                curTag = ele.data('tag');
                list.html('');
                var indexs = tags_hash[curTag];
                $('#tags-nav a').removeClass('current');
                ele.addClass('current');
                if(curTag === undefined) {
                    for(var i = 0; i < items.length; i++) {
                        list.append(genGistItem(items[i]));
                    }
                }
                else {
                    for(var j=0; j < indexs.length; j++){
                        list.append(genGistItem(items[indexs[j]]));
                    }                
                }
                e.preventDefault();
            });
            
        });
    });
})();
