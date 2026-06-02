uses JackTranslator.Tokenizing
uses JackTranslator.ParsingEngine
uses java.nio.file.Files
uses java.nio.charset.StandardCharsets
uses java.io.File

var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\ExpressionLessSquare"

var inputEntry = new File(inputPath)
var filesToProcess : List<File>
var outputFile : File

// Check if the path is a directory
if (inputEntry.isDirectory()) {
  // If it is a directory, take all the .jack files within it
  filesToProcess = inputEntry.listFiles().toList().where(\f -> f.Name.endsWith(".jack"))

  for (jackFile in filesToProcess) {
    // The output file name will be xxxT.xml if the file is named xxx.jack
    var outputFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + "T.xml"
    outputFile = new File(outputFilePath)

    print("Analysing : " + jackFile.Name + " -> Creation of : " + outputFile.Name)

    // Creates the token file
    var ToKenizer = new Tokenizing(jackFile, outputFile)
    ToKenizer.writeTokens()

    // Create the clean XML output file for the parser (e.g., Main.xml without the 'T')
    var parserOutputFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + ".xml"
    var parserOutputFile = new File(parserOutputFilePath)

    print("Parsing : " + outputFile.Name + " -> Creation of : " + parserOutputFile.Name)

    // Instantiate the ParsingEngine using the exact constructor parameters
    // Pass the tokenizer XML file (outputFile) as input, and the clean XML file (parserOutputFile) as output
    var parser = new ParsingEngine(outputFile, parserOutputFile)

    // Call the root rule function to start the parsing process
    parser.compileClass()

  }
}
  else {
  print("Error, the path is not a directory")
}