var opTable = new HashTable({
	add: {
		opCode: '18'
	},
	and: {
		opCode: '40'
	},
	comp: {
		opCode: '28'
	},
	div: {
		opCode: '24'
	},
	j: {
		opCode: '3C'
	},
	jeq: {
		opCode: '30'
	},
	jgt: {
		opCode: '34'
	},
	jlt: {
		opCode: '38'
	},
	jsub: {
		opCode: '48'
	},
	lda: {
		opCode: '00'
	},
	ldch: {
		opCode: '50'
	},
	ldl: {
		opCode: '08'
	},
	ldx: {
		opCode: '04'
	},
	mul: {
		opCode: '20'
	},
	or: {
		opCode: '44'
	},
	rd: {
		opCode: 'D8'
	},
	rsub: {
		opCode: '4C'
	},
	sta: {
		opCode: '0C'
	},
	stch: {
		opCode: '54'
	},
	stl: {
		opCode: '14'
	},
	stx: {
		opCode: '10'
	},
	sub: {
		opCode: '1C'
	},
	td: {
		opCode: 'E0'
	},
	tix: {
		opCode: '2C'
	},
	wd: {
		opCode: 'DC'
	}
});



var dirTable = new HashTable({
	start: {},
	end: {},
	resw: {},
	resb: {},
	byte: {},
	word: {}
});

var symTable = new HashTable({});

var locCtr = 0,
	progStart = 0,
	progLength = 0,
	programName = "prog";