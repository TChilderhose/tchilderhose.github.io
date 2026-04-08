/*! instant.page v5.1.0 - (C) 2019-2020 Alexandre Dieulot - https://instant.page/license */

let mouseoverTimer
let lastTouchTimestamp
const prefetches = new Set()
const prefetchElement = document.createElement('link')
const isSupported = prefetchElement.relList && prefetchElement.relList.supports && prefetchElement.relList.supports('prefetch')
                    && window.IntersectionObserver && 'isIntersecting' in IntersectionObserverEntry.prototype
const allowQueryString = 'instantAllowQueryString' in document.body.dataset
const allowExternalLinks = 'instantAllowExternalLinks' in document.body.dataset
const useWhitelist = 'instantWhitelist' in document.body.dataset
const mousedownShortcut = 'instantMousedownShortcut' in document.body.dataset
const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111

let delayOnHover = 65
let useMousedown = false
let useMousedownOnly = false
let useViewport = false

if ('instantIntensity' in document.body.dataset) {
  const intensity = document.body.dataset.instantIntensity

  if (intensity.substr(0, 'mousedown'.length) == 'mousedown') {
    useMousedown = true
    if (intensity == 'mousedown-only') {
      useMousedownOnly = true
    }
  }
  else if (intensity.substr(0, 'viewport'.length) == 'viewport') {
    if (!(navigator.connection && (navigator.connection.saveData || (navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g'))))) {
      if (intensity == "viewport") {
        /* Biggest iPhone resolution (which we want): 414 × 896 = 370944
         * Small 7" tablet resolution (which we don’t want): 600 × 1024 = 614400
         * Note that the viewport (which we check here) is smaller than the resolution due to the UI’s chrome */
        if (document.documentElement.clientWidth * document.documentElement.clientHeight < 450000) {
          useViewport = true
        }
      }
      else if (intensity == "viewport-all") {
        useViewport = true
      }
    }
  }
  else {
    const milliseconds = parseInt(intensity)
    if (!isNaN(milliseconds)) {
      delayOnHover = milliseconds
    }
  }
}

if (isSupported) {
  const eventListenersOptions = {
    capture: true,
    passive: true,
  }

  if (!useMousedownOnly) {
    document.addEventListener('touchstart', touchstartListener, eventListenersOptions)
  }

  if (!useMousedown) {
    document.addEventListener('mouseover', mouseoverListener, eventListenersOptions)
  }
  else if (!mousedownShortcut) {
      document.addEventListener('mousedown', mousedownListener, eventListenersOptions)
  }

  if (mousedownShortcut) {
    document.addEventListener('mousedown', mousedownShortcutListener, eventListenersOptions)
  }

  if (useViewport) {
    let triggeringFunction
    if (window.requestIdleCallback) {
      triggeringFunction = (callback) => {
        requestIdleCallback(callback, {
          timeout: 1500,
        })
      }
    }
    else {
      triggeringFunction = (callback) => {
        callback()
      }
    }

    triggeringFunction(() => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const linkElement = entry.target
            intersectionObserver.unobserve(linkElement)
            preload(linkElement.href)
          }
        })
      })

      document.querySelectorAll('a').forEach((linkElement) => {
        if (isPreloadable(linkElement)) {
          intersectionObserver.observe(linkElement)
        }
      })
    })
  }
}

function touchstartListener(event) {
  /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
   * must be assigned on touchstart to be measured on mouseover. */
  lastTouchTimestamp = performance.now()

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement.href)
}

function mouseoverListener(event) {
  if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  linkElement.addEventListener('mouseout', mouseoutListener, {passive: true})

  mouseoverTimer = setTimeout(() => {
    preload(linkElement.href)
    mouseoverTimer = undefined
  }, delayOnHover)
}

function mousedownListener(event) {
  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement.href)
}

function mouseoutListener(event) {
  if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
    return
  }

  if (mouseoverTimer) {
    clearTimeout(mouseoverTimer)
    mouseoverTimer = undefined
  }
}

