var ts = require("typescript");
var fs = require("graceful-fs");
var path = require("path");

var defaultLibFilename = ts.combinePaths(ts.getDirectoryPath(ts.normalizePath(require.resolve("typescript"))), "lib.d.ts");
var lastLibVersion;
var lastLibPrecompiled;
var fc = Object.create(null);

function getFileFromCache(fileName) {
	var fci = fc[fileName];
	if (fci!==undefined) {
		if (fci.mtime==fs.statSync(fileName).mtime.getTime())
			return fci;
	}
	var mtime = fs.statSync(fileName).mtime.getTime();
	var text = ts.sys.readFile(fileName, 'utf-8');
	/// <reference path="bobril.d.ts"/>
	var re = /\/\/\/ +<reference +path *= *"(.*?)" *\/>/g;
	var res;
	var refs = [];
	while( res = re.exec(text) ) {
       refs.push(path.join(path.dirname(fileName),res[1]));
	}
	fci = { content: text, mtime: mtime, refs: refs };
	fc[fileName] = fci;
	return fci;	
}

function latestTime(fileNames) {
	var res = 0;
    for(var i=0;i<fileNames.length;i++)
	{
		var fci = getFileFromCache(fileNames[i]);
		res = Math.max(res,fci.mtime);
		res = Math.max(res,latestTime(fci.refs));
	}
	return res;
}

function createCompilerHost(currentDirectory) {
	function getCanonicalFileName(fileName) {
		return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
	}
	function getSourceFile(filename, languageVersion, onError) {
		if (filename===defaultLibFilename && languageVersion===lastLibVersion) {
			return lastLibPrecompiled;
		}
		try {
			var text = getFileFromCache(filename).content;
		} catch (e) {
			if (onError) {
				onError(e.message);
			}
			text = "";
		}
		if (filename===defaultLibFilename) {
			lastLibVersion=languageVersion;
			lastLibPrecompiled=ts.createSourceFile(filename, text, languageVersion, true);
			return lastLibPrecompiled;
		}
		return ts.createSourceFile(filename, text, languageVersion, true);
	}
	function writeFile(fileName, data, writeByteOrderMark, onError) {
		try {
			var text = ts.sys.readFile(fileName, 'utf-8');
		} catch (e) {
			text = "";
		}
		if (text===data) {
			fs.utimesSync(fileName,new Date(),new Date());
			return;
		}
		try {
			console.log("Writing " + fileName);
			ts.sys.writeFile(fileName, data, false);
		} catch (e) {
			if (onError) {
				onError(e.message);
			}
		}
	}
	return {
		getSourceFile: getSourceFile,
		getDefaultLibFilename: function (options) { return defaultLibFilename; },
		writeFile: writeFile,
		getCurrentDirectory: function () { return currentDirectory; },
		useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames; },
		getCanonicalFileName: getCanonicalFileName,
		getNewLine: function () { return '\n'; }
	};
}

function reportDiagnostic(diagnostic) {
	var output = "";
	if (diagnostic.file) {
		var loc = diagnostic.file.getLineAndCharacterFromPosition(diagnostic.start);
		output += diagnostic.file.filename + "(" + loc.line + "," + loc.character + "): ";
	}
	var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
	output += category + " TS" + diagnostic.code + ": " + diagnostic.messageText + ts.sys.newLine;
	ts.sys.write(output);
}

function reportDiagnostics(diagnostics) {
	for (var i = 0; i < diagnostics.length; i++) {
		reportDiagnostic(diagnostics[i]);
	}
}

/// string|string[], boolean, boolean, string?
function typeScriptCompile(fileNames, commonJs, sourceMap, currentDirectory) {
	var curDir = currentDirectory || ts.sys.getCurrentDirectory();
	if (!Array.isArray(fileNames)) fileNames=[fileNames];

	var outputName = fileNames[0].substr(0,fileNames[0].length-3)+".js";
	var outtime = 0;
	try {
		outtime = fs.statSync(outputName).mtime.getTime();
	}
	catch (e) { console.log(e); }
	if (sourceMap) {
		try {
			outtime = Math.min(outtime, fs.statSync(outputName+".map").mtime.getTime());
		}
		catch (e) { console.log(e); }
	}
	
	var sourcetime = 0;
	try {
		sourcetime = latestTime(fileNames);
	}
	catch(e) {
		console.log(e);
		sourcetime = (new Date()).getTime(); 
	}
	
	if (sourcetime < outtime) {
		return;
	}
	
	var compilerOptions = {
		sourceMap: sourceMap,
		target: 0 /* ES3 */,
		module: commonJs? 1 /* CommonJs */ : 0 /* None */,
		noImplicitAny: true,
		suppressImplicitAnyIndexErrors: true,
		noEmitOnError: true
	};

	var program = ts.createProgram(fileNames, compilerOptions, createCompilerHost(curDir));
	var errors = program.getDiagnostics();
	var exitStatus;
	if (errors.length) {
		exitStatus = 1 /* AllOutputGenerationSkipped */;
	} else {
		var checker = program.getTypeChecker(true);
		errors = checker.getDiagnostics();
		if (checker.isEmitBlocked()) {
			exitStatus = 1 /* AllOutputGenerationSkipped */;
		} else {
			var emitOutput = checker.emitFiles();
			var emitErrors = emitOutput.diagnostics;
			exitStatus = emitOutput.emitResultStatus;
			errors = ts.concatenate(errors, emitErrors);
		}
	}
	reportDiagnostics(errors);
	return exitStatus;
}

module.exports = typeScriptCompile;
