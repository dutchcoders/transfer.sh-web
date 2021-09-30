'use strict';

$(document).ready(function() {

    // Smooth scrolling
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

});

(function() {
    var files = Array();
    var queue = Array();

    $(window).bind('beforeunload', function(){
        if (queue.length===0)  {
            return;
        }

        return 'There are still ' + queue.length + ' files being uploaded.';
    });

    function deleteFile(baseURL) {
        var deleteModal = $('.delete-modal');
        if (deleteModal.hasClass('show')) {
            deleteModal.removeClass('show');
        } else {
            deleteModal.addClass('show');
        }

        deleteModal.find('input[placeholder]').each(function () {
            $(this).attr('size', $(this).attr('placeholder').length);
        });

        $('#confirm-delete').on('click', function (event) {
            event.stopPropagation();
            event.preventDefault();
            var deletionToken = $('#deletion-token').val();
            if (deletionToken.length > 0) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            deleteModal.find('#web').html('<span style="clear:both">File deleted</span>');
                            deleteModal.find('#error').html('')
                        } else {
                            deleteModal.find('#error').html('<span>Error (' + xhr.status + ') during deletion of file</span>');
                        }
                    }
                };

                // start deletion
                xhr.open('DELETE', baseURL + '/' + deletionToken, true);
                xhr.send();
            }
        });
    }

    function upload(file) {
        $('.browse').addClass('uploading');

        var li = $('<li style="clear:both;"/><br/><br/>');

        li.append($('<div><div class="upload-progress"><span></span><div class="bar" style="width:0%;">####################################################</div></div><p>Uploading... ' + file.name + '</p></div>'));
        $(li).appendTo($('.queue'));

        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', function(e) {
            var pc = parseInt((e.loaded / e.total * 100));
            $('.upload-progress', $(li)).show();
            $('.upload-progress .bar', $(li)).css('width', pc + '%');
            $('.upload-progress span', $(li)).empty().append(pc + '%');

        }, false);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                $('#web').addClass('uploading');
                if (xhr.status === 200) {
                    var deletionToken = xhr.getResponseHeader('X-Url-Delete').split('/').pop();
                    var url = $('<p></p>').text(xhr.responseText).html();
                    $(li).html('<a target="_blank" href="' + url + '">' + url + '</a><br/><br/>' +
                        '<span class="code-title"># Deletion token</span><br/>' + deletionToken + '<hr/>');
                } else {
                    $(li).html('<span>Error (' + xhr.status + ') during upload of file ' + file.name + '</span><hr/>');
                }

                // file uploaded successfully, remove from queue
                var index = queue.indexOf(xhr);
                if (index > -1) {
                    queue.splice(index, 1);
                }

                files.push(URI($('<p></p>').text(xhr.responseText.replace('\n', '')).html()).path());

                $('.download-zip').attr('href', URI('(' + files.join(',') + ').zip').absoluteTo(location.href).toString());
                $('.download-tar').attr('href', URI('(' + files.join(',') + ').tar.gz').absoluteTo(location.href).toString());

                $('.all-files').addClass('show');
            }
        };

        // should queue all uploads.
        queue.push(xhr);

        // start upload
        xhr.open('PUT', './' + file.name, true);
        xhr.send(file);
    }

    $(document).bind('dragenter', function(event) {
        event.preventDefault();
    }).bind('dragover', function(event) {
        event.preventDefault();
        // show drop indicator
        $('#terminal').addClass('dragged');
        $('#web').addClass('dragged');
    }).bind('dragleave', function() {
        $('#terminal').removeClass('dragged');
        $('#web').removeClass('dragged');

    }).bind('drop dragdrop', function(event) {
        var files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;

        $.each(files, function(index, file) {
            upload(file);
        });

        event.stopPropagation();
        event.preventDefault();
    });

    $('a.browse').on('click', function() {
        $('input[type=file]').click();
        return (false);
    });


    $('input[type=file]').on('change', function() {
        $.each(this.files, function(index, file) {
            if (file instanceof Blob) {
                upload(file);
            }
        });
    });

    $('a#fire-delete').on('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        deleteFile($(this).attr('href'));
    });

    // clipboard
    if (window.location.href.indexOf('download') > -1 ) {


        (function() {
            var copylinkbtn = document.getElementById('copy-link-btn'),
                copylink = document.getElementById('copy-link-wrapper'),
                overlay = document.getElementById('overlay');

            var url = 'http://url';
            copylinkbtn.addEventListener('click', function() {

                var error = document.getElementsByClassName('error');

                while (error[0]) {
                    error[0].parentNode.removeChild(error[0]);
                }

                document.body.className += ' active';

                copylink.children[1].value = url;
                copylink.children[1].focus();
                copylink.children[1].select();
            }, false);

            overlay.addEventListener('click', function() {
                document.body.className = '';
            }, false);

            copylink.children[1].addEventListener('keydown', function(e) {

                var error = document.getElementsByClassName('error');

                while (error[0]) {
                    error[0].parentNode.removeChild(error[0]);
                }

                setTimeout(function() {

                    if ((e.metaKey || e.ctrlKey) && e.keyCode === 67 && isTextSelected(copylink.children[2])) {
                        document.body.className = '';
                    } else if ((e.metaKey || e.ctrlKey) && e.keyCode === 67 && isTextSelected(copylink.children[2]) === false) {
                        var error = document.createElement('span');
                        error.className = 'error';
                        var errortext = document.createTextNode('The link was not copied, make sure the entire text is selected.');

                        error.appendChild(errortext);
                        copylink.appendChild(error);
                    }
                }, 100);

                function isTextSelected(input) {
                    if (typeof input.selectionStart === 'number') {
                        return input.selectionStart === 0 && input.selectionEnd === input.value.length;
                    } else if (typeof document.selection !== 'undefined') {
                        input.focus();
                        return document.selection.createRange().text === input.value;
                    }
                }
            }, false);
        })();
    }

})();
