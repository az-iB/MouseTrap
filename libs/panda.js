/**
 * @preserve
 * DOM Panda
 * --
 * Client-side web page layout rendering engine
 *
 * @author Jan Kuca <jan@jankuca>, http://jankuca.com
 * @license Creative Commons 3.0 Attribution/Share-alike Unported License
 *
 */

var panda = {};

/**
 * Walks the DOM tree
 * @constructor
 */
panda.Walker = function (root) {
  this.root = root || this.getRootElement();
  this.index = -1;
  this.items = Array.prototype.slice.call(this.root.childNodes);
  this.sub = null;
};

/**
 * Moves to the next element
 */
panda.Walker.prototype.walk = function () {
  let that = this;

  if (this.index === -1) {
    this.index += 1;
    this.onnode(this.root);
  } else {
    if (this.items[this.index]) {
      if (this.index === 0 && typeof this.onlevelin === 'function') {
        this.onlevelin();
      }
      let node = this.items[this.index];

      switch (node.nodeType) {
        case node.ELEMENT_NODE:
          let sub = new panda.Walker(node);

          this.sub = sub;
          sub.onnode = this.onnode;
          sub.onlevelin = this.onlevelin;
          sub.onlevelout = this.onlevelout;
          sub.onend = function () {
            if (typeof this.onlevelout === 'function') {
              this.onlevelout();
            }
            that.sub = null;
            that.index += 1;
            that.walk();
          };
          sub.walk();
          sub = null;
          break;
        case node.TEXT_NODE:
          if (/\S/.test(node.nodeValue)) {
            this.index += 1;
            this.onnode(node);
          }
          break;
        default:
          this.index += 1;
          this.walk();
      }
    } else {
      if (this.sub !== null) {
        this.sub.walk();
      } else {
        this.onend();
      }
    }
  }
};
/**
 * Returns the root <html> element
 * @return {HTMLHtmlElement} The root <html> element
 */
panda.Walker.prototype.getRootElement = function () {
  return document.getElementsByTagName('head')[0].parentNode;
};
/**
 * Handles deferred calls
 */
panda.Deferred = function () {
  this.pending = [];
  this.completed = false;
  this.status = null;
  this.result = null;
};
/**
 * Attaches success and failure callback functions
 * @param {function()} successCallback The callback function to call on success
 * @param {function()=} failureCallback The callback function to call on failure
 * @param {Object=} ctx The context in which to call the callback functions
 * @return {panda.Deferred}
 */
panda.Deferred.prototype.then = function (successCallback, failureCallback, ctx) {
  this.pending.push({
    success: successCallback,
    failure: (typeof arguments[1] === 'function') ? failureCallback : null,
    _ctx: ctx || (arguments.length === 2 && typeof arguments[1] === 'object' ? arguments[1] : null) || null
  });

  if (this.completed) {
    this.callback();
  }

  return this;
};

/**
 * @param {function()} callback The callback function to call
 * @param {Object=} ctx The context in which to call the callback function
 * @return {panda.Deferred}
 */
panda.Deferred.prototype.thenEnsure = function (callback, ctx) {
  this.then(callback, callback, ctx);
  return this;
};

/**
 * Sets up piping into another {panda.Deferred} object
 * @param {panda.Deferred} target The Deferred object to pipe to
 * @return {panda.Deferred}
 */
panda.Deferred.prototype.pipe = function (target) {
  this.then(function (result) {
    target.complete('success', result);
  }, function (result) {
    target.complete('failure', result);
  });

  return this;
};

/**
 * Completes the action by calling the appropriate callback functions
 * @param {string} status Identifies the set of callback functions to call
 * @param {*} result The data to pass the callback functions
 */
panda.Deferred.prototype.complete = function (status, result) {
  this.completed = true;
  this.status = status;
  this.result = (typeof result !== 'undefined') ? result : null;

  this.callback();
};

/**
 * Calls the appropriate callback functions
 */
panda.Deferred.prototype.callback = function () {
  let status = this.status;

  // let result = this.result;

  let step;

  while (this.pending[0]) {
    step = this.pending.shift();
    if (typeof step[status] === 'function') {
      step[status].call(step._ctx, this.result);
    }
  }
};
/**
 * Renders the DOM nodes
 * @constructor
 */
panda.Renderer = function () {
};
/**
 * Initializes the renderer
 */
