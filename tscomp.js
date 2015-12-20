var ts = require("typescript");
var fs = require("graceful-fs");
var path = require("path");

var defaultLibFilename = ts.combinePaths(ts.getDirectoryPath(ts.normalizePath(require.resolve("typescript"))), "lib.es6.d.ts");
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
		getDefaultLibFileName: function (options) { return defaultLibFilename; },
		writeFile: writeFile,
		getCurrentDirectory: function () { return currentDirectory; },
		useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames; },
		getCanonicalFileName: getCanonicalFileName,
		getNewLine: function () { return '\n'; },
        fileExists: function(fileName) {
			try {
				getFileFromCache(fileName);
				return true;
			} catch (e) {
			}
			return false;
		},
        readFile: function(fileName) {
			return getFileFromCache(fileName).content;
		}	
	};
}

function reportDiagnostic(diagnostic) {
	var output = "";
	if (diagnostic.file) {
		var loc = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
		output += diagnostic.file.fileName + "(" + (loc.line+1) + "," + (loc.character+1) + "): ";
	}
	var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
	output += category + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;
	ts.sys.write(output);
}

function reportDiagnostics(diagnostics) {
	for (var i = 0; i < diagnostics.length; i++) {
		reportDiagnostic(diagnostics[i]);
	}
}

/// string
function typeScriptCompile(tsconfig, rebuild) {
	var curDir = ts.sys.getCurrentDirectory();
	if (!path.isAbsolute(tsconfig)) tsconfig = path.join(curDir, tsconfig);
	curDir = path.dirname(tsconfig);
	var tsconfigjson = ts.readConfigFile(tsconfig,function(fn) { return ts.sys.readFile(fn, 'utf-8') })['config'];
	tsconfigjson["compilerOptions"]["moduleResolution"]="node";
	tsconfigjson["compilerOptions"]["target"]="es5";
	tsconfigjson["compilerOptions"]["module"]="commonjs";
	var tscmd = ts.parseJsonConfigFileContent(tsconfigjson, null, curDir);
	if (tscmd.errors.length) {
		reportDiagnostics(tscmd.errors);
		return 1;
	}
	var fileNames = tscmd.fileNames;
	if (!Array.isArray(fileNames)) fileNames=[fileNames];

	var outtime = 1e306;
	for(var i = 0; i < fileNames.length; i++)
	{
		var fn=fileNames[i];
		if (fn.substr(fn.length-5,5)===".d.ts")
			continue;
		var outputName = fn.substr(0,fn.length-3)+".js";
		try {
			outtime = Math.min(outtime, fs.statSync(outputName).mtime.getTime());
		}
		catch (e) { console.log(e); outtime = 0; }
		if (tscmd.options.sourceMap) {
			try {
				outtime = Math.min(outtime, fs.statSync(outputName+".map").mtime.getTime());
			}
			catch (e) { console.log(e); outtime = 0; }
		}
	}

	var sourcetime = 0;
	try {
		sourcetime = latestTime(fileNames);
	}
	catch(e) {
		console.log(e);
		sourcetime = (new Date()).getTime();
	}

	if (!rebuild && sourcetime < outtime) {
		return;
	}

	var program = ts.createProgram(fileNames, tscmd.options, createCompilerHost(curDir));
	var diagnostics = program.getSyntacticDiagnostics();
	reportDiagnostics(diagnostics);
	if (diagnostics.length === 0) {
		var diagnostics = program.getGlobalDiagnostics();
		reportDiagnostics(diagnostics);
		if (diagnostics.length === 0) {
			var diagnostics = program.getSemanticDiagnostics();
			reportDiagnostics(diagnostics);
		}
	}
	if (tscmd.options.noEmit) {
		return diagnostics.length ? 2 : 0;
	}
	var emitOutput = program.emit();
	reportDiagnostics(emitOutput.diagnostics);
	if (emitOutput.emitSkipped) {
		return 3;
	}
	if (diagnostics.length > 0 || emitOutput.diagnostics.length > 0) {
		return 0;
	}
	return 0;
}

module.exports = typeScriptCompile;
