!(function ($, window, document, undefined) {
  'use strict'
  function Plugin(element, options) {
    ;(this.element = element),
      (this.settings = $.extend({}, defaults, options)),
      (this._defaults = defaults),
      (this._name = pluginName),
      this.init()
  }
  function openPopUp(url, title, width, height) {
    var w = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : screen.width,
      h = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height,
      left = w / 2 - width / 2 + 10,
      top = h / 2 - height / 2 + 50
    window
      .open(
        url,
        title,
        'scrollbars=yes, width=' +
          width +
          ', height=' +
          height +
          ', top=' +
          top +
          ', left=' +
          left,
      )
      .focus()
  }
  function title_case(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }
  function shorten(num) {
    return num >= 1e9
      ? (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'G'
      : num >= 1e6
      ? (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
      : num >= 1e3
      ? (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
      : num
  }
  function setMobileCss(objects) {
    $.each(objects, function () {
      isMobile
        ? ($(this).css('width', 100 / objects.length + '%'),
          $(this).removeClass('with-counter-desktop'))
        : ($(this).removeAttr('style'),
          $(this).find('span.shareCount').length > 0 &&
            $(this).addClass('with-counter-desktop'))
    })
  }
  function checkPlacePosition($child, position, element, extraOffset) {
    if (
      !1 === isMobile &&
      -1 != $.inArray(position, ['content-right', 'content-left'])
    ) {
      var initialOffset =
        'content-right' === position ? element.offsetWidth : -75
      $child.css('margin-left', initialOffset + extraOffset)
    } else $child.css('margin-left', 0)
  }
  function getWidth() {
    return window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width
  }
  function updateIsMobile() {
    var mobile = getWidth() < 961
    return void 0 !== isMobile && (isMobile = mobile), mobile
  }
  function appendButtons(count, $component) {
    count &&
      count > 0 &&
      ($component
        .append($('<span>', { class: 'shareCount' }).append(shorten(count)))
        .removeClass('without-counter'),
      !1 === isMobile && $component.addClass('with-counter-desktop'))
  }
  function issetOrZero(fn) {
    var value
    try {
      value = fn()
    } catch (e) {
      value = 0
    }
    return value
  }
  function setShareCount(network, url, $component, facebookToken) {
    switch (network) {
      case 'facebook':
        facebookToken &&
          $.getJSON(
            'https://graph.facebook.com/?id=' +
              url +
              '&fields=engagement&access_token=' +
              facebookToken +
              '&callback=?',
            function (data) {
              appendButtons(
                issetOrZero(function () {
                  return data.engagement.share_count
                }),
                $component,
              )
            },
          )
        break
      case 'odnoklassniki':
        $.getJSON(
          'https://connect.ok.ru/dk?st.cmd=extLike&ref=' + url + '&callback=?',
          function () {},
        ),
          (window.ODKL = window.ODKL || {}),
          (window.ODKL.updateCount = function (index, count) {
            appendButtons(count, $component)
          })
        break
      case 'pinterest':
        $.getJSON(
          'https://api.pinterest.com/v1/urls/count.json?url=' +
            url.replace(/\/+$/, '/') +
            '&callback=?',
          function (data) {
            appendButtons(
              issetOrZero(function () {
                return data.count
              }),
              $component,
            )
          },
        )
        break
      case 'reddit':
        $.getJSON(
          'https://www.reddit.com/api/info.json?url=' + url + '&jsonp=?',
          function (response) {
            appendButtons(
              issetOrZero(function () {
                return response.data.children[0].data.score
              }),
              $component,
            )
          },
        )
        break
      case 'tumblr':
        $.getJSON(
          'https://api.tumblr.com/v2/share/stats?url=' + url + '&callback=?',
          function (data) {
            appendButtons(
              issetOrZero(function () {
                return data.response.note_count
              }),
              $component,
            )
          },
        )
        break
      case 'vk':
        $.getJSON(
          'https://vk.com/share.php?act=count&index=1&url=' +
            url +
            '&callback=?',
          function () {},
        ),
          (window.VK = window.VK || {}),
          (window.VK.Share = window.VK.Share || {}),
          (window.VK.Share.count = function (index, count) {
            appendButtons(count, $component)
          })
        break
      default:
        return -1
    }
  }
  var pluginName = 'floatingSocialShare',
    defaults = {
      place: 'top-left',
      counter: !0,
      target: !0,
      facebook_token: null,
      buttons: ['facebook', 'twitter'],
      title: document.title,
      url: window.location.href,
      description: $('meta[name="description"]').attr('content') || '',
      media: $('meta[property="og:image"]').attr('content') || '',
      text: { default: 'share with:' },
      text_title_case: !1,
      popup: !0,
      popup_width: 400,
      popup_height: 300,
      extra_offset: 15,
    },
    isMobile = updateIsMobile()
  $.extend(Plugin.prototype, {
    init: function () {
      ;-1 == $.inArray(this.settings.place, places) &&
        (this.settings.place = this._defaults.place)
      var base = this,
        $template = $('<div>', { id: 'floatingSocialShare' }),
        $child = $('<div>', { class: this.settings.place }).appendTo($template),
        _text_default = base.settings.text.default || base.settings.text
      $.each(this.settings.buttons, function (index, value) {
        var v = networks[value],
          $icon = $(v.icon),
          _href = v.url
            .replace('{url}', encodeURIComponent(base.settings.url))
            .replace('{title}', encodeURIComponent(base.settings.title))
            .replace(
              '{description}',
              encodeURIComponent(base.settings.description),
            )
            .replace('{media}', encodeURIComponent(base.settings.media)),
          _text_value = base.settings.text[value] || _text_default + value,
          _text_output = base.settings.text_title_case
            ? title_case(_text_value)
            : _text_value,
          $component = $('<a>', {
            title: base.settings.title,
            class: value + ' pop-upper',
          })
            .attr('href', _href)
            .attr('title', _text_output)
            .append($icon)
            .addClass('without-counter')
        !0 === base.settings.target &&
          $component
            .attr('target', '_blank')
            .attr('rel', 'noopener noreferrer'),
          !0 === base.settings.counter &&
            setShareCount(
              value,
              encodeURI(base.settings.url),
              $component,
              base.settings.facebook_token,
            ),
          $child.append($component)
      }),
        $template.appendTo(this.element)
      var links = $(this.element).find('.pop-upper')
      !0 === this.settings.popup &&
        links.on('click', function (event) {
          event.preventDefault(),
            openPopUp(
              $(this).attr('href'),
              $(this).attr('title'),
              base.settings.popup_width,
              base.settings.popup_height,
            )
        }),
        setMobileCss(links),
        checkPlacePosition(
          $child,
          base.settings.place,
          base.element,
          base.settings.extra_offset,
        ),
        $(window).resize(function () {
          setMobileCss(links),
            checkPlacePosition(
              $child,
              base.settings.place,
              base.element,
              base.settings.extra_offset,
            ),
            updateIsMobile()
        })
    },
  })
  var places = ['content-left', 'content-right', 'top-left', 'top-right'],
    networks = {
      mail: {
        icon:
          "<svg aria-label='Mail' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.387l-9 6.463-9-6.463V21H1.5C.649 21 0 20.35 0 19.5v-15c0-.425.162-.8.431-1.068C.7 3.16 1.076 3 1.5 3H2l10 7.25L22 3h.5c.425 0 .8.162 1.069.432.27.268.431.643.431 1.068z'/></svg>",
        url: 'mailto:?subject={url}',
      },
      facebook: {
        icon:
          "<svg aria-label='Facebook' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/></svg>",
        url: 'https://www.facebook.com/sharer/sharer.php?u={url}&t={title}',
      },
      linkedin: {
        icon:
          "<svg aria-label='Linkedin' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/></svg>",
        url:
          'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}&source=',
      },
      odnoklassniki: {
        icon:
          "<svg aria-label='Odnoklassniki' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M14.505 17.44c1.275-.29 2.493-.794 3.6-1.49.834-.558 1.058-1.686.5-2.52-.536-.802-1.604-1.044-2.435-.553-2.55 1.595-5.79 1.595-8.34 0-.847-.534-1.965-.28-2.5.565 0 .002 0 .004-.002.005-.534.847-.28 1.966.567 2.5l.002.002c1.105.695 2.322 1.2 3.596 1.488l-3.465 3.465c-.707.695-.72 1.83-.028 2.537l.03.03c.344.354.81.53 1.274.53.465 0 .93-.176 1.275-.53L12 20.065l3.404 3.406c.72.695 1.87.676 2.566-.045.678-.703.678-1.818 0-2.52l-3.465-3.466zM12 12.388c3.42-.004 6.19-2.774 6.195-6.193C18.195 2.78 15.415 0 12 0S5.805 2.78 5.805 6.197c.005 3.42 2.776 6.19 6.195 6.192zm0-8.757c1.416.002 2.563 1.15 2.564 2.565 0 1.416-1.148 2.563-2.564 2.565-1.415-.002-2.562-1.148-2.565-2.564C9.437 4.78 10.585 3.633 12 3.63z'/></svg>",
        url:
          'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl={url}',
      },
      pinterest: {
        icon:
          "<svg aria-label='Pinterest' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z'/></svg>",
        url:
          'https://www.pinterest.com/pin/create/button/?url={url}&description={description}&media={media}',
      },
      reddit: {
        icon:
          "<svg aria-label='Reddit' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z'/></svg>",
        url: 'https://www.reddit.com/submit?url={url}&title={title}',
      },
      telegram: {
        icon:
          "<svg aria-label='Telegram' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z'/></svg>",
        url: 'https://telegram.me/share/url?text={title}&url={url}',
      },
      tumblr: {
        icon:
          "<svg aria-label='Tumblr' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z'/></svg>",
        url:
          'https://www.tumblr.com/share/link?url={url}&name={title}&description={description}',
      },
      twitter: {
        icon:
          "<svg aria-label='Twitter' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/></svg>",
        url: 'https://twitter.com/intent/tweet?text={title}%20{url}',
      },
      vk: {
        icon:
          "<svg aria-label='VK' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z'/></svg>",
        url:
          'https://vk.com/share.php?url={url}&title={title}&description={description}',
      },
      whatsapp: {
        icon:
          "<svg aria-label='WhatsApp' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/></svg>",
        url: 'https://api.whatsapp.com://send?text={url}',
      },
      viber: {
        icon:
          "<svg aria-label='Viber' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02zm.36 2.6a.299.299 0 0 0-.3.299.3.3 0 0 0 .3.3 5.631 5.631 0 0 1 4.03 1.59c1.09 1.06 1.621 2.48 1.641 4.34a.3.3 0 0 0 .3.3v-.009a.3.3 0 0 0 .3-.3 6.451 6.451 0 0 0-1.81-4.76c-1.19-1.16-2.692-1.76-4.462-1.76zm-3.954.69a.955.955 0 0 0-.615.12h-.012c-.41.24-.788.54-1.148.94-.27.32-.421.639-.461.949a1.24 1.24 0 0 0 .05.541l.02.01a13.722 13.722 0 0 0 1.2 2.6 15.383 15.383 0 0 0 2.32 3.171l.03.04.04.03.03.03.03.03a15.603 15.603 0 0 0 3.18 2.33c1.32.72 2.122 1.06 2.602 1.2v.01c.14.04.268.06.398.06a1.84 1.84 0 0 0 1.102-.472c.39-.35.7-.738.93-1.148v-.01c.23-.43.15-.841-.18-1.121a13.632 13.632 0 0 0-2.15-1.54c-.51-.28-1.03-.11-1.24.17l-.45.569c-.23.28-.65.24-.65.24l-.012.01c-3.12-.8-3.95-3.959-3.95-3.959s-.04-.43.25-.65l.56-.45c.27-.22.46-.74.17-1.25a13.522 13.522 0 0 0-1.54-2.15.843.843 0 0 0-.504-.3zm4.473.89a.3.3 0 0 0 .002.6 3.78 3.78 0 0 1 2.65 1.15 3.5 3.5 0 0 1 .9 2.57.3.3 0 0 0 .3.299l.01.012a.3.3 0 0 0 .3-.301c.03-1.19-.34-2.19-1.07-2.99-.73-.8-1.75-1.25-3.05-1.34a.3.3 0 0 0-.042 0zm.49 1.619a.305.305 0 0 0-.018.611c.99.05 1.47.55 1.53 1.58a.3.3 0 0 0 .3.29h.01a.3.3 0 0 0 .29-.32c-.07-1.34-.8-2.091-2.1-2.161a.305.305 0 0 0-.012 0z'/></svg>",
        url: 'viber://forward?text={title}%20{url}',
      },
    }
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName) ||
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options))
    })
  }
})(jQuery, window, document)
