var format_numeric = function(nStr, render) {
    nStr = render(nStr);
    var prefix = prefix || '';
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1))
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    return prefix + x1 + x2;
};

var format_bytes = function(val_bytes, render) {
    var new_val = 0;
    var suffix = '';

    val_bytes = parseInt(render(val_bytes));

    if (val_bytes > 1073741824) {
        new_val = val_bytes / 1073741824;
        suffix = 'GB';
    } else if (val_bytes > 1048576) {
        new_val = val_bytes / 1048576;
        suffix = 'MB';
    } else if (val_bytes > 1024) {
        new_val = val_bytes / 1024;
        suffix = 'KB';
    } else {
        new_val = val_bytes;
        suffix = 'B';
    }

    return  new_val.toFixed(2) + ' ' + suffix;
};

var get_stats = function() {
    $.ajax({
        url: '/ajax/stats.json',
        dataType: 'jsonp',
        data: {
            servers: $('#servers').val(),
            qsort: $('#qsort option:selected').val(),
            qreverse: $('#qreverse option:selected').val(),
            qfilter: $('#qfilter').val(),
        },
        success: function(data, textStatus, jqXHR) {
            $('#servers_content').html(mustache.tmpl_servers({
                'servers': data['servers'],
                'size': function() {
                    return format_bytes;
                },
                'numeric': function() {
                    return format_numeric;
                }
            }));
            $('#queues_content').html(mustache.tmpl_queues({
                'queues': data['queues'],
                'size': function() {
                    return format_bytes;
                },
                'numeric': function() {
                    return format_numeric;
                }
            }));
            $('#error_count').html(0);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#error_count').html(parseInt($('#error_count').html()) + 1);
        },
    });
};

$(document).ready(function() {
    get_stats();
    var refresh_int = setInterval(get_stats, parseInt($('#refresh').val()) * 1000);

    $('#btn_refresh').click(function () {
        if ($(this).val() == 'Stop') {
            clearInterval(refresh_int);
            $(this).val('Start');
        } else if ($(this).val() == 'Start') {
            refresh_int = setInterval(get_stats, parseInt($('#refresh').val()) * 1000);
            $(this).val('Stop');
        }
    });

    $('a.cmd').live('click', function() {
        var row = $(this).closest('tr');
        var action = $(this).attr('x-kestrel-action');
        var queue = row.attr('x-kestrel-queue');
        var server = row.attr('x-kestrel-server');
        if (confirm(action + ' ' + server + ':' + queue)) {
            $.ajax({
                url: '/ajax/action.json',
                dataType: 'jsonp',
                data: {
                    action: action,
                    server: server,
                    queue: queue,
                },
                success: function(data, textStatus, jqXHR) {
                    if (action == 'delete') {
                        row.hide();
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('An error occurred');
                }
            });
        }
        return false;
    });
});