panda.Renderer.prototype.init = function (root) {
  this.buildCanvas();
  this.imageProxy = new panda.ImageProxy();
};
/**
 * Gets the image out of the canvas
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.getImage = function () {
  let dfr = new panda.Deferred();

  try {
    let img = new Image();

    img.onload = function () {
      dfr.complete('success', img);
    };
    img.src = this.canvas.toDataURL();
  } catch (err) {
    dfr.complete('failure', err);
  }

  return dfr;
};
/**
 * Builds a canvas
 */
panda.Renderer.prototype.buildCanvas = function (root) {
  let canvas = document.createElement('canvas');

  let bounds = this.root.getBoundingClientRect();

  canvas.width = bounds.right - bounds.left;
  canvas.height = bounds.bottom - bounds.top;
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');

  // background
  this.ctx.fillStyle = 'white';
  this.ctx.fillRect(0, 0, canvas.width, canvas.height);
};
/**
 * Renders a DOM node
 * @param {Node} node The DOM node to render
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderNode = function (node) {
  if (!this.root) {
    this.root = node;
    this.init();
  }

  switch (node.nodeType) {
    case node.ELEMENT_NODE:
      return this.renderElement(node);
    case node.TEXT_NODE:
      return this.renderTextNode(node);
    default:
      let dfr = new panda.Deferred();

      dfr.complete('success');
      return dfr;
  }
};
/**
 * Renders a DOM element node
 * @param {Element} node The DOM element node to render
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderElement = function (node) {
  let dfr = new panda.Deferred();

  let rects = node.getClientRects();

  if (rects.length === 0) {
    dfr.complete('success');
  } else if (rects.length === 1) {
    // implies a block or one-line inline element
    this.renderElementPart(node, rects.item(0), panda.Renderer.RenderModes.COMPLETE_PART)
      .pipe(dfr);
  } else {
    // implies an inline element
    let that = this;

    let ii = rects.length;

    let renderPart = function (i) {
      /* var mode;
      if (i === 0) {
        mode = panda.Renderer.RenderModes.FIRST_PART;
      } else if (i === ii - 1) {
        mode = panda.Renderer.RenderModes.LAST_PART;
      } else {
        mode = panda.Renderer.RenderModes.MIDDLE_PART;
      }*/

      that.renderElementPart(node, rects.item(i++)).then(function () {
        if (i !== ii) {
          renderPart(i);
        } else {
          dfr.complete('success');
        }
      });
    };

    renderPart(0);
  }

  return dfr;
};
/**
 * @param {Element} node The element to render a part of
 * @param {ClientRect} rect The client rectangle of the part
 * @param {panda.Renderer.RenderModes=} mode The mode in which to render the part
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderElementPart = function (node, rect, mode) {
  mode = mode || panda.Renderer.RenderModes.COMPLETE_PART;

  let ctx = this.ctx;

  let dfr = new panda.Deferred();

  if (rect.right - rect.left > 0 && rect.bottom - rect.top > 0) {
    let elCanvas = document.createElement('canvas');

    // let elCtx = elCanvas.getContext('2d');

    elCanvas.width = rect.right - rect.left;
    elCanvas.height = rect.bottom - rect.top;

    this.renderElementBackground(node, elCanvas).then(function () {
      this.renderElementBorder(node, elCanvas);

      let imgDfr = new panda.Deferred();

      if (node.tagName === 'IMG') {
        this.renderImageElementContents(node, elCanvas).pipe(imgDfr);
      } else {
        imgDfr.complete('success');
      }
      imgDfr.thenEnsure(function () {
        this.clipElement(node, elCanvas);
        ctx.drawImage(elCanvas,
          rect.left + window.scrollX,
          rect.top + window.scrollY,
          rect.right - rect.left,
          rect.bottom - rect.top
        );
        dfr.complete('success');
      }, this);
    }, this);
  } else {
    dfr.complete('success');
  }

  return dfr;
};

/**
 * @param {Element} node The element to render background of
 * @param {HTMLCanvasElement} canvas The canvas to render onto
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderElementBackground = function (node, canvas) {
  let dfr = new panda.Deferred();

  let style = window.getComputedStyle(node, null);

  let ctx = canvas.getContext('2d');

  // color
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // image
  this.getBackgroundImage(style).then(function (img) {
    this.renderElementBackgroundRepeated(style, img, canvas);
    dfr.complete('success');
  }, function () {
    dfr.complete('success');
  }, this);

  return dfr;
};

/**
 * @param {CSSStyleDeclaration} style Style to get the position from
 * @param {Image} img The background image
 * @param {number} width Width of the node
 * @param {number} height Height of the node
 */
