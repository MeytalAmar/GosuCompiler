uses java.nio.file.Files
uses java.nio.charset.StandardCharsets
uses java.io.File
uses VMTranslator.Parser
uses VMTranslator.CodeWriter
uses VMTranslator.CommandType

// Update the path to the targil1 directory you created here
var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\FibonacciSeries"

var inputEntry = new File(inputPath)
var filesToProcess : List<File>
var outputFile : File

// Check if the path is a directory or a single file
if (inputEntry.isDirectory()) {
  // If it is a directory, take all the .vm files within it
  filesToProcess = inputEntry.listFiles().toList().where( \ f -> f.Name.endsWith(".vm") )
  // The output file name will be the same as the directory name
  outputFile = new File(inputEntry.Path + "\\" + inputEntry.Name + ".asm")
} else {
  // If it is a single file
  filesToProcess = {inputEntry}
  var outputFileName = inputPath.contains(".")
      ? inputPath.substring(0, inputPath.lastIndexOf(".")) + ".asm"
      : inputPath + ".asm"
  outputFile = new File(outputFileName)
}

// Create one CodeWriter for the combined output file
var writer = new CodeWriter(outputFile)

var needsBootstrap = inputEntry.isDirectory() && filesToProcess.hasMatch(\ f -> f.Name.equalsIgnoreCase("Sys.vm"))
if (needsBootstrap) {
  writer.writeInit()
}

// Iterate through all files and translate them into the same file
for (file in filesToProcess) {
  print("Processing file: " + file.Name)

  var fileNameOnly = file.Name.substring(0, file.Name.lastIndexOf("."))
  writer.setFileName(fileNameOnly)

  var lines = Files.readAllLines(file.toPath(), StandardCharsets.UTF_8)
  var parser = new Parser(lines)

  while (parser.HasMoreCommands) {
    parser.advance()

    if (parser.CmdType == CommandType.C_ARITHMETIC) {
      writer.writeArithmetic(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_PUSH || parser.CmdType == CommandType.C_POP) {
      writer.writePushPop(parser.CmdType, parser.Arg1, parser.Arg2)
    } else if (parser.CmdType == CommandType.C_LABEL) {
      writer.writeLabel(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_GOTO) {
      writer.writeGoto(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_IF) {
      writer.writeIf(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_FUNCTION) {
      writer.writeFunction(parser.Arg1, parser.Arg2)
    } else if (parser.CmdType == CommandType.C_CALL) {
      writer.writeCall(parser.Arg1, parser.Arg2)
    } else if (parser.CmdType == CommandType.C_RETURN) {
      writer.writeReturn()
    }
  }
}

writer.close()
print("Done! Combined output created at: " + outputFile.Path)