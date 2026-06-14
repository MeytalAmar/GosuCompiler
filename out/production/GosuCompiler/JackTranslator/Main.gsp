uses JackTranslator.Tokenizing
uses JackTranslator.ParsingEngine
uses java.nio.file.Files
uses java.nio.charset.StandardCharsets
uses java.io.File

var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\ComplexArrays"

var inputEntry = new File(inputPath)
var filesToProcess : List<File>
var outputFile : File

// Check if the path is a directory
if (inputEntry.isDirectory()) {
  // If it is a directory, take all the .jack files within it
  filesToProcess = inputEntry.listFiles().toList().where(\f -> f.Name.endsWith(".jack"))

  for (jackFile in filesToProcess) {
    // The output file varName will be xxxT.xml if the file is named xxx.jack
    var outputFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + "T.xml"
    outputFile = new File(outputFilePath)

    print("Analysing : " + jackFile.Name + " -> Creation of : " + outputFile.Name)

    // Creates the token file
    var ToKenizer = new Tokenizing(jackFile, outputFile)
    ToKenizer.writeTokens()

    // Create the clean XML output file for the parser (e.g., Main.xml without the 'T') and the VM file
    //var parserOutputFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + ".xml"
    var parserVmFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + ".vm"

    //var parserOutputFile = new File(parserOutputFilePath)
    var parserVmFile = new File(parserVmFilePath)

    print("Parsing : " + outputFile.Name + " -> Creation of : " + parserVmFile.Name)

    // Instantiate the ParsingEngine using the exact constructor parameters
    // Pass the tokenizer XML file (outputFile) as input, and the clean XML file (parserOutputFile)  and the VM file as output
    var parser = new ParsingEngine(outputFile, parserVmFile)

    // Call the root rule function to start the parsing process
    parser.compileClass()

  }
}
else {
  print("Error, the path is not a directory")
}