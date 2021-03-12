// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/modules/serverComm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

async function serverComm(URL, fieldData) {
  let response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify(fieldData)
  });
  let result = await response.json(); // console.log(JSON.stringify(result));

  return result;
}

var _default = serverComm;
exports.default = _default;
},{}],"js/modules/helpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeElem = removeElem;
exports.setSessionGridArray = setSessionGridArray;
exports.getSessionGridArray = getSessionGridArray;
exports.getRowArray = getRowArray;
exports.normalizeGridArray = normalizeGridArray;
exports.getIndexArr = getIndexArr;
exports.isEqualArr = isEqualArr;
const body = document.querySelector("body");

function removeElem(elemClass) {
  if (!!body.querySelector(elemClass)) {
    body.querySelector(elemClass).remove();
  }
}

function setSessionGridArray(array) {
  sessionStorage.setItem("hexGridArray", JSON.stringify(array));
}

function getSessionGridArray() {
  return JSON.parse(sessionStorage.getItem("hexGridArray"));
}

function getRowArray(axis, index, array) {
  const rowArray = [];
  array.forEach(element => {
    if (element[axis] === index) {
      rowArray.push(element);
    }
  });
  return rowArray;
}

function normalizeGridArray(incomingArray, normalArray) {
  let normalizedArray = [];
  incomingArray.forEach(elem => {
    let index;
    normalArray.some(function (item, i) {
      return item.x == elem.x && item.y == elem.y && item.z == elem.z && ~(index = i);
    });
    normalizedArray.splice(index, 0, elem);
  });
  return normalizedArray;
}

function getIndexArr(fieldRadius) {
  const indexArr = [];

  for (let i = -fieldRadius + 1; i < fieldRadius; i++) {
    indexArr.push(i);
  }

  return indexArr;
}

function isEqualArr(arr1, arr2) {
  for (let i = 0; i < arr1.length; ++i) {
    if (JSON.stringify(arr1[i]) != JSON.stringify(arr2[i])) return false;
  }

  return true;
}
},{}],"js/modules/grawGrid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("./helpers");

function drawGrid(gridArray, elemCoefficient, gameOver) {
  const field = document.querySelector(".game-field");
  const fieldWidth = field.offsetWidth;
  const fieldHeight = field.offsetHeight;
  const elemRadius = elemCoefficient * 2 - 1;
  const cellSize = fieldWidth / (elemCoefficient * 4 + 1);
  const cellWidth = (cellSize * 2).toFixed(2);
  const cellHeight = (cellWidth * Math.sqrt(3) / 2).toFixed(2);
  const divElem = document.createElement("div");
  divElem.className = "hex-grid";
  divElem.innerHTML = ``;
  let cellClass = "css-2";

  switch (elemCoefficient) {
    case 2:
      cellClass = "css-3";
      break;

    case 3:
      cellClass = "css-4";
  }

  let x, y, z, value;
  let posX, posY;
  let centerX = fieldWidth / 2;
  let centerY = fieldHeight / 2;

  for (let i = 0; i < gridArray.length; i++) {
    [x, y, z, value] = [gridArray[i].x, gridArray[i].y, gridArray[i].z, gridArray[i].value];
    posX = x * 3 * cellWidth / 4 + centerX - cellWidth / 2;
    posY = (z - y) * cellHeight / 2 + centerY - cellHeight / 2;
    divElem.innerHTML += `
      <div class="${cellClass}" 
        data-value="${value}" 
        data-x="${x}" 
        data-y="${y}" 
        data-z="${z}" 
        style="left: ${posX}px; top: ${posY}px;">${value || ""}</div>
      `;
  }

  if (!!document.querySelector(".hex-grid")) {
    (0, _helpers.removeElem)(".hex-grid");
  }

  field.append(divElem);
  document.querySelector(".game-status").innerHTML = `Game Status: ${gameOver ? 'Game Over' : 'Playing'}`;
}

var _default = drawGrid;
exports.default = _default;
},{"./helpers":"js/modules/helpers.js"}],"js/modules/gameField.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initField = initField;
exports.updateCells = updateCells;
exports.getUpdate = getUpdate;
Object.defineProperty(exports, "drawGrid", {
  enumerable: true,
  get: function () {
    return _grawGrid.default;
  }
});

var _serverComm = _interopRequireDefault(require("./serverComm"));

var _grawGrid = _interopRequireDefault(require("./grawGrid"));

var _helpers = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let elemCoefficient = 1;
let hexGridArray = [];
let gameURL;
let gameOver = false;
let normalArray;

function initField(inputRadius, data, reqURL) {
  elemCoefficient = parseInt(inputRadius) - 1;
  hexGridArray = generateField(elemCoefficient);
  normalArray = JSON.parse(JSON.stringify(hexGridArray));
  gameURL = reqURL;
  updateCells(hexGridArray, data);
  (0, _grawGrid.default)(hexGridArray, elemCoefficient, gameOver);
  return hexGridArray;
}

function generateField(elemCoefficient) {
  const fieldSize = elemCoefficient;
  const gridArray = [];
  const value = 0;

  for (let i = -fieldSize; i < fieldSize + 1; i++) {
    for (let j = fieldSize; j > -fieldSize - 1; j--) {
      for (let k = fieldSize; k > -fieldSize - 1; k--) {
        if (i + j + k == 0) {
          gridArray.push({
            'x': i,
            'y': j,
            'z': k,
            'value': value
          });
        }
      }
    }
  }

  return gridArray;
}

function updateCells(gridArray, dataArray) {
  gridArray.forEach(element => {
    dataArray.forEach(data => {
      const result = element.x === data.x && element.y === data.y && element.z === data.z;

      if (!!result) {
        element.value = data.value;
      }
    });
  });
} // **
// direction Boolean  - true for positive / false for negative


