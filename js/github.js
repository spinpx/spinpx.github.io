// modified form gist-embed
(function() {
    $(document).ready(function() {
        var lists = $('#gist-list');
        var sig = true;
        function paintGist(id) {

            var data = {};
            // if the id doesn't exist, then ignore the code block
            if (!id) return false;

            var url = 'https://gist.github.com/' + id + '.json';
            
            sig = false;
            $('#gist-loading').show();

            // request the json version of this gist
            $.ajax({
                url: url,
                data: data,
                dataType: 'jsonp',
                timeout: 10000,
                success: function(response) {
                    var linkTag,
                        head,
                        lineNumbers,
                        highlightLineNumbers,
                        $responseDiv;

                    // the html payload is in the div property
                    if (response && response.div) {
                        // github returns /assets/embed-id.css now, but let's be sure about that
                        if (response.stylesheet && response.stylesheet.indexOf('http') !== 0) {
                            // add leading slash if missing
                            if (response.stylesheet.indexOf('/') !== 0) {
                                response.stylesheet = '/' + response.stylesheet;
                            }
                            response.stylesheet = 'https://gist.github.com' + response.stylesheet;
                        }

                        // add the stylesheet if it does not exist
                        if (response.stylesheet && $('link[href="' + response.stylesheet + '"]').length === 0) {
                            linkTag = document.createElement('link');
                            head = document.getElementsByTagName('head')[0];

                            linkTag.type = 'text/css';
                            linkTag.rel = 'stylesheet';
                            linkTag.href = response.stylesheet;
                            head.insertBefore(linkTag, head.firstChild);
                        }

                        // refernce to div
                        $responseDiv = $(response.div);

                        // remove id for uniqueness constraints
                        $responseDiv.removeAttr('id');

                        lists.append($responseDiv);   
                        
                        sig = true;
                        $('#gist-loading').hide();

                    } 
                }
            });
        }

        $(function() {
            // find all elements containing "data-gist-id" attribute.
            var page = 1;
            var url = 'https://api.github.com/users/spinpx/';
            $('#gist-more').hide();    

            $.ajax({
                url: url + 'gists',
                dataType: 'jsonp',
                timeout: 10000,
                success: function(res) {
                    var data = res.data;
                    var len = data.length;
                    var i = 0;
                    for (i; i < 5 && i < len; i++) {
                        paintGist(data[i].id);
                    }             
           
                    $(window).scroll(function() {
                        if (i < len) {
                            $('#gist-more').show();                    
                        } else {
                            $('#gist-more').hide(); 
                        }
                        if($(window).scrollTop() + $(window).height() > lists.height() + lists.offset().top) {
                            if (sig && i < len) {
                                paintGist(data[i++].id);
                            }
                        }
                    });
                }
            });
            var stars = $('#table-of-contents');
            stars.html('<h2>Starred Repositories<div id="text-table-of-contents"></h2><ul><li>Loading...</li></ul></div>');
            $.ajax({
                url: url + 'starred',
                dataType: 'jsonp',
                timeout: 10000,
                success: function(res) {
                    var data = res.data;                    
                    stars = stars.find('ul');
                    stars.html('');
                    for (var i = 0, len = data.length; i < len; i++) {
                        var link = '<li><a href="' + data[i].html_url + '">' + data[i].name + '</a></li>';
                        stars.append(link);
                    }
                }
            });
        });

    });
})();