panda.Renderer.prototype.getBackgroundPosition = function (style, img, width, height) {
  let pos = style.backgroundPosition.split(' ');

  let x = pos[0];

  let y = pos[1];

  if (x.search('%') !== -1) {
    x = Math.round((width - img.width) * (parseInt(x, 10) / 100));
  } else {
    x = parseInt(x, 10);
  }
  if (y.search('%') !== -1) {
    y = Math.round((height - img.height) * (parseInt(y, 10) / 100));
  } else {
    y = parseInt(y, 10);
  }

  return [x, y];
};

/**
 * @param {CSSStyleDeclaration} style Style to get the repetition settings from
 * @param {Image} img The background image
 * @param {HTMLCanvasElement} canvas The canvas to render the background onto
 */
panda.Renderer.prototype.renderElementBackgroundRepeated = function (style, img, canvas) {
  let ctx = canvas.getContext('2d');

  let width = canvas.width;

  let height = canvas.height;

  let pos = this.getBackgroundPosition(style, img, width, height);

  let x = pos[0];

  let y = pos[1];

  let tileWidth = img.width;

  let tileHeight = img.height;

  let repeat = style.backgroundRepeat;

  if (repeat === 'no-repeat') {
    ctx.drawImage(img, x, y);
  } else if (repeat === 'repeat') {
    if (y > 0) y -= tileHeight;
    while (y < height) {
      x = pos[0];
      if (x > 0) x -= tileWidth;
      while (x < width) {
        ctx.drawImage(img, x, y);
        x += tileWidth;
      }
      y += tileHeight;
    }
  } else if (repeat === 'repeat-x') {
    if (x > 0) x -= tileWidth;
    while (x < width) {
      ctx.drawImage(img, x, y);
      x += tileWidth;
    }
  } else if (repeat === 'repeat-y') {
    if (y > 0) y -= tileHeight;
    while (y < height) {
      ctx.drawImage(img, x, y);
      y += tileHeight;
    }
  }
};

/**
 * @param {Element} node The element to render borders of
 * @param {HTMLCanvasElement} canvas The canvas to render onto
 */
panda.Renderer.prototype.renderElementBorder = function (node, canvas) {
  let style = window.getComputedStyle(node, null);

  let ctx = canvas.getContext('2d');

  let width = canvas.width;

  let height = canvas.height;

  let top = parseInt(style.borderTopWidth || 0, 10);

  let right = parseInt(style.borderRightWidth || 0, 10);

  let bottom = parseInt(style.borderBottomWidth || 0, 10);

  let left = parseInt(style.borderLeftWidth || 0, 10);

  let topLeft = parseInt(style.borderTopLeftRadius || 0, 10);

  let topRight = parseInt(style.borderTopRightRadius || 0, 10);

  let bottomRight = parseInt(style.borderBottomRightRadius || 0, 10);

  let bottomLeft = parseInt(style.borderBottomLeftRadius || 0, 10);

  ctx.globalCompositeOperation = 'source-over';
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';

  if (top) {
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = top;
    ctx.beginPath();
    ctx.moveTo(topLeft, top / 2);
    ctx.lineTo(width - topRight, top / 2);
    ctx.stroke();
    ctx.closePath();
  }
  if (bottom) {
    ctx.strokeStyle = style.borderBottomColor;
    ctx.lineWidth = bottom;
    ctx.beginPath();
    ctx.moveTo(bottomLeft, height - bottom / 2);
    ctx.lineTo(width - bottomRight, height - bottom / 2);
    ctx.stroke();
    ctx.closePath();
  }
  if (left) {
    ctx.strokeStyle = style.borderLeftColor;
    ctx.lineWidth = left;
    ctx.beginPath();
    ctx.moveTo(topLeft, -left / 2 + top);
    ctx.quadraticCurveTo(left / 2, -left / 2 + top, left / 2, topLeft);
    ctx.lineTo(left / 2, height - bottomLeft);
    ctx.quadraticCurveTo(left / 2, height + left / 2 - bottom, bottomLeft, height + left / 2 - bottom);
    ctx.stroke();
    ctx.closePath();
  }
  if (right) {
    ctx.strokeStyle = style.borderRightColor;
    ctx.lineWidth = right;
    ctx.beginPath();
    ctx.moveTo(width - topRight, -right / 2 + top);
    ctx.quadraticCurveTo(width - right / 2, -right / 2 + top, width - right / 2, topRight);
    ctx.lineTo(width - right / 2, height - bottomRight);
    ctx.quadraticCurveTo(
      width - right / 2,
      height - right / 2 + bottom,
      width - bottomRight,
      height - right / 2 + bottom
    );
    ctx.stroke();
    ctx.closePath();
  }
};

