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
    this._xmlFile = xmlFile
    this._outputFile = outputFile
    _writer = new PrintWriter(outputFile)
    _reader = new BufferedReader(new FileReader(this._xmlFile))

    loadTokens(this._xmlFile)
  }
  // function which will read the xml file from part 1 and creates a list of tokens
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

  // helps to know what the current token
  private function currentToken() : Token {
    return _tokens.get(_pointer)
    }

  // to know what the next token is to anticipate
  private function NextToken() : Token {
    if (_pointer + 1 < _tokens.size()) {
    return _tokens.get(_pointer + 1)
    }
    return null
  }

  // function which receives a terminal and write the token in the output file and readthe next token from the input file
  function process( expectedValue : String){
    var token = currentToken()
    if(expectedValue == token.Value){
      _writer.println("<" + token.Type +">" + token.Value + "</" + token.Type + ">" ) //----------------------------
    }
    else{
      print("Error : not expected token")
      return
    }
    _pointer++
  }

   // compile the class non terminal
  function compileClass(){
    _writer.println("<class>")

    process("class")
    var current = currentToken()
    process(current.Value)
    process("{")

    while (currentToken().Value == "static" || currentToken().Value == "field") {
      compileClassVarDec()
    }
    while (currentToken().Value == "constructor" || currentToken().Value == "function" || currentToken().Value == "method") {
      compileSubroutine()
    }
    process("}")
    _writer.println("</class>")
    _writer.close()
  }

  // compile the classVarDec non terminal
  function compileClassVarDec(){
    _writer.println("<classVarDec>")

    var kind = currentToken()
    process(kind.Value)

    var type = currentToken()
    process(type.Value)

    var name = currentToken()
    process(name.Value)

    while(currentToken().Value == ",") {
      process(",")
      var name2 = currentToken()
      process(name2.Value)
    }

    process(";")
    _writer.println("</classVarDec>")
  }

  // compile the subroutine non terminal
  function compileSubroutine(){
    _writer.println("<subroutineDec>")

    var kind = currentToken()
    process(kind.Value)

    var type = currentToken()
    process(type.Value)

    var name = currentToken()
    process(name.Value)

    process("(")
    compileParameterList()
    process(")")
    compileSubroutineBody()

    _writer.println("</subroutineDec>")
  }

  function compileParameterList(){
    _writer.println("<parameterList>")

    if (currentToken().Value != ")") {
      var type = currentToken()
      process(type.Value)

      var name = currentToken()
      process(name.Value)

      while (currentToken().Value == ",") {
        process(",")
        var type2 = currentToken()
        process(type2.Value)

        var name2 = currentToken()
        process(name2.Value)
      }
    }
    _writer.println("</parameterList>")
  }

  function compileSubroutineBody(){
    _writer.println("<subroutineBody>")
    process("{")

    while (currentToken().Value == "var") {
      compileVarDec()
    }
    compileStatements()
    process("}")
    _writer.println("</subroutineBody>")
  }

  function compileVarDec(){
    _writer.println("<varDec>")
    process("var")

    var type = currentToken()
    process(type.Value)

    var name = currentToken()
    process(name.Value)

    while(currentToken().Value == ",") {
      process(",")
      var name2 = currentToken()
      process(name2.Value)
    }

    process(";")

    _writer.println("</varDec>")
  }

  function compileStatements(){
    _writer.println("<statements>")

    var next = currentToken().Value
    while (next == "let" || next == "if" || next == "while" || next == "do" || next == "return") {
      if(next == "let")
        compileLet()
      else if (next == "if")
        compileIf()
      else if (next == "while")
        compileWhile()
      else if (next == "do")
        compileDo()
      else if (next == "return")
        compileReturn()

      next = currentToken().Value
    }
    _writer.println("</statements>")
  }

  function compileLet(){
    _writer.println("<letStatement>")
    process("let")

    var name = currentToken()
    process(name.Value)

    if (currentToken().Value == "[") {
      process("[")
      compileExpression()
      process("]")
    }

    process("=")
    compileExpression()
    process(";")

    _writer.println("</letStatement>")
  }

  function compileIf(){
    _writer.println("<ifStatement>")
    process("if")
    process("(")
    compileExpression()
    process(")")
    process("{")
    compileStatements()
    process("}")

    if(currentToken().Value == "else") {
      process("else")
      process("{")
      compileStatements()
      process("}")
    }
    _writer.println("</ifStatement>")
  }

  function compileWhile(){
    _writer.println("<whileStatement>")
    process("while")
    process("(")
    compileExpression()
    process(")")
    process("{")
    compileStatements()
    process("}")

    _writer.println("</whileStatement>")
  }

  function compileDo(){
    _writer.println("<doStatement>")
    process("do")
    compileSubroutineCall()
    process(";")

    _writer.println("</doStatement>")
  }

  function compileReturn(){
    _writer.println("<returnStatement>")
    process("return")
    if(currentToken().Value != ";")
      compileExpression()

    process(";")

    _writer.println("</returnStatement>")
  }

  function compileExpression(){
    _writer.println("<expression>")
    compileTerm()

    while(currentToken().Value == "+" ||
          currentToken().Value == "-" ||
          currentToken().Value == "*" ||
          currentToken().Value == "/" ||
          currentToken().Value == "&amp;" ||
          currentToken().Value == "|" ||
          currentToken().Value == "&lt;" ||
          currentToken().Value == "&gt;" ||
          currentToken().Value == "=") {

      var opToken = currentToken()
      process(opToken.Value)

      compileTerm()
    }
    _writer.println("</expression>")
  }

  function compileTerm(){
    _writer.println("<term>")

    var token = currentToken()

    if (token.Type == "integerConstant" || token.Type == "stringConstant") {
      process(token.Value)
    }
    else if (token.Value == "true" || token.Value == "false" ||
        token.Value == "null" || token.Value == "this") {
      process(token.Value) // keywordConstant
    }
    else if (token.Value == "(") {
      process("(")
      compileExpression() // Nested expression inside parenthesis
      process(")")
    }
    else if (token.Value == "-" || token.Value == "~") {
      process(token.Value) // unaryOp
      compileTerm()        // Recursively compile the term affected by the unary operator
    }
    else if (token.Type == "identifier") {
      var nextToken = NextToken()

      if (nextToken.Value == "[") {
        process(token.Value)
        process("[")
        compileExpression()
        process("]")
      }
      else if (nextToken.Value == "(" || nextToken.Value == ".") {
        compileSubroutineCall()
      }
      else {
        process(token.Value)
      }
    }
    _writer.println("</term>")
  }

  function compileSubroutineCall() {
    var name = currentToken()
    process(name.Value)

    if (currentToken().Value == "(") {
      process("(")
      compileExpressionList()
      process(")")
    }
    else if (currentToken().Value == ".") {
      process(".")

      var subroutineName = currentToken()
      process(subroutineName.Value) // Process the actual function name after the dot

      process("(")
      compileExpressionList()
      process(")")
    }
  }

  function compileExpressionList() {
    _writer.println("<expressionList>")

    if (currentToken().Value != ")") {

      compileExpression()

      while (currentToken().Value == ",") {
        process(",")
        compileExpression()
      }
    }

    _writer.println("</expressionList>")
  }













}