function mousedownShortcutListener(event) {
  if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  const linkElement = event.target.closest('a')

  if (event.which > 1 || event.metaKey || event.ctrlKey) {
    return
  }

  if (!linkElement) {
    return
  }

  linkElement.addEventListener('click', function (event) {
    if (event.detail == 1337) {
      return
    }

    event.preventDefault()
  }, {capture: true, passive: false, once: true})

  const customEvent = new MouseEvent('click', {view: window, bubbles: true, cancelable: false, detail: 1337})
  linkElement.dispatchEvent(customEvent)
}

function isPreloadable(linkElement) {
  if (!linkElement || !linkElement.href) {
    return
  }

  if (useWhitelist && !('instant' in linkElement.dataset)) {
    return
  }

  if (!allowExternalLinks && linkElement.origin != location.origin && !('instant' in linkElement.dataset)) {
    return
  }

  if (!['http:', 'https:'].includes(linkElement.protocol)) {
    return
  }

  if (linkElement.protocol == 'http:' && location.protocol == 'https:') {
    return
  }

  if (!allowQueryString && linkElement.search && !('instant' in linkElement.dataset)) {
    return
  }

  if (linkElement.hash && linkElement.pathname + linkElement.search == location.pathname + location.search) {
    return
  }

  if ('noInstant' in linkElement.dataset) {
    return
  }

  return true
}

function preload(url) {
  if (prefetches.has(url)) {
    return
  }

  const prefetcher = document.createElement('link')
  prefetcher.rel = 'prefetch'
  prefetcher.href = url
  document.head.appendChild(prefetcher)

  prefetches.add(url)
}
;
const dmt = document.getElementById('dark-mode-toggle');
const ttb = document.getElementById("to-top");
const nb = document.getElementById("navbar");
var psp = window.pageYOffset;
var ut = null;

//Theme
setTheme(getT());
dmt.addEventListener('click', () => {
    setTheme(getT() === "dark" ? "light" : "dark");
});

function getT() {
    let theme = localStorage.getItem("theme");
    if (!theme){
        theme = 'dark'
        localStorage.setItem('theme', theme);
    }
    return theme;
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);    
    setUTT(theme);
}


//Utterance
const utO = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {           
            self.unobserve(entry.target);
            var s = document.createElement('script');

            for (var i = 0; i < entry.target.attributes.length; i++) {
                var attrib = entry.target.attributes[i];
                s.setAttribute(attrib.name, attrib.value);
            }
            s.setAttribute("theme", getT() === 'dark' ? "github-dark" : "github-light");
            
            entry.target.appendChild(s); 
        }
    }
)});

document.querySelectorAll('#utterance-container').forEach(js => { utO.observe(js); });

function setUTT(theme) {
    if (!ut) {
        ut = document.querySelector('.utterances-frame');
    }
    if (ut) {
        ut.contentWindow.postMessage(
            {
                type: 'set-theme',
                theme: theme === 'dark' ? 'github-dark' : 'github-light'
            }, 
            'https://utteranc.es'
        );
    }
}


//Scrolling
window.onscroll = function scrollFunction() {    
  var currentScrollPos = window.pageYOffset;

  if (currentScrollPos > 200) {
    ttb.style.visibility = "visible";
    ttb.style.opacity = "1";
    
    if (psp >= currentScrollPos) {
        nb.style.top = "0";
    } else {
        nb.style.top = "-3em";
    }
  } else {
    ttb.style.visibility = "hidden";
    ttb.style.opacity = "0";
    nb.style.top = "0";
  }

  psp = currentScrollPos;
}

ttb.addEventListener('click', () => {
    document.documentElement.scrollTo({
        top: 0,
        behavior: "smooth"
    })
});


//Hacky fix stick header anchors
document.onclick = function (e) {
    if (e != null &&
        e.target != null && 
        e.target.tagName == 'A' && 
        e.target.getAttribute("href").startsWith("#")){
        document.documentElement.scrollTo(0,0);
        psp = 0;
    }
};

//Lazy-load
function loadImg(img)
{
    const source = img.parentElement.querySelector('source');        
    source.srcset = source.getAttribute('data-srcset');
    img.src = img.getAttribute('data-src');
}

const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ('loading' in HTMLImageElement.prototype) {
    lazyImages.forEach(img => { loadImg(img);  })
} 
else {
    const imgObserver = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                self.unobserve(entry.target);
                loadImg(entry.target);
            }
        });
    });
    lazyImages.forEach(img => { imgObserver.observe(img);  })
} 
