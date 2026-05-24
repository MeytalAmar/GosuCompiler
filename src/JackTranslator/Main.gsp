uses JackTranslator.Tokenizing

var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\FibonacciSeries"//CHANGE THE PATH

var inputEntry = new File(inputPath)
var filesToProcess : List<File>
var outputFile : File

// Check if the path is a directory
if (inputEntry.isDirectory()) {
  // If it is a directory, take all the .jack files within it
  filesToProcess = inputEntry.listFiles().toList().where( \ f -> f.Name.endsWith(".jack") )

  for (jackFile in filesToProcess ) {
    // The output file name will be xxxT.xml if the file is named xxx.jack
    var outputFilePath = jackFile.Path.substring(0, jackFile.Path.length() - 5) + "T.xml"
    var outputFile = new File(outputFilePath)

    print("Analysing : " + jackFile.Name + " -> Creation of : " + outputFile.Name)
  }

  var ToKenFile= new Tokenizing(jackFile,outputFile)
}
else{
  print("Error, the path is not a directory")
}
