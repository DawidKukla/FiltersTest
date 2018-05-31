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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb2xsZWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxJQUFPLFdBQVcsQ0F5akZqQjtBQXpqRkQsV0FBTyxXQUFXO0lBOEJkLHdCQUFrQyxDQUFJLEVBQUUsQ0FBSTtRQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQVJlLDBCQUFjLGlCQVE3QixDQUFBO0lBTUQsdUJBQWlDLENBQUksRUFBRSxDQUFJO1FBQ3ZDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFGZSx5QkFBYSxnQkFFNUIsQ0FBQTtJQU1ELHlCQUFnQyxJQUFTO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQztRQUNsQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lB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QUFDLENBQUM7Z0JBRWxCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDMUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUtPLFVBQVUsQ0FBQyxPQUFVO1lBQ3pCLE1BQU0sQ0FBQztnQkFDSCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osT0FBTyxFQUFFLElBQUk7Z0JBQ2IsTUFBTSxFQUFFLElBQUk7YUFDZixDQUFDO1FBQ04sQ0FBQztLQUVKO0lBaGFZLGtCQUFNLFNBZ2FsQixDQUFBO0FBR0wsQ0FBQyxFQXpqRk0sV0FBVyxLQUFYLFdBQVcsUUF5akZqQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzIEJhc2FyYXQgQWxpIFN5ZWQuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbi8vXHJcbi8vIExpY2Vuc2VkIHVuZGVyIE1JVCBvcGVuIHNvdXJjZSBsaWNlbnNlIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuLy9cclxuLy8gT3JnaW5hbCBqYXZhc2NyaXB0IGNvZGUgd2FzIGJ5IE1hdXJpY2lvIFNhbnRvc1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lc3BhY2UgVG9wIGxldmVsIG5hbWVzcGFjZSBmb3IgY29sbGVjdGlvbnMsIGEgVHlwZVNjcmlwdCBkYXRhIHN0cnVjdHVyZSBsaWJyYXJ5LlxyXG4gKi9cclxuXHJcbm1vZHVsZSBjb2xsZWN0aW9ucyB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIEZ1bmN0aW9uIHNpZ25hdHVyZSBmb3IgY29tcGFyaW5nXHJcbiAgICAqIDwwIG1lYW5zIGEgaXMgc21hbGxlclxyXG4gICAgKiA9IDAgbWVhbnMgdGhleSBhcmUgZXF1YWxcclxuICAgICogPjAgbWVhbnMgYSBpcyBsYXJnZXJcclxuICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElDb21wYXJlRnVuY3Rpb248VD57XHJcbiAgICAgICAgKGE6IFQsIGI6IFQpOiBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIEZ1bmN0aW9uIHNpZ25hdHVyZSBmb3IgY2hlY2tpbmcgZXF1YWxpdHlcclxuICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElFcXVhbHNGdW5jdGlvbjxUPntcclxuICAgICAgICAoYTogVCwgYjogVCk6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAqIEZ1bmN0aW9uIHNpZ25hdHVyZSBmb3IgSXRlcmF0aW9ucy4gUmV0dXJuIGZhbHNlIHRvIGJyZWFrIGZyb20gbG9vcFxyXG4gICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUxvb3BGdW5jdGlvbjxUPntcclxuICAgICAgICAoYTogVCk6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0IGZ1bmN0aW9uIHRvIGNvbXBhcmUgZWxlbWVudCBvcmRlci5cclxuICAgICAqIEBmdW5jdGlvbiAgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q29tcGFyZTxUPihhOiBULCBiOiBUKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0IGZ1bmN0aW9uIHRvIHRlc3QgZXF1YWxpdHkuIFxyXG4gICAgICogQGZ1bmN0aW9uICAgICBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRFcXVhbHM8VD4oYTogVCwgYjogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBhID09PSBiO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCBmdW5jdGlvbiB0byBjb252ZXJ0IGFuIG9iamVjdCB0byBhIHN0cmluZy5cclxuICAgICAqIEBmdW5jdGlvbiAgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0VG9TdHJpbmcoaXRlbTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ0NPTExFQ1RJT05fTlVMTCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChpdGVtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ0NPTExFQ1RJT05fVU5ERUZJTkVEJztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbGxlY3Rpb25zLmlzU3RyaW5nKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBKb2lucyBhbGwgdGhlIHByb3BlcmllcyBvZiB0aGUgb2JqZWN0IHVzaW5nIHRoZSBwcm92aWRlZCBqb2luIHN0cmluZyBcclxuICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbWFrZVN0cmluZzxUPihpdGVtOiBULCBqb2luOiBzdHJpbmcgPSBcIixcIik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGl0ZW0gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX05VTEwnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoaXRlbSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX1VOREVGSU5FRCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9ucy5pc1N0cmluZyhpdGVtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0b3JldCA9IFwie1wiO1xyXG4gICAgICAgICAgICB2YXIgZmlyc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9yZXQgPSB0b3JldCArIGpvaW47XHJcbiAgICAgICAgICAgICAgICAgICAgdG9yZXQgPSB0b3JldCArIHByb3AgKyBcIjpcIiArIGl0ZW1bcHJvcF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRvcmV0ICsgXCJ9XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uLlxyXG4gICAgICogQGZ1bmN0aW9uICAgICBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuYzogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgZnVuYykgPT09ICdmdW5jdGlvbic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIHVuZGVmaW5lZC5cclxuICAgICAqIEBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gaXNVbmRlZmluZWQob2JqOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBvYmopID09PSAndW5kZWZpbmVkJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgYSBzdHJpbmcuXHJcbiAgICAgKiBAZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKG9iajogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBTdHJpbmddJztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldmVyc2VzIGEgY29tcGFyZSBmdW5jdGlvbi5cclxuICAgICAqIEBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmV2ZXJzZUNvbXBhcmVGdW5jdGlvbjxUPihjb21wYXJlRnVuY3Rpb246IElDb21wYXJlRnVuY3Rpb248VD4pOiBJQ29tcGFyZUZ1bmN0aW9uPFQ+IHtcclxuICAgICAgICBpZiAoIWNvbGxlY3Rpb25zLmlzRnVuY3Rpb24oY29tcGFyZUZ1bmN0aW9uKSkge1xyXG4vLyBSZVNoYXJwZXIgZGlzYWJsZSBvbmNlIExhbWJkYVxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4vLyBSZVNoYXJwZXIgZGlzYWJsZSBvbmNlIExhbWJkYVxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGQ6IFQsIHY6IFQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oZCwgdikgKiAtMTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGVxdWFsIGZ1bmN0aW9uIGdpdmVuIGEgY29tcGFyZSBmdW5jdGlvbi5cclxuICAgICAqIEBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gY29tcGFyZVRvRXF1YWxzPFQ+KGNvbXBhcmVGdW5jdGlvbjogSUNvbXBhcmVGdW5jdGlvbjxUPik6IElFcXVhbHNGdW5jdGlvbjxUPiB7XHJcbi8vIFJlU2hhcnBlciBkaXNhYmxlIG9uY2UgTGFtYmRhXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhOiBULCBiOiBUKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3Rpb24oYSwgYikgPT09IDA7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lc3BhY2UgQ29udGFpbnMgdmFyaW91cyBmdW5jdGlvbnMgZm9yIG1hbmlwdWxhdGluZyBhcnJheXMuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBtb2R1bGUgYXJyYXlzIHtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBpdGVtXHJcbiAgICAgICAgICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXkuXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgaW4gd2hpY2ggdG8gc2VhcmNoIHRoZSBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHRvIHNlYXJjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcclxuICAgICAgICAgKiB3aXRoaW4gdGhlIHNwZWNpZmllZCBhcnJheSwgb3IgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGV4cG9ydCBmdW5jdGlvbiBpbmRleE9mPFQ+KGFycmF5OiBUW10sIGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogbnVtYmVyIHtcclxuICAgICAgICAgICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRFcXVhbHM7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcXVhbHMoYXJyYXlbaV0sIGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcclxuICAgICAgICAgKiB3aXRoaW4gdGhlIHNwZWNpZmllZCBhcnJheS5cclxuICAgICAgICAgKiBAcGFyYW0geyp9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBzZWFyY2ggdGhlIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG8gXHJcbiAgICAgICAgICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIHBvc2l0aW9uIG9mIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50XHJcbiAgICAgICAgICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXkgb3IgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGV4cG9ydCBmdW5jdGlvbiBsYXN0SW5kZXhPZjxUPihhcnJheTogVFtdLCBpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHZhciBlcXVhbHMgPSBlcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gbGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcXVhbHMoYXJyYXlbaV0sIGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgYXJyYXkgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCB0aGUgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSB0aGUgZWxlbWVudCB0byBzZWFyY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdG8gXHJcbiAgICAgICAgICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHNwZWNpZmllZCBhcnJheSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zPFQ+KGFycmF5OiBUW10sIGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheXMuaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pID49IDA7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgZmlyc3Qgb2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBmcm9tIHRoZSBzcGVjaWZpZWQgYXJyYXkuXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgaW4gd2hpY2ggdG8gc2VhcmNoIGVsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIFxyXG4gICAgICAgICAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBhcnJheSBjaGFuZ2VkIGFmdGVyIHRoaXMgY2FsbC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KGFycmF5OiBUW10sIGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGFycmF5cy5pbmRleE9mKGFycmF5LCBpdGVtLCBlcXVhbHNGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5IGVxdWFsXHJcbiAgICAgICAgICogdG8gdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIGRldGVybWluZSB0aGUgZnJlcXVlbmN5IG9mIHRoZSBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHdob3NlIGZyZXF1ZW5jeSBpcyB0byBiZSBkZXRlcm1pbmVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG8gXHJcbiAgICAgICAgICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5IFxyXG4gICAgICAgICAqIGVxdWFsIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGV4cG9ydCBmdW5jdGlvbiBmcmVxdWVuY3k8VD4oYXJyYXk6IFRbXSwgaXRlbTogVCwgZXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248VD4pOiBudW1iZXIge1xyXG4gICAgICAgICAgICB2YXIgZXF1YWxzID0gZXF1YWxzRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGZyZXEgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyZXErKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZnJlcTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIHNwZWNpZmllZCBhcnJheXMgYXJlIGVxdWFsIHRvIG9uZSBhbm90aGVyLlxyXG4gICAgICAgICAqIFR3byBhcnJheXMgYXJlIGNvbnNpZGVyZWQgZXF1YWwgaWYgYm90aCBhcnJheXMgY29udGFpbiB0aGUgc2FtZSBudW1iZXJcclxuICAgICAgICAgKiBvZiBlbGVtZW50cywgYW5kIGFsbCBjb3JyZXNwb25kaW5nIHBhaXJzIG9mIGVsZW1lbnRzIGluIHRoZSB0d28gXHJcbiAgICAgICAgICogYXJyYXlzIGFyZSBlcXVhbCBhbmQgYXJlIGluIHRoZSBzYW1lIG9yZGVyLiBcclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheTEgb25lIGFycmF5IHRvIGJlIHRlc3RlZCBmb3IgZXF1YWxpdHkuXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkyIHRoZSBvdGhlciBhcnJheSB0byBiZSB0ZXN0ZWQgZm9yIGVxdWFsaXR5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG8gXHJcbiAgICAgICAgICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiBlbGVtZW1lbnRzIGluIHRoZSBhcnJheXMuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdHdvIGFycmF5cyBhcmUgZXF1YWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gZXF1YWxzPFQ+KGFycmF5MTogVFtdLCBhcnJheTI6IFRbXSwgZXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248VD4pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRFcXVhbHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJyYXkxLmxlbmd0aCAhPT0gYXJyYXkyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBhcnJheTEubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVxdWFscyhhcnJheTFbaV0sIGFycmF5MltpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHNoYWxsb3cgYSBjb3B5IG9mIHRoZSBzcGVjaWZpZWQgYXJyYXkuXHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgdG8gY29weS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYSBjb3B5IG9mIHRoZSBzcGVjaWZpZWQgYXJyYXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gY29weTxUPihhcnJheTogVFtdKTogVFtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmNvbmNhdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3dhcHMgdGhlIGVsZW1lbnRzIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb25zIGluIHRoZSBzcGVjaWZpZWQgYXJyYXkuXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IGluIHdoaWNoIHRvIHN3YXAgZWxlbWVudHMuXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGkgdGhlIGluZGV4IG9mIG9uZSBlbGVtZW50IHRvIGJlIHN3YXBwZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGogdGhlIGluZGV4IG9mIHRoZSBvdGhlciBlbGVtZW50IHRvIGJlIHN3YXBwZWQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYXJyYXkgaXMgZGVmaW5lZCBhbmQgdGhlIGluZGV4ZXMgYXJlIHZhbGlkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGV4cG9ydCBmdW5jdGlvbiBzd2FwPFQ+KGFycmF5OiBUW10sIGk6IG51bWJlciwgajogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChpIDwgMCB8fCBpID49IGFycmF5Lmxlbmd0aCB8fCBqIDwgMCB8fCBqID49IGFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XHJcbiAgICAgICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XHJcbiAgICAgICAgICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gdG9TdHJpbmc8VD4oYXJyYXk6IFRbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiAnWycgKyBhcnJheS50b1N0cmluZygpICsgJ10nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgYXJyYXkgXHJcbiAgICAgICAgICogc3RhcnRpbmcgZnJvbSBpbmRleCAwIHRvIGxlbmd0aCAtIDEuXHJcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IGluIHdoaWNoIHRvIGl0ZXJhdGUuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXHJcbiAgICAgICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBcclxuICAgICAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBleHBvcnQgZnVuY3Rpb24gZm9yRWFjaDxUPihhcnJheTogVFtdLCBjYWxsYmFjazogKGl0ZW06IFQpID0+IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGxlbmdodCA9IGFycmF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5naHQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGFycmF5W2ldKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIEEgbGlua2VkIGxpc3Qgbm9kZVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJTGlua2VkTGlzdE5vZGU8VD57XHJcbiAgICAgICAgZWxlbWVudDogVDtcclxuICAgICAgICBuZXh0OiBJTGlua2VkTGlzdE5vZGU8VD47XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIExpbmtlZExpc3Q8VD4ge1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEZpcnN0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGZpcnN0Tm9kZTogSUxpbmtlZExpc3ROb2RlPFQ+ID0gbnVsbDtcclxuICAgICAgICAvKipcclxuICAgICAgICAqIExhc3Qgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxhc3ROb2RlOiBJTGlua2VkTGlzdE5vZGU8VD4gPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIE51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgbGlzdFxyXG4gICAgICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIG5FbGVtZW50cyA9IDA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQ3JlYXRlcyBhbiBlbXB0eSBMaW5rZWQgTGlzdC5cclxuICAgICAgICAqIEBjbGFzcyBBIGxpbmtlZCBsaXN0IGlzIGEgZGF0YSBzdHJ1Y3R1cmUgY29uc2lzdGluZyBvZiBhIGdyb3VwIG9mIG5vZGVzXHJcbiAgICAgICAgKiB3aGljaCB0b2dldGhlciByZXByZXNlbnQgYSBzZXF1ZW5jZS5cclxuICAgICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEFkZHMgYW4gZWxlbWVudCB0byB0aGlzIGxpc3QuXHJcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIGJlIGFkZGVkLlxyXG4gICAgICAgICogQHBhcmFtIHtudW1iZXI9fSBpbmRleCBvcHRpb25hbCBpbmRleCB0byBhZGQgdGhlIGVsZW1lbnQuIElmIG5vIGluZGV4IGlzIHNwZWNpZmllZFxyXG4gICAgICAgICogdGhlIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGlzIGxpc3QuXHJcbiAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBhZGRlZCBvciBmYWxzZSBpZiB0aGUgaW5kZXggaXMgaW52YWxpZFxyXG4gICAgICAgICogb3IgaWYgdGhlIGVsZW1lbnQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICovXHJcbiAgICAgICAgYWRkKGl0ZW06IFQsIGluZGV4PzogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChpbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5uRWxlbWVudHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubkVsZW1lbnRzIHx8IGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIG5ld05vZGUgPSB0aGlzLmNyZWF0ZU5vZGUoaXRlbSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5FbGVtZW50cyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSB0aGlzLm5FbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGF0IHRoZSBlbmQuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3ROb2RlLm5leHQgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIENoYW5nZSBmaXJzdCBub2RlLlxyXG4gICAgICAgICAgICAgICAgbmV3Tm9kZS5uZXh0ID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldiA9IHRoaXMubm9kZUF0SW5kZXgoaW5kZXggLSAxKTtcclxuICAgICAgICAgICAgICAgIG5ld05vZGUubmV4dCA9IHByZXYubmV4dDtcclxuICAgICAgICAgICAgICAgIHByZXYubmV4dCA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICogQHJldHVybiB7Kn0gdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGxpc3Qgb3IgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzXHJcbiAgICAgICAgKiBlbXB0eS5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGZpcnN0KCk6IFQge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlyc3ROb2RlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdE5vZGUuZWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICogQHJldHVybiB7Kn0gdGhlIGxhc3QgZWxlbWVudCBpbiB0aGUgbGlzdCBvciB1bmRlZmluZWQgaWYgdGhlIGxpc3QgaXNcclxuICAgICAgICAqIGVtcHR5LlxyXG4gICAgICAgICovXHJcbiAgICAgICAgbGFzdCgpOiBUIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3ROb2RlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0Tm9kZS5lbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBkZXNpcmVkIGluZGV4LlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBpbmRleCBvciB1bmRlZmluZWQgaWYgdGhlIGluZGV4IGlzXHJcbiAgICAgICAgICogb3V0IG9mIGJvdW5kcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBlbGVtZW50QXRJbmRleChpbmRleDogbnVtYmVyKTogVCB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZUF0SW5kZXgoaW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5lbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgaW5kZXggaW4gdGhpcyBsaXN0IG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZVxyXG4gICAgICAgICAqIHNwZWNpZmllZCBlbGVtZW50LCBvciAtMSBpZiB0aGUgTGlzdCBkb2VzIG5vdCBjb250YWluIHRoaXMgZWxlbWVudC5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoaXMgbGlzdCBhcmVcclxuICAgICAgICAgKiBub3QgY29tcGFyYWJsZSB3aXRoIHRoZSA9PT0gb3BlcmF0b3IgYSBjdXN0b20gZXF1YWxzIGZ1bmN0aW9uIHNob3VsZCBiZVxyXG4gICAgICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcclxuICAgICAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogdmFyIHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gT3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byBlbGVtZW50cyBhcmUgZXF1YWwuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgaW5kZXggaW4gdGhpcyBsaXN0IG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlXHJcbiAgICAgICAgICogb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50LCBvciAtMSBpZiB0aGlzIGxpc3QgZG9lcyBub3QgY29udGFpbiB0aGVcclxuICAgICAgICAgKiBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGluZGV4T2YoaXRlbTogVCwgZXF1YWxzRnVuY3Rpb24/OiBJRXF1YWxzRnVuY3Rpb248VD4pOiBudW1iZXIge1xyXG5cclxuICAgICAgICAgICAgdmFyIGVxdWFsc0YgPSBlcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgY3VycmVudE5vZGUgPSB0aGlzLmZpcnN0Tm9kZTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnROb2RlICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzRihjdXJyZW50Tm9kZS5lbGVtZW50LCBpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoZSBsaXN0IGFyZVxyXG4gICAgICAgICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcclxuICAgICAgICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcclxuICAgICAgICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAgICpcclxuICAgICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICAgKiB2YXIgcGV0c0FyZUVxdWFsQnlOYW1lID0gZnVuY3Rpb24ocGV0MSwgcGV0Mikge1xyXG4gICAgICAgICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcclxuICAgICAgICAgICAqIH1cclxuICAgICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxyXG4gICAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gT3B0aW9uYWxcclxuICAgICAgICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cclxuICAgICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCwgZmFsc2VcclxuICAgICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zKGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5pbmRleE9mKGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSA+PSAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50IGluIHRoaXMgbGlzdC5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoZSBsaXN0IGFyZVxyXG4gICAgICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXHJcbiAgICAgICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxyXG4gICAgICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiB2YXIgcGV0c0FyZUVxdWFsQnlOYW1lID0gZnVuY3Rpb24ocGV0MSwgcGV0Mikge1xyXG4gICAgICAgICAqICByZXR1cm4gcGV0MS5uYW1lID09PSBwZXQyLm5hbWU7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIGVsZW1lbnQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoaXMgbGlzdCwgaWYgcHJlc2VudC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBsaXN0IGNvbnRhaW5lZCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVtb3ZlKGl0ZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBlcXVhbHNGID0gZXF1YWxzRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcclxuICAgICAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzIDwgMSB8fCBjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91czogSUxpbmtlZExpc3ROb2RlPFQ+ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlOiBJTGlua2VkTGlzdE5vZGU8VD4gPSB0aGlzLmZpcnN0Tm9kZTtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVxdWFsc0YoY3VycmVudE5vZGUuZWxlbWVudCwgaXRlbSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlID09PSB0aGlzLmZpcnN0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IHRoaXMuZmlyc3ROb2RlLm5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZSA9PT0gdGhpcy5sYXN0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnROb2RlID09PSB0aGlzLmxhc3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBwcmV2aW91cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMubmV4dCA9IGN1cnJlbnROb2RlLm5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLm5leHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBjdXJyZW50Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5uZXh0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZXZpb3VzID0gY3VycmVudE5vZGU7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBsaXN0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBsaXN0IGlzIGVxdWFsIHRvIHRoZSBnaXZlbiBsaXN0LlxyXG4gICAgICAgICAqIFR3byBsaXN0cyBhcmUgZXF1YWwgaWYgdGhleSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIG9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7TGlua2VkTGlzdH0gb3RoZXIgdGhlIG90aGVyIGxpc3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNoZWNrIGlmIHR3byBlbGVtZW50cyBhcmUgZXF1YWwuIElmIHRoZSBlbGVtZW50cyBpbiB0aGUgbGlzdHNcclxuICAgICAgICAgKiBhcmUgY3VzdG9tIG9iamVjdHMgeW91IHNob3VsZCBwcm92aWRlIGEgZnVuY3Rpb24sIG90aGVyd2lzZSBcclxuICAgICAgICAgKiB0aGUgPT09IG9wZXJhdG9yIGlzIHVzZWQgdG8gY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gbGlzdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBlcXVhbHMob3RoZXI6IExpbmtlZExpc3Q8VD4sIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBlcUYgPSBlcXVhbHNGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgICAgICAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIExpbmtlZExpc3QpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2l6ZSgpICE9PSBvdGhlci5zaXplKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHNBdXgodGhpcy5maXJzdE5vZGUsIG90aGVyLmZpcnN0Tm9kZSwgZXFGKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgZXF1YWxzQXV4KG4xOiBJTGlua2VkTGlzdE5vZGU8VD4sIG4yOiBJTGlua2VkTGlzdE5vZGU8VD4sIGVxRjogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHdoaWxlIChuMSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcUYobjEuZWxlbWVudCwgbjIuZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuMSA9IG4xLm5leHQ7XHJcbiAgICAgICAgICAgICAgICBuMiA9IG4yLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBnaXZlbiBpbmRleC5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSByZW1vdmVkIGVsZW1lbnQgb3IgdW5kZWZpbmVkIGlmIHRoZSBpbmRleCBpcyBvdXQgb2YgYm91bmRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZUVsZW1lbnRBdEluZGV4KGluZGV4OiBudW1iZXIpOiBUIHtcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm5FbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZWxlbWVudDogVDtcclxuICAgICAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvL0ZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5maXJzdE5vZGUuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5ub2RlQXRJbmRleChpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMuZmlyc3ROb2RlLmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSB0aGlzLmZpcnN0Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2aW91cy5uZXh0ID09PSB0aGlzLmxhc3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMubGFzdE5vZGUuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3ROb2RlID0gcHJldmlvdXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gcHJldmlvdXMubmV4dC5lbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBwcmV2aW91cy5uZXh0Lm5leHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBsaXN0IGluIG9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogKGl0ZW06IFQpID0+IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGN1cnJlbnROb2RlLmVsZW1lbnQpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXZlcnNlcyB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgbGlua2VkIGxpc3QgKG1ha2VzIHRoZSBsYXN0IFxyXG4gICAgICAgICAqIGVsZW1lbnQgZmlyc3QsIGFuZCB0aGUgZmlyc3QgZWxlbWVudCBsYXN0KS5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXZlcnNlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXM6IElMaW5rZWRMaXN0Tm9kZTxUPiA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50OiBJTGlua2VkTGlzdE5vZGU8VD4gPSB0aGlzLmZpcnN0Tm9kZTtcclxuICAgICAgICAgICAgdmFyIHRlbXA6IElMaW5rZWRMaXN0Tm9kZTxUPiA9IG51bGw7XHJcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wID0gY3VycmVudC5uZXh0O1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5uZXh0ID0gcHJldmlvdXM7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50ID0gdGVtcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gdGhpcy5sYXN0Tm9kZTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHRlbXA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpc3QgaW4gcHJvcGVyXHJcbiAgICAgICAgICogc2VxdWVuY2UuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXkuPCo+fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBsaXN0LFxyXG4gICAgICAgICAqIGluIHByb3BlciBzZXF1ZW5jZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0b0FycmF5KCk6IFRbXSB7XHJcbiAgICAgICAgICAgIHZhciBhcnJheTogVFtdID0gW107XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50Tm9kZTogSUxpbmtlZExpc3ROb2RlPFQ+ID0gdGhpcy5maXJzdE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChjdXJyZW50Tm9kZS5lbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBsaXN0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGxpc3QuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cyA8PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5cy50b1N0cmluZyh0aGlzLnRvQXJyYXkoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbm9kZUF0SW5kZXgoaW5kZXg6IG51bWJlcik6IElMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMubkVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09ICh0aGlzLm5FbGVtZW50cyAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgY3JlYXRlTm9kZShpdGVtOiBUKTogSUxpbmtlZExpc3ROb2RlPFQ+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuZXh0OiBudWxsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfSAvLyBFbmQgb2YgbGlua2VkIGxpc3QgXHJcblxyXG5cclxuXHJcbiAgICAvLyBVc2VkIGludGVybmFsbHkgYnkgZGljdGlvbmFyeSBcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSURpY3Rpb25hcnlQYWlyPEssIFY+e1xyXG4gICAgICAgIGtleTogSztcclxuICAgICAgICB2YWx1ZTogVjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGljdGlvbmFyeTxLLCBWPntcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2JqZWN0IGhvbGRpbmcgdGhlIGtleS12YWx1ZSBwYWlycy5cclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGFibGU6IHsgW2tleTogc3RyaW5nXTogSURpY3Rpb25hcnlQYWlyPEssIFY+IH07XHJcbiAgICAgICAgLy86IFtrZXk6IEtdIHdpbGwgbm90IHdvcmsgc2luY2UgaW5kaWNlcyBjYW4gb25seSBieSBzdHJpbmdzIGluIGphdmFzY3JpcHQgYW5kIHR5cGVzY3JpcHQgZW5mb3JjZXMgdGhpcy4gXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgbGlzdC5cclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbkVsZW1lbnRzOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuXHJcbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSB0b1N0cjogKGtleTogSykgPT4gc3RyaW5nO1xyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBlbXB0eSBkaWN0aW9uYXJ5LiBcclxuICAgICAgICAgKiBAY2xhc3MgPHA+RGljdGlvbmFyaWVzIG1hcCBrZXlzIHRvIHZhbHVlczsgZWFjaCBrZXkgY2FuIG1hcCB0byBhdCBtb3N0IG9uZSB2YWx1ZS5cclxuICAgICAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIGFjY2VwdHMgYW55IGtpbmQgb2Ygb2JqZWN0cyBhcyBrZXlzLjwvcD5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBrZXlzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHdoaWNoIGNvbnZlcnRzIGtleXMgdG8gdW5pcXVlXHJcbiAgICAgICAgICogc3RyaW5ncyBtdXN0IGJlIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xyXG4gICAgICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KTpzdHJpbmc9fSB0b1N0ckZ1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWRcclxuICAgICAgICAgKiB0byBjb252ZXJ0IGtleXMgdG8gc3RyaW5ncy4gSWYgdGhlIGtleXMgYXJlbid0IHN0cmluZ3Mgb3IgaWYgdG9TdHJpbmcoKVxyXG4gICAgICAgICAqIGlzIG5vdCBhcHByb3ByaWF0ZSwgYSBjdXN0b20gZnVuY3Rpb24gd2hpY2ggcmVjZWl2ZXMgYSBrZXkgYW5kIHJldHVybnMgYVxyXG4gICAgICAgICAqIHVuaXF1ZSBzdHJpbmcgbXVzdCBiZSBwcm92aWRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0b1N0ckZ1bmN0aW9uPzogKGtleTogSykgPT4gc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFibGUgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnRvU3RyID0gdG9TdHJGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0VG9TdHJpbmc7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHMgdGhlIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgICogUmV0dXJucyB1bmRlZmluZWQgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmcgZm9yIHRoaXMga2V5LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIGFzc29jaWF0ZWQgdmFsdWUgaXMgdG8gYmUgcmV0dXJuZWQuXHJcbiAgICAgICAgICogQHJldHVybiB7Kn0gdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5IG9yXHJcbiAgICAgICAgICogdW5kZWZpbmVkIGlmIHRoZSBtYXAgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0VmFsdWUoa2V5OiBLKTogViB7XHJcbiAgICAgICAgICAgIHZhciBwYWlyOiBJRGljdGlvbmFyeVBhaXI8SywgVj4gPSB0aGlzLnRhYmxlW3RoaXMudG9TdHIoa2V5KV07XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChwYWlyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGFpci52YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBc3NvY2lhdGVzIHRoZSBzcGVjaWZpZWQgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogSWYgdGhlIGRpY3Rpb25hcnkgcHJldmlvdXNseSBjb250YWluZWQgYSBtYXBwaW5nIGZvciB0aGlzIGtleSwgdGhlIG9sZFxyXG4gICAgICAgICAqIHZhbHVlIGlzIHJlcGxhY2VkIGJ5IHRoZSBzcGVjaWZpZWQgdmFsdWUuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2l0aCB3aGljaCB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHRvIGJlXHJcbiAgICAgICAgICogYXNzb2NpYXRlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdmFsdWUgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHByZXZpb3VzIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXHJcbiAgICAgICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIHRoZSBrZXkgb3IgaWYgdGhlIGtleS92YWx1ZSBhcmUgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNldFZhbHVlKGtleTogSywgdmFsdWU6IFYpOiBWIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChrZXkpIHx8IGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHJldDogVjtcclxuICAgICAgICAgICAgdmFyIGsgPSB0aGlzLnRvU3RyKGtleSk7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91c0VsZW1lbnQ6IElEaWN0aW9uYXJ5UGFpcjxLLCBWPiA9IHRoaXMudGFibGVba107XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChwcmV2aW91c0VsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5FbGVtZW50cysrO1xyXG4gICAgICAgICAgICAgICAgcmV0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0ID0gcHJldmlvdXNFbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFibGVba10gPSB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgbWFwcGluZyBmb3IgdGhpcyBrZXkgZnJvbSB0aGlzIGRpY3Rpb25hcnkgaWYgaXQgaXMgcHJlc2VudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBtYXBwaW5nIGlzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGVcclxuICAgICAgICAgKiBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHByZXZpb3VzIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBzcGVjaWZpZWQga2V5LCBvciB1bmRlZmluZWQgaWZcclxuICAgICAgICAgKiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3Iga2V5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShrZXk6IEspOiBWIHtcclxuICAgICAgICAgICAgdmFyIGsgPSB0aGlzLnRvU3RyKGtleSk7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91c0VsZW1lbnQ6IElEaWN0aW9uYXJ5UGFpcjxLLCBWPiA9IHRoaXMudGFibGVba107XHJcbiAgICAgICAgICAgIGlmICghY29sbGVjdGlvbnMuaXNVbmRlZmluZWQocHJldmlvdXNFbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMudGFibGVba107XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5FbGVtZW50cy0tO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzRWxlbWVudC52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBrZXlzKCk6IEtbXSB7XHJcbiAgICAgICAgICAgIHZhciBhcnJheTogS1tdID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy50YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFpcjogSURpY3Rpb25hcnlQYWlyPEssIFY+ID0gdGhpcy50YWJsZVtuYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHBhaXIua2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YWx1ZXMoKTogVltdIHtcclxuICAgICAgICAgICAgdmFyIGFycmF5OiBWW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnRhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50YWJsZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWlyOiBJRGljdGlvbmFyeVBhaXI8SywgVj4gPSB0aGlzLnRhYmxlW25hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2gocGFpci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBrZXktdmFsdWUgcGFpciBcclxuICAgICAgICAqIHByZXNlbnQgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM6IGtleSBhbmQgdmFsdWUuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBcclxuICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogKGtleTogSywgdmFsdWU6IFYpID0+IGFueSk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMudGFibGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhaXI6IElEaWN0aW9uYXJ5UGFpcjxLLCBWPiA9IHRoaXMudGFibGVbbmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldCA9IGNhbGxiYWNrKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIGEgbWFwcGluZyBmb3IgdGhlIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgcHJlc2VuY2UgaW4gdGhpcyBkaWN0aW9uYXJ5IGlzIHRvIGJlXHJcbiAgICAgICAgICogdGVzdGVkLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIGEgbWFwcGluZyBmb3IgdGhlXHJcbiAgICAgICAgICogc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWluc0tleShrZXk6IEspOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuICFjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZCh0aGlzLmdldFZhbHVlKGtleSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZW1vdmVzIGFsbCBtYXBwaW5ncyBmcm9tIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAqIEB0aGlzIHtjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5fVxyXG4gICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRhYmxlID0ge307XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2Yga2V5LXZhbHVlIG1hcHBpbmdzIGluIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzIDw9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICB2YXIgdG9yZXQgPSBcIntcIjtcclxuICAgICAgICAgICAgdGhpcy5mb3JFYWNoKChrLCB2KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0b3JldCA9IHRvcmV0ICsgXCJcXG5cXHRcIiArIGsudG9TdHJpbmcoKSArIFwiIDogXCIgKyB2LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9yZXQgKyBcIlxcbn1cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVE9ETyBESyBtb3ZlIHRvIHV0aWxzXHJcbiAgICAgICAgc3RhdGljIENvbnZlcnRPYmplY3RUb0RpY3Rpb25hcnk8SywgVj4ob2JqOiBPYmplY3QpOiBEaWN0aW9uYXJ5PEssVj4ge1xyXG4gICAgICAgICAgICB2YXIgZGljdCA9IG5ldyBEaWN0aW9uYXJ5PEssIFY+KCk7XHJcbiAgICAgICAgICAgIGlmIChvYmogJiYgIWpRdWVyeS5pc0VtcHR5T2JqZWN0KG9iaikpXHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgIGRpY3Quc2V0VmFsdWUoPGFueT5rZXksIG9ialtrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZGljdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGljIENvbnZlcnREaWN0aW9uYXJ5VG9PYmplY3Q8SywgVj4oZGljdGlvbmFyeTogRGljdGlvbmFyeTxLLCBWPik6YW55IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBpZiAoZGljdGlvbmFyeSAmJiAhalF1ZXJ5LmlzRW1wdHlPYmplY3QoZGljdGlvbmFyeSkpXHJcbiAgICAgICAgICAgIGRpY3Rpb25hcnkuZm9yRWFjaCgoa2V5OmFueSwgdmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgc3RhdGljIEZyb21PYmplY3REaWN0aW9uYXJ5VG9EaWN0aW9uYXJ5PFRJbktleVR5cGUsIFRJblZhbHVlVHlwZSwgVE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+KFxyXG4gICAgICAgICAgICBvYmo6IHsgW2tleTogc3RyaW5nXTogVEluVmFsdWVUeXBlIH0sXHJcbiAgICAgICAgICAgIGtleVNlbGVjdG9yOiAob2JqOiBzdHJpbmcpID0+IFRPdXRLZXlUeXBlLFxyXG4gICAgICAgICAgICB2YWx1ZVNlbGVjdG9yOiAob2JqOiBUSW5WYWx1ZVR5cGUpID0+IFRPdXRWYWx1ZVR5cGUsXHJcbiAgICAgICAgICAgIGdldEhhc2hDb2RlU2VsZWN0b3I/OiAoa2V5OiBUT3V0S2V5VHlwZSkgPT4gc3RyaW5nLFxyXG4gICAgICAgICAgICBkaWN0aW9uYXJ5SW5zdGFuY2VDcmVhdG9yOiAoZ2V0SGFzaENvZGVTZWxlY3Rvcj86IChrZXk6IFRPdXRLZXlUeXBlKSA9PiBzdHJpbmcpID0+IERpY3Rpb25hcnk8VE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+ID0gbnVsbFxyXG4gICAgICAgICk6IERpY3Rpb25hcnk8VE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+IHtcclxuXHJcbiAgICAgICAgICAgIHZhciBkaWN0OiBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPiA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChkaWN0aW9uYXJ5SW5zdGFuY2VDcmVhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBkaWN0ID0gZGljdGlvbmFyeUluc3RhbmNlQ3JlYXRvcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGljdCA9IG5ldyBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPihnZXRIYXNoQ29kZVNlbGVjdG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW9iaikgcmV0dXJuIGRpY3Q7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgZGljdC5zZXRWYWx1ZShrZXlTZWxlY3RvcihrZXkpLCB2YWx1ZVNlbGVjdG9yKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGljdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBGcm9tT2JqZWN0VG9EaWN0aW9uYXJ5PFRJbk9iamVjdCBleHRlbmRzIE9iamVjdCwgVE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+KFxyXG4gICAgICAgICAgICBvYmo6IFRJbk9iamVjdCxcclxuICAgICAgICAgICAga2V5U2VsZWN0b3I6IChvYmo6IHN0cmluZykgPT4gVE91dEtleVR5cGUsXHJcbiAgICAgICAgICAgIHZhbHVlU2VsZWN0b3I6IChvYmo6IFRJbk9iamVjdCkgPT4gVE91dFZhbHVlVHlwZSxcclxuICAgICAgICAgICAgZ2V0SGFzaENvZGVTZWxlY3Rvcj86IChrZXk6IFRPdXRLZXlUeXBlKSA9PiBzdHJpbmcpOiBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPiB7XHJcbiAgICAgICAgICAgIHZhciBkaWN0ID0gbmV3IERpY3Rpb25hcnk8VE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+KGdldEhhc2hDb2RlU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBpZiAoIW9iaikgcmV0dXJuIGRpY3Q7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgZGljdC5zZXRWYWx1ZShrZXlTZWxlY3RvcihrZXkpLCB2YWx1ZVNlbGVjdG9yKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGljdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBGcm9tQXJyYXlMaWtlT2JqZWN0VG9EaWN0aW9uYXJ5PFRJbktleVR5cGUsVEluVmFsdWVUeXBlLFRPdXRLZXlUeXBlICwgVE91dFZhbHVlVHlwZT4ob2JqOiB7W2tleTpudW1iZXJdOlRJblZhbHVlVHlwZSB9LGtleVNlbGVjdG9yOihvYmo6c3RyaW5nKT0+VE91dEtleVR5cGUsdmFsdWVTZWxlY3Rvcjoob2JqOlRJblZhbHVlVHlwZSk9PlRPdXRWYWx1ZVR5cGUsZ2V0SGFzaENvZGVTZWxlY3Rvcj86IChrZXk6IFRPdXRLZXlUeXBlKSA9PiBzdHJpbmcpOiBEaWN0aW9uYXJ5PFRPdXRLZXlUeXBlLCBUT3V0VmFsdWVUeXBlPiB7XHJcbiAgICAgICAgICAgIHJldHVybiBEaWN0aW9uYXJ5LkZyb21PYmplY3REaWN0aW9uYXJ5VG9EaWN0aW9uYXJ5KG9iaiwga2V5U2VsZWN0b3IsIHZhbHVlU2VsZWN0b3IsIGdldEhhc2hDb2RlU2VsZWN0b3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIEZyb21EaWN0aW9uYXJ5VG9PYmplY3Q8VEluS2V5VHlwZSxUSW5WYWx1ZVR5cGUsVE91dEtleVR5cGUsIFRPdXRWYWx1ZVR5cGU+KGRpY3Q6IERpY3Rpb25hcnk8VEluS2V5VHlwZSxUSW5WYWx1ZVR5cGU+LGtleVNlbGVjdG9yOihvYmo6VEluS2V5VHlwZSk9PnN0cmluZyx2YWx1ZVNlbGVjdG9yOihvYmo6VEluVmFsdWVUeXBlKT0+VE91dFZhbHVlVHlwZSk6IHtba2V5OnN0cmluZ106VE91dFZhbHVlVHlwZX0ge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgIGlmICghZGljdCkgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgZGljdC5mb3JFYWNoKChrZXksIHZhbHVlKT0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXlTZWxlY3RvcihrZXkpXSA9IHZhbHVlU2VsZWN0b3IodmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBHZXRDb3B5PEssIFY+KGRpY3Rpb25hcnk6IERpY3Rpb25hcnk8SywgVj4sZGVlcENvcHlGdW5jdGlvbjoobzpWKT0+Vj1vPT5vKTogRGljdGlvbmFyeTxLLCBWPiB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGljdGlvbmFyeTxLLCBWPigpO1xyXG4gICAgICAgICAgICBpZiAoZGljdGlvbmFyeSAmJiAhalF1ZXJ5LmlzRW1wdHlPYmplY3QoZGljdGlvbmFyeSkpIHtcclxuICAgICAgICAgICAgICAgIGRpY3Rpb25hcnkuZm9yRWFjaCgoa2V5OiBhbnksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXRWYWx1ZShrZXksZGVlcENvcHlGdW5jdGlvbih2YWwpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vVE9ETyBESyBtb3ZlIHRvIHV0aWxzXHJcbiAgICB9IC8vIEVuZCBvZiBkaWN0aW9uYXJ5XHJcblxyXG4gICAgLy8gLyoqXHJcbiAgICAvLyAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGlzIGVxdWFsIHRvIHRoZSBnaXZlbiBkaWN0aW9uYXJ5LlxyXG4gICAgLy8gICogVHdvIGRpY3Rpb25hcmllcyBhcmUgZXF1YWwgaWYgdGhleSBjb250YWluIHRoZSBzYW1lIG1hcHBpbmdzLlxyXG4gICAgLy8gICogQHBhcmFtIHtjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5fSBvdGhlciB0aGUgb3RoZXIgZGljdGlvbmFyeS5cclxuICAgIC8vICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IHZhbHVlc0VxdWFsRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgIC8vICAqIGZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgaWYgdHdvIHZhbHVlcyBhcmUgZXF1YWwuXHJcbiAgICAvLyAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBpcyBlcXVhbCB0byB0aGUgZ2l2ZW4gZGljdGlvbmFyeS5cclxuICAgIC8vICAqL1xyXG4gICAgLy8gY29sbGVjdGlvbnMuRGljdGlvbmFyeS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24ob3RoZXIsdmFsdWVzRXF1YWxGdW5jdGlvbikge1xyXG4gICAgLy8gXHR2YXIgZXFGID0gdmFsdWVzRXF1YWxGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0RXF1YWxzO1xyXG4gICAgLy8gXHRpZighKG90aGVyIGluc3RhbmNlb2YgY29sbGVjdGlvbnMuRGljdGlvbmFyeSkpe1xyXG4gICAgLy8gXHRcdHJldHVybiBmYWxzZTtcclxuICAgIC8vIFx0fVxyXG4gICAgLy8gXHRpZih0aGlzLnNpemUoKSAhPT0gb3RoZXIuc2l6ZSgpKXtcclxuICAgIC8vIFx0XHRyZXR1cm4gZmFsc2U7XHJcbiAgICAvLyBcdH1cclxuICAgIC8vIFx0cmV0dXJuIHRoaXMuZXF1YWxzQXV4KHRoaXMuZmlyc3ROb2RlLG90aGVyLmZpcnN0Tm9kZSxlcUYpO1xyXG4gICAgLy8gfVxyXG5cclxuXHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIE11bHRpRGljdGlvbmFyeTxLLCBWPiB7XHJcblxyXG4gICAgICAgIC8vIENhbm5vdCBkbzogXHJcbiAgICAgICAgLy8gY2xhc3MgTXVsdGlEaWN0aW9uYXJ5PEssVj4gZXh0ZW5kcyBEaWN0aW9uYXJ5PEssQXJyYXk8Vj4+IHtcclxuICAgICAgICAvLyBTaW5jZSB3ZSB3YW50IHRvIHJldXNlIHRoZSBmdW5jdGlvbiBuYW1lIHNldFZhbHVlIGFuZCB0eXBlcyBpbiBzaWduYXR1cmUgYmVjb21lIGluY29tcGF0aWJsZSBcclxuICAgICAgICAvLyBUaGVyZWZvcmUgd2UgYXJlIHVzaW5nIGNvbXBvc2l0aW9uIGluc3RlYWQgb2YgaW5oZXJpdGFuY2VcclxuICAgICAgICBwcml2YXRlIGRpY3Q6IERpY3Rpb25hcnk8SywgQXJyYXk8Vj4+O1xyXG4gICAgICAgIHByaXZhdGUgZXF1YWxzRjogSUVxdWFsc0Z1bmN0aW9uPFY+O1xyXG4gICAgICAgIHByaXZhdGUgYWxsb3dEdXBsaWNhdGU6IGJvb2xlYW47XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ3JlYXRlcyBhbiBlbXB0eSBtdWx0aSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgKiBAY2xhc3MgPHA+QSBtdWx0aSBkaWN0aW9uYXJ5IGlzIGEgc3BlY2lhbCBraW5kIG9mIGRpY3Rpb25hcnkgdGhhdCBob2xkc1xyXG4gICAgICAgKiBtdWx0aXBsZSB2YWx1ZXMgYWdhaW5zdCBlYWNoIGtleS4gU2V0dGluZyBhIHZhbHVlIGludG8gdGhlIGRpY3Rpb25hcnkgd2lsbFxyXG4gICAgICAgKiBhZGQgdGhlIHZhbHVlIHRvIGFuIGFycmF5IGF0IHRoYXQga2V5LiBHZXR0aW5nIGEga2V5IHdpbGwgcmV0dXJuIGFuIGFycmF5LFxyXG4gICAgICAgKiBob2xkaW5nIGFsbCB0aGUgdmFsdWVzIHNldCB0byB0aGF0IGtleS5cclxuICAgICAgICogWW91IGNhbiBjb25maWd1cmUgdG8gYWxsb3cgZHVwbGljYXRlcyBpbiB0aGUgdmFsdWVzLlxyXG4gICAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIGFjY2VwdHMgYW55IGtpbmQgb2Ygb2JqZWN0cyBhcyBrZXlzLjwvcD5cclxuICAgICAgICpcclxuICAgICAgICogPHA+SWYgdGhlIGtleXMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gd2hpY2ggY29udmVydHMga2V5cyB0byBzdHJpbmdzIG11c3QgYmVcclxuICAgICAgICogcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxyXG4gICAgICAgKlxyXG4gICAgICAgKiA8cHJlPlxyXG4gICAgICAgKiBmdW5jdGlvbiBwZXRUb1N0cmluZyhwZXQpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldC5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICogPC9wcmU+XHJcbiAgICAgICAqIDxwPklmIHRoZSB2YWx1ZXMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gdG8gY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiB2YWx1ZXNcclxuICAgICAgICogbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAqXHJcbiAgICAgICAqIDxwcmU+XHJcbiAgICAgICAqIGZ1bmN0aW9uIHBldHNBcmVFcXVhbEJ5QWdlKHBldDEscGV0Mikge1xyXG4gICAgICAgICAqICByZXR1cm4gcGV0MS5hZ2U9PT1wZXQyLmFnZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb25cclxuICAgICAgICogdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuIElmIHRoZSBrZXlzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcclxuICAgICAgICogaXMgbm90IGFwcHJvcHJpYXRlLCBhIGN1c3RvbSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhIGtleSBhbmQgcmV0dXJucyBhXHJcbiAgICAgICAqIHVuaXF1ZSBzdHJpbmcgbXVzdCBiZSBwcm92aWRlZC5cclxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gdmFsdWVzRXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIHZhbHVlcyBhcmUgZXF1YWwuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSBhbGxvd0R1cGxpY2F0ZVZhbHVlc1xyXG4gICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0b1N0ckZ1bmN0aW9uPzogKGtleTogSykgPT4gc3RyaW5nLCB2YWx1ZXNFcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxWPiwgYWxsb3dEdXBsaWNhdGVWYWx1ZXMgPSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRpY3QgPSBuZXcgRGljdGlvbmFyeTxLLCBBcnJheTxWPj4odG9TdHJGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuZXF1YWxzRiA9IHZhbHVlc0VxdWFsc0Z1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRFcXVhbHM7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsb3dEdXBsaWNhdGUgPSBhbGxvd0R1cGxpY2F0ZVZhbHVlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGhvbGRpbmcgdGhlIHZhbHVlcyB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwc1xyXG4gICAgICAgICogdGhlIHNwZWNpZmllZCBrZXkuXHJcbiAgICAgICAgKiBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncyBmb3IgdGhpcyBrZXkuXHJcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBhc3NvY2lhdGVkIHZhbHVlcyBhcmUgdG8gYmUgcmV0dXJuZWQuXHJcbiAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgaG9sZGluZyB0aGUgdmFsdWVzIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzXHJcbiAgICAgICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAqL1xyXG4gICAgICAgIGdldFZhbHVlKGtleTogSyk6IFZbXSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLmRpY3QuZ2V0VmFsdWUoa2V5KTtcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKHZhbHVlcykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlzLmNvcHkodmFsdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgdGhlIHZhbHVlIHRvIHRoZSBhcnJheSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIGlmIFxyXG4gICAgICAgICAqIGl0IGlzIG5vdCBhbHJlYWR5IHByZXNlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2l0aCB3aGljaCB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHRvIGJlXHJcbiAgICAgICAgICogYXNzb2NpYXRlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdmFsdWUgdGhlIHZhbHVlIHRvIGFkZCB0byB0aGUgYXJyYXkgYXQgdGhlIGtleVxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHZhbHVlIHdhcyBub3QgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggdGhhdCBrZXkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2V0VmFsdWUoa2V5OiBLLCB2YWx1ZTogVik6IGJvb2xlYW4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGtleSkgfHwgY29sbGVjdGlvbnMuaXNVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zS2V5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdC5zZXRWYWx1ZShrZXksIFt2YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5kaWN0LmdldFZhbHVlKGtleSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hbGxvd0R1cGxpY2F0ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFycmF5cy5jb250YWlucyhhcnJheSwgdmFsdWUsIHRoaXMuZXF1YWxzRikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIHZhbHVlcyBmcm9tIHRoZSBhcnJheSBvZiB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIHRoZVxyXG4gICAgICAgICAqIHNwZWNpZmllZCBrZXkuIElmIGEgdmFsdWUgaXNuJ3QgZ2l2ZW4sIGFsbCB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQgXHJcbiAgICAgICAgICoga2V5IGFyZSByZW1vdmVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIG1hcHBpbmcgaXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZVxyXG4gICAgICAgICAqIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3Q9fSB2YWx1ZSBvcHRpb25hbCBhcmd1bWVudCB0byBzcGVjaWZ5IHRoZSB2YWx1ZSB0byByZW1vdmUgXHJcbiAgICAgICAgICogZnJvbSB0aGUgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRydWUgaWYgdGhlIGRpY3Rpb25hcnkgY2hhbmdlZCwgZmFsc2UgaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0IG9yIFxyXG4gICAgICAgICAqIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXNuJ3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShrZXk6IEssIHZhbHVlPzogVik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHRoaXMuZGljdC5yZW1vdmUoa2V5KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhY29sbGVjdGlvbnMuaXNVbmRlZmluZWQodik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5kaWN0LmdldFZhbHVlKGtleSk7XHJcbiAgICAgICAgICAgIGlmIChhcnJheXMucmVtb3ZlKGFycmF5LCB2YWx1ZSwgdGhpcy5lcXVhbHNGKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGljdC5yZW1vdmUoa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAga2V5cygpOiBLW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0LmtleXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhbHVlcygpOiBWW10ge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5kaWN0LnZhbHVlcygpO1xyXG4gICAgICAgICAgICB2YXIgYXJyYXk6QXJyYXk8Vj4gPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gdmFsdWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh2W2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGF0IGxlYXN0IG9uZSB2YWx1ZSBhc3NvY2lhdHRlZCB0aGUgc3BlY2lmaWVkIGtleS5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIGRpY3Rpb25hcnkgaXMgdG8gYmVcclxuICAgICAgICAgKiB0ZXN0ZWQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgYXQgbGVhc3Qgb25lIHZhbHVlIGFzc29jaWF0dGVkIFxyXG4gICAgICAgICAqIHRoZSBzcGVjaWZpZWQga2V5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zS2V5KGtleTogSyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0LmNvbnRhaW5zS2V5KGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBtYXBwaW5ncyBmcm9tIHRoaXMgZGljdGlvbmFyeS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0LmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0LnNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZ3MuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdC5pc0VtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfS8vIGVuZCBvZiBtdWx0aSBkaWN0aW9uYXJ5IFxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBIZWFwPFQ+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBcnJheSB1c2VkIHRvIHN0b3JlIHRoZSBlbGVtZW50cyBvZCB0aGUgaGVhcC5cclxuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPE9iamVjdD59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGRhdGE6IFRbXSA9IFtdO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSBlbGVtZW50cy5cclxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6bnVtYmVyfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjb21wYXJlOiBJQ29tcGFyZUZ1bmN0aW9uPFQ+O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgSGVhcC5cclxuICAgICAgICAgKiBAY2xhc3MgXHJcbiAgICAgICAgICogPHA+QSBoZWFwIGlzIGEgYmluYXJ5IHRyZWUsIHdoZXJlIHRoZSBub2RlcyBtYWludGFpbiB0aGUgaGVhcCBwcm9wZXJ0eTogXHJcbiAgICAgICAgICogZWFjaCBub2RlIGlzIHNtYWxsZXIgdGhhbiBlYWNoIG9mIGl0cyBjaGlsZHJlbiBhbmQgdGhlcmVmb3JlIGEgTWluSGVhcCBcclxuICAgICAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHVzZXMgYW4gYXJyYXkgdG8gc3RvcmUgZWxlbWVudHMuPC9wPlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBjb21wYXJlIGZ1bmN0aW9uIG11c3QgYmUgcHJvdmlkZWQsIFxyXG4gICAgICAgICAqICBhdCBjb25zdHJ1Y3Rpb24gdGltZSwgb3RoZXJ3aXNlIHRoZSA8PSwgPT09IGFuZCA+PSBvcGVyYXRvcnMgYXJlIFxyXG4gICAgICAgICAqIHVzZWQgdG8gY29tcGFyZSBlbGVtZW50cy4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xyXG4gICAgICAgICAqICBpZiAoYSBpcyBsZXNzIHRoYW4gYiBieSBzb21lIG9yZGVyaW5nIGNyaXRlcmlvbikge1xyXG4gICAgICAgICAqICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xyXG4gICAgICAgICAqICAgICByZXR1cm4gMTtcclxuICAgICAgICAgKiAgfSBcclxuICAgICAgICAgKiAgLy8gYSBtdXN0IGJlIGVxdWFsIHRvIGJcclxuICAgICAgICAgKiAgcmV0dXJuIDA7XHJcbiAgICAgICAgICogfVxyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHA+SWYgYSBNYXgtSGVhcCBpcyB3YW50ZWQgKGdyZWF0ZXIgZWxlbWVudHMgb24gdG9wKSB5b3UgY2FuIGEgcHJvdmlkZSBhXHJcbiAgICAgICAgICogcmV2ZXJzZSBjb21wYXJlIGZ1bmN0aW9uIHRvIGFjY29tcGxpc2ggdGhhdCBiZWhhdmlvci4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHJldmVyc2VDb21wYXJlKGEsIGIpIHtcclxuICAgICAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xyXG4gICAgICAgICAqICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICogIH0gXHJcbiAgICAgICAgICogIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXHJcbiAgICAgICAgICogIHJldHVybiAwO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6bnVtYmVyPX0gY29tcGFyZUZ1bmN0aW9uIG9wdGlvbmFsXHJcbiAgICAgICAgICogZnVuY3Rpb24gdXNlZCB0byBjb21wYXJlIHR3byBlbGVtZW50cy4gTXVzdCByZXR1cm4gYSBuZWdhdGl2ZSBpbnRlZ2VyLFxyXG4gICAgICAgICAqIHplcm8sIG9yIGEgcG9zaXRpdmUgaW50ZWdlciBhcyB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbGVzcyB0aGFuLCBlcXVhbCB0byxcclxuICAgICAgICAgKiBvciBncmVhdGVyIHRoYW4gdGhlIHNlY29uZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcihjb21wYXJlRnVuY3Rpb24/OiBJQ29tcGFyZUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGFyZSA9IGNvbXBhcmVGdW5jdGlvbiB8fCBjb2xsZWN0aW9ucy5kZWZhdWx0Q29tcGFyZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBsZWZ0IGNoaWxkIG9mIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBnZXQgdGhlIGxlZnQgY2hpbGRcclxuICAgICAgICAgKiBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGxlZnQgY2hpbGQuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxlZnRDaGlsZEluZGV4KG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuICgyICogbm9kZUluZGV4KSArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSByaWdodCBjaGlsZCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSByaWdodCBjaGlsZFxyXG4gICAgICAgICAqIGZvci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgcmlnaHQgY2hpbGQuXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHJpZ2h0Q2hpbGRJbmRleChub2RlSW5kZXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAoMiAqIG5vZGVJbmRleCkgKyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgcGFyZW50IG9mIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBnZXQgdGhlIHBhcmVudCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIHBhcmVudC5cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgcGFyZW50SW5kZXgobm9kZUluZGV4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigobm9kZUluZGV4IC0gMSkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHNtYWxsZXIgY2hpbGQgbm9kZSAoaWYgaXQgZXhpc3RzKS5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdENoaWxkIGxlZnQgY2hpbGQgaW5kZXguXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0Q2hpbGQgcmlnaHQgY2hpbGQgaW5kZXguXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgaW5kZXggd2l0aCB0aGUgbWluaW11bSB2YWx1ZSBvciAtMSBpZiBpdCBkb2Vzbid0XHJcbiAgICAgICAgICogZXhpc3RzLlxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBtaW5JbmRleChsZWZ0Q2hpbGQ6IG51bWJlciwgcmlnaHRDaGlsZDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyaWdodENoaWxkID49IHRoaXMuZGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChsZWZ0Q2hpbGQgPj0gdGhpcy5kYXRhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRDaGlsZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBhcmUodGhpcy5kYXRhW2xlZnRDaGlsZF0sIHRoaXMuZGF0YVtyaWdodENoaWxkXSkgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0Q2hpbGQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByaWdodENoaWxkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1vdmVzIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleCB1cCB0byBpdHMgcHJvcGVyIHBsYWNlIGluIHRoZSBoZWFwLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gbW92ZSB1cC5cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc2lmdFVwKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudEluZGV4KGluZGV4KTtcclxuICAgICAgICAgICAgd2hpbGUgKGluZGV4ID4gMCAmJiB0aGlzLmNvbXBhcmUodGhpcy5kYXRhW3BhcmVudF0sIHRoaXMuZGF0YVtpbmRleF0pID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXJyYXlzLnN3YXAodGhpcy5kYXRhLCBwYXJlbnQsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gcGFyZW50O1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5wYXJlbnRJbmRleChpbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTW92ZXMgdGhlIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4IGRvd24gdG8gaXRzIHByb3BlciBwbGFjZSBpbiB0aGUgaGVhcC5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBtb3ZlIGRvd24uXHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHNpZnREb3duKG5vZGVJbmRleDogbnVtYmVyKTogdm9pZCB7XHJcblxyXG4gICAgICAgICAgICAvL3NtYWxsZXIgY2hpbGQgaW5kZXhcclxuICAgICAgICAgICAgdmFyIG1pbiA9IHRoaXMubWluSW5kZXgodGhpcy5sZWZ0Q2hpbGRJbmRleChub2RlSW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodENoaWxkSW5kZXgobm9kZUluZGV4KSk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAobWluID49IDAgJiYgdGhpcy5jb21wYXJlKHRoaXMuZGF0YVtub2RlSW5kZXhdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW21pbl0pID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXJyYXlzLnN3YXAodGhpcy5kYXRhLCBtaW4sIG5vZGVJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBub2RlSW5kZXggPSBtaW47XHJcbiAgICAgICAgICAgICAgICBtaW4gPSB0aGlzLm1pbkluZGV4KHRoaXMubGVmdENoaWxkSW5kZXgobm9kZUluZGV4KSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2hpbGRJbmRleChub2RlSW5kZXgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgaGVhcC5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSBUaGUgdmFsdWUgYXQgdGhlIHJvb3Qgb2YgdGhlIGhlYXAuIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZVxyXG4gICAgICAgICAqIGhlYXAgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGVlaygpOiBUIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkcyB0aGUgZ2l2ZW4gZWxlbWVudCBpbnRvIHRoZSBoZWFwLlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gZWxlbWVudCB0aGUgZWxlbWVudC5cclxuICAgICAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGFkZGVkIG9yIGZhbHMgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRhdGEucHVzaChlbGVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zaWZ0VXAodGhpcy5kYXRhLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgaGVhcC5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSBUaGUgdmFsdWUgcmVtb3ZlZCBmcm9tIHRoZSByb290IG9mIHRoZSBoZWFwLiBSZXR1cm5zXHJcbiAgICAgICAgICogdW5kZWZpbmVkIGlmIHRoZSBoZWFwIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZVJvb3QoKTogVCB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSB0aGlzLmRhdGFbMF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbMF0gPSB0aGlzLmRhdGFbdGhpcy5kYXRhLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLnNwbGljZSh0aGlzLmRhdGEubGVuZ3RoIC0gMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpZnREb3duKDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBoZWFwIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIEhlYXAgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LCBmYWxzZVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHZhciBlcXVGID0gY29sbGVjdGlvbnMuY29tcGFyZVRvRXF1YWxzKHRoaXMuY29tcGFyZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheXMuY29udGFpbnModGhpcy5kYXRhLCBlbGVtZW50LCBlcXVGKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgaGVhcC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBoZWFwLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrcyBpZiB0aGlzIGhlYXAgaXMgZW1wdHkuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGlzIGhlYXAgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXHJcbiAgICAgICAgICogb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoIDw9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgaGVhcC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBoZWFwIGluIFxyXG4gICAgICAgICAqIG5vIHBhcnRpY3VsYXIgb3JkZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXHJcbiAgICAgICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBcclxuICAgICAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3JFYWNoKGNhbGxiYWNrOiAoaXRlbTogVCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgICAgICBhcnJheXMuZm9yRWFjaCh0aGlzLmRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFN0YWNrPFQ+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMaXN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEB0eXBlIGNvbGxlY3Rpb25zLkxpbmtlZExpc3RcclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbGlzdDogTGlua2VkTGlzdDxUPjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IFN0YWNrLlxyXG4gICAgICAgICAqIEBjbGFzcyBBIFN0YWNrIGlzIGEgTGFzdC1Jbi1GaXJzdC1PdXQgKExJRk8pIGRhdGEgc3RydWN0dXJlLCB0aGUgbGFzdFxyXG4gICAgICAgICAqIGVsZW1lbnQgYWRkZWQgdG8gdGhlIHN0YWNrIHdpbGwgYmUgdGhlIGZpcnN0IG9uZSB0byBiZSByZW1vdmVkLiBUaGlzXHJcbiAgICAgICAgICogaW1wbGVtZW50YXRpb24gdXNlcyBhIGxpbmtlZCBsaXN0IGFzIGEgY29udGFpbmVyLlxyXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QgPSBuZXcgTGlua2VkTGlzdDxUPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUHVzaGVzIGFuIGl0ZW0gb250byB0aGUgdG9wIG9mIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gYmUgcHVzaGVkIG9udG8gdGhpcyBzdGFjay5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBwdXNoZWQgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1c2goZWxlbTogVCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmFkZChlbGVtLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUHVzaGVzIGFuIGl0ZW0gb250byB0aGUgdG9wIG9mIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gYmUgcHVzaGVkIG9udG8gdGhpcyBzdGFjay5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBwdXNoZWQgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtOiBUKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBvYmplY3QgYXQgdGhlIHRvcCBvZiB0aGlzIHN0YWNrIGFuZCByZXR1cm5zIHRoYXQgb2JqZWN0LlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBvYmplY3QgYXQgdGhlIHRvcCBvZiB0aGlzIHN0YWNrIG9yIHVuZGVmaW5lZCBpZiB0aGVcclxuICAgICAgICAgKiBzdGFjayBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwb3AoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QucmVtb3ZlRWxlbWVudEF0SW5kZXgoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvb2tzIGF0IHRoZSBvYmplY3QgYXQgdGhlIHRvcCBvZiB0aGlzIHN0YWNrIHdpdGhvdXQgcmVtb3ZpbmcgaXQgZnJvbSB0aGVcclxuICAgICAgICAgKiBzdGFjay5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayBvciB1bmRlZmluZWQgaWYgdGhlXHJcbiAgICAgICAgICogc3RhY2sgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGVlaygpOiBUIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5maXJzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3Quc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgc3RhY2sgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhpcyBzdGFjayBhcmVcclxuICAgICAgICAgKiBub3QgY29tcGFyYWJsZSB3aXRoIHRoZSA9PT0gb3BlcmF0b3IsIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcclxuICAgICAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXHJcbiAgICAgICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIHZhciBwZXRzQXJlRXF1YWxCeU5hbWUgKHBldDEsIHBldDIpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzdGFjayBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXHJcbiAgICAgICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zKGVsZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuY29udGFpbnMoZWxlbSwgZXF1YWxzRnVuY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3MgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgc3RhY2sgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXHJcbiAgICAgICAgICogb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuaXNFbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHN0YWNrLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICAqIFJlbW92ZXMgZWxlbWVudCBmcm9tIHRoaXMgc3RhY2suXHJcbiAgICAgICAgICAqIFRoaXMgbWV0aG9kIGlzbid0IHN0YW5kYXJkIG1ldGhvZCBpbiBzdGFjayBpbXBsZW1lbnRhdGlvbiBcclxuICAgICAgICAgICogQWRkZWQgYnkgSy5NLiBDb21hcmNoICBcclxuICAgICAgICAgICogQHBhcmFtIGl0ZW0gXHJcbiAgICAgICAgICAqIEBwYXJhbSBlcXVhbHNGdW5jdGlvbiBcclxuICAgICAgICAgICogQHJldHVybnMge30gXHJcbiAgICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShpdGVtOiBULCBlcXVhbHNGdW5jdGlvbj86IElFcXVhbHNGdW5jdGlvbjxUPik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LnJlbW92ZShpdGVtLCBlcXVhbHNGdW5jdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHN0YWNrIGluIFxyXG4gICAgICAgICAqIExJRk8gb3JkZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXHJcbiAgICAgICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBcclxuICAgICAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3JFYWNoKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9IC8vIEVuZCBvZiBzdGFjayBcclxuXHJcblxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBRdWV1ZTxUPntcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTGlzdCBjb250YWluaW5nIHRoZSBlbGVtZW50cy5cclxuICAgICAgICAgKiBAdHlwZSBjb2xsZWN0aW9ucy5MaW5rZWRMaXN0XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxpc3Q6IExpbmtlZExpc3Q8VD47XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgcXVldWUuXHJcbiAgICAgICAgICogQGNsYXNzIEEgcXVldWUgaXMgYSBGaXJzdC1Jbi1GaXJzdC1PdXQgKEZJRk8pIGRhdGEgc3RydWN0dXJlLCB0aGUgZmlyc3RcclxuICAgICAgICAgKiBlbGVtZW50IGFkZGVkIHRvIHRoZSBxdWV1ZSB3aWxsIGJlIHRoZSBmaXJzdCBvbmUgdG8gYmUgcmVtb3ZlZC4gVGhpc1xyXG4gICAgICAgICAqIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsaW5rZWQgbGlzdCBhcyBhIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gbmV3IExpbmtlZExpc3Q8VD4oKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoZSBlbmQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSB0aGUgZWxlbWVudCB0byBpbnNlcnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBlbnF1ZXVlKGVsZW06IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5hZGQoZWxlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluc2VydHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGludG8gdGhlIGVuZCBvZiB0aGlzIHF1ZXVlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGluc2VydC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtOiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgaGVhZCBvZiB0aGlzIHF1ZXVlLCBvciB1bmRlZmluZWQgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBkZXF1ZXVlKCk6IFQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saXN0LnNpemUoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gdGhpcy5saXN0LmZpcnN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3QucmVtb3ZlRWxlbWVudEF0SW5kZXgoMCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzLCBidXQgZG9lcyBub3QgcmVtb3ZlLCB0aGUgaGVhZCBvZiB0aGlzIHF1ZXVlLlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBoZWFkIG9mIHRoaXMgcXVldWUsIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBlZWsoKTogVCB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5saXN0LnNpemUoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5maXJzdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3Quc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhpcyBzdGFjayBhcmVcclxuICAgICAgICAgKiBub3QgY29tcGFyYWJsZSB3aXRoIHRoZSA9PT0gb3BlcmF0b3IsIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcclxuICAgICAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXHJcbiAgICAgICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiA8cHJlPlxyXG4gICAgICAgICAqIHZhciBwZXRzQXJlRXF1YWxCeU5hbWUgKHBldDEsIHBldDIpIHtcclxuICAgICAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBxdWV1ZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXHJcbiAgICAgICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zKGVsZW06IFQsIGVxdWFsc0Z1bmN0aW9uPzogSUVxdWFsc0Z1bmN0aW9uPFQ+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpc3QuY29udGFpbnMoZWxlbSwgZXF1YWxzRnVuY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hlY2tzIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmQgb25seSBpZiB0aGlzIHF1ZXVlIGNvbnRhaW5zIG5vIGl0ZW1zOyBmYWxzZVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LnNpemUoKSA8PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0LmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBxdWV1ZSBpbiBcclxuICAgICAgICAgKiBGSUZPIG9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gLy8gRW5kIG9mIHF1ZXVlXHJcblxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBQcmlvcml0eVF1ZXVlPFQ+IHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBoZWFwOiBIZWFwPFQ+O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgcHJpb3JpdHkgcXVldWUuXHJcbiAgICAgICAgICogQGNsYXNzIDxwPkluIGEgcHJpb3JpdHkgcXVldWUgZWFjaCBlbGVtZW50IGlzIGFzc29jaWF0ZWQgd2l0aCBhIFwicHJpb3JpdHlcIixcclxuICAgICAgICAgKiBlbGVtZW50cyBhcmUgZGVxdWV1ZWQgaW4gaGlnaGVzdC1wcmlvcml0eS1maXJzdCBvcmRlciAodGhlIGVsZW1lbnRzIHdpdGggdGhlIFxyXG4gICAgICAgICAqIGhpZ2hlc3QgcHJpb3JpdHkgYXJlIGRlcXVldWVkIGZpcnN0KS4gUHJpb3JpdHkgUXVldWVzIGFyZSBpbXBsZW1lbnRlZCBhcyBoZWFwcy4gXHJcbiAgICAgICAgICogSWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdCBiZSBwcm92aWRlZCwgXHJcbiAgICAgICAgICogb3RoZXJ3aXNlIHRoZSA8PSwgPT09IGFuZCA+PSBvcGVyYXRvcnMgYXJlIHVzZWQgdG8gY29tcGFyZSBvYmplY3QgcHJpb3JpdHkuPC9wPlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XHJcbiAgICAgICAgICogIGlmIChhIGlzIGxlc3MgdGhhbiBiIGJ5IHNvbWUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XHJcbiAgICAgICAgICogICAgIHJldHVybiAtMTtcclxuICAgICAgICAgKiAgfSBpZiAoYSBpcyBncmVhdGVyIHRoYW4gYiBieSB0aGUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XHJcbiAgICAgICAgICogICAgIHJldHVybiAxO1xyXG4gICAgICAgICAqICB9IFxyXG4gICAgICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxyXG4gICAgICAgICAqICByZXR1cm4gMDtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpudW1iZXI9fSBjb21wYXJlRnVuY3Rpb24gb3B0aW9uYWxcclxuICAgICAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNvbXBhcmUgdHdvIGVsZW1lbnQgcHJpb3JpdGllcy4gTXVzdCByZXR1cm4gYSBuZWdhdGl2ZSBpbnRlZ2VyLFxyXG4gICAgICAgICAqIHplcm8sIG9yIGEgcG9zaXRpdmUgaW50ZWdlciBhcyB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbGVzcyB0aGFuLCBlcXVhbCB0byxcclxuICAgICAgICAgKiBvciBncmVhdGVyIHRoYW4gdGhlIHNlY29uZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcihjb21wYXJlRnVuY3Rpb24/OiBJQ29tcGFyZUZ1bmN0aW9uPFQ+KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhcCA9IG5ldyBIZWFwPFQ+KGNvbGxlY3Rpb25zLnJldmVyc2VDb21wYXJlRnVuY3Rpb24oY29tcGFyZUZ1bmN0aW9uKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoaXMgcHJpb3JpdHkgcXVldWUuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGluc2VydGVkLCBvciBmYWxzZSBpZiBpdCBpcyB1bmRlZmluZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZW5xdWV1ZShlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYXAuYWRkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGlzIHByaW9yaXR5IHF1ZXVlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFkZChlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYXAuYWRkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBvZiB0aGlzIHF1ZXVlLCBcclxuICAgICAgICAgKiAgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVxdWV1ZSgpOiBUIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGVhcC5zaXplKCkgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbCA9IHRoaXMuaGVhcC5wZWVrKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlYXAucmVtb3ZlUm9vdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMsIGJ1dCBkb2VzIG5vdCByZW1vdmUsIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZS5cclxuICAgICAgICAgKiBAcmV0dXJuIHsqfSB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IG9mIHRoaXMgcXVldWUsIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBlZWsoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYXAucGVlaygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxyXG4gICAgICAgICAqIGZhbHNlIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYXAuY29udGFpbnMoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3MgaWYgdGhpcyBwcmlvcml0eSBxdWV1ZSBpcyBlbXB0eS5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgcHJpb3JpdHkgcXVldWUgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXHJcbiAgICAgICAgICogb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYXAuaXNFbXB0eSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcHJpb3JpdHkgcXVldWUuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgcHJpb3JpdHkgcXVldWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWFwLnNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgcHJpb3JpdHkgcXVldWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhcC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgcXVldWUgaW4gXHJcbiAgICAgICAgICogbm8gcGFydGljdWxhciBvcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcclxuICAgICAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIFxyXG4gICAgICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvckVhY2goY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pIHtcclxuICAgICAgICAgICAgdGhpcy5oZWFwLmZvckVhY2goY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IC8vIGVuZCBvZiBwcmlvcml0eSBxdWV1ZVxyXG5cclxuXHJcblxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBTZXQ8VD57XHJcbiAgICAgICAgcHJpdmF0ZSBkaWN0aW9uYXJ5OiBEaWN0aW9uYXJ5PFQsIGFueT47XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgc2V0LlxyXG4gICAgICAgICAqIEBjbGFzcyA8cD5BIHNldCBpcyBhIGRhdGEgc3RydWN0dXJlIHRoYXQgY29udGFpbnMgbm8gZHVwbGljYXRlIGl0ZW1zLjwvcD5cclxuICAgICAgICAgKiA8cD5JZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gXHJcbiAgICAgICAgICogd2hpY2ggY29udmVydHMgZWxlbWVudHMgdG8gc3RyaW5ncyBtdXN0IGJlIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJpbmdGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXHJcbiAgICAgICAgICogdG8gY29udmVydCBlbGVtZW50cyB0byBzdHJpbmdzLiBJZiB0aGUgZWxlbWVudHMgYXJlbid0IHN0cmluZ3Mgb3IgaWYgdG9TdHJpbmcoKVxyXG4gICAgICAgICAqIGlzIG5vdCBhcHByb3ByaWF0ZSwgYSBjdXN0b20gZnVuY3Rpb24gd2hpY2ggcmVjZWl2ZXMgYSBvbmplY3QgYW5kIHJldHVybnMgYVxyXG4gICAgICAgICAqIHVuaXF1ZSBzdHJpbmcgbXVzdCBiZSBwcm92aWRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0b1N0cmluZ0Z1bmN0aW9uPzogKGl0ZW06IFQpID0+IHN0cmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBuZXcgRGljdGlvbmFyeTxULCBhbnk+KHRvU3RyaW5nRnVuY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBzZXQgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCxcclxuICAgICAgICAgKiBmYWxzZSBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnMoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmNvbnRhaW5zS2V5KGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgdG8gdGhpcyBzZXQgaWYgaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBpbnNlcnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBkaWQgbm90IGFscmVhZHkgY29udGFpbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbnMoZWxlbWVudCkgfHwgY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5zZXRWYWx1ZShlbGVtZW50LCBlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtcyBhbiBpbnRlcnNlY2lvbiBiZXR3ZWVuIHRoaXMgYW4gYW5vdGhlciBzZXQuXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IHRoaXMgc2V0IGFuZCB0aGUgZ2l2ZW4gc2V0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW50ZXJzZWN0aW9uKG90aGVyU2V0OiBTZXQ8VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIHNldCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFvdGhlclNldC5jb250YWlucyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldC5yZW1vdmUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtcyBhIHVuaW9uIGJldHdlZW4gdGhpcyBhbiBhbm90aGVyIHNldC5cclxuICAgICAgICAgKiBBZGRzIGFsbCB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gc2V0IHRvIHRoaXMgc2V0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdW5pb24ob3RoZXJTZXQ6IFNldDxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgc2V0ID0gdGhpcztcclxuICAgICAgICAgICAgb3RoZXJTZXQuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICAgICAgc2V0LmFkZChlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1zIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYW4gYW5vdGhlciBzZXQuXHJcbiAgICAgICAgICogUmVtb3ZlcyBmcm9tIHRoaXMgc2V0IGFsbCB0aGUgdmFsdWVzIHRoYXQgYXJlIHByZXNlbnQgaW4gdGhlIGdpdmVuIHNldC5cclxuICAgICAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRpZmZlcmVuY2Uob3RoZXJTZXQ6IFNldDxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgc2V0ID0gdGhpcztcclxuICAgICAgICAgICAgb3RoZXJTZXQuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICAgICAgc2V0LnJlbW92ZShlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBzZXQgY29udGFpbnMgYWxsIHRoZSBlbGVtZW50cyBpbiB0aGlzIHNldC5cclxuICAgICAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgaXMgYSBzdWJzZXQgb2YgdGhlIGdpdmVuIHNldC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc1N1YnNldE9mKG90aGVyU2V0OiBTZXQ8VD4pOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNpemUoKSA+IG90aGVyU2V0LnNpemUoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgaXNTdWIgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghb3RoZXJTZXQuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc1N1YiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaXNTdWI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBmcm9tIHRoaXMgc2V0IGlmIGl0IGlzIHByZXNlbnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBjb250YWluZWQgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnJlbW92ZShlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IFxyXG4gICAgICAgICAqIHByZXNlbnQgaW4gdGhpcyBzZXQuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXHJcbiAgICAgICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudHM6IHRoZSBlbGVtZW50LiBUbyBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHYpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0IGluIGFyYml0cmFyeSBvcmRlci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvQXJyYXkoKTogVFtdIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpY3Rpb25hcnkuaXNFbXB0eSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHNldC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpY3Rpb25hcnkuc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBzZXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAqIFByb3ZpZGVzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGZvciBkaXNwbGF5XHJcbiAgICAgICAgKi9cclxuICAgICAgICB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlzLnRvU3RyaW5nKHRoaXMudG9BcnJheSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9Ly8gZW5kIG9mIFNldFxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCYWc8VD57XHJcblxyXG4gICAgICAgIHByaXZhdGUgdG9TdHJGOiAoaXRlbTogVCkgPT4gc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgZGljdGlvbmFyeTogRGljdGlvbmFyeTxULCBhbnk+O1xyXG4gICAgICAgIHByaXZhdGUgbkVsZW1lbnRzOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgYmFnLlxyXG4gICAgICAgICAqIEBjbGFzcyA8cD5BIGJhZyBpcyBhIHNwZWNpYWwga2luZCBvZiBzZXQgaW4gd2hpY2ggbWVtYmVycyBhcmUgXHJcbiAgICAgICAgICogYWxsb3dlZCB0byBhcHBlYXIgbW9yZSB0aGFuIG9uY2UuPC9wPlxyXG4gICAgICAgICAqIDxwPklmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBmdW5jdGlvbiBcclxuICAgICAgICAgKiB3aGljaCBjb252ZXJ0cyBlbGVtZW50cyB0byB1bmlxdWUgc3RyaW5ncyBtdXN0IGJlIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XHJcbiAgICAgICAgICogIHJldHVybiBwZXQubmFtZTtcclxuICAgICAgICAgKiB9XHJcbiAgICAgICAgICogPC9wcmU+XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXHJcbiAgICAgICAgICogdG8gY29udmVydCBlbGVtZW50cyB0byBzdHJpbmdzLiBJZiB0aGUgZWxlbWVudHMgYXJlbid0IHN0cmluZ3Mgb3IgaWYgdG9TdHJpbmcoKVxyXG4gICAgICAgICAqIGlzIG5vdCBhcHByb3ByaWF0ZSwgYSBjdXN0b20gZnVuY3Rpb24gd2hpY2ggcmVjZWl2ZXMgYW4gb2JqZWN0IGFuZCByZXR1cm5zIGFcclxuICAgICAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IodG9TdHJGdW5jdGlvbj86IChpdGVtOiBUKSA9PiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy50b1N0ckYgPSB0b1N0ckZ1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRUb1N0cmluZztcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5ID0gbmV3IERpY3Rpb25hcnk8VCwgYW55Pih0aGlzLnRvU3RyRik7XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEFkZHMgbkNvcGllcyBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdCB0byB0aGlzIGJhZy5cclxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gYWRkLlxyXG4gICAgICAgICogQHBhcmFtIHtudW1iZXI9fSBuQ29waWVzIHRoZSBudW1iZXIgb2YgY29waWVzIHRvIGFkZCwgaWYgdGhpcyBhcmd1bWVudCBpc1xyXG4gICAgICAgICogdW5kZWZpbmVkIDEgY29weSBpcyBhZGRlZC5cclxuICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgdW5sZXNzIGVsZW1lbnQgaXMgdW5kZWZpbmVkLlxyXG4gICAgICAgICovXHJcbiAgICAgICAgYWRkKGVsZW1lbnQ6IFQsIG5Db3BpZXM6IG51bWJlcj0gMSk6IGJvb2xlYW4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGVsZW1lbnQpIHx8IG5Db3BpZXMgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBub2RlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvcGllczogbkNvcGllc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5zZXRWYWx1ZShlbGVtZW50LCBub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5nZXRWYWx1ZShlbGVtZW50KS5jb3BpZXMgKz0gbkNvcGllcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cyArPSBuQ29waWVzO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQ291bnRzIHRoZSBudW1iZXIgb2YgY29waWVzIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGluIHRoaXMgYmFnLlxyXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIG9iamVjdCB0byBzZWFyY2ggZm9yLi5cclxuICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBjb3BpZXMgb2YgdGhlIG9iamVjdCwgMCBpZiBub3QgZm91bmRcclxuICAgICAgICAqL1xyXG4gICAgICAgIGNvdW50KGVsZW1lbnQ6IFQpOiBudW1iZXIge1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpY3Rpb25hcnkuZ2V0VmFsdWUoZWxlbWVudCkuY29waWVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBiYWcgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCxcclxuICAgICAgICAgKiBmYWxzZSBvdGhlcndpc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29udGFpbnMoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmNvbnRhaW5zS2V5KGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBSZW1vdmVzIG5Db3BpZXMgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QgdG8gdGhpcyBiYWcuXHJcbiAgICAgICAgKiBJZiB0aGUgbnVtYmVyIG9mIGNvcGllcyB0byByZW1vdmUgaXMgZ3JlYXRlciB0aGFuIHRoZSBhY3R1YWwgbnVtYmVyIFxyXG4gICAgICAgICogb2YgY29waWVzIGluIHRoZSBCYWcsIGFsbCBjb3BpZXMgYXJlIHJlbW92ZWQuIFxyXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgZWxlbWVudCB0byByZW1vdmUuXHJcbiAgICAgICAgKiBAcGFyYW0ge251bWJlcj19IG5Db3BpZXMgdGhlIG51bWJlciBvZiBjb3BpZXMgdG8gcmVtb3ZlLCBpZiB0aGlzIGFyZ3VtZW50IGlzXHJcbiAgICAgICAgKiB1bmRlZmluZWQgMSBjb3B5IGlzIHJlbW92ZWQuXHJcbiAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGF0IGxlYXN0IDEgZWxlbWVudCB3YXMgcmVtb3ZlZC5cclxuICAgICAgICAqL1xyXG4gICAgICAgIHJlbW92ZShlbGVtZW50OiBULCBuQ29waWVzOiBudW1iZXIgPSAxKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbnMuaXNVbmRlZmluZWQoZWxlbWVudCkgfHwgbkNvcGllcyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmRpY3Rpb25hcnkuZ2V0VmFsdWUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobkNvcGllcyA+IG5vZGUuY29waWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgLT0gbm9kZS5jb3BpZXM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzIC09IG5Db3BpZXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlLmNvcGllcyAtPSBuQ29waWVzO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY29waWVzIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkucmVtb3ZlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgYmlnIGluIGFyYml0cmFyeSBvcmRlciwgXHJcbiAgICAgICAgICogaW5jbHVkaW5nIG11bHRpcGxlIGNvcGllcy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgYmFnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvQXJyYXkoKTogVFtdIHtcclxuICAgICAgICAgICAgdmFyIGE6QXJyYXk8VD4gPSBbXTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcclxuICAgICAgICAgICAgdmFyIHZsID0gdmFsdWVzLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2bDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHZhbHVlc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gbm9kZS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBjb3BpZXMgPSBub2RlLmNvcGllcztcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29waWVzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgc2V0IG9mIHVuaXF1ZSBlbGVtZW50cyBpbiB0aGlzIGJhZy4gXHJcbiAgICAgICAgICogQHJldHVybiB7Y29sbGVjdGlvbnMuU2V0PFQ+fSBhIHNldCBvZiB1bmlxdWUgZWxlbWVudHMgaW4gdGhpcyBiYWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdG9TZXQoKTogU2V0PFQ+IHtcclxuICAgICAgICAgICAgdmFyIHRvcmV0ID0gbmV3IFNldDxUPih0aGlzLnRvU3RyRik7XHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcclxuICAgICAgICAgICAgdmFyIGwgPSBlbGVtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBlbGVtZW50c1tpXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRvcmV0LmFkZCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRvcmV0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBcclxuICAgICAgICAgKiBwcmVzZW50IGluIHRoaXMgYmFnLCBpbmNsdWRpbmcgbXVsdGlwbGUgY29waWVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50LiBUbyBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdi52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBjb3BpZXMgPSB2LmNvcGllcztcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29waWVzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBiYWcuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgYmFnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNpemUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBiYWcgY29udGFpbnMgbm8gZWxlbWVudHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzID09PSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBiYWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0vLyBFbmQgb2YgYmFnIFxyXG5cclxuXHJcbiAgICAvLyBJbnRlcm5hbCBpbnRlcmZhY2UgZm9yIEJTVCBcclxuICAgIGludGVyZmFjZSBCU1RyZWVOb2RlPFQ+e1xyXG4gICAgICAgIGVsZW1lbnQ6IFQ7XHJcbiAgICAgICAgbGVmdENoOiBCU1RyZWVOb2RlPFQ+O1xyXG4gICAgICAgIHJpZ2h0Q2g6IEJTVHJlZU5vZGU8VD47XHJcbiAgICAgICAgcGFyZW50OiBCU1RyZWVOb2RlPFQ+O1xyXG4gICAgfVxyXG4gICAgZXhwb3J0IGNsYXNzIEJTVHJlZTxUPiB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgcm9vdDogQlNUcmVlTm9kZTxUPjtcclxuICAgICAgICBwcml2YXRlIGNvbXBhcmU6IElDb21wYXJlRnVuY3Rpb248VD47XHJcbiAgICAgICAgcHJpdmF0ZSBuRWxlbWVudHM6IG51bWJlcjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IGJpbmFyeSBzZWFyY2ggdHJlZS5cclxuICAgICAgICAgKiBAY2xhc3MgPHA+QSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBiaW5hcnkgdHJlZSBpbiB3aGljaCBlYWNoIFxyXG4gICAgICAgICAqIGludGVybmFsIG5vZGUgc3RvcmVzIGFuIGVsZW1lbnQgc3VjaCB0aGF0IHRoZSBlbGVtZW50cyBzdG9yZWQgaW4gdGhlIFxyXG4gICAgICAgICAqIGxlZnQgc3VidHJlZSBhcmUgbGVzcyB0aGFuIGl0IGFuZCB0aGUgZWxlbWVudHMgXHJcbiAgICAgICAgICogc3RvcmVkIGluIHRoZSByaWdodCBzdWJ0cmVlIGFyZSBncmVhdGVyLjwvcD5cclxuICAgICAgICAgKiA8cD5Gb3JtYWxseSwgYSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBub2RlLWJhc2VkIGJpbmFyeSB0cmVlIGRhdGEgc3RydWN0dXJlIHdoaWNoIFxyXG4gICAgICAgICAqIGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6PC9wPlxyXG4gICAgICAgICAqIDx1bD5cclxuICAgICAgICAgKiA8bGk+VGhlIGxlZnQgc3VidHJlZSBvZiBhIG5vZGUgY29udGFpbnMgb25seSBub2RlcyB3aXRoIGVsZW1lbnRzIGxlc3MgXHJcbiAgICAgICAgICogdGhhbiB0aGUgbm9kZSdzIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgICAqIDxsaT5UaGUgcmlnaHQgc3VidHJlZSBvZiBhIG5vZGUgY29udGFpbnMgb25seSBub2RlcyB3aXRoIGVsZW1lbnRzIGdyZWF0ZXIgXHJcbiAgICAgICAgICogdGhhbiB0aGUgbm9kZSdzIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgICAqIDxsaT5Cb3RoIHRoZSBsZWZ0IGFuZCByaWdodCBzdWJ0cmVlcyBtdXN0IGFsc28gYmUgYmluYXJ5IHNlYXJjaCB0cmVlcy48L2xpPlxyXG4gICAgICAgICAqIDwvdWw+XHJcbiAgICAgICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdCBcclxuICAgICAgICAgKiBiZSBwcm92aWRlZCBhdCBjb25zdHJ1Y3Rpb24gdGltZSwgb3RoZXJ3aXNlIHRoZSA8PSwgPT09IGFuZCA+PSBvcGVyYXRvcnMgYXJlIFxyXG4gICAgICAgICAqIHVzZWQgdG8gY29tcGFyZSBlbGVtZW50cy4gRXhhbXBsZTo8L3A+XHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcclxuICAgICAgICAgKiAgaWYgKGEgaXMgbGVzcyB0aGFuIGIgYnkgc29tZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAqICB9IGlmIChhIGlzIGdyZWF0ZXIgdGhhbiBiIGJ5IHRoZSBvcmRlcmluZyBjcml0ZXJpb24pIHtcclxuICAgICAgICAgKiAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICogIH0gXHJcbiAgICAgICAgICogIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXHJcbiAgICAgICAgICogIHJldHVybiAwO1xyXG4gICAgICAgICAqIH1cclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcj19IGNvbXBhcmVGdW5jdGlvbiBvcHRpb25hbFxyXG4gICAgICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSB0d28gZWxlbWVudHMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcclxuICAgICAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXHJcbiAgICAgICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoY29tcGFyZUZ1bmN0aW9uPzogSUNvbXBhcmVGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBhcmUgPSBjb21wYXJlRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdENvbXBhcmU7XHJcbiAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoaXMgdHJlZSBpZiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBkaWQgbm90IGFscmVhZHkgY29udGFpbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYWRkKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25zLmlzVW5kZWZpbmVkKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluc2VydE5vZGUodGhpcy5jcmVhdGVOb2RlKGVsZW1lbnQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgdHJlZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHMgPT09IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyB0cmVlLlxyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHRyZWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxyXG4gICAgICAgICAqIGZhbHNlIG90aGVyd2lzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWlucyhlbGVtZW50OiBUKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KSAhPT0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGZyb20gdGhpcyB0cmVlIGlmIGl0IGlzIHByZXNlbnQuXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbmVkIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmUoZWxlbWVudDogVCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuc2VhcmNoTm9kZSh0aGlzLnJvb3QsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTm9kZShub2RlKTtcclxuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIFxyXG4gICAgICAgICAqIGluLW9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lIFxyXG4gICAgICAgICAqIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlub3JkZXJUcmF2ZXJzYWwoY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5pbm9yZGVyVHJhdmVyc2FsQXV4KHRoaXMucm9vdCwgY2FsbGJhY2ssIHtcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBwcmUtb3JkZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzIGludm9rZWQgd2l0aCBvbmUgXHJcbiAgICAgICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJlb3JkZXJUcmF2ZXJzYWwoY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVvcmRlclRyYXZlcnNhbEF1eCh0aGlzLnJvb3QsIGNhbGxiYWNrLCB7XHJcbiAgICAgICAgICAgICAgICBzdG9wOiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW4gcG9zdC1vcmRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXMgaW52b2tlZCB3aXRoIG9uZSBcclxuICAgICAgICAgKiBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwb3N0b3JkZXJUcmF2ZXJzYWwoY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wb3N0b3JkZXJUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjaywge1xyXG4gICAgICAgICAgICAgICAgc3RvcDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIFxyXG4gICAgICAgICAqIGxldmVsLW9yZGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lIFxyXG4gICAgICAgICAqIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldmVsVHJhdmVyc2FsKGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubGV2ZWxUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlLlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHRyZWUgaXNcclxuICAgICAgICAgKiBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBtaW5pbXVtKCk6IFQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWluaW11bUF1eCh0aGlzLnJvb3QpLmVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlLlxyXG4gICAgICAgICAqIEByZXR1cm4geyp9IHRoZSBtYXhpbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHRyZWUgaXNcclxuICAgICAgICAgKiBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBtYXhpbXVtKCk6IFQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4aW11bUF1eCh0aGlzLnJvb3QpLmVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIGlub3JkZXIuXHJcbiAgICAgICAgICogRXF1aXZhbGVudCB0byBpbm9yZGVyVHJhdmVyc2FsLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xyXG4gICAgICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gXHJcbiAgICAgICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yRWFjaChjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWwoY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyB0cmVlIGluIGluLW9yZGVyLlxyXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyB0cmVlIGluIGluLW9yZGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvQXJyYXkoKTogVFtdIHtcclxuICAgICAgICAgICAgdmFyIGFycmF5OiBBcnJheTxUPiA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmlub3JkZXJUcmF2ZXJzYWwoZnVuY3Rpb24gKGVsZW1lbnQ6IFQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGlzIHRyZWUuXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgaGVpZ2h0IG9mIHRoaXMgdHJlZSBvciAtMSBpZiBpcyBlbXB0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0QXV4KHRoaXMucm9vdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHNlYXJjaE5vZGUobm9kZTogQlNUcmVlTm9kZTxUPiwgZWxlbWVudDogVCk6IEJTVHJlZU5vZGU8VD4ge1xyXG4gICAgICAgICAgICB2YXIgY21wOm51bWJlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHdoaWxlIChub2RlICE9PSBudWxsICYmIGNtcCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY21wID0gdGhpcy5jb21wYXJlKGVsZW1lbnQsIG5vZGUuZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLmxlZnRDaDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnJpZ2h0Q2g7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHRyYW5zcGxhbnQobjE6IEJTVHJlZU5vZGU8VD4sIG4yOiBCU1RyZWVOb2RlPFQ+KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChuMS5wYXJlbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdCA9IG4yO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG4xID09PSBuMS5wYXJlbnQubGVmdENoKSB7XHJcbiAgICAgICAgICAgICAgICBuMS5wYXJlbnQubGVmdENoID0gbjI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuMS5wYXJlbnQucmlnaHRDaCA9IG4yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuMiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbjIucGFyZW50ID0gbjEucGFyZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHJlbW92ZU5vZGUobm9kZTogQlNUcmVlTm9kZTxUPik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5sZWZ0Q2ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwbGFudChub2RlLCBub2RlLnJpZ2h0Q2gpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucmlnaHRDaCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KG5vZGUsIG5vZGUubGVmdENoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy5taW5pbXVtQXV4KG5vZGUucmlnaHRDaCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoeS5wYXJlbnQgIT09IG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcGxhbnQoeSwgeS5yaWdodENoKTtcclxuICAgICAgICAgICAgICAgICAgICB5LnJpZ2h0Q2ggPSBub2RlLnJpZ2h0Q2g7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5yaWdodENoLnBhcmVudCA9IHk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcGxhbnQobm9kZSwgeSk7XHJcbiAgICAgICAgICAgICAgICB5LmxlZnRDaCA9IG5vZGUubGVmdENoO1xyXG4gICAgICAgICAgICAgICAgeS5sZWZ0Q2gucGFyZW50ID0geTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbm9yZGVyVHJhdmVyc2FsQXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4sIGNhbGxiYWNrOiBJTG9vcEZ1bmN0aW9uPFQ+LCBzaWduYWw6IHsgc3RvcDogYm9vbGVhbjsgfSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eChub2RlLmxlZnRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XHJcbiAgICAgICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eChub2RlLnJpZ2h0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBsZXZlbFRyYXZlcnNhbEF1eChub2RlOiBCU1RyZWVOb2RlPFQ+LCBjYWxsYmFjazogSUxvb3BGdW5jdGlvbjxUPikge1xyXG4gICAgICAgICAgICB2YXIgcXVldWUgPSBuZXcgUXVldWU8QlNUcmVlTm9kZTxUPj4oKTtcclxuICAgICAgICAgICAgaWYgKG5vZGUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHF1ZXVlLmVucXVldWUobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKCFxdWV1ZS5pc0VtcHR5KCkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBxdWV1ZS5kZXF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5sZWZ0Q2ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5lbnF1ZXVlKG5vZGUubGVmdENoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnJpZ2h0Q2ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5lbnF1ZXVlKG5vZGUucmlnaHRDaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgcHJlb3JkZXJUcmF2ZXJzYWxBdXgobm9kZTogQlNUcmVlTm9kZTxUPiwgY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4sIHNpZ25hbDogeyBzdG9wOiBib29sZWFuOyB9KSB7XHJcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsIHx8IHNpZ25hbC5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2lnbmFsLnN0b3AgPSBjYWxsYmFjayhub2RlLmVsZW1lbnQpID09PSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHNpZ25hbC5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wcmVvcmRlclRyYXZlcnNhbEF1eChub2RlLmxlZnRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XHJcbiAgICAgICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5yaWdodENoLCBjYWxsYmFjaywgc2lnbmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBwb3N0b3JkZXJUcmF2ZXJzYWxBdXgobm9kZTogQlNUcmVlTm9kZTxUPiwgY2FsbGJhY2s6IElMb29wRnVuY3Rpb248VD4sIHNpZ25hbDogeyBzdG9wOiBib29sZWFuOyB9KSB7XHJcbiAgICAgICAgICAgIGlmIChub2RlID09PSBudWxsIHx8IHNpZ25hbC5zdG9wKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wb3N0b3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvc3RvcmRlclRyYXZlcnNhbEF1eChub2RlLnJpZ2h0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xyXG4gICAgICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaWduYWwuc3RvcCA9IGNhbGxiYWNrKG5vZGUuZWxlbWVudCkgPT09IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBtaW5pbXVtQXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4pOiBCU1RyZWVOb2RlPFQ+IHtcclxuICAgICAgICAgICAgd2hpbGUgKG5vZGUubGVmdENoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5sZWZ0Q2g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIG1heGltdW1BdXgobm9kZTogQlNUcmVlTm9kZTxUPik6IEJTVHJlZU5vZGU8VD4ge1xyXG4gICAgICAgICAgICB3aGlsZSAobm9kZS5yaWdodENoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5yaWdodENoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaGVpZ2h0QXV4KG5vZGU6IEJTVHJlZU5vZGU8VD4pOiBudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh0aGlzLmhlaWdodEF1eChub2RlLmxlZnRDaCksIHRoaXMuaGVpZ2h0QXV4KG5vZGUucmlnaHRDaCkpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnNlcnROb2RlKG5vZGU6IEJTVHJlZU5vZGU8VD4pOiBCU1RyZWVOb2RlPFQ+IHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYXJlbnQ6IGFueSA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMucm9vdDtcclxuICAgICAgICAgICAgdmFyIGNtcDpudW1iZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB3aGlsZSAocG9zaXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNtcCA9IHRoaXMuY29tcGFyZShub2RlLmVsZW1lbnQsIHBvc2l0aW9uLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXAgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbi5sZWZ0Q2g7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24ucmlnaHRDaDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJlZSBpcyBlbXB0eVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290ID0gbm9kZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbXBhcmUobm9kZS5lbGVtZW50LCBwYXJlbnQuZWxlbWVudCkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQubGVmdENoID0gbm9kZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5yaWdodENoID0gbm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgY3JlYXRlTm9kZShlbGVtZW50OiBUKTogQlNUcmVlTm9kZTxUPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgbGVmdENoOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRDaDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IC8vIGVuZCBvZiBCU1RyZWVcclxuXHJcblxyXG59Ly8gRW5kIG9mIG1vZHVsZSAiXX0=