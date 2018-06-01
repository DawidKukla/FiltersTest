var collections;
(function (collections) {
    function defaultCompare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    }
    collections.defaultCompare = defaultCompare;
    function defaultEquals(a, b) {
        return a === b;
    }
    collections.defaultEquals = defaultEquals;
    function defaultToString(item) {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item;
        }
        else {
            return item.toString();
        }
    }
    collections.defaultToString = defaultToString;
    function makeString(item, join = ",") {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item.toString();
        }
        else {
            var toret = "{";
            var first = true;
            for (var prop in item) {
                if (item.hasOwnProperty(prop)) {
                    if (first)
                        first = false;
                    else
                        toret = toret + join;
                    toret = toret + prop + ":" + item[prop];
                }
            }
            return toret + "}";
        }
    }
    collections.makeString = makeString;
    function isFunction(func) {
        return (typeof func) === 'function';
    }
    collections.isFunction = isFunction;
    function isUndefined(obj) {
        return (typeof obj) === 'undefined';
    }
    collections.isUndefined = isUndefined;
    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    collections.isString = isString;
    function reverseCompareFunction(compareFunction) {
        if (!collections.isFunction(compareFunction)) {
            return function (a, b) {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
        }
        else {
            return function (d, v) {
                return compareFunction(d, v) * -1;
            };
        }
    }
    collections.reverseCompareFunction = reverseCompareFunction;
    function compareToEquals(compareFunction) {
        return function (a, b) {
            return compareFunction(a, b) === 0;
        };
    }
    collections.compareToEquals = compareToEquals;
    let arrays;
    (function (arrays) {
        function indexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.indexOf = indexOf;
        function lastIndexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = length - 1; i >= 0; i--) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.lastIndexOf = lastIndexOf;
        function contains(array, item, equalsFunction) {
            return arrays.indexOf(array, item, equalsFunction) >= 0;
        }
        arrays.contains = contains;
        function remove(array, item, equalsFunction) {
            var index = arrays.indexOf(array, item, equalsFunction);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        }
        arrays.remove = remove;
        function frequency(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            var freq = 0;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    freq++;
                }
            }
            return freq;
        }
        arrays.frequency = frequency;
        function equals(array1, array2, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            if (array1.length !== array2.length) {
                return false;
            }
            var length = array1.length;
            for (var i = 0; i < length; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        }
        arrays.equals = equals;
        function copy(array) {
            return array.concat();
        }
        arrays.copy = copy;
        function swap(array, i, j) {
            if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
                return false;
            }
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return true;
        }
        arrays.swap = swap;
        function toString(array) {
            return '[' + array.toString() + ']';
        }
        arrays.toString = toString;
        function forEach(array, callback) {
            var lenght = array.length;
            for (var i = 0; i < lenght; i++) {
                if (callback(array[i]) === false) {
                    return;
                }
            }
        }
        arrays.forEach = forEach;
    })(arrays = collections.arrays || (collections.arrays = {}));
    class LinkedList {
        constructor() {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        }
        add(item, index) {
            if (collections.isUndefined(index)) {
                index = this.nElements;
            }
            if (index < 0 || index > this.nElements || collections.isUndefined(item)) {
                return false;
            }
            var newNode = this.createNode(item);
            if (this.nElements === 0) {
                this.firstNode = newNode;
                this.lastNode = newNode;
            }
            else if (index === this.nElements) {
                this.lastNode.next = newNode;
                this.lastNode = newNode;
            }
            else if (index === 0) {
                newNode.next = this.firstNode;
                this.firstNode = newNode;
            }
            else {
                var prev = this.nodeAtIndex(index - 1);
                newNode.next = prev.next;
                prev.next = newNode;
            }
            this.nElements++;
            return true;
        }
        first() {
            if (this.firstNode !== null) {
                return this.firstNode.element;
            }
            return undefined;
        }
        last() {
            if (this.lastNode !== null) {
                return this.lastNode.element;
            }
            return undefined;
        }
        elementAtIndex(index) {
            var node = this.nodeAtIndex(index);
            if (node === null) {
                return undefined;
            }
            return node.element;
        }
        indexOf(item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (collections.isUndefined(item)) {
                return -1;
            }
            var currentNode = this.firstNode;
            var index = 0;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    return index;
                }
                index++;
                currentNode = currentNode.next;
            }
            return -1;
        }
        contains(item, equalsFunction) {
            return (this.indexOf(item, equalsFunction) >= 0);
        }
        remove(item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (this.nElements < 1 || collections.isUndefined(item)) {
                return false;
            }
            var previous = null;
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    if (currentNode === this.firstNode) {
                        this.firstNode = this.firstNode.next;
                        if (currentNode === this.lastNode) {
                            this.lastNode = null;
                        }
                    }
                    else if (currentNode === this.lastNode) {
                        this.lastNode = previous;
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    else {
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    this.nElements--;
                    return true;
                }
                previous = currentNode;
                currentNode = currentNode.next;
            }
            return false;
        }
        clear() {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        }
        equals(other, equalsFunction) {
            var eqF = equalsFunction || collections.defaultEquals;
            if (!(other instanceof LinkedList)) {
                return false;
            }
            if (this.size() !== other.size()) {
                return false;
            }
            return this.equalsAux(this.firstNode, other.firstNode, eqF);
        }
        equalsAux(n1, n2, eqF) {
            while (n1 !== null) {
                if (!eqF(n1.element, n2.element)) {
                    return false;
                }
                n1 = n1.next;
                n2 = n2.next;
            }
            return true;
        }
        removeElementAtIndex(index) {
            if (index < 0 || index >= this.nElements) {
                return undefined;
            }
            var element;
            if (this.nElements === 1) {
                element = this.firstNode.element;
                this.firstNode = null;
                this.lastNode = null;
            }
            else {
                var previous = this.nodeAtIndex(index - 1);
                if (previous === null) {
                    element = this.firstNode.element;
                    this.firstNode = this.firstNode.next;
                }
                else if (previous.next === this.lastNode) {
                    element = this.lastNode.element;
                    this.lastNode = previous;
                }
                if (previous !== null) {
                    element = previous.next.element;
                    previous.next = previous.next.next;
                }
            }
            this.nElements--;
            return element;
        }
        forEach(callback) {
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (callback(currentNode.element) === false) {
                    break;
                }
                currentNode = currentNode.next;
            }
        }
        reverse() {
            var previous = null;
            var current = this.firstNode;
            var temp = null;
            while (current !== null) {
                temp = current.next;
                current.next = previous;
                previous = current;
                current = temp;
            }
            temp = this.firstNode;
            this.firstNode = this.lastNode;
            this.lastNode = temp;
        }
        toArray() {
            var array = [];
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                array.push(currentNode.element);
                currentNode = currentNode.next;
            }
            return array;
        }
        size() {
            return this.nElements;
        }
        isEmpty() {
            return this.nElements <= 0;
        }
        toString() {
            return arrays.toString(this.toArray());
        }
        nodeAtIndex(index) {
            if (index < 0 || index >= this.nElements) {
                return null;
            }
            if (index === (this.nElements - 1)) {
                return this.lastNode;
            }
            var node = this.firstNode;
            for (var i = 0; i < index; i++) {
                node = node.next;
            }
            return node;
        }
        createNode(item) {
            return {
                element: item,
                next: null
            };
        }
    }
    collections.LinkedList = LinkedList;
    class Dictionary {
        constructor(toStrFunction) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || collections.defaultToString;
        }
        getValue(key) {
            var pair = this.table[this.toStr(key)];
            if (collections.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        }
        setValue(key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var ret;
            var k = this.toStr(key);
            var previousElement = this.table[k];
            if (collections.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            }
            else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        }
        remove(key) {
            var k = this.toStr(key);
            var previousElement = this.table[k];
            if (!collections.isUndefined(previousElement)) {
                delete this.table[k];
                this.nElements--;
                return previousElement.value;
            }
            return undefined;
        }
        keys() {
            var array = [];
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    array.push(pair.key);
                }
            }
            return array;
        }
        values() {
            var array = [];
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    array.push(pair.value);
                }
            }
            return array;
        }
        forEach(callback) {
            for (var name in this.table) {
                if (this.table.hasOwnProperty(name)) {
                    var pair = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        }
        containsKey(key) {
            return !collections.isUndefined(this.getValue(key));
        }
        clear() {
            this.table = {};
            this.nElements = 0;
        }
        size() {
            return this.nElements;
        }
        isEmpty() {
            return this.nElements <= 0;
        }
        toString() {
            var toret = "{";
            this.forEach((k, v) => {
                toret = toret + "\n\t" + k.toString() + " : " + v.toString();
            });
            return toret + "\n}";
        }
        static ConvertObjectToDictionary(obj) {
            var dict = new Dictionary();
            if (obj && !jQuery.isEmptyObject(obj))
                for (var key in obj) {
                    dict.setValue(key, obj[key]);
                }
            return dict;
        }
        static ConvertDictionaryToObject(dictionary) {
            var result = {};
            if (dictionary && !jQuery.isEmptyObject(dictionary))
                dictionary.forEach((key, val) => {
                    result[key] = val;
                });
            return result;
        }
        static FromObjectDictionaryToDictionary(obj, keySelector, valueSelector, getHashCodeSelector, dictionaryInstanceCreator = null) {
            var dict = null;
            if (dictionaryInstanceCreator) {
                dict = dictionaryInstanceCreator();
            }
            else {
                dict = new Dictionary(getHashCodeSelector);
            }
            if (!obj)
                return dict;
            Object.keys(obj).forEach((key) => {
                var value = obj[key];
                dict.setValue(keySelector(key), valueSelector(value));
            });
            return dict;
        }
        static FromObjectToDictionary(obj, keySelector, valueSelector, getHashCodeSelector) {
            var dict = new Dictionary(getHashCodeSelector);
            if (!obj)
                return dict;
            Object.keys(obj).forEach((key) => {
                var value = obj[key];
                dict.setValue(keySelector(key), valueSelector(value));
            });
            return dict;
        }
        static FromArrayLikeObjectToDictionary(obj, keySelector, valueSelector, getHashCodeSelector) {
            return Dictionary.FromObjectDictionaryToDictionary(obj, keySelector, valueSelector, getHashCodeSelector);
        }
        static FromDictionaryToObject(dict, keySelector, valueSelector) {
            var result = {};
            if (!dict)
                return result;
            dict.forEach((key, value) => {
                result[keySelector(key)] = valueSelector(value);
            });
            return result;
        }
        static GetCopy(dictionary, deepCopyFunction = o => o) {
            var result = new Dictionary();
            if (dictionary && !jQuery.isEmptyObject(dictionary)) {
                dictionary.forEach((key, val) => {
                    result.setValue(key, deepCopyFunction(val));
                });
            }
            return result;
        }
    }
    collections.Dictionary = Dictionary;
    class MultiDictionary {
        constructor(toStrFunction, valuesEqualsFunction, allowDuplicateValues = false) {
            this.dict = new Dictionary(toStrFunction);
            this.equalsF = valuesEqualsFunction || collections.defaultEquals;
            this.allowDuplicate = allowDuplicateValues;
        }
        getValue(key) {
            var values = this.dict.getValue(key);
            if (collections.isUndefined(values)) {
                return [];
            }
            return arrays.copy(values);
        }
        setValue(key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return false;
            }
            if (!this.containsKey(key)) {
                this.dict.setValue(key, [value]);
                return true;
            }
            var array = this.dict.getValue(key);
            if (!this.allowDuplicate) {
                if (arrays.contains(array, value, this.equalsF)) {
                    return false;
                }
            }
            array.push(value);
            return true;
        }
        remove(key, value) {
            if (collections.isUndefined(value)) {
                var v = this.dict.remove(key);
                return !collections.isUndefined(v);
            }
            var array = this.dict.getValue(key);
            if (arrays.remove(array, value, this.equalsF)) {
                if (array.length === 0) {
                    this.dict.remove(key);
                }
                return true;
            }
            return false;
        }
        keys() {
            return this.dict.keys();
        }
        values() {
            var values = this.dict.values();
            var array = [];
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                for (var j = 0; j < v.length; j++) {
                    array.push(v[j]);
                }
            }
            return array;
        }
        containsKey(key) {
            return this.dict.containsKey(key);
        }
        clear() {
            this.dict.clear();
        }
        size() {
            return this.dict.size();
        }
        isEmpty() {
            return this.dict.isEmpty();
        }
    }
    collections.MultiDictionary = MultiDictionary;
    class Heap {
        constructor(compareFunction) {
            this.data = [];
            this.compare = compareFunction || collections.defaultCompare;
        }
        leftChildIndex(nodeIndex) {
            return (2 * nodeIndex) + 1;
        }
        rightChildIndex(nodeIndex) {
            return (2 * nodeIndex) + 2;
        }
        parentIndex(nodeIndex) {
            return Math.floor((nodeIndex - 1) / 2);
        }
        minIndex(leftChild, rightChild) {
            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                }
                else {
                    return leftChild;
                }
            }
            else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                }
                else {
                    return rightChild;
                }
            }
        }
        siftUp(index) {
            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        }
        siftDown(nodeIndex) {
            var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
                arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            }
        }
        peek() {
            if (this.data.length > 0) {
                return this.data[0];
            }
            else {
                return undefined;
            }
        }
        add(element) {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        }
        removeRoot() {
            if (this.data.length > 0) {
                var obj = this.data[0];
                this.data[0] = this.data[this.data.length - 1];
                this.data.splice(this.data.length - 1, 1);
                if (this.data.length > 0) {
                    this.siftDown(0);
                }
                return obj;
            }
            return undefined;
        }
        contains(element) {
            var equF = collections.compareToEquals(this.compare);
            return arrays.contains(this.data, element, equF);
        }
        size() {
            return this.data.length;
        }
        isEmpty() {
            return this.data.length <= 0;
        }
        clear() {
            this.data.length = 0;
        }
        forEach(callback) {
            arrays.forEach(this.data, callback);
        }
    }
    collections.Heap = Heap;
    class Stack {
        constructor() {
            this.list = new LinkedList();
        }
        push(elem) {
            return this.list.add(elem, 0);
        }
        add(elem) {
            return this.list.add(elem, 0);
        }
        pop() {
            return this.list.removeElementAtIndex(0);
        }
        peek() {
            return this.list.first();
        }
        size() {
            return this.list.size();
        }
        contains(elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        }
        isEmpty() {
            return this.list.isEmpty();
        }
        clear() {
            this.list.clear();
        }
        remove(item, equalsFunction) {
            return this.list.remove(item, equalsFunction);
        }
        forEach(callback) {
            this.list.forEach(callback);
        }
    }
    collections.Stack = Stack;
    class Queue {
        constructor() {
            this.list = new LinkedList();
        }
        enqueue(elem) {
            return this.list.add(elem);
        }
        add(elem) {
            return this.list.add(elem);
        }
        dequeue() {
            if (this.list.size() !== 0) {
                var el = this.list.first();
                this.list.removeElementAtIndex(0);
                return el;
            }
            return undefined;
        }
        peek() {
            if (this.list.size() !== 0) {
                return this.list.first();
            }
            return undefined;
        }
        size() {
            return this.list.size();
        }
        contains(elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        }
        isEmpty() {
            return this.list.size() <= 0;
        }
        clear() {
            this.list.clear();
        }
        forEach(callback) {
            this.list.forEach(callback);
        }
    }
    collections.Queue = Queue;
    class PriorityQueue {
        constructor(compareFunction) {
            this.heap = new Heap(collections.reverseCompareFunction(compareFunction));
        }
        enqueue(element) {
            return this.heap.add(element);
        }
        add(element) {
            return this.heap.add(element);
        }
        dequeue() {
            if (this.heap.size() !== 0) {
                var el = this.heap.peek();
                this.heap.removeRoot();
                return el;
            }
            return undefined;
        }
        peek() {
            return this.heap.peek();
        }
        contains(element) {
            return this.heap.contains(element);
        }
        isEmpty() {
            return this.heap.isEmpty();
        }
        size() {
            return this.heap.size();
        }
        clear() {
            this.heap.clear();
        }
        forEach(callback) {
            this.heap.forEach(callback);
        }
    }
    collections.PriorityQueue = PriorityQueue;
    class Set {
        constructor(toStringFunction) {
            this.dictionary = new Dictionary(toStringFunction);
        }
        contains(element) {
            return this.dictionary.containsKey(element);
        }
        add(element) {
            if (this.contains(element) || collections.isUndefined(element)) {
                return false;
            }
            else {
                this.dictionary.setValue(element, element);
                return true;
            }
        }
        intersection(otherSet) {
            var set = this;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    set.remove(element);
                }
                return true;
            });
        }
        union(otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.add(element);
                return true;
            });
        }
        difference(otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.remove(element);
                return true;
            });
        }
        isSubsetOf(otherSet) {
            if (this.size() > otherSet.size()) {
                return false;
            }
            var isSub = true;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    isSub = false;
                    return false;
                }
                return true;
            });
            return isSub;
        }
        remove(element) {
            if (!this.contains(element)) {
                return false;
            }
            else {
                this.dictionary.remove(element);
                return true;
            }
        }
        forEach(callback) {
            this.dictionary.forEach(function (k, v) {
                return callback(v);
            });
        }
        toArray() {
            return this.dictionary.values();
        }
        isEmpty() {
            return this.dictionary.isEmpty();
        }
        size() {
            return this.dictionary.size();
        }
        clear() {
            this.dictionary.clear();
        }
        toString() {
            return arrays.toString(this.toArray());
        }
    }
    collections.Set = Set;
    class Bag {
        constructor(toStrFunction) {
            this.toStrF = toStrFunction || collections.defaultToString;
            this.dictionary = new Dictionary(this.toStrF);
            this.nElements = 0;
        }
        add(element, nCopies = 1) {
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                var node = {
                    value: element,
                    copies: nCopies
                };
                this.dictionary.setValue(element, node);
            }
            else {
                this.dictionary.getValue(element).copies += nCopies;
            }
            this.nElements += nCopies;
            return true;
        }
        count(element) {
            if (!this.contains(element)) {
                return 0;
            }
            else {
                return this.dictionary.getValue(element).copies;
            }
        }
        contains(element) {
            return this.dictionary.containsKey(element);
        }
        remove(element, nCopies = 1) {
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                return false;
            }
            else {
                var node = this.dictionary.getValue(element);
                if (nCopies > node.copies) {
                    this.nElements -= node.copies;
                }
                else {
                    this.nElements -= nCopies;
                }
                node.copies -= nCopies;
                if (node.copies <= 0) {
                    this.dictionary.remove(element);
                }
                return true;
            }
        }
        toArray() {
            var a = [];
            var values = this.dictionary.values();
            var vl = values.length;
            for (var i = 0; i < vl; i++) {
                var node = values[i];
                var element = node.value;
                var copies = node.copies;
                for (var j = 0; j < copies; j++) {
                    a.push(element);
                }
            }
            return a;
        }
        toSet() {
            var toret = new Set(this.toStrF);
            var elements = this.dictionary.values();
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var value = elements[i].value;
                toret.add(value);
            }
            return toret;
        }
        forEach(callback) {
            this.dictionary.forEach(function (k, v) {
                var value = v.value;
                var copies = v.copies;
                for (var i = 0; i < copies; i++) {
                    if (callback(value) === false) {
                        return false;
                    }
                }
                return true;
            });
        }
        size() {
            return this.nElements;
        }
        isEmpty() {
            return this.nElements === 0;
        }
        clear() {
            this.nElements = 0;
            this.dictionary.clear();
        }
    }
    collections.Bag = Bag;
    class BSTree {
        constructor(compareFunction) {
            this.root = null;
            this.compare = compareFunction || collections.defaultCompare;
            this.nElements = 0;
        }
        add(element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            if (this.insertNode(this.createNode(element)) !== null) {
                this.nElements++;
                return true;
            }
            return false;
        }
        clear() {
            this.root = null;
            this.nElements = 0;
        }
        isEmpty() {
            return this.nElements === 0;
        }
        size() {
            return this.nElements;
        }
        contains(element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            return this.searchNode(this.root, element) !== null;
        }
        remove(element) {
            var node = this.searchNode(this.root, element);
            if (node === null) {
                return false;
            }
            this.removeNode(node);
            this.nElements--;
            return true;
        }
        inorderTraversal(callback) {
            this.inorderTraversalAux(this.root, callback, {
                stop: false
            });
        }
        preorderTraversal(callback) {
            this.preorderTraversalAux(this.root, callback, {
                stop: false
            });
        }
        postorderTraversal(callback) {
            this.postorderTraversalAux(this.root, callback, {
                stop: false
            });
        }
        levelTraversal(callback) {
            this.levelTraversalAux(this.root, callback);
        }
        minimum() {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.minimumAux(this.root).element;
        }
        maximum() {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.maximumAux(this.root).element;
        }
        forEach(callback) {
            this.inorderTraversal(callback);
        }
        toArray() {
            var array = [];
            this.inorderTraversal(function (element) {
                array.push(element);
                return true;
            });
            return array;
        }
        height() {
            return this.heightAux(this.root);
        }
        searchNode(node, element) {
            var cmp = null;
            while (node !== null && cmp !== 0) {
                cmp = this.compare(element, node.element);
                if (cmp < 0) {
                    node = node.leftCh;
                }
                else if (cmp > 0) {
                    node = node.rightCh;
                }
            }
            return node;
        }
        transplant(n1, n2) {
            if (n1.parent === null) {
                this.root = n2;
            }
            else if (n1 === n1.parent.leftCh) {
                n1.parent.leftCh = n2;
            }
            else {
                n1.parent.rightCh = n2;
            }
            if (n2 !== null) {
                n2.parent = n1.parent;
            }
        }
        removeNode(node) {
            if (node.leftCh === null) {
                this.transplant(node, node.rightCh);
            }
            else if (node.rightCh === null) {
                this.transplant(node, node.leftCh);
            }
            else {
                var y = this.minimumAux(node.rightCh);
                if (y.parent !== node) {
                    this.transplant(y, y.rightCh);
                    y.rightCh = node.rightCh;
                    y.rightCh.parent = y;
                }
                this.transplant(node, y);
                y.leftCh = node.leftCh;
                y.leftCh.parent = y;
            }
        }
        inorderTraversalAux(node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.rightCh, callback, signal);
        }
        levelTraversalAux(node, callback) {
            var queue = new Queue();
            if (node !== null) {
                queue.enqueue(node);
            }
            while (!queue.isEmpty()) {
                node = queue.dequeue();
                if (callback(node.element) === false) {
                    return;
                }
                if (node.leftCh !== null) {
                    queue.enqueue(node.leftCh);
                }
                if (node.rightCh !== null) {
                    queue.enqueue(node.rightCh);
                }
            }
        }
        preorderTraversalAux(node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.rightCh, callback, signal);
        }
        postorderTraversalAux(node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.rightCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
        }
        minimumAux(node) {
            while (node.leftCh !== null) {
                node = node.leftCh;
            }
            return node;
        }
        maximumAux(node) {
            while (node.rightCh !== null) {
                node = node.rightCh;
            }
            return node;
        }
        heightAux(node) {
            if (node === null) {
                return -1;
            }
            return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
        }
        insertNode(node) {
            var parent = null;
            var position = this.root;
            var cmp = null;
            while (position !== null) {
                cmp = this.compare(node.element, position.element);
                if (cmp === 0) {
                    return null;
                }
                else if (cmp < 0) {
                    parent = position;
                    position = position.leftCh;
                }
                else {
                    parent = position;
                    position = position.rightCh;
                }
            }
            node.parent = parent;
            if (parent === null) {
                this.root = node;
            }
            else if (this.compare(node.element, parent.element) < 0) {
                parent.leftCh = node;
            }
            else {
                parent.rightCh = node;
            }
            return node;
        }
        createNode(element) {
            return {
                element: element,
                leftCh: null,
                rightCh: null,
                parent: null
            };
        }
    }
    collections.BSTree = BSTree;
})(collections || (collections = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb2xsZWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxJQUFPLFdBQVcsQ0F5akZqQjtBQXpqRkQsV0FBTyxXQUFXO0lBOEJkLHdCQUFrQyxDQUFJLEVBQUUsQ0FBSTtRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDUCxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2I7YUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDaEIsT0FBTyxDQUFDLENBQUM7U0FDWjthQUFNO1lBQ0gsT0FBTyxDQUFDLENBQUM7U0FDWjtJQUNMLENBQUM7SUFSZSwwQkFBYyxpQkFRN0IsQ0FBQTtJQU1ELHVCQUFpQyxDQUFJLEVBQUUsQ0FBSTtRQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUZlLHlCQUFhLGdCQUU1QixDQUFBO0lBTUQseUJBQWdDLElBQVM7UUFDckMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2YsT0FBTyxpQkFBaUIsQ0FBQztTQUM1QjthQUFNLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxPQUFPLHNCQUFzQixDQUFDO1NBQ2pDO2FBQU0sSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7YUFBTTtZQUNILE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQVZlLDJCQUFlLGtCQVU5QixDQUFBO0lBS0Qsb0JBQThCLElBQU8sRUFBRSxPQUFlLEdBQUc7UUFDckQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2YsT0FBTyxpQkFBaUIsQ0FBQztTQUM1QjthQUFNLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxPQUFPLHNCQUFzQixD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QixNQUFNLEdBQUcsUUFBUSxDQUFDO29CQUNsQixRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7cUJBQU07b0JBQ0gsTUFBTSxHQUFHLFFBQVEsQ0FBQztvQkFDbEIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7aUJBQy9CO2FBQ0o7WUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7Z0JBRWpCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZELE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUtPLFVBQVUsQ0FBQyxPQUFVO1lBQ3pCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE1BQU0sRUFBRSxJQUFJO2FBQ2YsQ0FBQztRQUNOLENBQUM7S0FFSjtJQWhhWSxrQkFBTSxTQWdhbEIsQ0FBQTtBQUdMLENBQUMsRUF6akZNLFdBQVcsS0FBWCxXQUFXLFFBeWpGakIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMyBCYXNhcmF0IEFsaSBTeWVkLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4vL1xyXG4vLyBMaWNlbnNlZCB1bmRlciBNSVQgb3BlbiBzb3VyY2UgbGljZW5zZSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbi8vXHJcbi8vIE9yZ2luYWwgamF2YXNjcmlwdCBjb2RlIHdhcyBieSBNYXVyaWNpbyBTYW50b3NcclxuXHJcbi8qKlxyXG4gKiBAbmFtZXNwYWNlIFRvcCBsZXZlbCBuYW1lc3BhY2UgZm9yIGNvbGxlY3Rpb25zLCBhIFR5cGVTY3JpcHQgZGF0YSBzdHJ1Y3R1cmUgbGlicmFyeS5cclxuICovXHJcblxyXG5tb2R1bGUgY29sbGVjdGlvbnMge1xyXG5cclxuICAgIC8qKlxyXG4gICAgKiBGdW5jdGlvbiBzaWduYXR1cmUgZm9yIGNvbXBhcmluZ1xyXG4gICAgKiA8MCBtZWFucyBhIGlzIHNtYWxsZXJcclxuICAgICogPSAwIG1lYW5zIHRoZXkgYXJlIGVxdWFsXHJcbiAgICAqID4wIG1lYW5zIGEgaXMgbGFyZ2VyXHJcbiAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJQ29tcGFyZUZ1bmN0aW9uPFQ+e1xyXG4gICAgICAgIChhOiBULCBiOiBUKTogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBGdW5jdGlvbiBzaWduYXR1cmUgZm9yIGNoZWNraW5nIGVxdWFsaXR5XHJcbiAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRXF1YWxzRnVuY3Rpb248VD57XHJcbiAgICAgICAgKGE6IFQsIGI6IFQpOiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBGdW5jdGlvbiBzaWduYXR1cmUgZm9yIEl0ZXJhdGlvbnMuIFJldHVybiBmYWxzZSB0byBicmVhayBmcm9tIGxvb3BcclxuICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElMb29wRnVuY3Rpb248VD57XHJcbiAgICAgICAgKGE6IFQpOiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCBmdW5jdGlvbiB0byBjb21wYXJlIGVsZW1lbnQgb3JkZXIuXHJcbiAgICAgKiBAZnVuY3Rpb24gICAgIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmU8VD4oYTogVCwgYjogVCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCBmdW5jdGlvbiB0byB0ZXN0IGVxdWFsaXR5LiBcclxuICAgICAqIEBmdW5jdGlvbiAgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0RXF1YWxzPFQ+KGE6IFQsIGI6IFQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gYSA9PT0gYjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmF1bHQgZnVuY3Rpb24gdG8gY29udmVydCBhbiBvYmplY3QgdG8gYSBzdHJpbmcuXHJcbiAgICAgKiBAZnVuY3Rpb24gICAgIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZGVmYXVsdFRvU3RyaW5nKGl0ZW06IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGl0ZW0gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX05VTEwnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoaXRlbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX1VOREVGSU5FRCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9ucy5pc1N0cmluZyhpdGVtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICogSm9pbnMgYWxsIHRoZSBwcm9wZXJpZXMgb2YgdGhlIG9iamVjdCB1c2luZyB0aGUgcHJvdmlkZWQgam9pbiBzdHJpbmcgXHJcbiAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1ha2VTdHJpbmc8VD4oaXRlbTogVCwgam9pbjogc3RyaW5nID0gXCIsXCIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpdGVtID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnQ09MTEVDVElPTl9OVUxMJztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnQ09MTEVDVElPTl9VTkRFRklORUQnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbnMuaXNTdHJpbmcoaXRlbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdG9yZXQgPSBcIntcIjtcclxuICAgICAgICAgICAgdmFyIGZpcnN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcmV0ID0gdG9yZXQgKyBqb2luO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcmV0ID0gdG9yZXQgKyBwcm9wICsgXCI6XCIgKyBpdGVtW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0b3JldCArIFwifVwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgYSBmdW5jdGlvbi5cclxuICAgICAqIEBmdW5jdGlvbiAgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmM6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIGZ1bmMpID09PSAnZnVuY3Rpb24nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudCBpcyB1bmRlZmluZWQuXHJcbiAgICAgKiBAZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iajogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0eXBlb2Ygb2JqKSA9PT0gJ3VuZGVmaW5lZCc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIGEgc3RyaW5nLlxyXG4gICAgICogQGZ1bmN0aW9uXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyhvYmo6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXZlcnNlcyBhIGNvbXBhcmUgZnVuY3Rpb24uXHJcbiAgICAgKiBAZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJldmVyc2VDb21wYXJlRnVuY3Rpb248VD4oY29tcGFyZUZ1bmN0aW9uOiBJQ29tcGFyZUZ1bmN0aW9uPFQ+KTogSUNvbXBhcmVGdW5jdGlvbjxUPiB7XHJcbiAgICAgICAgaWYgKCFjb2xsZWN0aW9ucy5pc0Z1bmN0aW9uKGNvbXBhcmVGdW5jdGlvbikpIHtcclxuLy8gUmVTaGFycGVyIGRpc2FibGUgb25jZSBMYW1iZGFcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuLy8gUmVTaGFycGVyIGRpc2FibGUgb25jZSBMYW1iZGFcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkOiBULCB2OiBUKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGQsIHYpICogLTE7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBlcXVhbCBmdW5jdGlvbiBnaXZlbiBhIGNvbXBhcmUgZnVuY3Rpb24uXHJcbiAgICAgKiBAZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVUb0VxdWFsczxUPihjb21wYXJlRnVuY3Rpb246IElDb21wYXJlRnVuY3Rpb248VD4pOiBJRXF1YWxzRnVuY3Rpb248VD4ge1xyXG4vLyBSZVNoYXJwZXIgZGlzYWJsZSBvbmNlIExhbWJkYVxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYTogVCwgYjogVCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpID09PSAwO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmFtZXNwYWNlIENvbnRhaW5zIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBtYW5pcHVsYXRpbmcgYXJyYXlzLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgbW9kdWxlIGFycmF5cyB7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgaXRlbVxyXG4gICAgICAgICAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCB0aGUgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSB0aGUgZWxlbWVudCB0byBzZWFyY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZCB0byBcclxuICAgICAgICAgKiBjaGVjayBlcXVhbGl0eSBiZXR3ZWVuIDIgZWxlbWVudHMuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50XHJcbiAgICAgICAgICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXksIG9yIC0xIGlmIG5vdCBmb3VuZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gaW5kZXhPZjxUPihhcnJheTogVFtdLCBpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHZhciBlcXVhbHMgPSBlcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIG9mIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50XHJcbiAgICAgICAgICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXkuXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgaW4gd2hpY2ggdG8gc2VhcmNoIHRoZSBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHRvIHNlYXJjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBwb3NpdGlvbiBvZiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxyXG4gICAgICAgICAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5IG9yIC0xIGlmIG5vdCBmb3VuZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gbGFzdEluZGV4T2Y8VD4oYXJyYXk6IFRbXSwgaXRlbTogVCwgZXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248VD4pOiBudW1iZXIge1xyXG4gICAgICAgICAgICB2YXIgZXF1YWxzID0gZXF1YWxzRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIGFycmF5IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0geyp9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBzZWFyY2ggdGhlIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgYXJyYXkgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGV4cG9ydCBmdW5jdGlvbiBjb250YWluczxUPihhcnJheTogVFtdLCBpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlzLmluZGV4T2YoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSA+PSAwO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGZpcnN0IG9jdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgZnJvbSB0aGUgc3BlY2lmaWVkIGFycmF5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHRvIHNlYXJjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB0byBcclxuICAgICAgICAgKiBjaGVjayBlcXVhbGl0eSBiZXR3ZWVuIDIgZWxlbWVudHMuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYXJyYXkgY2hhbmdlZCBhZnRlciB0aGlzIGNhbGwuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZTxUPihhcnJheTogVFtdLCBpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBhcnJheXMuaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIHNwZWNpZmllZCBhcnJheSBlcXVhbFxyXG4gICAgICAgICAqIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBkZXRlcm1pbmUgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSB0aGUgZWxlbWVudCB3aG9zZSBmcmVxdWVuY3kgaXMgdG8gYmUgZGV0ZXJtaW5lZC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIHNwZWNpZmllZCBhcnJheSBcclxuICAgICAgICAgKiBlcXVhbCB0byB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gZnJlcXVlbmN5PFQ+KGFycmF5OiBUW10sIGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogbnVtYmVyIHtcclxuICAgICAgICAgICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRFcXVhbHM7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBmcmVxID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVxdWFscyhhcnJheVtpXSwgaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmVxKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZyZXE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHR3byBzcGVjaWZpZWQgYXJyYXlzIGFyZSBlcXVhbCB0byBvbmUgYW5vdGhlci5cclxuICAgICAgICAgKiBUd28gYXJyYXlzIGFyZSBjb25zaWRlcmVkIGVxdWFsIGlmIGJvdGggYXJyYXlzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyXHJcbiAgICAgICAgICogb2YgZWxlbWVudHMsIGFuZCBhbGwgY29ycmVzcG9uZGluZyBwYWlycyBvZiBlbGVtZW50cyBpbiB0aGUgdHdvIFxyXG4gICAgICAgICAqIGFycmF5cyBhcmUgZXF1YWwgYW5kIGFyZSBpbiB0aGUgc2FtZSBvcmRlci4gXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkxIG9uZSBhcnJheSB0byBiZSB0ZXN0ZWQgZm9yIGVxdWFsaXR5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5MiB0aGUgb3RoZXIgYXJyYXkgdG8gYmUgdGVzdGVkIGZvciBlcXVhbGl0eS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gZWxlbWVtZW50cyBpbiB0aGUgYXJyYXlzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHR3byBhcnJheXMgYXJlIGVxdWFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIGVxdWFsczxUPihhcnJheTE6IFRbXSwgYXJyYXkyOiBUW10sIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBlcXVhbHMgPSBlcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFycmF5MS5sZW5ndGggIT09IGFycmF5Mi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXJyYXkxLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcXVhbHMoYXJyYXkxW2ldLCBhcnJheTJbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBzaGFsbG93IGEgY29weSBvZiB0aGUgc3BlY2lmaWVkIGFycmF5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IHRvIGNvcHkuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IGEgY29weSBvZiB0aGUgc3BlY2lmaWVkIGFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIGNvcHk8VD4oYXJyYXk6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5jb25jYXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN3YXBzIHRoZSBlbGVtZW50cyBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9ucyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSBpbiB3aGljaCB0byBzd2FwIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpIHRoZSBpbmRleCBvZiBvbmUgZWxlbWVudCB0byBiZSBzd2FwcGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBqIHRoZSBpbmRleCBvZiB0aGUgb3RoZXIgZWxlbWVudCB0byBiZSBzd2FwcGVkLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGFycmF5IGlzIGRlZmluZWQgYW5kIHRoZSBpbmRleGVzIGFyZSB2YWxpZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gc3dhcDxUPihhcnJheTogVFtdLCBpOiBudW1iZXIsIGo6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoaSA8IDAgfHwgaSA+PSBhcnJheS5sZW5ndGggfHwgaiA8IDAgfHwgaiA+PSBhcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xyXG4gICAgICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG4gICAgICAgICAgICBhcnJheVtqXSA9IHRlbXA7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nPFQ+KGFycmF5OiBUW10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gJ1snICsgYXJyYXkudG9TdHJpbmcoKSArICddJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIGFycmF5IFxyXG4gICAgICAgICAqIHN0YXJ0aW5nIGZyb20gaW5kZXggMCB0byBsZW5ndGggLSAxLlxyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSBpbiB3aGljaCB0byBpdGVyYXRlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2g8VD4oYXJyYXk6IFRbXSwgY2FsbGJhY2s6IChpdGVtOiBUKSA9PiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBsZW5naHQgPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ2h0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayhhcnJheVtpXSkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBBIGxpbmtlZCBsaXN0IG5vZGVcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUxpbmtlZExpc3ROb2RlPFQ+e1xyXG4gICAgICAgIGVsZW1lbnQ6IFQ7XHJcbiAgICAgICAgbmV4dDogSUxpbmtlZExpc3ROb2RlPFQ+O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBMaW5rZWRMaXN0PFQ+IHtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBGaXJzdCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBmaXJzdE5vZGU6IElMaW5rZWRMaXN0Tm9kZTxUPiA9IG51bGw7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBMYXN0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBsYXN0Tm9kZTogSUxpbmtlZExpc3ROb2RlPFQ+ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBOdW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGxpc3RcclxuICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBuRWxlbWVudHMgPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgTGlua2VkIExpc3QuXHJcbiAgICAgICAgKiBAY2xhc3MgQSBsaW5rZWQgbGlzdCBpcyBhIGRhdGEgc3RydWN0dXJlIGNvbnNpc3Rpbmcgb2YgYSBncm91cCBvZiBub2Rlc1xyXG4gICAgICAgICogd2hpY2ggdG9nZXRoZXIgcmVwcmVzZW50IGEgc2VxdWVuY2UuXHJcbiAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBBZGRzIGFuIGVsZW1lbnQgdG8gdGhpcyBsaXN0LlxyXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBiZSBhZGRlZC5cclxuICAgICAgICAqIEBwYXJhbSB7bnVtYmVyPX0gaW5kZXggb3B0aW9uYWwgaW5kZXggdG8gYWRkIHRoZSBlbGVtZW50LiBJZiBubyBpbmRleCBpcyBzcGVjaWZpZWRcclxuICAgICAgICAqIHRoZSBlbGVtZW50IGlzIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhpcyBsaXN0LlxyXG4gICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgYWRkZWQgb3IgZmFsc2UgaWYgdGhlIGluZGV4IGlzIGludmFsaWRcclxuICAgICAgICAqIG9yIGlmIHRoZSBlbGVtZW50IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGFkZChpdGVtOiBULCBpbmRleD86IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMubkVsZW1lbnRzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLm5FbGVtZW50cyB8fCBjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBuZXdOb2RlID0gdGhpcy5jcmVhdGVOb2RlKGl0ZW0pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uRWxlbWVudHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gdGhpcy5uRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBhdCB0aGUgZW5kLlxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZS5uZXh0ID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGFuZ2UgZmlyc3Qgbm9kZS5cclxuICAgICAgICAgICAgICAgIG5ld05vZGUubmV4dCA9IHRoaXMuZmlyc3ROb2RlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXYgPSB0aGlzLm5vZGVBdEluZGV4KGluZGV4IC0gMSk7XHJcbiAgICAgICAgICAgICAgICBuZXdOb2RlLm5leHQgPSBwcmV2Lm5leHQ7XHJcbiAgICAgICAgICAgICAgICBwcmV2Lm5leHQgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoaXMgbGlzdC5cclxuICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBsaXN0IG9yIHVuZGVmaW5lZCBpZiB0aGUgbGlzdCBpc1xyXG4gICAgICAgICogZW1wdHkuXHJcbiAgICAgICAgKi9cclxuICAgICAgICBmaXJzdCgpOiBUIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpcnN0Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3ROb2RlLmVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogUmV0dXJucyB0aGUgbGFzdCBlbGVtZW50IGluIHRoaXMgbGlzdC5cclxuICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGxpc3Qgb3IgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzXHJcbiAgICAgICAgKiBlbXB0eS5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGxhc3QoKTogVCB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdE5vZGUuZWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoaXMgbGlzdC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggZGVzaXJlZCBpbmRleC5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gaW5kZXggb3IgdW5kZWZpbmVkIGlmIHRoZSBpbmRleCBpc1xyXG4gICAgICAgICAqIG91dCBvZiBib3VuZHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZWxlbWVudEF0SW5kZXgoaW5kZXg6IG51bWJlcik6IFQge1xyXG5cclxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVBdEluZGV4KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGluZGV4IGluIHRoaXMgbGlzdCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGVcclxuICAgICAgICAgKiBzcGVjaWZpZWQgZWxlbWVudCwgb3IgLTEgaWYgdGhlIExpc3QgZG9lcyBub3QgY29udGFpbiB0aGlzIGVsZW1lbnQuXHJcbiAgICAgICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIGxpc3QgYXJlXHJcbiAgICAgICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcclxuICAgICAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXHJcbiAgICAgICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIHZhciBwZXRzQXJlRXF1YWxCeU5hbWUgPSBmdW5jdGlvbihwZXQxLCBwZXQyKSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIE9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGluZGV4IGluIHRoaXMgbGlzdCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZVxyXG4gICAgICAgICAqIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCwgb3IgLTEgaWYgdGhpcyBsaXN0IGRvZXMgbm90IGNvbnRhaW4gdGhlXHJcbiAgICAgICAgICogZWxlbWVudC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpbmRleE9mKGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBlcXVhbHNGID0gZXF1YWxzRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVxdWFsc0YoY3VycmVudE5vZGUuZWxlbWVudCwgaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGxpc3QgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGUgbGlzdCBhcmVcclxuICAgICAgICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXHJcbiAgICAgICAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXHJcbiAgICAgICAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgICAqXHJcbiAgICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAgICogdmFyIHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcclxuICAgICAgICAgICAqICByZXR1cm4gcGV0MS5uYW1lID09PSBwZXQyLm5hbWU7XHJcbiAgICAgICAgICAgKiB9XHJcbiAgICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cclxuICAgICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIE9wdGlvbmFsXHJcbiAgICAgICAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byBlbGVtZW50cyBhcmUgZXF1YWwuXHJcbiAgICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsIGZhbHNlXHJcbiAgICAgICAgICAgKiBvdGhlcndpc2UuXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuaW5kZXhPZihpdGVtLCBlcXVhbHNGdW5jdGlvbikgPj0gMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbiB0aGlzIGxpc3QuXHJcbiAgICAgICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGUgbGlzdCBhcmVcclxuICAgICAgICAgKiBub3QgY29tcGFyYWJsZSB3aXRoIHRoZSA9PT0gb3BlcmF0b3IgYSBjdXN0b20gZXF1YWxzIGZ1bmN0aW9uIHNob3VsZCBiZVxyXG4gICAgICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcclxuICAgICAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogdmFyIHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIGJlIHJlbW92ZWQgZnJvbSB0aGlzIGxpc3QsIGlmIHByZXNlbnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdCBjb250YWluZWQgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB2YXIgZXF1YWxzRiA9IGVxdWFsc0Z1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRFcXVhbHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5FbGVtZW50cyA8IDEgfHwgY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXM6IElMaW5rZWRMaXN0Tm9kZTxUPiA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50Tm9kZTogSUxpbmtlZExpc3ROb2RlPFQ+ID0gdGhpcy5maXJzdE5vZGU7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcXVhbHNGKGN1cnJlbnROb2RlLmVsZW1lbnQsIGl0ZW0pKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZSA9PT0gdGhpcy5maXJzdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSB0aGlzLmZpcnN0Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudE5vZGUgPT09IHRoaXMubGFzdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Tm9kZSA9PT0gdGhpcy5sYXN0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gcHJldmlvdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBjdXJyZW50Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5uZXh0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cy5uZXh0ID0gY3VycmVudE5vZGUubmV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUubmV4dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzLS07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnROb2RlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgbGlzdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gbGlzdC5cclxuICAgICAgICAgKiBUd28gbGlzdHMgYXJlIGVxdWFsIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBvcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge0xpbmtlZExpc3R9IG90aGVyIHRoZSBvdGhlciBsaXN0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLiBJZiB0aGUgZWxlbWVudHMgaW4gdGhlIGxpc3RzXHJcbiAgICAgICAgICogYXJlIGN1c3RvbSBvYmplY3RzIHlvdSBzaG91bGQgcHJvdmlkZSBhIGZ1bmN0aW9uLCBvdGhlcndpc2UgXHJcbiAgICAgICAgICogdGhlID09PSBvcGVyYXRvciBpcyB1c2VkIHRvIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gZWxlbWVudHMuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGxpc3QgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGxpc3QuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXF1YWxzKG90aGVyOiBMaW5rZWRMaXN0PFQ+LCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB2YXIgZXFGID0gZXF1YWxzRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgICAgICAgICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBMaW5rZWRMaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNpemUoKSAhPT0gb3RoZXIuc2l6ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzQXV4KHRoaXMuZmlyc3ROb2RlLCBvdGhlci5maXJzdE5vZGUsIGVxRik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGVxdWFsc0F1eChuMTogSUxpbmtlZExpc3ROb2RlPFQ+LCBuMjogSUxpbmtlZExpc3ROb2RlPFQ+LCBlcUY6IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB3aGlsZSAobjEgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghZXFGKG4xLmVsZW1lbnQsIG4yLmVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbjEgPSBuMS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgbjIgPSBuMi5uZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoaXMgbGlzdC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggZ2l2ZW4gaW5kZXguXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gcmVtb3ZlZCBlbGVtZW50IG9yIHVuZGVmaW5lZCBpZiB0aGUgaW5kZXggaXMgb3V0IG9mIGJvdW5kcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmVFbGVtZW50QXRJbmRleChpbmRleDogbnVtYmVyKTogVCB7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5uRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQ6IFQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5FbGVtZW50cyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy9GaXJzdCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMuZmlyc3ROb2RlLmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMubm9kZUF0SW5kZXgoaW5kZXggLSAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91cyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmZpcnN0Tm9kZS5lbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gdGhpcy5maXJzdE5vZGUubmV4dDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJldmlvdXMubmV4dCA9PT0gdGhpcy5sYXN0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmxhc3ROb2RlLmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHByZXZpb3VzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IHByZXZpb3VzLm5leHQuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cy5uZXh0ID0gcHJldmlvdXMubmV4dC5uZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzLS07XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgbGlzdCBpbiBvcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IChpdGVtOiBUKSA9PiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayhjdXJyZW50Tm9kZS5lbGVtZW50KSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV2ZXJzZXMgdGhlIG9yZGVyIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpbmtlZCBsaXN0IChtYWtlcyB0aGUgbGFzdCBcclxuICAgICAgICAgKiBlbGVtZW50IGZpcnN0LCBhbmQgdGhlIGZpcnN0IGVsZW1lbnQgbGFzdCkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV2ZXJzZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIHByZXZpb3VzOiBJTGlua2VkTGlzdE5vZGU8VD4gPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudDogSUxpbmtlZExpc3ROb2RlPFQ+ID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wOiBJTGlua2VkTGlzdE5vZGU8VD4gPSBudWxsO1xyXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGVtcCA9IGN1cnJlbnQubmV4dDtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQubmV4dCA9IHByZXZpb3VzO1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSBjdXJyZW50O1xyXG4gICAgICAgICAgICAgICAgY3VycmVudCA9IHRlbXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVtcCA9IHRoaXMuZmlyc3ROb2RlO1xyXG4gICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IHRoaXMubGFzdE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSB0ZW1wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBsaXN0IGluIHByb3BlclxyXG4gICAgICAgICAqIHNlcXVlbmNlLlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5LjwqPn0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgbGlzdCxcclxuICAgICAgICAgKiBpbiBwcm9wZXIgc2VxdWVuY2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9BcnJheSgpOiBUW10ge1xyXG4gICAgICAgICAgICB2YXIgYXJyYXk6IFRbXSA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudE5vZGU6IElMaW5rZWRMaXN0Tm9kZTxUPiA9IHRoaXMuZmlyc3ROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goY3VycmVudE5vZGUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgbGlzdC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHMgPD0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheXMudG9TdHJpbmcodGhpcy50b0FycmF5KCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIG5vZGVBdEluZGV4KGluZGV4OiBudW1iZXIpOiBJTGlua2VkTGlzdE5vZGU8VD4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm5FbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAodGhpcy5uRWxlbWVudHMgLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmZpcnN0Tm9kZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZU5vZGUoaXRlbTogVCk6IElMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbmV4dDogbnVsbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH0gLy8gRW5kIG9mIGxpbmtlZCBsaXN0IFxyXG5cclxuXHJcblxyXG4gICAgLy8gVXNlZCBpbnRlcm5hbGx5IGJ5IGRpY3Rpb25hcnkgXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElEaWN0aW9uYXJ5UGFpcjxLLCBWPntcclxuICAgICAgICBrZXk6IEs7XHJcbiAgICAgICAgdmFsdWU6IFY7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIERpY3Rpb25hcnk8SywgVj57XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9iamVjdCBob2xkaW5nIHRoZSBrZXktdmFsdWUgcGFpcnMuXHJcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRhYmxlOiB7IFtrZXk6IHN0cmluZ106IElEaWN0aW9uYXJ5UGFpcjxLLCBWPiB9O1xyXG4gICAgICAgIC8vOiBba2V5OiBLXSB3aWxsIG5vdCB3b3JrIHNpbmNlIGluZGljZXMgY2FuIG9ubHkgYnkgc3RyaW5ncyBpbiBqYXZhc2NyaXB0IGFuZCB0eXBlc2NyaXB0IGVuZm9yY2VzIHRoaXMuIFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBOdW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG5FbGVtZW50czogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGNvbnZlcnQga2V5cyB0byBzdHJpbmdzLlxyXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgdG9TdHI6IChrZXk6IEspID0+IHN0cmluZztcclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgZGljdGlvbmFyeS4gXHJcbiAgICAgICAgICogQGNsYXNzIDxwPkRpY3Rpb25hcmllcyBtYXAga2V5cyB0byB2YWx1ZXM7IGVhY2gga2V5IGNhbiBtYXAgdG8gYXQgbW9zdCBvbmUgdmFsdWUuXHJcbiAgICAgICAgICogVGhpcyBpbXBsZW1lbnRhdGlvbiBhY2NlcHRzIGFueSBraW5kIG9mIG9iamVjdHMgYXMga2V5cy48L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cD5JZiB0aGUga2V5cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBmdW5jdGlvbiB3aGljaCBjb252ZXJ0cyBrZXlzIHRvIHVuaXF1ZVxyXG4gICAgICAgICAqIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiBmdW5jdGlvbiBwZXRUb1N0cmluZyhwZXQpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldC5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXHJcbiAgICAgICAgICogdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuIElmIHRoZSBrZXlzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcclxuICAgICAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGEga2V5IGFuZCByZXR1cm5zIGFcclxuICAgICAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IodG9TdHJGdW5jdGlvbj86IChrZXk6IEspID0+IHN0cmluZykge1xyXG4gICAgICAgICAgICB0aGlzLnRhYmxlID0ge307XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICAgICAgdGhpcy50b1N0ciA9IHRvU3RyRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdFRvU3RyaW5nO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGlzIGtleS5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBhc3NvY2lhdGVkIHZhbHVlIGlzIHRvIGJlIHJldHVybmVkLlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSB2YWx1ZSB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwcyB0aGUgc3BlY2lmaWVkIGtleSBvclxyXG4gICAgICAgICAqIHVuZGVmaW5lZCBpZiB0aGUgbWFwIGNvbnRhaW5zIG5vIG1hcHBpbmcgZm9yIHRoaXMga2V5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldFZhbHVlKGtleTogSyk6IFYge1xyXG4gICAgICAgICAgICB2YXIgcGFpcjogSURpY3Rpb25hcnlQYWlyPEssIFY+ID0gdGhpcy50YWJsZVt0aGlzLnRvU3RyKGtleSldO1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQocGFpcikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQXNzb2NpYXRlcyB0aGUgc3BlY2lmaWVkIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIElmIHRoZSBkaWN0aW9uYXJ5IHByZXZpb3VzbHkgY29udGFpbmVkIGEgbWFwcGluZyBmb3IgdGhpcyBrZXksIHRoZSBvbGRcclxuICAgICAgICAgKiB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgc3BlY2lmaWVkIHZhbHVlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdpdGggd2hpY2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB0byBiZVxyXG4gICAgICAgICAqIGFzc29jaWF0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIHZhbHVlIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIG9yIHVuZGVmaW5lZCBpZlxyXG4gICAgICAgICAqIHRoZXJlIHdhcyBubyBtYXBwaW5nIGZvciB0aGUga2V5IG9yIGlmIHRoZSBrZXkvdmFsdWUgYXJlIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZXRWYWx1ZShrZXk6IEssIHZhbHVlOiBWKTogViB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoa2V5KSB8fCBjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciByZXQ6IFY7XHJcbiAgICAgICAgICAgIHZhciBrID0gdGhpcy50b1N0cihrZXkpO1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNFbGVtZW50OiBJRGljdGlvbmFyeVBhaXI8SywgVj4gPSB0aGlzLnRhYmxlW2tdO1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQocHJldmlvdXNFbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMrKztcclxuICAgICAgICAgICAgICAgIHJldCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldCA9IHByZXZpb3VzRWxlbWVudC52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhYmxlW2tdID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIG1hcHBpbmcgZm9yIHRoaXMga2V5IGZyb20gdGhpcyBkaWN0aW9uYXJ5IGlmIGl0IGlzIHByZXNlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgbWFwcGluZyBpcyB0byBiZSByZW1vdmVkIGZyb20gdGhlXHJcbiAgICAgICAgICogZGljdGlvbmFyeS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXHJcbiAgICAgICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIGtleS5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoa2V5OiBLKTogViB7XHJcbiAgICAgICAgICAgIHZhciBrID0gdGhpcy50b1N0cihrZXkpO1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNFbGVtZW50OiBJRGljdGlvbmFyeVBhaXI8SywgVj4gPSB0aGlzLnRhYmxlW2tdO1xyXG4gICAgICAgICAgICBpZiAoIWNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHByZXZpb3VzRWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRhYmxlW2tdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91c0VsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAga2V5cygpOiBLW10ge1xyXG4gICAgICAgICAgICB2YXIgYXJyYXk6IEtbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMudGFibGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhaXI6IElEaWN0aW9uYXJ5UGFpcjxLLCBWPiA9IHRoaXMudGFibGVbbmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaChwYWlyLmtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFsdWVzKCk6IFZbXSB7XHJcbiAgICAgICAgICAgIHZhciBhcnJheTogVltdID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy50YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFpcjogSURpY3Rpb25hcnlQYWlyPEssIFY+ID0gdGhpcy50YWJsZVtuYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHBhaXIudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2gga2V5LXZhbHVlIHBhaXIgXHJcbiAgICAgICAgKiBwcmVzZW50IGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAqIGludm9rZWQgd2l0aCB0d28gYXJndW1lbnRzOiBrZXkgYW5kIHZhbHVlLiBUbyBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IChrZXk6IEssIHZhbHVlOiBWKSA9PiBhbnkpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnRhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50YWJsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWlyOiBJRGljdGlvbmFyeVBhaXI8SywgVj4gPSB0aGlzLnRhYmxlW25hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXQgPSBjYWxsYmFjayhwYWlyLmtleSwgcGFpci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBhIG1hcHBpbmcgZm9yIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIHByZXNlbmNlIGluIHRoaXMgZGljdGlvbmFyeSBpcyB0byBiZVxyXG4gICAgICAgICAqIHRlc3RlZC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBhIG1hcHBpbmcgZm9yIHRoZVxyXG4gICAgICAgICAqIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnNLZXkoa2V5OiBLKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAhY29sbGVjdGlvbnMuaXNVbmRlZmluZWQodGhpcy5nZXRWYWx1ZShrZXkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogUmVtb3ZlcyBhbGwgbWFwcGluZ3MgZnJvbSB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgKiBAdGhpcyB7Y29sbGVjdGlvbnMuRGljdGlvbmFyeX1cclxuICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy50YWJsZSA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmdzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmdzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cyA8PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgdmFyIHRvcmV0ID0gXCJ7XCI7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yRWFjaCgoaywgdikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdG9yZXQgPSB0b3JldCArIFwiXFxuXFx0XCIgKyBrLnRvU3RyaW5nKCkgKyBcIiA6IFwiICsgdi50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvcmV0ICsgXCJcXG59XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE8gREsgbW92ZSB0byB1dGlsc1xyXG4gICAgICAgIHN0YXRpYyBDb252ZXJ0T2JqZWN0VG9EaWN0aW9uYXJ5PEssIFY+KG9iajogT2JqZWN0KTogRGljdGlvbmFyeTxLLFY+IHtcclxuICAgICAgICAgICAgdmFyIGRpY3QgPSBuZXcgRGljdGlvbmFyeTxLLCBWPigpO1xyXG4gICAgICAgICAgICBpZiAob2JqICYmICFqUXVlcnkuaXNFbXB0eU9iamVjdChvYmopKVxyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICBkaWN0LnNldFZhbHVlKDxhbnk+a2V5LCBvYmpba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRpY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRpYyBDb252ZXJ0RGljdGlvbmFyeVRvT2JqZWN0PEssIFY+KGRpY3Rpb25hcnk6IERpY3Rpb25hcnk8SywgVj4pOmFueSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgaWYgKGRpY3Rpb25hcnkgJiYgIWpRdWVyeS5pc0VtcHR5T2JqZWN0KGRpY3Rpb25hcnkpKVxyXG4gICAgICAgICAgICBkaWN0aW9uYXJ5LmZvckVhY2goKGtleTphbnksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHN0YXRpYyBGcm9tT2JqZWN0RGljdGlvbmFyeVRvRGljdGlvbmFyeTxUSW5LZXlUeXBlLCBUSW5WYWx1ZVR5cGUsIFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPihcclxuICAgICAgICAgICAgb2JqOiB7IFtrZXk6IHN0cmluZ106IFRJblZhbHVlVHlwZSB9LFxyXG4gICAgICAgICAgICBrZXlTZWxlY3RvcjogKG9iajogc3RyaW5nKSA9PiBUT3V0S2V5VHlwZSxcclxuICAgICAgICAgICAgdmFsdWVTZWxlY3RvcjogKG9iajogVEluVmFsdWVUeXBlKSA9PiBUT3V0VmFsdWVUeXBlLFxyXG4gICAgICAgICAgICBnZXRIYXNoQ29kZVNlbGVjdG9yPzogKGtleTogVE91dEtleVR5cGUpID0+IHN0cmluZyxcclxuICAgICAgICAgICAgZGljdGlvbmFyeUluc3RhbmNlQ3JlYXRvcjogKGdldEhhc2hDb2RlU2VsZWN0b3I/OiAoa2V5OiBUT3V0S2V5VHlwZSkgPT4gc3RyaW5nKSA9PiBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPiA9IG51bGxcclxuICAgICAgICApOiBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPiB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGljdDogRGljdGlvbmFyeTxUT3V0S2V5VHlwZSwgVE91dFZhbHVlVHlwZT4gPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoZGljdGlvbmFyeUluc3RhbmNlQ3JlYXRvcikge1xyXG4gICAgICAgICAgICAgICAgZGljdCA9IGRpY3Rpb25hcnlJbnN0YW5jZUNyZWF0b3IoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRpY3QgPSBuZXcgRGljdGlvbmFyeTxUT3V0S2V5VHlwZSwgVE91dFZhbHVlVHlwZT4oZ2V0SGFzaENvZGVTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVybiBkaWN0O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgIGRpY3Quc2V0VmFsdWUoa2V5U2VsZWN0b3Ioa2V5KSwgdmFsdWVTZWxlY3Rvcih2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgRnJvbU9iamVjdFRvRGljdGlvbmFyeTxUSW5PYmplY3QgZXh0ZW5kcyBPYmplY3QsIFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPihcclxuICAgICAgICAgICAgb2JqOiBUSW5PYmplY3QsXHJcbiAgICAgICAgICAgIGtleVNlbGVjdG9yOiAob2JqOiBzdHJpbmcpID0+IFRPdXRLZXlUeXBlLFxyXG4gICAgICAgICAgICB2YWx1ZVNlbGVjdG9yOiAob2JqOiBUSW5PYmplY3QpID0+IFRPdXRWYWx1ZVR5cGUsXHJcbiAgICAgICAgICAgIGdldEhhc2hDb2RlU2VsZWN0b3I/OiAoa2V5OiBUT3V0S2V5VHlwZSkgPT4gc3RyaW5nKTogRGljdGlvbmFyeTxUT3V0S2V5VHlwZSwgVE91dFZhbHVlVHlwZT4ge1xyXG4gICAgICAgICAgICB2YXIgZGljdCA9IG5ldyBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPihnZXRIYXNoQ29kZVNlbGVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVybiBkaWN0O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgIGRpY3Quc2V0VmFsdWUoa2V5U2VsZWN0b3Ioa2V5KSwgdmFsdWVTZWxlY3Rvcih2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRpY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgRnJvbUFycmF5TGlrZU9iamVjdFRvRGljdGlvbmFyeTxUSW5LZXlUeXBlLFRJblZhbHVlVHlwZSxUT3V0S2V5VHlwZSAsIFRPdXRWYWx1ZVR5cGU+KG9iajoge1trZXk6bnVtYmVyXTpUSW5WYWx1ZVR5cGUgfSxrZXlTZWxlY3Rvcjoob2JqOnN0cmluZyk9PlRPdXRLZXlUeXBlLHZhbHVlU2VsZWN0b3I6KG9iajpUSW5WYWx1ZVR5cGUpPT5UT3V0VmFsdWVUeXBlLGdldEhhc2hDb2RlU2VsZWN0b3I/OiAoa2V5OiBUT3V0S2V5VHlwZSkgPT4gc3RyaW5nKTogRGljdGlvbmFyeTxUT3V0S2V5VHlwZSwgVE91dFZhbHVlVHlwZT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gRGljdGlvbmFyeS5Gcm9tT2JqZWN0RGljdGlvbmFyeVRvRGljdGlvbmFyeShvYmosIGtleVNlbGVjdG9yLCB2YWx1ZVNlbGVjdG9yLCBnZXRIYXNoQ29kZVNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBGcm9tRGljdGlvbmFyeVRvT2JqZWN0PFRJbktleVR5cGUsVEluVmFsdWVUeXBlLFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPihkaWN0OiBEaWN0aW9uYXJ5PFRJbktleVR5cGUsVEluVmFsdWVUeXBlPixrZXlTZWxlY3Rvcjoob2JqOlRJbktleVR5cGUpPT5zdHJpbmcsdmFsdWVTZWxlY3Rvcjoob2JqOlRJblZhbHVlVHlwZSk9PlRPdXRWYWx1ZVR5cGUpOiB7W2tleTpzdHJpbmddOlRPdXRWYWx1ZVR5cGV9IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBpZiAoIWRpY3QpIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIGRpY3QuZm9yRWFjaCgoa2V5LCB2YWx1ZSk9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5U2VsZWN0b3Ioa2V5KV0gPSB2YWx1ZVNlbGVjdG9yKHZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgR2V0Q29weTxLLCBWPihkaWN0aW9uYXJ5OiBEaWN0aW9uYXJ5PEssIFY+LGRlZXBDb3B5RnVuY3Rpb246KG86Vik9PlY9bz0+byk6IERpY3Rpb25hcnk8SywgVj4ge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IERpY3Rpb25hcnk8SywgVj4oKTtcclxuICAgICAgICAgICAgaWYgKGRpY3Rpb25hcnkgJiYgIWpRdWVyeS5pc0VtcHR5T2JqZWN0KGRpY3Rpb25hcnkpKSB7XHJcbiAgICAgICAgICAgICAgICBkaWN0aW9uYXJ5LmZvckVhY2goKGtleTogYW55LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc2V0VmFsdWUoa2V5LGRlZXBDb3B5RnVuY3Rpb24odmFsKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1RPRE8gREsgbW92ZSB0byB1dGlsc1xyXG4gICAgfSAvLyBFbmQgb2YgZGljdGlvbmFyeVxyXG5cclxuICAgIC8vIC8qKlxyXG4gICAgLy8gICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gZGljdGlvbmFyeS5cclxuICAgIC8vICAqIFR3byBkaWN0aW9uYXJpZXMgYXJlIGVxdWFsIGlmIHRoZXkgY29udGFpbiB0aGUgc2FtZSBtYXBwaW5ncy5cclxuICAgIC8vICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuRGljdGlvbmFyeX0gb3RoZXIgdGhlIG90aGVyIGRpY3Rpb25hcnkuXHJcbiAgICAvLyAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSB2YWx1ZXNFcXVhbEZ1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAvLyAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGVxdWFsLlxyXG4gICAgLy8gICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGRpY3Rpb25hcnkuXHJcbiAgICAvLyAgKi9cclxuICAgIC8vIGNvbGxlY3Rpb25zLkRpY3Rpb25hcnkucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyLHZhbHVlc0VxdWFsRnVuY3Rpb24pIHtcclxuICAgIC8vIFx0dmFyIGVxRiA9IHZhbHVlc0VxdWFsRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgIC8vIFx0aWYoIShvdGhlciBpbnN0YW5jZW9mIGNvbGxlY3Rpb25zLkRpY3Rpb25hcnkpKXtcclxuICAgIC8vIFx0XHRyZXR1cm4gZmFsc2U7XHJcbiAgICAvLyBcdH1cclxuICAgIC8vIFx0aWYodGhpcy5zaXplKCkgIT09IG90aGVyLnNpemUoKSl7XHJcbiAgICAvLyBcdFx0cmV0dXJuIGZhbHNlO1xyXG4gICAgLy8gXHR9XHJcbiAgICAvLyBcdHJldHVybiB0aGlzLmVxdWFsc0F1eCh0aGlzLmZpcnN0Tm9kZSxvdGhlci5maXJzdE5vZGUsZXFGKTtcclxuICAgIC8vIH1cclxuXHJcblxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBNdWx0aURpY3Rpb25hcnk8SywgVj4ge1xyXG5cclxuICAgICAgICAvLyBDYW5ub3QgZG86IFxyXG4gICAgICAgIC8vIGNsYXNzIE11bHRpRGljdGlvbmFyeTxLLFY+IGV4dGVuZHMgRGljdGlvbmFyeTxLLEFycmF5PFY+PiB7XHJcbiAgICAgICAgLy8gU2luY2Ugd2Ugd2FudCB0byByZXVzZSB0aGUgZnVuY3Rpb24gbmFtZSBzZXRWYWx1ZSBhbmQgdHlwZXMgaW4gc2lnbmF0dXJlIGJlY29tZSBpbmNvbXBhdGlibGUgXHJcbiAgICAgICAgLy8gVGhlcmVmb3JlIHdlIGFyZSB1c2luZyBjb21wb3NpdGlvbiBpbnN0ZWFkIG9mIGluaGVyaXRhbmNlXHJcbiAgICAgICAgcHJpdmF0ZSBkaWN0OiBEaWN0aW9uYXJ5PEssIEFycmF5PFY+PjtcclxuICAgICAgICBwcml2YXRlIGVxdWFsc0Y6IElFcXVhbHNGdW5jdGlvbjxWPjtcclxuICAgICAgICBwcml2YXRlIGFsbG93RHVwbGljYXRlOiBib29sZWFuO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgbXVsdGkgZGljdGlvbmFyeS5cclxuICAgICAgICogQGNsYXNzIDxwPkEgbXVsdGkgZGljdGlvbmFyeSBpcyBhIHNwZWNpYWwga2luZCBvZiBkaWN0aW9uYXJ5IHRoYXQgaG9sZHNcclxuICAgICAgICogbXVsdGlwbGUgdmFsdWVzIGFnYWluc3QgZWFjaCBrZXkuIFNldHRpbmcgYSB2YWx1ZSBpbnRvIHRoZSBkaWN0aW9uYXJ5IHdpbGxcclxuICAgICAgICogYWRkIHRoZSB2YWx1ZSB0byBhbiBhcnJheSBhdCB0aGF0IGtleS4gR2V0dGluZyBhIGtleSB3aWxsIHJldHVybiBhbiBhcnJheSxcclxuICAgICAgICogaG9sZGluZyBhbGwgdGhlIHZhbHVlcyBzZXQgdG8gdGhhdCBrZXkuXHJcbiAgICAgICAqIFlvdSBjYW4gY29uZmlndXJlIHRvIGFsbG93IGR1cGxpY2F0ZXMgaW4gdGhlIHZhbHVlcy5cclxuICAgICAgICogVGhpcyBpbXBsZW1lbnRhdGlvbiBhY2NlcHRzIGFueSBraW5kIG9mIG9iamVjdHMgYXMga2V5cy48L3A+XHJcbiAgICAgICAqXHJcbiAgICAgICAqIDxwPklmIHRoZSBrZXlzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHdoaWNoIGNvbnZlcnRzIGtleXMgdG8gc3RyaW5ncyBtdXN0IGJlXHJcbiAgICAgICAqIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICpcclxuICAgICAgICogPHByZT5cclxuICAgICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgKiA8cD5JZiB0aGUgdmFsdWVzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHRvIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gdmFsdWVzXHJcbiAgICAgICAqIG11c3QgYmUgcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgKlxyXG4gICAgICAgKiA8cHJlPlxyXG4gICAgICAgKiBmdW5jdGlvbiBwZXRzQXJlRXF1YWxCeUFnZShwZXQxLHBldDIpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldDEuYWdlPT09cGV0Mi5hZ2U7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgKiA8L3ByZT5cclxuICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KTpzdHJpbmc9fSB0b1N0ckZ1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uXHJcbiAgICAgICAqIHRvIGNvbnZlcnQga2V5cyB0byBzdHJpbmdzLiBJZiB0aGUga2V5cyBhcmVuJ3Qgc3RyaW5ncyBvciBpZiB0b1N0cmluZygpXHJcbiAgICAgICAqIGlzIG5vdCBhcHByb3ByaWF0ZSwgYSBjdXN0b20gZnVuY3Rpb24gd2hpY2ggcmVjZWl2ZXMgYSBrZXkgYW5kIHJldHVybnMgYVxyXG4gICAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXHJcbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IHZhbHVlc0VxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAqIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHR3byB2YWx1ZXMgYXJlIGVxdWFsLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0gYWxsb3dEdXBsaWNhdGVWYWx1ZXNcclxuICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IodG9TdHJGdW5jdGlvbj86IChrZXk6IEspID0+IHN0cmluZywgdmFsdWVzRXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248Vj4sIGFsbG93RHVwbGljYXRlVmFsdWVzID0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0ID0gbmV3IERpY3Rpb25hcnk8SywgQXJyYXk8Vj4+KHRvU3RyRnVuY3Rpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmVxdWFsc0YgPSB2YWx1ZXNFcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgICAgICAgICB0aGlzLmFsbG93RHVwbGljYXRlID0gYWxsb3dEdXBsaWNhdGVWYWx1ZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogUmV0dXJucyBhbiBhcnJheSBob2xkaW5nIHRoZSB2YWx1ZXMgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHNcclxuICAgICAgICAqIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICogUmV0dXJucyBhbiBlbXB0eSBhcnJheSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MgZm9yIHRoaXMga2V5LlxyXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgYXNzb2NpYXRlZCB2YWx1ZXMgYXJlIHRvIGJlIHJldHVybmVkLlxyXG4gICAgICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGhvbGRpbmcgdGhlIHZhbHVlcyB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwc1xyXG4gICAgICAgICogdGhlIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgKi9cclxuICAgICAgICBnZXRWYWx1ZShrZXk6IEspOiBWW10ge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5kaWN0LmdldFZhbHVlKGtleSk7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZCh2YWx1ZXMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5cy5jb3B5KHZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGRzIHRoZSB2YWx1ZSB0byB0aGUgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LCBpZiBcclxuICAgICAgICAgKiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdpdGggd2hpY2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB0byBiZVxyXG4gICAgICAgICAqIGFzc29jaWF0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIHRoZSB2YWx1ZSB0byBhZGQgdG8gdGhlIGFycmF5IGF0IHRoZSBrZXlcclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSB2YWx1ZSB3YXMgbm90IGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIHRoYXQga2V5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNldFZhbHVlKGtleTogSywgdmFsdWU6IFYpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChrZXkpIHx8IGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWluc0tleShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Quc2V0VmFsdWUoa2V5LCBbdmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuZGljdC5nZXRWYWx1ZShrZXkpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuYWxsb3dEdXBsaWNhdGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcnJheXMuY29udGFpbnMoYXJyYXksIHZhbHVlLCB0aGlzLmVxdWFsc0YpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCB2YWx1ZXMgZnJvbSB0aGUgYXJyYXkgb2YgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCB0aGVcclxuICAgICAgICAgKiBzcGVjaWZpZWQga2V5LiBJZiBhIHZhbHVlIGlzbid0IGdpdmVuLCBhbGwgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIFxyXG4gICAgICAgICAqIGtleSBhcmUgcmVtb3ZlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBtYXBwaW5nIGlzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGVcclxuICAgICAgICAgKiBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0PX0gdmFsdWUgb3B0aW9uYWwgYXJndW1lbnQgdG8gc3BlY2lmeSB0aGUgdmFsdWUgdG8gcmVtb3ZlIFxyXG4gICAgICAgICAqIGZyb20gdGhlIGFycmF5IGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0cnVlIGlmIHRoZSBkaWN0aW9uYXJ5IGNoYW5nZWQsIGZhbHNlIGlmIHRoZSBrZXkgZG9lc24ndCBleGlzdCBvciBcclxuICAgICAgICAgKiBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzbid0IGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoa2V5OiBLLCB2YWx1ZT86IFYpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSB0aGlzLmRpY3QucmVtb3ZlKGtleSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIWNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhcnJheSA9IHRoaXMuZGljdC5nZXRWYWx1ZShrZXkpO1xyXG4gICAgICAgICAgICBpZiAoYXJyYXlzLnJlbW92ZShhcnJheSwgdmFsdWUsIHRoaXMuZXF1YWxzRikpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpY3QucmVtb3ZlKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGtleXMoKTogS1tdIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdC5rZXlzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YWx1ZXMoKTogVltdIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuZGljdC52YWx1ZXMoKTtcclxuICAgICAgICAgICAgdmFyIGFycmF5OkFycmF5PFY+ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHZhbHVlc1tpXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2godltqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBhdCBsZWFzdCBvbmUgdmFsdWUgYXNzb2NpYXR0ZWQgdGhlIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgcHJlc2VuY2UgaW4gdGhpcyBkaWN0aW9uYXJ5IGlzIHRvIGJlXHJcbiAgICAgICAgICogdGVzdGVkLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGF0IGxlYXN0IG9uZSB2YWx1ZSBhc3NvY2lhdHRlZCBcclxuICAgICAgICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWluc0tleShrZXk6IEspOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdC5jb250YWluc0tleShrZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgbWFwcGluZ3MgZnJvbSB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGljdC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBrZXktdmFsdWUgbWFwcGluZ3MgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdC5zaXplKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmdzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmdzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpY3QuaXNFbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0vLyBlbmQgb2YgbXVsdGkgZGljdGlvbmFyeSBcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSGVhcDxUPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQXJyYXkgdXNlZCB0byBzdG9yZSB0aGUgZWxlbWVudHMgb2QgdGhlIGhlYXAuXHJcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxPYmplY3Q+fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBkYXRhOiBUW10gPSBbXTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuXHJcbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgY29tcGFyZTogSUNvbXBhcmVGdW5jdGlvbjxUPjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IEhlYXAuXHJcbiAgICAgICAgICogQGNsYXNzIFxyXG4gICAgICAgICAqIDxwPkEgaGVhcCBpcyBhIGJpbmFyeSB0cmVlLCB3aGVyZSB0aGUgbm9kZXMgbWFpbnRhaW4gdGhlIGhlYXAgcHJvcGVydHk6IFxyXG4gICAgICAgICAqIGVhY2ggbm9kZSBpcyBzbWFsbGVyIHRoYW4gZWFjaCBvZiBpdHMgY2hpbGRyZW4gYW5kIHRoZXJlZm9yZSBhIE1pbkhlYXAgXHJcbiAgICAgICAgICogVGhpcyBpbXBsZW1lbnRhdGlvbiB1c2VzIGFuIGFycmF5IHRvIHN0b3JlIGVsZW1lbnRzLjwvcD5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgY29tcGFyZSBmdW5jdGlvbiBtdXN0IGJlIHByb3ZpZGVkLCBcclxuICAgICAgICAgKiAgYXQgY29uc3RydWN0aW9uIHRpbWUsIG90aGVyd2lzZSB0aGUgPD0sID09PSBhbmQgPj0gb3BlcmF0b3JzIGFyZSBcclxuICAgICAgICAgKiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcclxuICAgICAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAqICB9IGlmIChhIGlzIGdyZWF0ZXIgdGhhbiBiIGJ5IHRoZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICogIH0gXHJcbiAgICAgICAgICogIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXHJcbiAgICAgICAgICogIHJldHVybiAwO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwPklmIGEgTWF4LUhlYXAgaXMgd2FudGVkIChncmVhdGVyIGVsZW1lbnRzIG9uIHRvcCkgeW91IGNhbiBhIHByb3ZpZGUgYVxyXG4gICAgICAgICAqIHJldmVyc2UgY29tcGFyZSBmdW5jdGlvbiB0byBhY2NvbXBsaXNoIHRoYXQgYmVoYXZpb3IuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiBmdW5jdGlvbiByZXZlcnNlQ29tcGFyZShhLCBiKSB7XHJcbiAgICAgICAgICogIGlmIChhIGlzIGxlc3MgdGhhbiBiIGJ5IHNvbWUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XHJcbiAgICAgICAgICogICAgIHJldHVybiAxO1xyXG4gICAgICAgICAqICB9IGlmIChhIGlzIGdyZWF0ZXIgdGhhbiBiIGJ5IHRoZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAqICB9IFxyXG4gICAgICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxyXG4gICAgICAgICAqICByZXR1cm4gMDtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcj19IGNvbXBhcmVGdW5jdGlvbiBvcHRpb25hbFxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSB0d28gZWxlbWVudHMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcclxuICAgICAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXHJcbiAgICAgICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoY29tcGFyZUZ1bmN0aW9uPzogSUNvbXBhcmVGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBhcmUgPSBjb21wYXJlRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdENvbXBhcmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbGVmdCBjaGlsZCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSBsZWZ0IGNoaWxkXHJcbiAgICAgICAgICogZm9yLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBsZWZ0IGNoaWxkLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBsZWZ0Q2hpbGRJbmRleChub2RlSW5kZXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAoMiAqIG5vZGVJbmRleCkgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgcmlnaHQgY2hpbGQgb2YgdGhlIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4LlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBub2RlSW5kZXggVGhlIGluZGV4IG9mIHRoZSBub2RlIHRvIGdldCB0aGUgcmlnaHQgY2hpbGRcclxuICAgICAgICAgKiBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIHJpZ2h0IGNoaWxkLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSByaWdodENoaWxkSW5kZXgobm9kZUluZGV4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gKDIgKiBub2RlSW5kZXgpICsgMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHBhcmVudCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSBwYXJlbnQgZm9yLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBwYXJlbnQuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHBhcmVudEluZGV4KG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKG5vZGVJbmRleCAtIDEpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBzbWFsbGVyIGNoaWxkIG5vZGUgKGlmIGl0IGV4aXN0cykuXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnRDaGlsZCBsZWZ0IGNoaWxkIGluZGV4LlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodENoaWxkIHJpZ2h0IGNoaWxkIGluZGV4LlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGluZGV4IHdpdGggdGhlIG1pbmltdW0gdmFsdWUgb3IgLTEgaWYgaXQgZG9lc24ndFxyXG4gICAgICAgICAqIGV4aXN0cy5cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbWluSW5kZXgobGVmdENoaWxkOiBudW1iZXIsIHJpZ2h0Q2hpbGQ6IG51bWJlcik6IG51bWJlciB7XHJcblxyXG4gICAgICAgICAgICBpZiAocmlnaHRDaGlsZCA+PSB0aGlzLmRhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVmdENoaWxkID49IHRoaXMuZGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0Q2hpbGQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlKHRoaXMuZGF0YVtsZWZ0Q2hpbGRdLCB0aGlzLmRhdGFbcmlnaHRDaGlsZF0pIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdENoaWxkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmlnaHRDaGlsZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNb3ZlcyB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXggdXAgdG8gaXRzIHByb3BlciBwbGFjZSBpbiB0aGUgaGVhcC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBub2RlIHRvIG1vdmUgdXAuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHNpZnRVcChpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnRJbmRleChpbmRleCk7XHJcbiAgICAgICAgICAgIHdoaWxlIChpbmRleCA+IDAgJiYgdGhpcy5jb21wYXJlKHRoaXMuZGF0YVtwYXJlbnRdLCB0aGlzLmRhdGFbaW5kZXhdKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGFycmF5cy5zd2FwKHRoaXMuZGF0YSwgcGFyZW50LCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IHBhcmVudDtcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHRoaXMucGFyZW50SW5kZXgoaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1vdmVzIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleCBkb3duIHRvIGl0cyBwcm9wZXIgcGxhY2UgaW4gdGhlIGhlYXAuXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gbW92ZSBkb3duLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzaWZ0RG93bihub2RlSW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG5cclxuICAgICAgICAgICAgLy9zbWFsbGVyIGNoaWxkIGluZGV4XHJcbiAgICAgICAgICAgIHZhciBtaW4gPSB0aGlzLm1pbkluZGV4KHRoaXMubGVmdENoaWxkSW5kZXgobm9kZUluZGV4KSxcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDaGlsZEluZGV4KG5vZGVJbmRleCkpO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKG1pbiA+PSAwICYmIHRoaXMuY29tcGFyZSh0aGlzLmRhdGFbbm9kZUluZGV4XSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVttaW5dKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGFycmF5cy5zd2FwKHRoaXMuZGF0YSwgbWluLCBub2RlSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgbm9kZUluZGV4ID0gbWluO1xyXG4gICAgICAgICAgICAgICAgbWluID0gdGhpcy5taW5JbmRleCh0aGlzLmxlZnRDaGlsZEluZGV4KG5vZGVJbmRleCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yaWdodENoaWxkSW5kZXgobm9kZUluZGV4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGhlYXAuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlIGF0IHRoZSByb290IG9mIHRoZSBoZWFwLiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGVcclxuICAgICAgICAgKiBoZWFwIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBlZWsoKTogVCB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgdGhlIGdpdmVuIGVsZW1lbnQgaW50byB0aGUgaGVhcC5cclxuICAgICAgICAgKiBAcGFyYW0geyp9IGVsZW1lbnQgdGhlIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHJldHVybiB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBhZGRlZCBvciBmYWxzIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGQoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kYXRhLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2lmdFVwKHRoaXMuZGF0YS5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGhlYXAuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlIHJlbW92ZWQgZnJvbSB0aGUgcm9vdCBvZiB0aGUgaGVhcC4gUmV0dXJuc1xyXG4gICAgICAgICAqIHVuZGVmaW5lZCBpZiB0aGUgaGVhcCBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmVSb290KCk6IFQge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5kYXRhWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhWzBdID0gdGhpcy5kYXRhW3RoaXMuZGF0YS5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5zcGxpY2UodGhpcy5kYXRhLmxlbmd0aCAtIDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaWZ0RG93bigwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgaGVhcCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBIZWFwIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCwgZmFsc2VcclxuICAgICAgICAgKiBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnMoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB2YXIgZXF1RiA9IGNvbGxlY3Rpb25zLmNvbXBhcmVUb0VxdWFscyh0aGlzLmNvbXBhcmUpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlzLmNvbnRhaW5zKHRoaXMuZGF0YSwgZWxlbWVudCwgZXF1Rik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGhlYXAuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgaGVhcC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3MgaWYgdGhpcyBoZWFwIGlzIGVtcHR5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgYW5kIG9ubHkgaWYgdGhpcyBoZWFwIGNvbnRhaW5zIG5vIGl0ZW1zOyBmYWxzZVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aCA8PSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIGhlYXAuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgaGVhcCBpbiBcclxuICAgICAgICAgKiBubyBwYXJ0aWN1bGFyIG9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogKGl0ZW06IFQpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgYXJyYXlzLmZvckVhY2godGhpcy5kYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBTdGFjazxUPiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTGlzdCBjb250YWluaW5nIHRoZSBlbGVtZW50cy5cclxuICAgICAgICAgKiBAdHlwZSBjb2xsZWN0aW9ucy5MaW5rZWRMaXN0XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxpc3Q6IExpbmtlZExpc3Q8VD47XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBlbXB0eSBTdGFjay5cclxuICAgICAgICAgKiBAY2xhc3MgQSBTdGFjayBpcyBhIExhc3QtSW4tRmlyc3QtT3V0IChMSUZPKSBkYXRhIHN0cnVjdHVyZSwgdGhlIGxhc3RcclxuICAgICAgICAgKiBlbGVtZW50IGFkZGVkIHRvIHRoZSBzdGFjayB3aWxsIGJlIHRoZSBmaXJzdCBvbmUgdG8gYmUgcmVtb3ZlZC4gVGhpc1xyXG4gICAgICAgICAqIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsaW5rZWQgbGlzdCBhcyBhIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gbmV3IExpbmtlZExpc3Q8VD4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFB1c2hlcyBhbiBpdGVtIG9udG8gdGhlIHRvcCBvZiB0aGlzIHN0YWNrLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGJlIHB1c2hlZCBvbnRvIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgcHVzaGVkIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdXNoKGVsZW06IFQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5hZGQoZWxlbSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFB1c2hlcyBhbiBpdGVtIG9udG8gdGhlIHRvcCBvZiB0aGlzIHN0YWNrLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGJlIHB1c2hlZCBvbnRvIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgcHVzaGVkIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGQoZWxlbTogVCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmFkZChlbGVtLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayBhbmQgcmV0dXJucyB0aGF0IG9iamVjdC5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayBvciB1bmRlZmluZWQgaWYgdGhlXHJcbiAgICAgICAgICogc3RhY2sgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcG9wKCk6IFQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LnJlbW92ZUVsZW1lbnRBdEluZGV4KDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMb29rcyBhdCB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayB3aXRob3V0IHJlbW92aW5nIGl0IGZyb20gdGhlXHJcbiAgICAgICAgICogc3RhY2suXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgb3IgdW5kZWZpbmVkIGlmIHRoZVxyXG4gICAgICAgICAqIHN0YWNrIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBlZWsoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuZmlyc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LnNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHN0YWNrIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoaXMgc3RhY2sgYXJlXHJcbiAgICAgICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yLCBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXHJcbiAgICAgICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxyXG4gICAgICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiB2YXIgcGV0c0FyZUVxdWFsQnlOYW1lIChwZXQxLCBwZXQyKSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc3RhY2sgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxyXG4gICAgICAgICAqIGZhbHNlIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhlbGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmNvbnRhaW5zKGVsZW0sIGVxdWFsc0Z1bmN0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoaXMgc3RhY2sgaXMgZW1wdHkuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGlzIHN0YWNrIGNvbnRhaW5zIG5vIGl0ZW1zOyBmYWxzZVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmlzRW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBzdGFjay5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0LmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAgKiBSZW1vdmVzIGVsZW1lbnQgZnJvbSB0aGlzIHN0YWNrLlxyXG4gICAgICAgICAgKiBUaGlzIG1ldGhvZCBpc24ndCBzdGFuZGFyZCBtZXRob2QgaW4gc3RhY2sgaW1wbGVtZW50YXRpb24gXHJcbiAgICAgICAgICAqIEFkZGVkIGJ5IEsuTS4gQ29tYXJjaCAgXHJcbiAgICAgICAgICAqIEBwYXJhbSBpdGVtIFxyXG4gICAgICAgICAgKiBAcGFyYW0gZXF1YWxzRnVuY3Rpb24gXHJcbiAgICAgICAgICAqIEByZXR1cm5zIHt9IFxyXG4gICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoaXRlbTogVCwgZXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248VD4pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5yZW1vdmUoaXRlbSwgZXF1YWxzRnVuY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBzdGFjayBpbiBcclxuICAgICAgICAgKiBMSUZPIG9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfSAvLyBFbmQgb2Ygc3RhY2sgXHJcblxyXG5cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUXVldWU8VD57XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExpc3QgY29udGFpbmluZyB0aGUgZWxlbWVudHMuXHJcbiAgICAgICAgICogQHR5cGUgY29sbGVjdGlvbnMuTGlua2VkTGlzdFxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBsaXN0OiBMaW5rZWRMaXN0PFQ+O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IHF1ZXVlLlxyXG4gICAgICAgICAqIEBjbGFzcyBBIHF1ZXVlIGlzIGEgRmlyc3QtSW4tRmlyc3QtT3V0IChGSUZPKSBkYXRhIHN0cnVjdHVyZSwgdGhlIGZpcnN0XHJcbiAgICAgICAgICogZWxlbWVudCBhZGRlZCB0byB0aGUgcXVldWUgd2lsbCBiZSB0aGUgZmlyc3Qgb25lIHRvIGJlIHJlbW92ZWQuIFRoaXNcclxuICAgICAgICAgKiBpbXBsZW1lbnRhdGlvbiB1c2VzIGEgbGlua2VkIGxpc3QgYXMgYSBjb250YWluZXIuXHJcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdCA9IG5ldyBMaW5rZWRMaXN0PFQ+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGUgZW5kIG9mIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGluc2VydGVkLCBvciBmYWxzZSBpZiBpdCBpcyB1bmRlZmluZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZW5xdWV1ZShlbGVtOiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoZSBlbmQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSB0aGUgZWxlbWVudCB0byBpbnNlcnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGQoZWxlbTogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmFkZChlbGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSBoZWFkIG9mIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZSwgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVxdWV1ZSgpOiBUIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdC5zaXplKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbCA9IHRoaXMubGlzdC5maXJzdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnJlbW92ZUVsZW1lbnRBdEluZGV4KDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcywgYnV0IGRvZXMgbm90IHJlbW92ZSwgdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgaGVhZCBvZiB0aGlzIHF1ZXVlLCBvciB1bmRlZmluZWQgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwZWVrKCk6IFQge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdC5zaXplKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuZmlyc3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LnNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHF1ZXVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoaXMgc3RhY2sgYXJlXHJcbiAgICAgICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yLCBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXHJcbiAgICAgICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxyXG4gICAgICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiB2YXIgcGV0c0FyZUVxdWFsQnlOYW1lIChwZXQxLCBwZXQyKSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxyXG4gICAgICAgICAqIGZhbHNlIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhlbGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmNvbnRhaW5zKGVsZW0sIGVxdWFsc0Z1bmN0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgYW5kIG9ubHkgaWYgdGhpcyBxdWV1ZSBjb250YWlucyBubyBpdGVtczsgZmFsc2VcclxuICAgICAgICAgKiBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5zaXplKCkgPD0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgcXVldWUgaW4gXHJcbiAgICAgICAgICogRklGTyBvcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IC8vIEVuZCBvZiBxdWV1ZVxyXG5cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUHJpb3JpdHlRdWV1ZTxUPiB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgaGVhcDogSGVhcDxUPjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqIEBjbGFzcyA8cD5JbiBhIHByaW9yaXR5IHF1ZXVlIGVhY2ggZWxlbWVudCBpcyBhc3NvY2lhdGVkIHdpdGggYSBcInByaW9yaXR5XCIsXHJcbiAgICAgICAgICogZWxlbWVudHMgYXJlIGRlcXVldWVkIGluIGhpZ2hlc3QtcHJpb3JpdHktZmlyc3Qgb3JkZXIgKHRoZSBlbGVtZW50cyB3aXRoIHRoZSBcclxuICAgICAgICAgKiBoaWdoZXN0IHByaW9yaXR5IGFyZSBkZXF1ZXVlZCBmaXJzdCkuIFByaW9yaXR5IFF1ZXVlcyBhcmUgaW1wbGVtZW50ZWQgYXMgaGVhcHMuIFxyXG4gICAgICAgICAqIElmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBjb21wYXJlIGZ1bmN0aW9uIG11c3QgYmUgcHJvdmlkZWQsIFxyXG4gICAgICAgICAqIG90aGVyd2lzZSB0aGUgPD0sID09PSBhbmQgPj0gb3BlcmF0b3JzIGFyZSB1c2VkIHRvIGNvbXBhcmUgb2JqZWN0IHByaW9yaXR5LjwvcD5cclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xyXG4gICAgICAgICAqICBpZiAoYSBpcyBsZXNzIHRoYW4gYiBieSBzb21lIG9yZGVyaW5nIGNyaXRlcmlvbikge1xyXG4gICAgICAgICAqICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xyXG4gICAgICAgICAqICAgICByZXR1cm4gMTtcclxuICAgICAgICAgKiAgfSBcclxuICAgICAgICAgKiAgLy8gYSBtdXN0IGJlIGVxdWFsIHRvIGJcclxuICAgICAgICAgKiAgcmV0dXJuIDA7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6bnVtYmVyPX0gY29tcGFyZUZ1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdXNlZCB0byBjb21wYXJlIHR3byBlbGVtZW50IHByaW9yaXRpZXMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcclxuICAgICAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXHJcbiAgICAgICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoY29tcGFyZUZ1bmN0aW9uPzogSUNvbXBhcmVGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLmhlYXAgPSBuZXcgSGVhcDxUPihjb2xsZWN0aW9ucy5yZXZlcnNlQ29tcGFyZUZ1bmN0aW9uKGNvbXBhcmVGdW5jdGlvbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGlzIHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGVucXVldWUoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmFkZChlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluc2VydHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGludG8gdGhpcyBwcmlvcml0eSBxdWV1ZS5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBpbnNlcnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBhZGQoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmFkZChlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IG9mIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gdGhlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZSwgXHJcbiAgICAgICAgICogIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlcXVldWUoKTogVCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYXAuc2l6ZSgpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSB0aGlzLmhlYXAucGVlaygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWFwLnJlbW92ZVJvb3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzLCBidXQgZG9lcyBub3QgcmVtb3ZlLCB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IG9mIHRoaXMgcXVldWUuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBvZiB0aGlzIHF1ZXVlLCBvciB1bmRlZmluZWQgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwZWVrKCk6IFQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLnBlZWsoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHByaW9yaXR5IHF1ZXVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHByaW9yaXR5IHF1ZXVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCxcclxuICAgICAgICAgKiBmYWxzZSBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnMoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmNvbnRhaW5zKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgaXMgZW1wdHkuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGlzIHByaW9yaXR5IHF1ZXVlIGNvbnRhaW5zIG5vIGl0ZW1zOyBmYWxzZVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLmlzRW1wdHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGVhcC5zaXplKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmhlYXAuY2xlYXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHF1ZXVlIGluIFxyXG4gICAgICAgICAqIG5vIHBhcnRpY3VsYXIgb3JkZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXHJcbiAgICAgICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBcclxuICAgICAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3JFYWNoKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhcC5mb3JFYWNoKGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSAvLyBlbmQgb2YgcHJpb3JpdHkgcXVldWVcclxuXHJcblxyXG5cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgU2V0PFQ+e1xyXG4gICAgICAgIHByaXZhdGUgZGljdGlvbmFyeTogRGljdGlvbmFyeTxULCBhbnk+O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IHNldC5cclxuICAgICAgICAgKiBAY2xhc3MgPHA+QSBzZXQgaXMgYSBkYXRhIHN0cnVjdHVyZSB0aGF0IGNvbnRhaW5zIG5vIGR1cGxpY2F0ZSBpdGVtcy48L3A+XHJcbiAgICAgICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIFxyXG4gICAgICAgICAqIHdoaWNoIGNvbnZlcnRzIGVsZW1lbnRzIHRvIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xyXG4gICAgICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyaW5nRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxyXG4gICAgICAgICAqIHRvIGNvbnZlcnQgZWxlbWVudHMgdG8gc3RyaW5ncy4gSWYgdGhlIGVsZW1lbnRzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcclxuICAgICAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGEgb25qZWN0IGFuZCByZXR1cm5zIGFcclxuICAgICAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IodG9TdHJpbmdGdW5jdGlvbj86IChpdGVtOiBUKSA9PiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5ID0gbmV3IERpY3Rpb25hcnk8VCwgYW55Pih0b1N0cmluZ0Z1bmN0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXHJcbiAgICAgICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5jb250YWluc0tleShlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoaXMgc2V0IGlmIGl0IGlzIG5vdCBhbHJlYWR5IHByZXNlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgZGlkIG5vdCBhbHJlYWR5IGNvbnRhaW4gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5zKGVsZW1lbnQpIHx8IGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuc2V0VmFsdWUoZWxlbWVudCwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybXMgYW4gaW50ZXJzZWNpb24gYmV0d2VlbiB0aGlzIGFuIGFub3RoZXIgc2V0LlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIHZhbHVlcyB0aGF0IGFyZSBub3QgcHJlc2VudCB0aGlzIHNldCBhbmQgdGhlIGdpdmVuIHNldC5cclxuICAgICAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGludGVyc2VjdGlvbihvdGhlclNldDogU2V0PFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBzZXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgICAgIGlmICghb3RoZXJTZXQuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXQucmVtb3ZlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybXMgYSB1bmlvbiBiZXR3ZWVuIHRoaXMgYW4gYW5vdGhlciBzZXQuXHJcbiAgICAgICAgICogQWRkcyBhbGwgdmFsdWVzIGZyb20gdGhlIGdpdmVuIHNldCB0byB0aGlzIHNldC5cclxuICAgICAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHVuaW9uKG90aGVyU2V0OiBTZXQ8VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIHNldCA9IHRoaXM7XHJcbiAgICAgICAgICAgIG90aGVyU2V0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgICAgIHNldC5hZGQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtcyBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGlzIGFuIGFub3RoZXIgc2V0LlxyXG4gICAgICAgICAqIFJlbW92ZXMgZnJvbSB0aGlzIHNldCBhbGwgdGhlIHZhbHVlcyB0aGF0IGFyZSBwcmVzZW50IGluIHRoZSBnaXZlbiBzZXQuXHJcbiAgICAgICAgICogQHBhcmFtIHtjb2xsZWN0aW9ucy5TZXR9IG90aGVyU2V0IG90aGVyIHNldC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBkaWZmZXJlbmNlKG90aGVyU2V0OiBTZXQ8VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIHNldCA9IHRoaXM7XHJcbiAgICAgICAgICAgIG90aGVyU2V0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgICAgIHNldC5yZW1vdmUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gc2V0IGNvbnRhaW5zIGFsbCB0aGUgZWxlbWVudHMgaW4gdGhpcyBzZXQuXHJcbiAgICAgICAgICogQHBhcmFtIHtjb2xsZWN0aW9ucy5TZXR9IG90aGVyU2V0IG90aGVyIHNldC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc2V0IGlzIGEgc3Vic2V0IG9mIHRoZSBnaXZlbiBzZXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNTdWJzZXRPZihvdGhlclNldDogU2V0PFQ+KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaXplKCkgPiBvdGhlclNldC5zaXplKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGlzU3ViID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW90aGVyU2V0LmNvbnRhaW5zKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNTdWIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGlzU3ViO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgZnJvbSB0aGlzIHNldCBpZiBpdCBpcyBwcmVzZW50LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgY29udGFpbmVkIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5yZW1vdmUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBcclxuICAgICAgICAgKiBwcmVzZW50IGluIHRoaXMgc2V0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnRzOiB0aGUgZWxlbWVudC4gVG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2goZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh2KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIHNldCBpbiBhcmJpdHJhcnkgb3JkZXIuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIHNldC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b0FycmF5KCk6IFRbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpY3Rpb25hcnkudmFsdWVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBzZXQgY29udGFpbnMgbm8gZWxlbWVudHMuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmlzRW1wdHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHNldC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzZXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LnNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgc2V0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuY2xlYXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgKiBQcm92aWRlcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBmb3IgZGlzcGxheVxyXG4gICAgICAgICovXHJcbiAgICAgICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5cy50b1N0cmluZyh0aGlzLnRvQXJyYXkoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS8vIGVuZCBvZiBTZXRcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQmFnPFQ+e1xyXG5cclxuICAgICAgICBwcml2YXRlIHRvU3RyRjogKGl0ZW06IFQpID0+IHN0cmluZztcclxuICAgICAgICBwcml2YXRlIGRpY3Rpb25hcnk6IERpY3Rpb25hcnk8VCwgYW55PjtcclxuICAgICAgICBwcml2YXRlIG5FbGVtZW50czogbnVtYmVyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IGJhZy5cclxuICAgICAgICAgKiBAY2xhc3MgPHA+QSBiYWcgaXMgYSBzcGVjaWFsIGtpbmQgb2Ygc2V0IGluIHdoaWNoIG1lbWJlcnMgYXJlIFxyXG4gICAgICAgICAqIGFsbG93ZWQgdG8gYXBwZWFyIG1vcmUgdGhhbiBvbmNlLjwvcD5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gXHJcbiAgICAgICAgICogd2hpY2ggY29udmVydHMgZWxlbWVudHMgdG8gdW5pcXVlIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xyXG4gICAgICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxyXG4gICAgICAgICAqIHRvIGNvbnZlcnQgZWxlbWVudHMgdG8gc3RyaW5ncy4gSWYgdGhlIGVsZW1lbnRzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcclxuICAgICAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGFuIG9iamVjdCBhbmQgcmV0dXJucyBhXHJcbiAgICAgICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHRvU3RyRnVuY3Rpb24/OiAoaXRlbTogVCkgPT4gc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG9TdHJGID0gdG9TdHJGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0VG9TdHJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IG5ldyBEaWN0aW9uYXJ5PFQsIGFueT4odGhpcy50b1N0ckYpO1xyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBBZGRzIG5Db3BpZXMgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QgdG8gdGhpcyBiYWcuXHJcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIGFkZC5cclxuICAgICAgICAqIEBwYXJhbSB7bnVtYmVyPX0gbkNvcGllcyB0aGUgbnVtYmVyIG9mIGNvcGllcyB0byBhZGQsIGlmIHRoaXMgYXJndW1lbnQgaXNcclxuICAgICAgICAqIHVuZGVmaW5lZCAxIGNvcHkgaXMgYWRkZWQuXHJcbiAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIHVubGVzcyBlbGVtZW50IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtZW50OiBULCBuQ29waWVzOiBudW1iZXI9IDEpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChlbGVtZW50KSB8fCBuQ29waWVzIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBjb3BpZXM6IG5Db3BpZXNcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuc2V0VmFsdWUoZWxlbWVudCwgbm9kZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZ2V0VmFsdWUoZWxlbWVudCkuY29waWVzICs9IG5Db3BpZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgKz0gbkNvcGllcztcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIGNvcGllcyBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdCBpbiB0aGlzIGJhZy5cclxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBvYmplY3QgdG8gc2VhcmNoIGZvci4uXHJcbiAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgY29waWVzIG9mIHRoZSBvYmplY3QsIDAgaWYgbm90IGZvdW5kXHJcbiAgICAgICAgKi9cclxuICAgICAgICBjb3VudChlbGVtZW50OiBUKTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpLmNvcGllcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXHJcbiAgICAgICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5jb250YWluc0tleShlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogUmVtb3ZlcyBuQ29waWVzIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0IHRvIHRoaXMgYmFnLlxyXG4gICAgICAgICogSWYgdGhlIG51bWJlciBvZiBjb3BpZXMgdG8gcmVtb3ZlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgYWN0dWFsIG51bWJlciBcclxuICAgICAgICAqIG9mIGNvcGllcyBpbiB0aGUgQmFnLCBhbGwgY29waWVzIGFyZSByZW1vdmVkLiBcclxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gcmVtb3ZlLlxyXG4gICAgICAgICogQHBhcmFtIHtudW1iZXI9fSBuQ29waWVzIHRoZSBudW1iZXIgb2YgY29waWVzIHRvIHJlbW92ZSwgaWYgdGhpcyBhcmd1bWVudCBpc1xyXG4gICAgICAgICogdW5kZWZpbmVkIDEgY29weSBpcyByZW1vdmVkLlxyXG4gICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhdCBsZWFzdCAxIGVsZW1lbnQgd2FzIHJlbW92ZWQuXHJcbiAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoZWxlbWVudDogVCwgbkNvcGllczogbnVtYmVyID0gMSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGVsZW1lbnQpIHx8IG5Db3BpZXMgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5Db3BpZXMgPiBub2RlLmNvcGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzIC09IG5vZGUuY29waWVzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5FbGVtZW50cyAtPSBuQ29waWVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbm9kZS5jb3BpZXMgLT0gbkNvcGllcztcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmNvcGllcyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnJlbW92ZShlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGJpZyBpbiBhcmJpdHJhcnkgb3JkZXIsIFxyXG4gICAgICAgICAqIGluY2x1ZGluZyBtdWx0aXBsZSBjb3BpZXMuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGJhZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b0FycmF5KCk6IFRbXSB7XHJcbiAgICAgICAgICAgIHZhciBhOkFycmF5PFQ+ID0gW107XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLmRpY3Rpb25hcnkudmFsdWVzKCk7XHJcbiAgICAgICAgICAgIHZhciB2bCA9IHZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB2YWx1ZXNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IG5vZGUudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29waWVzID0gbm9kZS5jb3BpZXM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvcGllczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYS5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIHNldCBvZiB1bmlxdWUgZWxlbWVudHMgaW4gdGhpcyBiYWcuIFxyXG4gICAgICAgICAqIEByZXR1cm4ge2NvbGxlY3Rpb25zLlNldDxUPn0gYSBzZXQgb2YgdW5pcXVlIGVsZW1lbnRzIGluIHRoaXMgYmFnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvU2V0KCk6IFNldDxUPiB7XHJcbiAgICAgICAgICAgIHZhciB0b3JldCA9IG5ldyBTZXQ8VD4odGhpcy50b1N0ckYpO1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLmRpY3Rpb25hcnkudmFsdWVzKCk7XHJcbiAgICAgICAgICAgIHZhciBsID0gZWxlbWVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZWxlbWVudHNbaV0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0b3JldC5hZGQodmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0b3JldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgXHJcbiAgICAgICAgICogcHJlc2VudCBpbiB0aGlzIGJhZywgaW5jbHVkaW5nIG11bHRpcGxlIGNvcGllcy5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudC4gVG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2goZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHYudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29waWVzID0gdi5jb3BpZXM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcGllczsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgYmFnLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cyA9PT0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgYmFnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9Ly8gRW5kIG9mIGJhZyBcclxuXHJcblxyXG4gICAgLy8gSW50ZXJuYWwgaW50ZXJmYWNlIGZvciBCU1QgXHJcbiAgICBpbnRlcmZhY2UgQlNUcmVlTm9kZTxUPntcclxuICAgICAgICBlbGVtZW50OiBUO1xyXG4gICAgICAgIGxlZnRDaDogQlNUcmVlTm9kZTxUPjtcclxuICAgICAgICByaWdodENoOiBCU1RyZWVOb2RlPFQ+O1xyXG4gICAgICAgIHBhcmVudDogQlNUcmVlTm9kZTxUPjtcclxuICAgIH1cclxuICAgIGV4cG9ydCBjbGFzcyBCU1RyZWU8VD4ge1xyXG5cclxuICAgICAgICBwcml2YXRlIHJvb3Q6IEJTVHJlZU5vZGU8VD47XHJcbiAgICAgICAgcHJpdmF0ZSBjb21wYXJlOiBJQ29tcGFyZUZ1bmN0aW9uPFQ+O1xyXG4gICAgICAgIHByaXZhdGUgbkVsZW1lbnRzOiBudW1iZXI7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBlbXB0eSBiaW5hcnkgc2VhcmNoIHRyZWUuXHJcbiAgICAgICAgICogQGNsYXNzIDxwPkEgYmluYXJ5IHNlYXJjaCB0cmVlIGlzIGEgYmluYXJ5IHRyZWUgaW4gd2hpY2ggZWFjaCBcclxuICAgICAgICAgKiBpbnRlcm5hbCBub2RlIHN0b3JlcyBhbiBlbGVtZW50IHN1Y2ggdGhhdCB0aGUgZWxlbWVudHMgc3RvcmVkIGluIHRoZSBcclxuICAgICAgICAgKiBsZWZ0IHN1YnRyZWUgYXJlIGxlc3MgdGhhbiBpdCBhbmQgdGhlIGVsZW1lbnRzIFxyXG4gICAgICAgICAqIHN0b3JlZCBpbiB0aGUgcmlnaHQgc3VidHJlZSBhcmUgZ3JlYXRlci48L3A+XHJcbiAgICAgICAgICogPHA+Rm9ybWFsbHksIGEgYmluYXJ5IHNlYXJjaCB0cmVlIGlzIGEgbm9kZS1iYXNlZCBiaW5hcnkgdHJlZSBkYXRhIHN0cnVjdHVyZSB3aGljaCBcclxuICAgICAgICAgKiBoYXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOjwvcD5cclxuICAgICAgICAgKiA8dWw+XHJcbiAgICAgICAgICogPGxpPlRoZSBsZWZ0IHN1YnRyZWUgb2YgYSBub2RlIGNvbnRhaW5zIG9ubHkgbm9kZXMgd2l0aCBlbGVtZW50cyBsZXNzIFxyXG4gICAgICAgICAqIHRoYW4gdGhlIG5vZGUncyBlbGVtZW50PC9saT5cclxuICAgICAgICAgKiA8bGk+VGhlIHJpZ2h0IHN1YnRyZWUgb2YgYSBub2RlIGNvbnRhaW5zIG9ubHkgbm9kZXMgd2l0aCBlbGVtZW50cyBncmVhdGVyIFxyXG4gICAgICAgICAqIHRoYW4gdGhlIG5vZGUncyBlbGVtZW50PC9saT5cclxuICAgICAgICAgKiA8bGk+Qm90aCB0aGUgbGVmdCBhbmQgcmlnaHQgc3VidHJlZXMgbXVzdCBhbHNvIGJlIGJpbmFyeSBzZWFyY2ggdHJlZXMuPC9saT5cclxuICAgICAgICAgKiA8L3VsPlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBjb21wYXJlIGZ1bmN0aW9uIG11c3QgXHJcbiAgICAgICAgICogYmUgcHJvdmlkZWQgYXQgY29uc3RydWN0aW9uIHRpbWUsIG90aGVyd2lzZSB0aGUgPD0sID09PSBhbmQgPj0gb3BlcmF0b3JzIGFyZSBcclxuICAgICAgICAgKiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XHJcbiAgICAgICAgICogIGlmIChhIGlzIGxlc3MgdGhhbiBiIGJ5IHNvbWUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XHJcbiAgICAgICAgICogICAgIHJldHVybiAtMTtcclxuICAgICAgICAgKiAgfSBpZiAoYSBpcyBncmVhdGVyIHRoYW4gYiBieSB0aGUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XHJcbiAgICAgICAgICogICAgIHJldHVybiAxO1xyXG4gICAgICAgICAqICB9IFxyXG4gICAgICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxyXG4gICAgICAgICAqICByZXR1cm4gMDtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpudW1iZXI9fSBjb21wYXJlRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNvbXBhcmUgdHdvIGVsZW1lbnRzLiBNdXN0IHJldHVybiBhIG5lZ2F0aXZlIGludGVnZXIsXHJcbiAgICAgICAgICogemVybywgb3IgYSBwb3NpdGl2ZSBpbnRlZ2VyIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBsZXNzIHRoYW4sIGVxdWFsIHRvLFxyXG4gICAgICAgICAqIG9yIGdyZWF0ZXIgdGhhbiB0aGUgc2Vjb25kLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGNvbXBhcmVGdW5jdGlvbj86IElDb21wYXJlRnVuY3Rpb248VD4pIHtcclxuICAgICAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5jb21wYXJlID0gY29tcGFyZUZ1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRDb21wYXJlO1xyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCB0byB0aGlzIHRyZWUgaWYgaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBpbnNlcnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgZGlkIG5vdCBhbHJlYWR5IGNvbnRhaW4gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbnNlcnROb2RlKHRoaXMuY3JlYXRlTm9kZShlbGVtZW50KSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHRyZWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbnMgbm8gZWxlbWVudHMuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbnMgbm8gZWxlbWVudHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzID09PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgdHJlZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyB0cmVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCxcclxuICAgICAgICAgKiBmYWxzZSBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnMoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hOb2RlKHRoaXMucm9vdCwgZWxlbWVudCkgIT09IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBmcm9tIHRoaXMgdHJlZSBpZiBpdCBpcyBwcmVzZW50LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5lZCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVtb3ZlKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzLS07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBcclxuICAgICAgICAgKiBpbi1vcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXMgaW52b2tlZCB3aXRoIG9uZSBcclxuICAgICAgICAgKiBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpbm9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eCh0aGlzLnJvb3QsIGNhbGxiYWNrLCB7XHJcbiAgICAgICAgICAgICAgICBzdG9wOiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW4gcHJlLW9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lIFxyXG4gICAgICAgICAqIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByZW9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjaywge1xyXG4gICAgICAgICAgICAgICAgc3RvcDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIHBvc3Qtb3JkZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzIGludm9rZWQgd2l0aCBvbmUgXHJcbiAgICAgICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcG9zdG9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KHRoaXMucm9vdCwgY2FsbGJhY2ssIHtcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBcclxuICAgICAgICAgKiBsZXZlbC1vcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXMgaW52b2tlZCB3aXRoIG9uZSBcclxuICAgICAgICAgKiBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXZlbFRyYXZlcnNhbChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmxldmVsVHJhdmVyc2FsQXV4KHRoaXMucm9vdCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbWluaW11bSBlbGVtZW50IG9mIHRoaXMgdHJlZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgbWluaW11bSBlbGVtZW50IG9mIHRoaXMgdHJlZSBvciB1bmRlZmluZWQgaWYgdGhpcyB0cmVlIGlzXHJcbiAgICAgICAgICogaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbWluaW11bSgpOiBUIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1pbmltdW1BdXgodGhpcy5yb290KS5lbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbWF4aW11bSBlbGVtZW50IG9mIHRoaXMgdHJlZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgbWF4aW11bSBlbGVtZW50IG9mIHRoaXMgdHJlZSBvciB1bmRlZmluZWQgaWYgdGhpcyB0cmVlIGlzXHJcbiAgICAgICAgICogaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbWF4aW11bSgpOiBUIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1heGltdW1BdXgodGhpcy5yb290KS5lbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBpbm9yZGVyLlxyXG4gICAgICAgICAqIEVxdWl2YWxlbnQgdG8gaW5vcmRlclRyYXZlcnNhbC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5pbm9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b0FycmF5KCk6IFRbXSB7XHJcbiAgICAgICAgICAgIHZhciBhcnJheTogQXJyYXk8VD4gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5pbm9yZGVyVHJhdmVyc2FsKGZ1bmN0aW9uIChlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhpcyB0cmVlLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGhlaWdodCBvZiB0aGlzIHRyZWUgb3IgLTEgaWYgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodEF1eCh0aGlzLnJvb3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzZWFyY2hOb2RlKG5vZGU6IEJTVHJlZU5vZGU8VD4sIGVsZW1lbnQ6IFQpOiBCU1RyZWVOb2RlPFQ+IHtcclxuICAgICAgICAgICAgdmFyIGNtcDpudW1iZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB3aGlsZSAobm9kZSAhPT0gbnVsbCAmJiBjbXAgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNtcCA9IHRoaXMuY29tcGFyZShlbGVtZW50LCBub2RlLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5sZWZ0Q2g7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5yaWdodENoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSB0cmFuc3BsYW50KG4xOiBCU1RyZWVOb2RlPFQ+LCBuMjogQlNUcmVlTm9kZTxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAobjEucGFyZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QgPSBuMjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChuMSA9PT0gbjEucGFyZW50LmxlZnRDaCkge1xyXG4gICAgICAgICAgICAgICAgbjEucGFyZW50LmxlZnRDaCA9IG4yO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbjEucGFyZW50LnJpZ2h0Q2ggPSBuMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobjIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIG4yLnBhcmVudCA9IG4xLnBhcmVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSByZW1vdmVOb2RlKG5vZGU6IEJTVHJlZU5vZGU8VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUubGVmdENoID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcGxhbnQobm9kZSwgbm9kZS5yaWdodENoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJpZ2h0Q2ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwbGFudChub2RlLCBub2RlLmxlZnRDaCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMubWluaW11bUF1eChub2RlLnJpZ2h0Q2gpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHkucGFyZW50ICE9PSBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KHksIHkucmlnaHRDaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5yaWdodENoID0gbm9kZS5yaWdodENoO1xyXG4gICAgICAgICAgICAgICAgICAgIHkucmlnaHRDaC5wYXJlbnQgPSB5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KG5vZGUsIHkpO1xyXG4gICAgICAgICAgICAgICAgeS5sZWZ0Q2ggPSBub2RlLmxlZnRDaDtcclxuICAgICAgICAgICAgICAgIHkubGVmdENoLnBhcmVudCA9IHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaW5vcmRlclRyYXZlcnNhbEF1eChub2RlOiBCU1RyZWVOb2RlPFQ+LCBjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPiwgc2lnbmFsOiB7IHN0b3A6IGJvb2xlYW47IH0pOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwgfHwgc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaWduYWwuc3RvcCA9IGNhbGxiYWNrKG5vZGUuZWxlbWVudCkgPT09IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5yaWdodENoLCBjYWxsYmFjaywgc2lnbmFsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbGV2ZWxUcmF2ZXJzYWxBdXgobm9kZTogQlNUcmVlTm9kZTxUPiwgY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pIHtcclxuICAgICAgICAgICAgdmFyIHF1ZXVlID0gbmV3IFF1ZXVlPEJTVHJlZU5vZGU8VD4+KCk7XHJcbiAgICAgICAgICAgIGlmIChub2RlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBxdWV1ZS5lbnF1ZXVlKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlICghcXVldWUuaXNFbXB0eSgpKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gcXVldWUuZGVxdWV1ZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKG5vZGUuZWxlbWVudCkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubGVmdENoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZW5xdWV1ZShub2RlLmxlZnRDaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5yaWdodENoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuZW5xdWV1ZShub2RlLnJpZ2h0Q2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHByZW9yZGVyVHJhdmVyc2FsQXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4sIGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+LCBzaWduYWw6IHsgc3RvcDogYm9vbGVhbjsgfSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnByZW9yZGVyVHJhdmVyc2FsQXV4KG5vZGUucmlnaHRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgcG9zdG9yZGVyVHJhdmVyc2FsQXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4sIGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+LCBzaWduYWw6IHsgc3RvcDogYm9vbGVhbjsgfSkge1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KG5vZGUubGVmdENoLCBjYWxsYmFjaywgc2lnbmFsKTtcclxuICAgICAgICAgICAgaWYgKHNpZ25hbC5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wb3N0b3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5yaWdodENoLCBjYWxsYmFjaywgc2lnbmFsKTtcclxuICAgICAgICAgICAgaWYgKHNpZ25hbC5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2lnbmFsLnN0b3AgPSBjYWxsYmFjayhub2RlLmVsZW1lbnQpID09PSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbWluaW11bUF1eChub2RlOiBCU1RyZWVOb2RlPFQ+KTogQlNUcmVlTm9kZTxUPiB7XHJcbiAgICAgICAgICAgIHdoaWxlIChub2RlLmxlZnRDaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubGVmdENoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBtYXhpbXVtQXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4pOiBCU1RyZWVOb2RlPFQ+IHtcclxuICAgICAgICAgICAgd2hpbGUgKG5vZGUucmlnaHRDaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUucmlnaHRDaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGhlaWdodEF1eChub2RlOiBCU1RyZWVOb2RlPFQ+KTogbnVtYmVyIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5oZWlnaHRBdXgobm9kZS5sZWZ0Q2gpLCB0aGlzLmhlaWdodEF1eChub2RlLnJpZ2h0Q2gpKSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaW5zZXJ0Tm9kZShub2RlOiBCU1RyZWVOb2RlPFQ+KTogQlNUcmVlTm9kZTxUPiB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFyZW50OiBhbnkgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLnJvb3Q7XHJcbiAgICAgICAgICAgIHZhciBjbXA6bnVtYmVyID0gbnVsbDtcclxuICAgICAgICAgICAgd2hpbGUgKHBvc2l0aW9uICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjbXAgPSB0aGlzLmNvbXBhcmUobm9kZS5lbGVtZW50LCBwb3NpdGlvbi5lbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24ubGVmdENoO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uLnJpZ2h0Q2g7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRyZWUgaXMgZW1wdHlcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdCA9IG5vZGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb21wYXJlKG5vZGUuZWxlbWVudCwgcGFyZW50LmVsZW1lbnQpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmxlZnRDaCA9IG5vZGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQucmlnaHRDaCA9IG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZU5vZGUoZWxlbWVudDogVCk6IEJTVHJlZU5vZGU8VD4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIGxlZnRDaDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHJpZ2h0Q2g6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSAvLyBlbmQgb2YgQlNUcmVlXHJcblxyXG5cclxufS8vIEVuZCBvZiBtb2R1bGUgIl19