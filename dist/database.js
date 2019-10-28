"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Database = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// todo implement indexes
// todo implement search cache
var Database =
/*#__PURE__*/
function () {
  function Database() {
    var _this = this;

    var collections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var storageDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "".concat(__dirname, "/.local");

    _classCallCheck(this, Database);

    this.__collections = collections;
    this.__storageDir = storageDir;
    this.__guidBase = Date.now();
    this.__data = {};
    this.__indexes = {
      values: {},
      _: {}
    };
    this.__transactionsDepth = 0;
    this.__transactionsData = {};

    var hookDefault = function hookDefault(database, dataBefore) {
      return function (database, dataAfter) {
        return null;
      };
    };

    Object.keys(this.__collections).forEach(function (collection) {
      var collectionDescription = _objectSpread({}, {
        onPost: hookDefault,
        onPut: hookDefault,
        onPatch: hookDefault,
        onDelete: hookDefault
      }, {}, _this.__collections[collection]);

      _this.__collections[collection] = collectionDescription;
      _this.__data[collection] = {};
    });

    this.__restore();

    process.on('exit', function (code) {
      console.log('exiting with code and shutting down database', code);

      _this.__shutdown();
    }); // catches ctrl+c event

    process.on('SIGINT', function (e) {
      console.log('SIGINT', e);
      process.exit();
    }); // catches "kill pid" (for example: nodemon restart)

    process.on('SIGUSR1', function (e) {
      console.log('SIGUSR1', e);
      process.exit();
    });
    process.on('SIGUSR2', function (e) {
      console.log('SIGUSR2', e);
      process.exit();
    }); // catches uncaught exceptions

    process.on('uncaughtException', function (e) {
      console.log('uncaughtException', e);
      process.exit();
    });
  }

  _createClass(Database, [{
    key: "transactionsStart",
    value: function transactionsStart(callback) {
      this.__transactionsDepth++;

      if (callback) {
        try {
          var afterCommit = callback(this, this.__transactionsDepth);
          this.transactionsCommit();
          afterCommit && afterCommit();
        } catch (e) {
          console.error(e);
          this.transactionsRollback();
          throw new Error(e);
        }
      }
    }
  }, {
    key: "transactionsCommit",
    value: function transactionsCommit() {
      var _this2 = this;

      this.__transactionsDepth > 0 && this.__transactionsDepth--;

      if (this.__transactionsDepth === 0) {
        Object.values(this.__transactionsData).forEach(function (c) {
          c["delete"] === true ? delete _this2.__data[c.collection][c.record._] : _this2.__data[c.collection][c.record._] = c.record;

          _this2.__updateIndexes(c);
        });
        var date = new Date().toISOString().split('T')[0];
        var transactionsFileName = "".concat(this.__storageDir, "/transactions/").concat(date, ".txt");

        _fs["default"].appendFileSync(transactionsFileName, JSON.stringify(this.__transactionsData) + '\n');

        this.__transactionsData = {};
      }
    }
  }, {
    key: "transactionsRollback",
    value: function transactionsRollback() {
      this.__transactionsData = {};
      this.__transactionsDepth = 0;
    }
  }, {
    key: "post",
    value: function post(collection) {
      var record = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.__transactionsDepth === 0) {
        throw new Error("start transaction before doing post");
      }

      if (!this.__collections[collection]) {
        throw new Error("collection ".concat(collection, " not exists"));
      }

      var doAfter = this.__collections[collection].onPost(this, record);

      record._ = this.__getNextGuid();
      this.__transactionsData[record._] = {
        collection: collection,
        record: record
      };
      doAfter && doAfter(this, _objectSpread({}, record));
      return record;
    }
  }, {
    key: "put",
    value: function put(collection, record) {
      if (this.__transactionsDepth === 0) {
        throw new Error("start transaction before doing put");
      }

      var doAfter = this.__collections[collection].onPut(this, record);

      this.__transactionsData[record._] = {
        collection: collection,
        record: record
      };
      doAfter && doAfter(this, _objectSpread({}, record));
      return this.__transactionsData[record._].record;
    }
  }, {
    key: "patch",
    value: function patch(collection, record) {
      if (this.__transactionsDepth === 0) {
        throw new Error("start transaction before doing patch");
      }

      var recordInData = this.__data[collection][record._];
      var recordInTransaction = this.__data[collection][record._];

      var recordPatch = _objectSpread({}, this.__data[collection][record._], {}, this.__transactionsData[record._] || {}, {}, record);

      var doAfter = this.__collections[collection].onPut(this, record);

      this.__transactionsData[record._] = {
        collection: collection,
        record: recordPatch
      };
      doAfter && doAfter(this, _objectSpread({}, recordPatch));
      return this.__transactionsData[record._].record;
    }
  }, {
    key: "get",
    value: function get(collection, _) {
      if (!this.__data[collection]) {
        throw new Error("collection not exists");
      }

      if (!this.__data[collection][_]) {
        throw new Error("record not found");
      }

      return _objectSpread({}, this.__data[collection][_]);
    }
  }, {
    key: "delete",
    value: function _delete(collection, _) {
      if (this.__transactionsDepth === 0) {
        throw new Error("start transaction before doing delete");
      }

      this.__transactionsData[_] = {
        collection: collection,
        record: {
          _: _
        },
        "delete": true
      };
    }
  }, {
    key: "filter",
    value: function filter(collection) {
      var _filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return true;
      };

      return Object.values(this.__data[collection]).filter(_filter);
    }
  }, {
    key: "search",
    value: function search(collection) {
      var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var keys = Object.keys(query);
      var values = Object.values(this.__data[collection]).filter(function (i) {
        return keys.reduce(function (a, c) {
          return a && i[c] === query[c];
        }, true);
      });
      return values;
    }
  }, {
    key: "__restore",
    value: function __restore() {
      var collectionsFileName = "".concat(this.__storageDir, "/collections/index.json");
      var indexesFileName = "".concat(this.__storageDir, "/indexes/index.json");

      if (!_fs["default"].existsSync(this.__storageDir)) {
        throw new Error("folder ".concat(this.__storageDir, " not exists"));
      }

      if (!_fs["default"].existsSync("".concat(this.__storageDir, "/collections"))) {
        _fs["default"].mkdirSync("".concat(this.__storageDir, "/collections"));

        _fs["default"].writeFileSync(collectionsFileName, '{}', {
          encoding: 'utf8'
        });
      }

      if (!_fs["default"].existsSync("".concat(this.__storageDir, "/indexes"))) {
        _fs["default"].mkdirSync("".concat(this.__storageDir, "/indexes"));

        _fs["default"].writeFileSync(indexesFileName, '{}', {
          encoding: 'utf8'
        });
      }

      if (!_fs["default"].existsSync("".concat(this.__storageDir, "/transactions"))) {
        _fs["default"].mkdirSync("".concat(this.__storageDir, "/transactions"));
      }

      var collectionsContent = _fs["default"].readFileSync(collectionsFileName, {
        encoding: 'utf8'
      });

      var collectionsData = JSON.parse(collectionsContent);

      var indexesContent = _fs["default"].readFileSync(indexesFileName, {
        encoding: 'utf8'
      });

      var indexesData = JSON.parse(indexesContent);
      Object.assign(this.__data, collectionsData);
      Object.assign(this.__indexes, indexesData);
    }
  }, {
    key: "__shutdown",
    value: function __shutdown() {
      var collectionsFileName = "".concat(this.__storageDir, "/collections/index.json");
      var indexesFileName = "".concat(this.__storageDir, "/indexes/index.json");

      _fs["default"].writeFileSync(collectionsFileName, JSON.stringify(this.__data), {
        encoding: 'utf8'
      });

      _fs["default"].writeFileSync(indexesFileName, JSON.stringify(this.__indexes), {
        encoding: 'utf8'
      });
    }
  }, {
    key: "__updateIndexes",
    value: function __updateIndexes(commit) {//console.warn('__updateIndexes not implemented ')
    }
  }, {
    key: "__getNextGuid",
    value: function __getNextGuid() {
      return this.__guidBase++;
    }
  }]);

  return Database;
}();

exports.Database = Database;