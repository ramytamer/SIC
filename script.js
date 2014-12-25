$(document).ready(function() {

	$('#runCode').click(function() {
		// Reseting...
		symTable = new HashTable({});
		var interfile = [];
		var lisFile = [];
		locCtr = progStart = progLength = 0;
		programName = "prog";
		var locCtrArr = [];
		$('#interfile, #lisfile, #objfile').html(' ');
		console.clear();

		var SOP = false,
			EOP = false;
		var code = editor.getValue(); // get the current code value.
		code = code.split(/\r?\n/g); // split by lines.
		for (var i = 0; i < code.length; i++) { // loop to each line of code.
			// Get line number
			var lineNumber = i + 1;

			// Get array of line.
			var line = code[i].match(/(?:[^\s']+|'[^']*')+/g);
			// If empty line or comment.
			if (!line || line[0] === '.') {
				continue;
			}

			// If the program ended ignore any other code.
			if (EOP) {
				continue;
			}


			// If the program didn't started yet.
			if (!SOP) {
				if (line[0].toLowerCase() == "start") {
					// alert(parseInt(line[1], 16));
					if (!isHex(line[1])) {
						interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : operand is not positive integer.</span></u><br> ");
						locCtr = progStart = 0;
					} else {
						locCtr = progStart = parseInt(line[1], 16);
						SOP = true;
					}
				} else if (line[1] && line[1].toLowerCase() == "start") {
					// alert(parseInt(line[2], 16));
					if (line[2] && !isHex(line[2])) {
						interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : operand is not integer.</span></u><br> ");
						locCtr = progStart = 0;
					} else {
						locCtr = progStart = parseInt(line[2], 16);
						programName = line[0];
						SOP = true;
					}
				}
				// interfile.push(locCtr.toString(16).toUpperCase() + " " + line.join('    ') + "<br>" );
				// continue;
			}

			interfile.push("<b>" + locCtr.toString(16).toUpperCase() + "</b>    " + code[i] + "<br>");
			locCtrArr[i] = locCtr;

			/*
			Assume there is always less than 3 parts.
			If 3 parts: LABEL	MNEMONIC	OPERAND
			If 2 parts:			MNEMONIC	OPERAND
			If 1 part:			MNEMONIC
			 */
			if (line.length >= 3) {

				// Line[0] ---> LABEL
				// search for symbol in symtable.
				if (symTable.hasItem(line[0])) {
					// #Error : label already exists.
					console.warn("#Error @" + lineNumber + " : label already exists.");
					interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : label already exists.</span></u><br> ");
				} else {
					// Brand new label.
					symTable.setItem(line[0], locCtr);
				}


				// Line[1] ---> MNEMONIC
				if (opTable.hasItem(line[1].toLowerCase())) { // search for it in opTable.
					// Increment the locCtr.
					locCtr += 3;
				} else if (dirTable.hasItem(line[1].toLowerCase())) { // search for it in dirTable.
					switch (line[1].toLowerCase()) {
						case 'word':
							// Add 3 bytes in case of word.
							if (!/^-\d+$|^\d+$/g.test(line[2])) {
								interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid decimal.</span></u><br> ");
							}
							locCtr += 3;
							break;
						case 'byte':
							// in case of byte, select what is between quotes.
							var wrd = line[2].match(/('[^']+'|-)/g);
							if (wrd && line[2][0].toLowerCase() === 'c') {
								// if c, get length & add it to the locCtr.
								locCtr += wrd[0].length - 2;
							} else if (wrd && line[2][0].toLowerCase() === 'x') {
								// if x, get length divided by 2 (every 2 hex 1 byte) & add it to the locCtr.
								var y = wrd[0].slice(1, wrd[0].length - 1);
								if (isHex(y))
									locCtr += (wrd[0].length - 2) / 2;
								else {
									interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid hex in byte.</span></u><br> ");
								}
							}
							break;
						case 'resb':
							if (!/^\d+$/g.test(line[2]) || parseInt(line[2], 10) < 0) {
								interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid number.</span></u><br> ");
								locCtr += 0;
							} else {
								locCtr += parseInt(line[2], 10);
							}
							break;
						case 'resw':
							if (!/^\d+$/g.test(line[2]) || parseInt(line[2], 10) < 0) {
								interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid number.</span></u><br> ");
								locCtr += 0;
							} else {

								locCtr += 3 * parseInt(line[2], 10);
							}
							break;
						case 'end':
							if (symTable.hasItem(line[2]) || !line[2].length) {
								EOP = true;
							} else if (!symTable.hasItem(line[2])) {
								interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid Symbol.</span></u><br> ");
							}
					}
				} else {
					// #Error : not valid MNEMONIC.
					console.warn("#Error @" + lineNumber + " : not valid MNEMONIC.");
					interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid MNEMONIC.<br>Or Invalid instruction format.<br>Tip: Make comment in separate line starting with (.) </span></u><br> ");
				}
			} else if (line.length == 2) {
				// Line[0] ---> MNEMONIC
				if (opTable.hasItem(line[0].toLowerCase())) {
					locCtr += 3;
				} else if (dirTable.hasItem(line[0].toLowerCase())) {
					if (line[0].toLowerCase() == "end") {
						if (line[1].length && !symTable.hasItem(line[1])) {
							interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid Symbol.</span></u><br> ");
						} else {
							EOP = true;
							locCtr -= 3;
						}
					}
					locCtr += 3;
				} else {
					// #Error : not valid MNEMONIC.
					console.warn("#Error @" + lineNumber + " : not valid MNEMONIC.");
					interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid MNEMONIC.</span></u><br> ");
				}
			} else if (line.length == 1) {
				// Line[0] ---> MNEMONIC
				if (opTable.hasItem(line[0].toLowerCase())) {
					locCtr += 3;
				} else if (dirTable.hasItem(line[0].toLowerCase())) {
					if (line[0].toLowerCase() == "end") {
						EOP = true;
					}
				} else {
					// #Error : not valid MNEMONIC.
					console.warn("#Error @" + lineNumber + " : not valid MNEMONIC.");
					interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid MNEMONIC.</span></u><br> ");
				}
			} else {
				// #Error : more than 3 parts.
				console.warn("#Error @" + lineNumber + " : more than 3 parts.");
				interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " Invalid instruction format.<br>Tip: Make comment in separate line starting with (.) </span></u><br> ");
			}

			// console.info("line: " + lineNumber);
			// console.log(symTable.length);

		}

		// Print interfile array.
		var interfilelength = interfile.length

		for (k = 0; k < interfilelength; k++) {
			$('#interfile').append(interfile.shift().replace(/\s/g, "&nbsp;"));
		}
		/*$.each(interfile, function(index, val) {
			$('#interfile').append(val.replace(/\s/g, "&nbsp;"));
		});*/

		// symTable.each(function(i, v) { console.info("i: " + i + ", " + v.toString(16)); });


		/////////////////////
		// END OF PASS 1 //
		/////////////////////


		//////////////////////////////////////////////////////////////////////////
		// ******************************************************************** //
		//////////////////////////////////////////////////////////////////////////

		//////////////////////////////////////////////////////////////////////////
		// ================================================================== //
		//////////////////////////////////////////////////////////////////////////

		//////////////////////////////////////////////////////////////////////////
		// ******************************************************************** //
		//////////////////////////////////////////////////////////////////////////


		///////////////////////
		// START OF PASS 2 //
		///////////////////////

		var OBJFILE = ""; // Reset the OBJFILE variable.

		// Get the length of the program.
		progLength = locCtr - progStart;
		progLengthX16 = progLength.toString(16).toUpperCase();
		progStartX16 = progStart.toString(16).toUpperCase();
		var endAddress = "";

		//////////////////////////////
		// START OF HEADER RECORD //
		//////////////////////////////

		// Program name and spaces stuff.
		OBJFILE += "H" + programName;
		var spaces = 6 - programName.length;
		if (spaces < 0) {
			// #Error : program name is too long
		} else {
			for (i = 0; i < spaces; i++) {
				OBJFILE += " ";
			}
		}

		// Starting address and stuff.
		progStartX16 = paddZeros(progStartX16, 6);
		if (!progStartX16) {
			// #Error: long program start.
		}

		// Add the edited start program to the OBJFILE.
		OBJFILE += progStartX16;

		// Program Length and stuff.
		progLengthX16 = paddZeros(progLengthX16, 6);
		if (!progLengthX16) {
			// #Error: program length is too long.
		}

		// Add the edited program length to the OBJFILE.
		OBJFILE += progLengthX16;

		// New Line for text record
		OBJFILE += "\n";

		// console.info(OBJFILE);

		////////////////////////////
		// END OF HEADER RECORD //
		////////////////////////////

		/////////////////////////////
		// START OF TEXT RECORDS //
		/////////////////////////////


		var textRecordStarted = false,
			textRecordStartAddr = "",
			textRecordLength = 0,
			textRecordArr = [];
		for (i = 0; i < code.length; i++) {
			// Get line number
			var lnNumber = i + 1;


			// Get array of line.
			var ln = code[i].match(/(?:[^\s']+|'[^']*')+/g);
			// If empty line or comment.
			if (!ln || ln[0] === '.') {
				continue;
			}

			if (ln.length >= 3) {
				// If directive start, ignore get the next line
				if (ln[1].toLowerCase() == "start") {
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					continue;
				}

				if (ln[0].toLowerCase() == "end") {
					// console.info("last");
					// lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					var textRecordLength = 0;
					for (o = 0; o < textRecordArr.length; o++) {
						for (k = 0; k < textRecordArr[o].length; k++) {
							textRecordLength++;
						}
					}
					textRecordLength /= 2;
					textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
					OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
					var txtRArrLength = textRecordArr.length;
					for (j = 0; j < txtRArrLength; j++) {
						var t = textRecordArr.shift();
						// console.info("j: " + j + "," + t);
						OBJFILE += t;
					}
					OBJFILE += "\n";

					endAddress = symTable.getItem(ln[1]);
					break;
				}

				if (ln[1].toLowerCase() == "resw" || ln[1].toLowerCase() == "resb") {
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					if (textRecordStarted) {
						// POP all results and add it to the OBJFILE.
						var textRecordLength = 0;
						for (o = 0; o < textRecordArr.length; o++) {
							for (k = 0; k < textRecordArr[o].length; k++) {
								textRecordLength++;
							}
						}
						textRecordLength /= 2;
						textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
						OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
						var txtRArrLength = textRecordArr.length;
						for (j = 0; j < txtRArrLength; j++) {
							var t = textRecordArr.shift();
							// console.info("j: " + j + "," + t);
							OBJFILE += t;
						}
						OBJFILE += "\n";
						textRecordLength = 0;
						textRecordStarted = false;
						textRecordStartAddr = "";
					}
					continue;
				}


				if (ln[1].toLowerCase() == "word") {
					if (!/^[-+]?\d+$/g.test(ln[2])) {
						lisFile.push("<u><span class='text-danger'> Error @" + lineNumber + ", Not a valid number></span></u><br>");
					}
					var operand = parseInt(ln[2], 10); // 4096
					if (operand < 0) {
						operand = twosComplement(operand * -1);
					}
					var objcode = generateObjCode("00", decimalToHex(operand), false);
					// console.log(objcode);
					if (!textRecordStarted) {
						textRecordStarted = true;
						locationCtr = locCtrArr[i].toString(16).toUpperCase();
						textRecordStartAddr = locationCtr;
						textRecordLength = 1;
						textRecordArr.push(objcode);
						lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
					} else {
						if (textRecordLength != 10) {
							textRecordArr.push(objcode);
							lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
							textRecordLength++;
						} else {
							// POP all results and add it to the OBJFILE.
							var textRecordLength = 0;
							for (o = 0; o < textRecordArr.length; o++) {
								for (k = 0; k < textRecordArr[o].length; k++) {
									textRecordLength++;
								}
							}
							textRecordLength /= 2;
							textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
							OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
							var txtRArrLength = textRecordArr.length;
							for (j = 0; j < txtRArrLength; j++) {
								var t = textRecordArr.shift();
								// console.info("j: " + j + "," + t);
								OBJFILE += t;
							}
							OBJFILE += "\n";
							// console.info("here: \n", OBJFILE);
							textRecordLength = 0;
							textRecordStarted = false;
							i--;
						}
					}
					continue;
				}

				if (ln[1].toLowerCase() == "byte") {
					wrd1 = ln[2].match(/('[^']+'|-)/g);
					wrd = "";
					if(wrd1){
						for (k = 1; k < wrd1[0].length - 1; k++) {
							wrd += wrd1[0][k];
						}
					}
					if (wrd && ln[2][0].toLowerCase() == "c") {
						textRecordArr.push(getAsciiHexOfStr(wrd));
						lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + getAsciiHexOfStr(wrd) + "</i></b>    " + code[i] + "<br>");
						// console.log(getAsciiHexOfStr(wrd));
					} else if (wrd && ln[2][0].toLowerCase() == "x") {
						var y = wrd[0].slice(1, wrd[0].length - 1);
						if (isHex(y)) {
							textRecordArr.push(wrd);
							lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + wrd + "</i></b>    " + code[i] + "<br>");
							// console.log(wrd);
						} else {
							interfile.push("<u><span class='text-danger'> #Error @" + lineNumber + " : not valid hex in byte.</span></u><br> ");
						}

					}
					textRecordLength++;
					continue;
				}


				// if not start (regular instruction)

				// If not started record, begin a new one
				if (!textRecordStarted) {
					textRecordStarted = true;
					locationCtr = locCtrArr[i].toString(16).toUpperCase();
					textRecordStartAddr = locationCtr; // get the location counter value of this line.
					textRecordLength = 1;
					if(!opTable.hasItem(ln[1].toLowerCase())){
							continue;
						}
					oprand = symTable.getItem(ln[2]).toString(16).toUpperCase();
					// console.info(ln[1]);
					opCode = opTable.getItem(ln[1].toLowerCase()).opCode;
					var objcode = generateObjCode(opCode, oprand, isIndexRelative(ln[2]));
					// console.log(objcode);
					textRecordArr.push(objcode);
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
				} else {
					if (textRecordLength != 10) {
						if(!opTable.hasItem(ln[1].toLowerCase())){
							continue;
						}
						opCode = opTable.getItem(ln[1].toLowerCase()).opCode;
						oprand = symTable.getItem(ln[2]).toString(16).toUpperCase();
						var objcode = generateObjCode(opCode, oprand, isIndexRelative(ln[2]));
						// console.log(objcode);
						textRecordArr.push(objcode);
						lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
						textRecordLength++;
					} else {
						// POP all results and add it to the OBJFILE.
						var textRecordLength = 0;
						for (o = 0; o < textRecordArr.length; o++) {
							for (k = 0; k < textRecordArr[o].length; k++) {
								textRecordLength++;
							}
						}
						textRecordLength /= 2;
						textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
						OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
						var txtRArrLength = textRecordArr.length;
						for (j = 0; j < txtRArrLength; j++) {
							var t = textRecordArr.shift();
							// console.info("j: " + j + "," + t);
							OBJFILE += t;
						}
						OBJFILE += "\n";
						// console.info("here: \n", OBJFILE);
						textRecordLength = 0;
						textRecordStarted = false;
						i--;
					}
				}
			} else if (ln.length == 2) {

				// If directive start, ignore get the next line
				if (ln[0].toLowerCase() == "start") {
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					continue;
				}

				if (ln[0].toLowerCase() == "end") {
					// console.info(locCtrArr[i], i);
					// lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					var textRecordLength = 0;
					for (o = 0; o < textRecordArr.length; o++) {
						for (k = 0; k < textRecordArr[o].length; k++) {
							textRecordLength++;
						}
					}
					textRecordLength /= 2;
					textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
					OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
					var txtRArrLength = textRecordArr.length;
					for (j = 0; j < txtRArrLength; j++) {
						var t = textRecordArr.shift();
						// console.info("j: " + j + "," + t);
						OBJFILE += t;
					}
					OBJFILE += "\n";

					endAddress = symTable.getItem(ln[1]);
					break;
				}

				if (ln[0].toLowerCase() == "resw" || ln[0].toLowerCase() == "resb") {
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					if (textRecordStarted) {
						// POP all results and add it to the OBJFILE.
						var textRecordLength = 0;
						for (o = 0; o < textRecordArr.length; o++) {
							for (k = 0; k < textRecordArr[o].length; k++) {
								textRecordLength++;
							}
						}
						textRecordLength /= 2;
						textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
						OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
						var txtRArrLength = textRecordArr.length;
						for (j = 0; j < txtRArrLength; j++) {
							var t = textRecordArr.shift();
							// console.info("j: " + j + "," + t);
							OBJFILE += t;
						}
						OBJFILE += "\n";
						textRecordLength = 0;
						textRecordStarted = false;
						textRecordStartAddr = "";
					}
					continue;
				}


				// if not start (regular instruction)

				// If not started record, begin a new one
				if (!textRecordStarted) {
					textRecordStarted = true;
					locationCtr = locCtrArr[i].toString(16).toUpperCase();
					textRecordStartAddr = locationCtr; // get the location counter value of this line.
					textRecordLength = 1;
					oprand = symTable.getItem(ln[1]).toString(16).toUpperCase();
					opCode = opTable.getItem(ln[0].toLowerCase()).opCode;
					var objcode = generateObjCode(opCode, oprand, isIndexRelative(ln[1]));
					// console.log(objcode);
					textRecordArr.push(objcode);
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
				} else {
					if (textRecordLength != 10) {
						opCode = opTable.getItem(ln[0].toLowerCase()).opCode;
						if (contain(ln[1], ",x")) {
							var o = ln[1].replace(",x", "");
							// console.info("o: " + o);
							// console.info("here: ", o);
							oprand = symTable.getItem(o).toString(16).toUpperCase();
						} else if (contain(ln[1], ",X")) {
							var o = ln[1].replace(",X", "");
							oprand = symTable.getItem(o).toString(16).toUpperCase();
						} else {
							oprand = symTable.getItem(ln[1]).toString(16).toUpperCase();
						}
						// console.info("oprand: " + oprand);
						var objcode = generateObjCode(opCode, oprand, isIndexRelative(ln[1]));
						// console.log(objcode);
						textRecordArr.push(objcode);
						// console.info("locctrarr: ", locCtrArr[i], ", locCtrArrdectohex: ", locCtrArr[i].toString(16));
						lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
						textRecordLength++;
						// console.info("textlength: " + textRecordLength);
					} else {
						// POP all results and add it to the OBJFILE.
						var textRecordLength = 0;
						for (o = 0; o < textRecordArr.length; o++) {
							for (k = 0; k < textRecordArr[o].length; k++) {
								textRecordLength++;
							}
						}
						textRecordLength /= 2;
						textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
						OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
						var txtRArrLength = textRecordArr.length;
						for (j = 0; j < txtRArrLength; j++) {
							var t = textRecordArr.shift();
							// console.info("j: " + j + "," + t);
							OBJFILE += t;
						}
						OBJFILE += "\n";
						// console.info("here: \n", OBJFILE);
						textRecordLength = 0;
						textRecordStarted = false;
						i--;
					}
				}

			} else if (ln.length == 1) {
				if (ln[0].toLowerCase() == "end") {
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>                          " + code[i] + "<br>");
					var textRecordLength = 0;
					for (o = 0; o < textRecordArr.length; o++) {
						for (k = 0; k < textRecordArr[o].length; k++) {
							textRecordLength++;
						}
					}
					textRecordLength /= 2;
					textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
					OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
					var txtRArrLength = textRecordArr.length;
					for (j = 0; j < txtRArrLength; j++) {
						var t = textRecordArr.shift();
						// console.info("j: " + j + "," + t);
						OBJFILE += t;
					}
					OBJFILE += "\n";

					// console.info("progstart: " + progStart);
					endAddress = progStart;
					break;
				}

				// If not started record, begin a new one
				if (!textRecordStarted) {
					if(!opTable.hasItem(ln[0].toLowerCase())){
							continue;
						}
					textRecordStarted = true;
					locationCtr = locCtrArr[i].toString(16).toUpperCase();
					textRecordStartAddr = locationCtr; // get the location counter value of this line.
					textRecordLength = 1;
					opCode = opTable.getItem(ln[0].toLowerCase()).opCode;
					var objcode = generateObjCode(opCode, "0000", false);
					// console.log(objcode);
					textRecordArr.push(objcode);
					lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
				} else {
					if (textRecordLength != 10) {
						if(!opTable.hasItem(ln[0].toLowerCase())){
							continue;
						}
						opCode = opTable.getItem(ln[0].toLowerCase()).opCode;
						var objcode = generateObjCode(opCode, "0000", false);
						// console.log(objcode);
						textRecordArr.push(objcode);
						lisFile.push("<b>" + decimalToHex(locCtrArr[i]) + "</b>    <b><i>" + objcode + "</b></i>    " + code[i] + "<br>");
						textRecordLength++;
					} else {
						// POP all results and add it to the OBJFILE.
						textRecordLength = (textRecordArr.length) * 3;
						textRecordLength = paddZeros(textRecordLength.toString(16).toUpperCase(), 2);
						OBJFILE += "T" + paddZeros(textRecordStartAddr, 6) + textRecordLength;
						var txtRArrLength = textRecordArr.length;
						for (j = 0; j < txtRArrLength; j++) {
							var t = textRecordArr.shift();
							// console.info("j: " + j + "," + t);
							OBJFILE += t;
						}
						OBJFILE += "\n";
						// console.info("here: \n", OBJFILE);
						textRecordLength = 0;
						textRecordStarted = false;
						i--;
					}
				}
			}

		}

		// console.info("\n\nfinal\n", OBJFILE);

		///////////////////////////
		// END OF TEXT RECORDS //
		///////////////////////////

		///////////////////////////
		// START OF END RECORD //
		///////////////////////////

		OBJFILE += "E" + paddZeros(decimalToHex(endAddress), 6);

		/////////////////////////
		// END OF END RECORD //
		/////////////////////////


		// console.info("\n\nFINAL OBJECT CODE:\n\n");
		// console.log("'" + OBJFILE + "'");

		$('#objfile').html(OBJFILE.replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;"));
		$('#objfile').append('<br><br><button class="btn btn-info btn-block" id="select">Select Object Code</button>');


		// Print interfile array.
		$.each(lisFile, function(index, val) {
			$('#lisfile').append(val.replace(/\s/g, "&nbsp;"));
		});

		$('#select').click(function() {
			selecttxt('objfile');
			$(this).html('<i class="fa fa-clipboard"></i> Press Ctrl+c to copy.');
		});

		function selecttxt(element) {
			var doc = document;
			var text = doc.getElementById(element);

			if (doc.body.createTextRange) { // ms
				var range = doc.body.createTextRange();
				range.moveToElementText(text);
				range.select();
			} else if (window.getSelection) { // moz, opera, webkit
				var selection = window.getSelection();
				var range = doc.createRange();
				range.selectNodeContents(text);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		// copyToClipboard

	});

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/monokai");
	editor.commands.addCommand({
		name: 'myCommand',
		bindKey: {
			win: 'Ctrl-Enter',
			mac: 'Command-Enter'
		},
		exec: function(editor) {
			$('#runCode').trigger('click');
		},
	});
});

var isInt = function(n) {
	return Number(n) === n && n % 1 === 0;
};

var paddZeros = function(addr, maxlength) {
	var zeros = "";
	if ((maxlength - addr.length) < 0) {
		return addr;
	} else {
		for (var i = 0; i < (maxlength - addr.length); i++) {
			zeros += "0";
		}
		return zeros + addr;
	}
};


var contain = function(str, needle) {
	return str.indexOf(needle) > -1;
};

var isIndexRelative = function(addr) {
	return contain(addr.toLowerCase(), ",x");
};

var generateObjCode = function(opCode, addr, indexR) {
	var objcode = "";
	if (indexR) {
		var bin = paddZeros(decimalToBin(hexToDecimal(addr[0])), 4);
		bin = bin.split('');
		bin[0] = "1";
		bin = bin.join('');
		addr = addr.split('');
		addr[0] = decimalToHex(binToDecimal(bin));
		addr = addr.join('');
	}
	objcode = opCode + "" + addr;
	// console.info(opCode.length, opCode);
	// console.info(addr.length, addr);
	return paddZeros(objcode, 6);
	// TODO
	// CHECK FOR IS INDEX RELATIVE OR NOT
};

var getAsciiHexOfStr = function(str) {
	var x = "";
	for (var i = 0; i < str.length; i++) {
		x += str.charCodeAt(i).toString(16).toUpperCase();
	}
	return x;
}

function hexToDecimal(hex) {
	return parseInt(hex, 16);
}

function decimalToHex(dec) {
	return dec.toString(16).toUpperCase();
}

function binToDecimal(bin) {
	return parseInt(bin, 2);
}

function decimalToBin(dec) {
	return parseInt(dec, 10).toString(2);
}

function copyToClipboard(text) {
	// console.info(text);
	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function twosComplement(num) {
	var res = (16777215 - hexToDecimal(num)) + 1;
	return decimalToHex(res);
}

function isHex(hex) {
	if (!hex || !hex.length)
		return false;
	hex = hex.toLowerCase();
	for (var i = 0; i < hex.length; i++) {
		if ((hex[i] < 'a' || hex[i] > 'f') && (hex[i] < '0' || hex[i] > '9'))
			return false;
	}
	return true;
}