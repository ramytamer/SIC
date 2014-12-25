function HashTable(objs) {
	// Constructing Stuff
	this.length = 0;
	this.items = {};
	for (var i in objs) {
		if (objs.hasOwnProperty(i)) {
			this.items[i] = objs[i];
			this.length++;
		}
	}

	this.setItem = function(key, value) {
		var prev;
		if (this.hasItem(key)) {
			prev = this.items[key];
		} else {
			this.length++;
		}
		this.items[key] = value;
		return prev;
	};

	this.getItem = function(key) {
		return this.hasItem(key) ? this.items[key] : undefined;
	};

	this.hasItem = function(key) {
		return this.items.hasOwnProperty(key);
	};

	this.removeItem = function(key) {
		if (this.hasItem(key)) {
			var prev = this.getItem(key);
			this.length--;
			delete this.items[key];
			return prev;
		}
		return undefined;
	};

	this.keys = function() {
		var keys = [];
		for (var k in this.items) {
			if (this.hasItem(k)) {
				keys.push(k);
			}
		}
		return keys;
	};

	this.values = function() {
		var values = [];
		for (var k in this.items) {
			if (this.hasItem(k)) {
				values.push(this.getItem(k));
			}
		}
	};

	this.each = function(callback) {
		for (var k in this.items) {
			if (this.hasItem(k)) {
				callback(k, this.getItem(k));
			}
		}
	};

	this.clear = function() {
		this.items = {};
		this.length = 0;
	};

}