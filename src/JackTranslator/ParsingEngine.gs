package JackTranslator
uses java.io.File
uses java.io.FileReader
uses java.io.PrintWriter
uses java.util.Set
uses java.io.BufferedReader
uses JackTranslator.Token


class ParsingEngine {
  var _xmlFile : File
  var _outputFile : File
  var _writer : PrintWriter
  var _reader : BufferedReader
  var _tokens : List<Token> = new ArrayList<Token>()
  var _pointer : int = 0

  construct (xmlFile : File , outputFile: File){
    this._xmlFile=xmlFile
    this._outputFile= outputFile
    _writer = new PrintWriter(outputFile)
    _reader = new BufferedReader(new FileReader(this._xmlFile))
  }
//function which will read the xml file from part 1 and creates a list of tokens
  private function loadTokens(xmlFile : File) {
    var reader = new BufferedReader(new FileReader(xmlFile))
    var line = reader.readLine()

    while (line != null) {
      line = line.trim()

      // ignores the first and last tokens
      if (line != "<tokens>" and line != "</tokens>" and line.length() > 0) {

        // Extract the type
        var type = line.substring(line.indexOf("<") + 1, line.indexOf(">"))

        // Extract the value
        var startValue = line.indexOf(">") + 1
        var endValue = line.lastIndexOf("</")
        var value = line.substring(startValue, endValue).trim()

        // adds the token to the list
        _tokens.add(new Token(type, value))
      }
      line = reader.readLine()
    }
    reader.close()
  }

  //helps to know what the current token
  private function currentToken() : Token {
    return _tokens.get(_pointer)
    }

  //to know what the next token is to anticipate
    private function NextToken() : Token {
    if (_pointer + 1 < _tokens.size()) {
    return _tokens.get(_pointer + 1)
    }
    return null
    }

  //function which receives a terminal and write the token in the output file and readthe next token from the input file
  function process( expectedValue : String){
    var token = currentToken()
    if(expectedValue == token.Value){
      _writer.println("<" + token.Type +">" + token.Value + "</" + token.Type + ">" )
    }
    else{
      print("Error : not expected token")
      return
    }
    _pointer++
  }

  //compile the class non terminal
   function compileClass(){}
  //compile the classVarDec non terminal
  function compileClassVarDec(){}
  //compile the subroutine non terminal
  function compileSubroutine(){}
  function compileParameterList(){}
  function compileSubroutineBody(){}
  function compileVarDec(){}
  function compileStatements(){}
  function compileLet(){}
  function compileIf(){}
  function compileWhile(){}
  function compileDo(){}
  function compileReturn(){}
  function compileExpression(){}
  function compileTerm(){}
  function compileExpressionList(){}













}