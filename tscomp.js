var ts = require("typescript");

function createCompilerHost(currentDirectory) {
	function getCanonicalFileName(fileName) {
		return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
	}
	var unsupportedFileEncodingErrorCode = -2147024809;
	function getSourceFile(filename, languageVersion, onError) {
		try {
			var text = ts.sys.readFile(filename, 'utf-8');
		} catch (e) {
			if (onError) {
				onError(e.number === unsupportedFileEncodingErrorCode ? ts.createCompilerDiagnostic(ts.Diagnostics.Unsupported_file_encoding).messageText : e.message);
			}
			text = "";
		}
		return text !== undefined ? ts.createSourceFile(filename, text, languageVersion, "0") : undefined;
	}
	function writeFile(fileName, data, writeByteOrderMark, onError) {
		try {
			var text = ts.sys.readFile(fileName, 'utf-8');
		} catch (e) {
			text = "";
		}
		if (text===data) return;
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
		getDefaultLibFilename: function (options) { return ts.combinePaths(ts.getDirectoryPath(ts.normalizePath(require.resolve("typescript"))), "lib.d.ts"); },
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
