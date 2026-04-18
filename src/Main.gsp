uses java.nio.file.Files
uses java.nio.charset.StandardCharsets
uses java.io.File
uses Step1.Parser
uses Step1.CodeWriter
uses Step1.CommandType

// Update the path to the targil1 directory you created here
var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\targil1"

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

// Iterate through all files and translate them into the same file
for (file in filesToProcess) {
  print("Processing file: " + file.Name)
  var lines = Files.readAllLines(file.toPath(), StandardCharsets.UTF_8)
  var parser = new Parser(lines)

  while (parser.HasMoreCommands) {
    parser.advance()

    if (parser.CmdType == CommandType.C_ARITHMETIC) {
      writer.writeArithmetic(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_PUSH || parser.CmdType == CommandType.C_POP) {
      writer.writePushPop(parser.CmdType, parser.Arg1, parser.Arg2)
    }
  }
}

writer.close()
print("Done! Combined output created at: " + outputFile.Path)