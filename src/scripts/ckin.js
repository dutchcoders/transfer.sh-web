/*!
   ckin v0.0.1: Custom HTML5 Media Player Skins.
   (c) 2017 
   MIT License
   git+https://github.com/hunzaboy/ckin.git
*/
// Source: https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca;
(function () {
  // helpers
  var regExp = function regExp(name) {
    return new RegExp('(^| )' + name + '( |$)');
  };
  var forEach = function forEach(list, fn, scope) {
    for (var i = 0; i < list.length; i++) {
      fn.call(scope, list[i]);
    }
  };

  // class list object with basic methods
  function ClassList(element) {
    this.element = element;
  }

  ClassList.prototype = {
    add: function add() {
      forEach(arguments, function (name) {
        if (!this.contains(name)) {
          this.element.className += ' ' + name;
        }
      }, this);
    },
    remove: function remove() {
      forEach(arguments, function (name) {
        this.element.className = this.element.className.replace(regExp(name), '');
      }, this);
    },
    toggle: function toggle(name) {
      return this.contains(name) ? (this.remove(name), false) : (this.add(name), true);
    },
    contains: function contains(name) {
      return regExp(name).test(this.element.className);
    },
    // bonus..
    replace: function replace(oldName, newName) {
      this.remove(oldName), this.add(newName);
    }
  };

  // IE8/9, Safari
  if (!('classList' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'classList', {
      get: function get() {
        return new ClassList(this);
      }
    });
  }

  // replace() support for others
  if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
    DOMTokenList.prototype.replace = ClassList.prototype.replace;
  }
})();
(function () {
  if (typeof NodeList.prototype.forEach === "function") return false;
  NodeList.prototype.forEach = Array.prototype.forEach;
})();

// Unfortunately, due to scattered support, browser sniffing is required
function browserSniff() {
  var nVer = navigator.appVersion,
    nAgt = navigator.userAgent,
    browserName = navigator.appName,
    fullVersion = '' + parseFloat(navigator.appVersion),
    majorVersion = parseInt(navigator.appVersion, 10),
    nameOffset,
    verOffset,
    ix;

  // MSIE 11
  if (navigator.appVersion.indexOf("Windows NT") !== -1 && navigator.appVersion.indexOf("rv:11") !== -1) {
    browserName = "IE";
    fullVersion = "11;";
  }
  // MSIE
  else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
    browserName = "IE";
    fullVersion = nAgt.substring(verOffset + 5);
  }
  // Chrome
  else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset + 7);
  }
  // Safari
  else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) !== -1) {
      fullVersion = nAgt.substring(verOffset + 8);
    }
  }
  // Firefox
  else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // Trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(";")) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }
  if ((ix = fullVersion.indexOf(" ")) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }
  // Get major version
  majorVersion = parseInt('' + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }
  // Return data
  return [browserName, majorVersion];
}

var obj = {};
obj.browserInfo = browserSniff();
obj.browserName = obj.browserInfo[0];
obj.browserVersion = obj.browserInfo[1];

wrapPlayers();
/* Get Our Elements */
var players = document.querySelectorAll('.ckin__player');

var iconPlay = '<i class="ckin-play"></i>';
var iconPause = '<i class="ckin-pause"></i>';
var iconVolumeMute = '<i class="ckin-volume-mute"></i>';
var iconVolumeHigh = '<i class="ckin-volume-high"></i>';
var iconVolumeMedium = '<i class="ckin-volume-medium"></i>';
var iconVolumeLow = '<i class="ckin-volume-low"></i>';
var iconExpand = '<i class="ckin-expand"></i>';
var iconCompress = '<i class="ckin-compress"></i>';

