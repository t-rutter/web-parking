$(document).ready(function() {
  dReady();
});

function dReady() {
  var expanding = false;
  var tds = $('thead:first tr:first td').size();
  $('table .expand_actions:eq(0), table .expand_actions_ajax:eq(0)').parent().parent().parent().css('cursor', 'pointer');
  $('.comeback').click(function() {
    if ($('input[name=s]').css('opacity') == "1") {
      $('#search').submit();
    }
  });
  if ($().fancybox) {
    $("a.box").fancybox({
      width: 560,
      padding: 5,
      margin: 10,
      scrolling: 'no'
    });
  }
  if (!$('#filter_type').length) {
    $('#page_info').addClass('full-width');
  }
  $('.expand_actions').parent().unbind('click');
  $('.expand_actions_ajax').parent().unbind('click');
  $('.expand_actions').parent().click(function() {
    var existing = $('div:eq(0)', $(this).next());
    if (existing.length) {
      $(this).removeClass('expanded');
      existing.slideUp(function() {
        existing.parent().parent().remove()
      })
    } else {
      tds = $('thead:first tr:first td', $(this).parent().parent()).size();
      $(this).addClass('expanded');
      $('.drop_skeleton .act_padd > div').append('<div style="clear:both;"></div>');
      var skel_html = $('.drop_skeleton').html();
      var skel_data = $('.uniq', $(this)).val().split('|');
      for (i = 0; i <= skel_data.length - 1; i++) {
        var re = new RegExp("%UNIQ" + (i + 1).toString() + "%", "g");
        skel_html = skel_html.replace(re, skel_data[i])
      }
      $(this).after('<tr class="actions_"><td colspan="' + tds + '"><div style="display:none;" class="action_spawn">' + skel_html + '</div></td></tr>');
      var new_div = $('div', $(this).next());
      if ($(this).hasClass('z')) {
        new_div.addClass('z')
      }
      new_div.slideDown()
    }
  });
  $('.expand_actions_ajax').parent().click(function(event) {
    if (!$(event.target).is('a')) {
      if (expanding == false) {
        expanding = true;
        var row = $(this);
        var existing = $('div:eq(0)', $(this).next());
        if ($(this).next().hasClass('actions_')) {
          row.removeClass('expanded');
          existing.slideUp(function() {
            existing.parent().parent().remove();
            expanding = false
          })
        } else {
          tds = $('thead:first tr:first td', $(this).parent().parent()).size();
          $(row).fadeTo('fast', 0.2);
          $(this).addClass('expanded');
          var ajax_type = $('.expand_actions_ajax', row).attr('ajax-type');
          var skel_data = $('.uniq', row).val().split('|');
          $.get('/home/ajax/', {
            'data': skel_data[0],
            'type': ajax_type
          }, function(data) {
            row.after('<tr class="actions_"><td colspan="' + tds + '"><div style="display:none;" class="action_spawn">' + data + '</div></td></tr>');
            var new_div = $('div', row.next());
            if (row.hasClass('z')) {
              new_div.parent().addClass('z')
            }
            new_div.parent().slideDown(function() {
              expanding = false
            });
            $('.dropdown_options_types .links a', new_div).click(function() {
              $('.dropdown_options_links div', new_div).stop(true, true);
              $('.linksSelector > div > div', new_div).stop(true);
              var dType = $(this).attr('data-type');
              var elm = $('.dropdown_options_types .links a.selected', new_div);
              if (elm.attr('data-type') != dType) {
                elm.removeClass('selected');
                $('.dropdown_options_links div[data-type=' + elm.attr('data-type') + ']', new_div).stop().fadeOut('fast', function() {
                  $('.dropdown_options_links div[data-type=' + dType + ']', new_div).fadeIn('fast');
                });
                var childIndex = ($(this).index() + 1);
                $(".linksSelector > div > div", new_div).animate({
                  marginLeft: (20 * childIndex).toString() + '%'
                }, 500);
                $(this).addClass('selected');
              }
              return false;
            });
            $(row).fadeTo('fast', 1)
          })
        }
      }
    }
  });
  $('td[url=true]').parent().mousedown(function(b) {
    if (b.which == 2) {
      window.open('http://' + $('td:eq(0)', this).text())
    }
  });
  if ($('.i').length > 0) {
    $('body').prepend('<div class=\"info_popout\" style=\"display:none;\"></div>');
    $(".i").each(function() {
      $(this).mousemove(function(e) {
        var h = e.pageY - $('.info_popout').height() / 2;
        $('.info_popout').html('<div style=\"position:absolute;top:40%;\"><div style=\"position:relative;right: 22px;bottom:4px;margin-bottom:0;\"><img src=\"https://static.ventraip.com.au/wholesale/img/tip.png\" /></div></div>' + $(this).attr('info')).fadeIn('fast');
        $('.info_popout').css('left', e.pageX + 26).css('top', h).css('position', 'absolute').css('z-index', '9999');
        $(this).mouseout(function() {
          $('.info_popout').stop(true, true, true).fadeOut('fast')
        })
      })
    })
  }
  $('.goto').click(function() {
    var pg = prompt("Please enter a page number", "");
    if (pg) {
      if (isNumber(pg)) {
        window.location = $(this).attr('href') + pg
      } else {
        alert('Not a valid number.')
      }
    }
    return false
  });
  $("tr:visible:odd").addClass("z");
  $("tr:hidden:odd").addClass("z");
  $(".menu li:has(ul)").click(function(event) {
    if (this == event.target) {
      $(this).toggleClass('clicked').children('ul').slideToggle();
      $(this).find('li:has(ul)').removeClass('clicked').find("ul").slideUp();
      $(this).siblings().not('.current_item').removeClass('clicked').find("ul").slideUp()
    }
  }).addClass('has_ul');
  $('.menu-item.admin-item').click(function() {
    load_counters('.' + $('span', this).attr('class'));
  });
  if ($('.menu-admin-domainnames').parent().hasClass('expand')) {
    load_counters('.menu-admin-domainnames');
  }
  if ($('.menu-admin-resellers').parent().hasClass('expand')) {
    load_counters('.menu-admin-resellers');
  }
}
var AJAX_URL = 'https://whmcs.commandhost.net/ajax';