function getMovedRow(rowArray, direction, axis) {
  const moveArr = JSON.parse(JSON.stringify(rowArray));
  const filteredInitArr = moveArr.filter(elem => elem.value > 0);
  if (!filteredInitArr.length) return moveArr;
  const valuesArray = filteredInitArr.length && filteredInitArr.map(elem => elem.value) || [];
  const countZeroes = moveArr.length - valuesArray.length;
  const zeroesArray = new Array(countZeroes).fill(0);
  const newArray = direction ? [...valuesArray, ...zeroesArray] : [...zeroesArray, ...valuesArray];

  for (const [index, value] of moveArr.entries()) {
    value.value = newArray[index];
  }

  return moveArr;
}

function getCalculatedRow(rowArray, direction) {
  const initArr = JSON.parse(JSON.stringify(rowArray));

  if (direction) {
    for (let i = initArr.length - 1; i > 0; i--) {
      if (initArr[i].value === initArr[i - 1].value) {
        initArr[i].value += initArr[i - 1].value;
        initArr[i - 1].value = 0;
      }
    }
  } else {
    for (let i = 1; i < initArr.length; i++) {
      if (initArr[i - 1].value === initArr[i].value) {
        initArr[i - 1].value += initArr[i].value;
        initArr[i].value = 0;
      }
    }
  }

  return initArr;
}

function generateNewArray(axis, fieldRadius, direction, incomingArray, resultArray, changeFunction) {
  const indexArr = (0, _helpers.getIndexArr)(fieldRadius);
  const rawArray = [];

  for (let indexVal of indexArr) {
    let rowArray = (0, _helpers.getRowArray)(axis, indexVal, incomingArray);
    let bufferRow = changeFunction(rowArray, direction, axis);
    rawArray.push(...bufferRow);
  }

  let normalizedArray = (0, _helpers.normalizeGridArray)(rawArray, normalArray);
  resultArray.push(...normalizedArray);
}

function getUpdate(axis, fieldRadius, direction) {
  const options = [axis, fieldRadius, direction];
  let movedHexGridArray = [];
  let calculatedHexGridArray = [];
  let updatedHexGridArray = [];
  generateNewArray(...options, hexGridArray, movedHexGridArray, getMovedRow);
  generateNewArray(...options, movedHexGridArray, calculatedHexGridArray, getCalculatedRow); // check changes in cells array

  if ((0, _helpers.isEqualArr)(calculatedHexGridArray, hexGridArray)) {
    return;
  }

  generateNewArray(...options, calculatedHexGridArray, updatedHexGridArray, getMovedRow);
  addNewCellData(updatedHexGridArray).then(result => {
    hexGridArray = result;
    gameOver = gameOverCheck(hexGridArray, fieldRadius);
    (0, _grawGrid.default)(hexGridArray, elemCoefficient, gameOver);
  });
}

function addNewCellData(incomingArray) {
  let newArray = (0, _serverComm.default)(gameURL, incomingArray.filter(elem => elem.value > 0)).then(result => {
    incomingArray.map(elem => {
      result.forEach(data => {
        const result = elem.x === data.x && elem.y === data.y && elem.z === data.z;

        if (!!result) {
          elem.value = data.value;
        }
      });
    });
    return incomingArray;
  });
  return newArray;
}

function gameOverCheck(incomingArray, fieldRadius) {
  let count = 0;
  const indexArr = (0, _helpers.getIndexArr)(fieldRadius);

  for (let axis of ['x', 'y', 'z']) for (let indexVal of indexArr) {
    let rowArray = (0, _helpers.getRowArray)(axis, indexVal, incomingArray);

    for (let i = 1; i < rowArray.length; i++) {
      if (rowArray[i].value === rowArray[i - 1].value || rowArray[i].value === 0) {
        count++;
      }

      ;
    }
  }

  return !count;
}
},{"./serverComm":"js/modules/serverComm.js","./grawGrid":"js/modules/grawGrid.js","./helpers":"js/modules/helpers.js"}],"js/main.js":[function(require,module,exports) {
"use strict";

var _serverComm = _interopRequireDefault(require("./modules/serverComm"));

var _gameField = require("./modules/gameField");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const baseURL = "http://51.15.207.127:13337";
let fieldData = [];
let fieldRadius;
let hexGridArray = [];
const body = document.querySelector("body");
body.addEventListener("click", function (e) {
  const target = e.target;

  if (!!target.closest(".radius-btn")) {
    fieldRadius = target.value;
    initialDataReq(target);
  }
});

function initialDataReq(target) {
  const reqURL = `${baseURL}/${target.value}`;
  (0, _serverComm.default)(reqURL, fieldData).then(result => hexGridArray = (0, _gameField.initField)(target.value, result, reqURL));
}

function getDirection(e) {
  switch (e.code) {
    case "KeyW":
      hexGridArray = (0, _gameField.getUpdate)("x", fieldRadius, 1);
      break;

    case "KeyS":
      hexGridArray = (0, _gameField.getUpdate)("x", fieldRadius, 0);
      break;

    case "KeyE":
      hexGridArray = (0, _gameField.getUpdate)("y", fieldRadius, 0);
      break;

    case "KeyA":
      hexGridArray = (0, _gameField.getUpdate)("y", fieldRadius, 1);
      break;

    case "KeyQ":
      hexGridArray = (0, _gameField.getUpdate)("z", fieldRadius, 1);
      break;

    case "KeyD":
      hexGridArray = (0, _gameField.getUpdate)("z", fieldRadius, 0);
      break;

    default:
      return;
  }
}

document.addEventListener("keydown", getDirection);
},{"./modules/serverComm":"js/modules/serverComm.js","./modules/gameField":"js/modules/gameField.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52981" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map