players.forEach(function (player) {
  var video = player.querySelector('video');
  if (null === video) {
    return;
  }

  var skin = attachSkin(video.dataset.ckin);
  player.classList.add(skin);

  var overlay = video.dataset.overlay;
  addOverlay(player, overlay);

  var title = showTitle(skin, video.dataset.title);
  if (title) {
    player.insertAdjacentHTML('beforeend', title);
  }

  var html = buildControls(skin);
  player.insertAdjacentHTML('beforeend', html);

  var color = video.dataset.color;
  addColor(player, color);

  var playerControls = player.querySelector('.' + skin + '__controls');
  var progress = player.querySelector('.progress');;
  var progressBar = player.querySelector('.progress__filled');
  var progressTime = player.querySelector('.progress__time');
  var toggle = player.querySelectorAll('.toggle');
  var skipButtons = player.querySelectorAll('[data-skip]');
  var ranges = player.querySelectorAll('.' + skin + '__slider');
  var volumeButton = player.querySelector('.volume');
  var fullScreenButton = player.querySelector('.fullscreen');

  if (obj.browserName === "IE" && (obj.browserVersion === 8 || obj.browserVersion === 9)) {
    showControls(video);
    playerControls.style.display = "none";
  }

  video.addEventListener('click', function () {
    togglePlay(this, player, true);
  });
  video.addEventListener('play', function () {
    updateButton(this, toggle);
  });

  video.addEventListener('pause', function () {
    updateButton(this, toggle);
  });
  video.addEventListener('timeupdate', function () {
    handleProgress(this, progressBar, progressTime);
  });

  toggle.forEach(function (button) {
    return button.addEventListener('click', function () {
      togglePlay(video, player, true);
    });
  });
  volumeButton.addEventListener('click', function () {
    toggleVolume(video, volumeButton);
  });

  var mousedown = false;
  progress.addEventListener('click', function (e) {
    scrub(e, video, progress, progressTime);
  });
  progress.addEventListener('mousemove', function (e) {
    return mousedown && scrub(e, video, progress, progressTime);
  });
  progress.addEventListener('mousedown', function () {
    return mousedown = true;
  });
  progress.addEventListener('mouseup', function () {
    return mousedown = false;
  });
  fullScreenButton.addEventListener('click', function (e) {
    return toggleFullScreen(player, fullScreenButton);
  });
  addListenerMulti(player, 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function (e) {
    return onFullScreen(e, player);
  });
});

players.forEach(function (player) {
  var audio = player.querySelector('audio');
  if (null === audio) {
    return;
  }

  var skin = attachSkin(audio.dataset.ckin);
  player.classList.add(skin);

  var overlay = audio.dataset.overlay;
  addOverlay(player, overlay);

  var title = showTitle(skin, audio.dataset.title);
  if (title) {
    player.insertAdjacentHTML('beforeend', title);
  }

  var html = buildControls(skin);
  player.insertAdjacentHTML('beforeend', html);

  var color = audio.dataset.color;
  addColor(player, color);

  var playerControls = player.querySelector('.' + skin + '__controls');
  var progress = player.querySelector('.progress');;
  var progressBar = player.querySelector('.progress__filled');
  var progressTime = player.querySelector('.progress__time');
  var toggle = player.querySelectorAll('.toggle');
  var skipButtons = player.querySelectorAll('[data-skip]');
  var ranges = player.querySelectorAll('.' + skin + '__slider');
  var volumeButton = player.querySelector('.volume');
  var fullScreenButton = player.querySelector('.fullscreen');

  if (obj.browserName === "IE" && (obj.browserVersion === 8 || obj.browserVersion === 9)) {
    showControls(audio);
    playerControls.style.display = "none";
  }

  audio.addEventListener('click', function () {
    togglePlay(this, player, false);
  });
  audio.addEventListener('play', function () {
    updateButton(this, toggle);
  });

  audio.addEventListener('pause', function () {
    updateButton(this, toggle);
  });
  audio.addEventListener('timeupdate', function () {
    handleProgress(this, progressBar, progressTime);
  });

  toggle.forEach(function (button) {
    return button.addEventListener('click', function () {
      togglePlay(audio, player, false);
    });
  });

  volumeButton.addEventListener('click', function () {
    toggleVolume(audio, volumeButton);
  });

  var mousedown = false;
  progress.addEventListener('click', function (e) {
    scrub(e, audio, progress, progressTime);
  });
  progress.addEventListener('mousemove', function (e) {
    return mousedown && scrub(e, audio, progress, progressTime);
  });
  progress.addEventListener('mousedown', function () {
    return mousedown = true;
  });
  progress.addEventListener('mouseup', function () {
    return mousedown = false;
  });
  fullScreenButton.addEventListener('click', function (e) {
    return toggleFullScreen(player, fullScreenButton);
  });
  addListenerMulti(player, 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function (e) {
    return onFullScreen(e, player);
  });
});

function showControls(media) {
  media.setAttribute("controls", "controls");
}

function togglePlay(media, player, autoHide) {
  var method = media.paused ? 'play' : 'pause';
  media[method]();
  if (autoHide) {
    media.paused ? player.classList.remove('is-playing') : player.classList.add('is-playing');
  }
}

function updateButton(media, toggle) {
  var icon = media.paused ? iconPlay : iconPause;
  toggle.forEach(function (button) {
    return button.innerHTML = icon;
  });
}

function skip() {
  media.currentTime += parseFloat(this.dataset.skip);
}