/**
 * @param {Image} img The image element to render contents of
 * @param {HTMLCanvasElement} canvas The canvas to render onto
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderImageElementContents = function (img, canvas) {
  let dfr = new panda.Deferred();

  let style = window.getComputedStyle(img, null);

  let ctx = canvas.getContext('2d');

  let width = canvas.width;

  let height = canvas.height;

  let top = parseInt(style.borderTopWidth || 0, 10) + parseInt(style.paddingTop || 0, 10);

  let right = parseInt(style.borderRightWidth || 0, 10) + parseInt(style.paddingRight || 0, 10);

  let bottom = parseInt(style.borderBottomWidth || 0, 10) + parseInt(style.paddingBottom || 0, 10);

  let left = parseInt(style.borderLeftWidth || 0, 10) + parseInt(style.paddingLeft || 0, 10);

  ctx.globalCompositeOperation = 'source-over';
  if (img.src.split(':')[0] === 'data') {
    ctx.drawImage(img, left, top,
      width - left - right,
      height - top - bottom
    );
    dfr.complete('success');
  } else {
    this.imageProxy.get(img.src).then(function (img) {
      ctx.drawImage(img, left, top,
        width - left - right,
        height - top - bottom
      );
      dfr.complete('success');
    }, function (err) {
      dfr.complete('failure', err);
    });
  }

  return dfr;
};

panda.Renderer.prototype.getOverflowParentOf = function (node) {
  let root = this.root;

  let style;

  while (node !== root) {
    node = node.parentNode;
    style = window.getComputedStyle(node, null);
    if (style.overflow === 'hidden') {
      return node;
    }
  }
  return null;
};

/**
 * @param {Element} node The node
 * @param {HTMLCanvasElement} canvas The canvas to clip
 */
panda.Renderer.prototype.clipElement = function (node, canvas) {
  this.clipElementWithBorderRadius(node, canvas);
  this.clipElementWithParentOverflow(node, canvas);
};

/**
 * @param {Element} node The node
 * @param {HTMLCanvasElement} canvas The canvas to clip
 */
panda.Renderer.prototype.clipElementWithBorderRadius = function (node, canvas) {
  let style = window.getComputedStyle(node, null);

  let ctx = canvas.getContext('2d');

  let width = canvas.width;

  let height = canvas.height;

  let topLeft = parseInt(style.borderTopLeftRadius || 0, 10);

  let topRight = parseInt(style.borderTopRightRadius || 0, 10);

  let bottomRight = parseInt(style.borderBottomRightRadius || 0, 10);

  let bottomLeft = parseInt(style.borderBottomLeftRadius || 0, 10);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'black';
  if (topLeft) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(topLeft, 0);
    ctx.quadraticCurveTo(0, 0, 0, topLeft);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  };
  if (topRight) {
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - topRight, 0);
    ctx.quadraticCurveTo(width, 0, width, topRight);
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fill();
  };
  if (bottomRight) {
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - bottomRight, height);
    ctx.quadraticCurveTo(width, height, width, height - bottomRight);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  };
  if (bottomLeft) {
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(bottomLeft, height);
    ctx.quadraticCurveTo(0, height, 0, height - bottomLeft);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  };
};

/**
 * @param {Element} node The node
 * @param {HTMLCanvasElement} canvas The canvas to clip
 */