function htmlEncode(value) {
  return $('<div/>').text(value).html();
}

function htmlDecode(value) {
  return $('<div/>').html(value).text();
}

function load_counters(menu) {
  menu = $(menu);
  if (menu.attr('loaded') != '1') {
    menu.attr('loaded', '1');
    if (menu.attr('class') == 'menu-admin-domainnames') {
      $.getJSON('/home/ajax?type=domain_name_menu_count', function(data) {
        var pending_cor = $($('a:contains("COR Pending Approval")'), $('.menu-admin-domainnames').next().children());
        var pending_rego = $($('a:contains("Registrations Pending")'), $('.menu-admin-domainnames').next().children());
        var active_complaints = $($('a:contains("Active Complaints")'), $('.menu-admin-domainnames').next().children());
        var gtld_email = $($('a:contains("Obtain Registrant Email")'), $('.menu-admin-domainnames').next().children());
        var aulockdown = $($('a:contains("auLOCKDOWN")'), $('.menu-admin-domainnames').next().children());
        pending_cor.html(pending_cor.html() + ' (' + data['cor'] + ')');
        pending_rego.html(pending_rego.html() + ' (' + data['pending_reg'] + ')');
        active_complaints.html(active_complaints.html() + ' (' + data['complaint'] + ')');
        gtld_email.html(gtld_email.html() + ' (' + data['gtld_email'] + ')');
        aulockdown.html(aulockdown.html() + ' (' + data['aulockdowns'] + ')');
      });
    } else if (menu.attr('class') == 'menu-admin-resellers') {
      $.getJSON('/home/ajax?type=domain_name_menu_count', function(data) {
        var applications = $($('a:contains("Applications")'), $('.menu-admin-resellers').next().children());
        applications.html(applications.html() + ' (' + data['applications'] + ') ');
      });
    }
  }
}

function domains_select(cs) {
  if ($("input[name=copyfrom]").length > 0) {
    $('input[name=copyfrom]').autocomplete({
      source: function(request, response) {
        $.ajax({
          url: "/home/ajax/",
          dataType: "json",
          data: {
            q: request.term,
            type: "domains_json"
          },
          success: function(data) {
            response($.map(data, function(item) {
              return {
                domainname: __highlight(item.domainname, request.term),
                value: item.domainname,
                real: item.real
              }
            }))
          }
        })
      },
      open: function() {
        $(this).removeClass("wait")
      },
      search: function(event, ui) {
        $(this).addClass("wait")
      },
      select: function(e, c) {
        if (!c.item.real) {
          return false
        }
        $.getJSON("/home/ajax/", {
          type: "get_contacts",
          domain: c.item.value,
          contacts: cs
        }, function(data) {
          if (data.success != false) {
            $.each(data, function(k, v) {
              $.each(v, function(k1, v1) {
                $.each(v1, function(k2, v2) {
                  if (k2 == 'country') {
                    $('select[name=country] option[value=' + v2 + ']').attr('selected', 'selected');
                    $('select[name=' + k1 + '_country] option[value=' + v2 + ']').attr('selected', 'selected');
                  } else {
                    $('.data_' + k1 + ' input[name=' + k2 + ']').val(v2);
                    $('.data_' + k1 + ' input[name=' + k1 + '_' + k2 + ']').val(v2)
                  }
                })
              })
            })
          }
        })
      }
    }).data("autocomplete")._renderItem = function(ul, item) {
      return $("<li></li>").data("item.autocomplete", item).append($("<a></a>").html(item.domainname)).appendTo(ul)
    }
  }
}

function form_data(element) {
  element = $(element);
  var post_data = {};
  element.each(function() {
    post_data[$(this).attr('name')] = $(this).val()
  });
  return post_data
}

function throttle(f, delay) {
  var timer = null;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = window.setTimeout(function() {
      f.apply(context, args)
    }, delay || 500)
  }
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function parseRSS(url, callback) {
  $.ajax({
    url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url) + '?ts=' + Math.round((new Date()).getTime() / 1000).toString(),
    dataType: 'json',
    success: function(data) {
      callback(data.responseData.feed)
    }
  });
}

function __highlight(s, t) {
  var matcher = new RegExp("(" + $.ui.autocomplete.escapeRegex(t) + ")", "ig");
  return s.replace(matcher, "<strong>$1</strong>")
}