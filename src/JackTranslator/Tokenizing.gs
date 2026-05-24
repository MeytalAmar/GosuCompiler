package JackTranslator
uses java.io.File
uses java.io.FileReader
uses java.io.PrintWriter
uses java.util.Set
uses java.io.BufferedReader

class Tokenizing {
  //keep the keywords and symbols in global sets
  static final var KEYWORDS : Set<String> = {
      "class", "constructor", "function", "method", "field", "static",
      "var", "int", "char", "boolean", "void", "true", "false",
      "null", "this", "let", "do", "if", "else", "while", "return"
  }

  static final var SYMBOLS : Set<String> = {
      "{", "}", "(", ")", "[", "]", ".", ",", ";",
      "+", "-", "*", "/", "&", "|", "<", ">", "=", "~"
  }
  var _jackFile : File
  var _outputFile : File
  var _writer : PrintWriter
  var _reader : BufferedReader

 construct (jackFile : File , outputFile: File){
   this._jackFile=jackFile
   this._outputFile= outputFile
   _writer = new PrintWriter(outputFile)
   _reader = new BufferedReader(new FileReader(this._jackFile))
 }

  function writeTokens (jackFile : File , outputFile: File){

    _writer.println("<tokens>")
    //creates a temp to keep all the characters read
    var temp = new StringBuilder()
  //read each character of the file
    var intValue = _reader.read()
//loop until the end of the file
    while(intValue!= -1){
      //converts into a real character
      var c = intValue as char
      //    חלוקה למקרים
    }








//end of file
    _writer.println("</tokens>")
  }




}