panda.Renderer.prototype.clipElementWithParentOverflow = function (node, canvas) {
  let clip = this.getOverflowParentOf(node);

  if (clip) {
    let ctx = canvas.getContext('2d');

    let width = canvas.width;

    let height = canvas.height;

    let style = window.getComputedStyle(clip);

    let top = parseInt(style.borderTopWidth || 0, 10) + parseInt(style.paddingTop || 0, 10);

    let right = parseInt(style.borderRightWidth || 0, 10) + parseInt(style.paddingRight || 0, 10);

    let bottom = parseInt(style.borderBottomWidth || 0, 10) + parseInt(style.paddingBottom || 0, 10);

    let left = parseInt(style.borderLeftWidth || 0, 10) + parseInt(style.paddingLeft || 0, 10);

    let nodeRect = node.getBoundingClientRect();

    let clipRect = clip.getBoundingClientRect();

    let clipLeft = clipRect.left - nodeRect.left + left;

    let clipTop = clipRect.top - nodeRect.top + top;

    let clipRight = nodeRect.right - clipRect.right + right;

    let clipBottom = nodeRect.bottom - clipRect.bottom + bottom;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'black';
    // TODO: take overflow parent border radius into account
    if (clipTop > 0) {
      ctx.fillRect(0, 0, width, clipTop);
    }
    if (clipLeft > 0) {
      ctx.fillRect(0, 0, clipLeft, height);
    }
    if (clipRight > 0) {
      ctx.fillRect(width - clipRight, 0, clipRight, height);
    }
    if (clipBottom > 0) {
      ctx.fillRect(0, height - clipBottom, width, clipBottom);
    }
  }
};

/**
 * Renders a DOM text node
 * @param {Text} node The text node to render
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.renderTextNode = function (node) {
  let dfr = new panda.Deferred();

  let range = document.createRange();

  range.selectNode(node);
  let rects = range.getClientRects();

  if (rects.length !== 0) {
    let parent = node.parentNode;

    // let first = (parent.firstChild === node);

    let style = window.getComputedStyle(parent);

    let ctx = this.ctx;

    ctx.fillStyle = style.color;
    ctx.textBaseline = 'top';
    ctx.font = [
      style.fontStyle, style.fontVariant, style.fontWeight,
      style.fontSize,
      style.fontFamily
    ].join(' ').replace('normal normal normal ', '');

    let words = node.nodeValue
      .replace(/\s{2,}/g, ' ')
      .replace(/(^\s+|\s+$)/g, '')
      .split(/(?: +| *\n+ *)/);

    let r = 0;

    let rect = rects.item(r++);

    let buffer = '';

    let fitting = '';

    words.forEach(function (word, i) {
      if (i !== 0) {
        buffer += ' ';
      }
      buffer += word;
      let measure = ctx.measureText(buffer).width;

      if (measure > rect.width) {
        ctx.fillText(fitting,
            rect.left + window.scrollX,
            rect.top + window.scrollY
        );
        buffer = word;
        fitting = word;
        rect = rects.item(r++) || rect;
      } else {
        fitting = buffer;
      }
    });
    if (fitting !== '') {
      ctx.fillText(fitting,
          rect.left + window.scrollX,
          rect.top + window.scrollY
      );
    }
  }

  dfr.complete('success');
  return dfr;
};

/**
 * @param {CSSStyleDeclaration} style Style to get the background from
 * @return {panda.Deferred}
 */
panda.Renderer.prototype.getBackgroundImage = function (style) {
  let dfr = new panda.Deferred();

  if (/^url\(/.test(style.backgroundImage)) {
    let url = style.backgroundImage.match(/^url\('?"?(.+?)"?'?\)/)[1];

    this.imageProxy.get(url).pipe(dfr);
  } else {
    dfr.complete('failure');
  }

  return dfr;
};
/**
 * @enum {number}
 */
panda.Renderer.RenderModes = {
  COMPLETE_PART: 0,
  FIRST_PART: 1,
  MIDDLE_PART: 2,
  LAST_PART: 3
};
/**
 * @constructor
 */
panda.ImageProxy = function () {
};

/**
 * @param {string} url A URL of the image to load
 * @return {panda.Deferred}
 */
panda.ImageProxy.prototype.get = function (url) {
  let dfr = new panda.Deferred();

  let img = new Image();

  img.onload = function () {
    dfr.complete('success', img);
  };
  img.onerror = function (err) {
    dfr.complete('failure', err);
  };
  img.src = this.getProxyURL(url);

  return dfr;
};

/**
 * @param {string} url The original URL
 * @return {string} A proxy URL
 */
panda.ImageProxy.prototype.getProxyURL = function (url) {
  return '/imageproxy?url=' + url;
};

export default panda;