function toggleVolume(media, volumeButton) {
  var level = media.volume;
  var icon = iconVolumeMedium;
  if (level == 1) {
    level = 0;
    icon = iconVolumeMute;
  } else if (level == 0.66) {
    level = 1;
    icon = iconVolumeHigh;
  } else if (level == 0.33) {
    level = 0.66;
    icon = iconVolumeMedium;
  } else {
    level = 0.33;
    icon = iconVolumeLow;
  }
  media['volume'] = level;
  volumeButton.innerHTML = icon;
}

function handleRangeUpdate() {
  media[this.name] = this.value;
}

function handleProgress(media, progressBar, progressTime) {
  var percent = media.currentTime / media.duration * 100;
  progressBar.style.flexBasis = percent + '%';
  progressTime.innerText = formatTime(media.currentTime) + "/" + formatTime(media.duration);
}

function scrub(e, media, progress, progressTime) {
  var scrubTime = e.offsetX / progress.offsetWidth * media.duration;
  media.currentTime = scrubTime;
  progressTime.innerText = formatTime(media.currentTime) + "/" + formatTime(media.duration);
}

function formatTime(time) {
  var date = new Date(null);
  date.setSeconds(time); // specify value for SECONDS here
  return date.toISOString().substr(11, 8);
}

function wrapPlayers() {

  var videos = document.querySelectorAll('video');

  videos.forEach(function (video) {

    var wrapper = document.createElement('div');
    wrapper.classList.add('ckin__player');

    video.parentNode.insertBefore(wrapper, video);

    wrapper.appendChild(video);
  });

  var audios = document.querySelectorAll('audio');

  audios.forEach(function (audio) {
    var wrapper = document.createElement('div');
    wrapper.classList.add('ckin__player');
    wrapper.classList.add('audio');

    audio.parentNode.insertBefore(wrapper, audio);

    wrapper.appendChild(audio);
  });
}

function buildControls(skin) {
  var html = [];
  html.push('<button class="' + skin + '__button--big toggle" title="Toggle Play">' + iconPlay + '</button>');

  html.push('<div class="' + skin + '__controls ckin__controls">');

  html.push('<button class="' + skin + '__button toggle" title="Toggle Media">' + iconPlay + '</button>', '<div class="progress">', '<div class="progress__filled"></div>', '<p class="progress__breaker"></p>', '<div class="progress__time"></div>', '</div>', '<button class="' + skin + '__button volume" title="Volume">' + iconVolumeMedium + '</button>', '<button class="' + skin + '__button fullscreen" title="Full Screen">' + iconExpand + '</button>');

  html.push('</div>');

  return html.join('');
}

function attachSkin(skin) {
  if (typeof skin != 'undefined' && skin != '') {
    return skin;
  } else {
    return 'default';
  }
}

function showTitle(skin, title) {
  if (typeof title != 'undefined' && title != '') {
    return '<div class="' + skin + '__title">' + title + '</div>';
  } else {
    return false;
  }
}

function addOverlay(player, overlay) {

  if (overlay == 1) {
    player.classList.add('ckin__overlay');
  } else if (overlay == 2) {
    player.classList.add('ckin__overlay--2');
  } else {
    return;
  }
}

function addColor(player, color) {
  if (typeof color != 'undefined' && color != '') {
    var buttons = player.querySelectorAll('button');
    var progress = player.querySelector('.progress__filled');
    progress.style.background = color;
    buttons.forEach(function (button) {
      return button.style.color = color;
    });
  }
}

function toggleFullScreen(player, fullScreenButton) {
  // let isFullscreen = false;
  if (!document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    player.classList.add('ckin__fullscreen');

    if (player.requestFullscreen) {
      player.requestFullscreen();
    } else if (player.mozRequestFullScreen) {
      player.mozRequestFullScreen(); // Firefox
    } else if (player.webkitRequestFullscreen) {
      player.webkitRequestFullscreen(); // Chrome and Safari
    } else if (player.msRequestFullscreen) {
      player.msRequestFullscreen();
    }
    isFullscreen = true;

    fullScreenButton.innerHTML = iconCompress;
  } else {
    player.classList.remove('ckin__fullscreen');

    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFullscreen = false;
    fullScreenButton.innerHTML = iconExpand;
  }
}

function onFullScreen(e, player) {
  var isFullscreenNow = document.webkitFullscreenElement !== null;
  if (!isFullscreenNow) {
    player.classList.remove('ckin__fullscreen');
    player.querySelector('.fullscreen').innerHTML = iconExpand;
  } else {
    // player.querySelector('.fullscreen').innerHTML = iconExpand;

  }
}

function addListenerMulti(element, eventNames, listener) {
  var events = eventNames.split(' ');
  for (var i = 0, iLen = events.length; i < iLen; i++) {
    element.addEventListener(events[i], listener, false);
  }
}