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
  //var _writer : PrintWriter
  var _reader : BufferedReader
  var _tokens : List<Token> = new ArrayList<Token>()
  var _pointer : int = 0
  var _symbolTable : SymbolTable
  var _vmWriter : VMWriter
  var _ifLabelIndex : int = 0
  var _whileLabelIndex : int = 0
  var _currentClassName : String = ""

  construct (xmlFile : File , outputFile: File){
    this._xmlFile = xmlFile
    this._outputFile = outputFile
    //_writer = new PrintWriter(outputFile)
    _reader = new BufferedReader(new FileReader(this._xmlFile))

    loadTokens(this._xmlFile)
    _symbolTable = new SymbolTable()

    _vmWriter = new VMWriter(outputFile)
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

        if (value == "&amp;")  value = "&"
        if (value == "&lt;")   value = "<"
        if (value == "&gt;")   value = ">"
        if (value == "&quot;") value = "\""

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
  /*function process( expectedValue : String){
    var token = currentToken()
    if(expectedValue == token.Value){
      _writer.println("<" + token.Type +">" + token.Value + "</" + token.Type + ">" )
    }
    else{
      print("Error : not expected token")
      return
    }
    _pointer++
  }*/
  function process(expectedValue : String) {
    var token = currentToken()
    if (expectedValue != token.Value) {
      print("Error: expected " + expectedValue + " but got " + token.Value)
      return
    }
    _pointer++
  }

   // compile the class non terminal
  /*function compileClass(){
    _writer.println("<class>")

    process("class")
    // Extracts and stores the current class name (e.g., "Main", "Square")
    var className = currentToken().Value
    process(className)
    process("{")

    while (currentToken().Value == "static" || currentToken().Value == "field") {
      compileClassVarDec()
    }
    while (currentToken().Value == "constructor" || currentToken().Value == "function" || currentToken().Value == "method") {
      // Passes the class name to the subroutine compiler for 'this' pointer setup
      compileSubroutine(className)
    }
    process("}")
    _writer.println("</class>")
    _writer.close()
  }*/

  function compileClass(){
    process("class")

    _currentClassName = currentToken().Value
    process(_currentClassName)
    process("{")

    while (currentToken().Value == "static" || currentToken().Value == "field") {
      compileClassVarDec()
    }
    while (currentToken().Value == "constructor" || currentToken().Value == "function" || currentToken().Value == "method") {
      compileSubroutine(_currentClassName)
    }

    process("}")

    _vmWriter.close()
  }
  // compile the classVarDec non terminal
  /*function compileClassVarDec(){
    _writer.println("<classVarDec>")

    var kind = currentToken().Value
    process(kind)

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    // registers the variable in the symbol table
    _symbolTable.define(name, type, kind)

    while(currentToken().Value == ",") {
      process(",")
      var name2 = currentToken().Value
      process(name2)

      _symbolTable.define(name2, type, kind)
    }

    process(";")
    _writer.println("</classVarDec>")
  }*/
  // compile the classVarDec non terminal
  function compileClassVarDec(){

    var kind = currentToken().Value
    process(kind)

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    _symbolTable.define(name, type, kind)

    while(currentToken().Value == ",") {
      process(",")

      var name2 = currentToken().Value
      process(name2)

      _symbolTable.define(name2, type, kind)
    }
    process(";")
  }

  // compile the subroutine non terminal
  /*function compileSubroutine(className : String){
    _writer.println("<subroutineDec>")

    var kind = currentToken().Value
    process(kind)

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    // resets the subroutine symbol table and injects 'this' if it is a method
    _symbolTable.startSubroutine(kind, className)

    process("(")
    compileParameterList()
    process(")")
    compileSubroutineBody()

    _writer.println("</subroutineDec>")
  }*/
  // compile the subroutine non terminal
  function compileSubroutine(className : String){

    var kind = currentToken().Value
    process(kind)

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    _symbolTable.startSubroutine(kind, className)

    process("(")
    compileParameterList()
    process(")")

    var fullSubroutineName = className + "." + name

    compileSubroutineBody(fullSubroutineName, kind)
  }

  function compileParameterList(){

    if (currentToken().Value != ")") {
      var type = currentToken().Value
      process(type)

      var name = currentToken().Value
      process(name)

      _symbolTable.define(name, type, "argument")

      while (currentToken().Value == ",") {
        process(",")

        var type2 = currentToken().Value
        process(type2)

        var name2 = currentToken().Value
        process(name2)

        _symbolTable.define(name2, type2, "argument")
      }
    }
  }
  /*function compileParameterList(){
    _writer.println("<parameterList>")

    if (currentToken().Value != ")") {
      var type = currentToken().Value
      process(type)

      var name = currentToken().Value
      process(name)

      // registers the parameter as an argument in the symbol table
      _symbolTable.define(name, type, "argument")

      while (currentToken().Value == ",") {
        process(",")
        var type2 = currentToken().Value
        process(type2)

        var name2 = currentToken().Value
        process(name2)

        _symbolTable.define(name2, type2, "argument")
      }
    }
    _writer.println("</parameterList>")
  }*/


  /*function compileSubroutineBody(){
    _writer.println("<subroutineBody>")
    process("{")

    while (currentToken().Value == "var") {
      compileVarDec()
    }
    compileStatements()
    process("}")
    _writer.println("</subroutineBody>")
  }*/
  function compileSubroutineBody(fullSubroutineName : String, kind : String){
    process("{")

    while (currentToken().Value == "var") {
      compileVarDec()
    }

    var nLocals = _symbolTable.varCount("var")

    _vmWriter.writeFunction(fullSubroutineName, nLocals)

    if (kind == "constructor") {
      var nFields = _symbolTable.varCount("field")
      _vmWriter.writePush("constant", nFields)
      _vmWriter.writeCall("Memory.alloc", 1)
      _vmWriter.writePop("pointer", 0)
    }
    else if (kind == "method") {
      _vmWriter.writePush("argument", 0)
      _vmWriter.writePop("pointer", 0)
    }
    compileStatements()

    process("}")
  }

  /*function compileVarDec(){
    _writer.println("<varDec>")
    process("var")

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    // Adds the local variable to the symbol table
    _symbolTable.define(name, type, "var")

    while(currentToken().Value == ",") {
      process(",")
      var name2 = currentToken().Value
      process(name2)

      _symbolTable.define(name2, type, "var")
    }

    process(";")
    _writer.println("</varDec>")
  }*/

  function compileVarDec(){
    process("var")

    var type = currentToken().Value
    process(type)

    var name = currentToken().Value
    process(name)

    _symbolTable.define(name, type, "var")

    while(currentToken().Value == ",") {
      process(",")
      var name2 = currentToken().Value
      process(name2)

      _symbolTable.define(name2, type, "var")
    }

    process(";")
  }

  /*function compileStatements(){
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
  }*/
  function compileStatements(){

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
  }

  /*function compileLet(){
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
  }*/

  /*function compileLet(){
    process("let")

    var name = currentToken().Value
    process(name)
    process("=")

    compileExpression()

    process(";")

    var category = _symbolTable.catOf(name)
    var index = _symbolTable.indexOf(name)

    var segment = ""
    if (category == "var") {
      segment = "local"
    } else if (category == "field") {
      segment = "this"
    } else {
      segment = category
    }

    _vmWriter.writePop(segment, index)
  }*/
  function compileLet(){
    process("let")

    var name = currentToken().Value
    process(name)

    var isArray = false
    if (currentToken().Value == "[") {
      isArray = true
      process("[")
      compileExpression()
      process("]")

      // push base address of array
      var seg = _symbolTable.catOf(name)
      var idx = _symbolTable.indexOf(name)
      if (seg == "var") seg = "local"
      if (seg == "field") seg = "this"
      _vmWriter.writePush(seg, idx)
      _vmWriter.writeArithmetic("add")  // base + index
    }

    process("=")
    compileExpression()
    process(";")

    if (isArray) {
      _vmWriter.writePop("temp", 0)
      _vmWriter.writePop("pointer", 1)
      _vmWriter.writePush("temp", 0)
      _vmWriter.writePop("that", 0)
    } else {
      var category = _symbolTable.catOf(name)
      var index = _symbolTable.indexOf(name)
      var segment = ""
      if (category == "var") segment = "local"
      else if (category == "field") segment = "this"
      else segment = category
      _vmWriter.writePop(segment, index)
    }
  }

  /*function compileIf(){
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
  }*/

  function compileIf(){

    process("if")
    process("(")
    compileExpression()
    process(")")

    var labelNum = _ifLabelIndex
    _ifLabelIndex++
    var labelTrue = "IF_TRUE" + labelNum
    var labelFalse = "IF_FALSE" + labelNum
    var labelEnd = "IF_END" + labelNum

    _vmWriter.writeIf(labelTrue)
    _vmWriter.writeGoto(labelFalse)

    _vmWriter.writeLabel(labelTrue)
    process("{")
    compileStatements()
    process("}")

    _vmWriter.writeGoto(labelEnd)

    _vmWriter.writeLabel(labelFalse)
    if(currentToken().Value == "else") {
      process("else")
      process("{")
      compileStatements()
      process("}")
    }
    _vmWriter.writeLabel(labelEnd)
  }

  /*function compileWhile(){
    _writer.println("<whileStatement>")
    process("while")
    process("(")
    compileExpression()
    process(")")
    process("{")
    compileStatements()
    process("}")

    _writer.println("</whileStatement>")
  }*/
  function compileWhile(){
    process("while")

    var labelNum = _whileLabelIndex
    _whileLabelIndex++

    var labelExpression = "WHILE_EXP" + labelNum
    var labelEnd = "WHILE_END" + labelNum

    _vmWriter.writeLabel(labelExpression)

    process("(")
    compileExpression()
    process(")")

    _vmWriter.writeArithmetic("not")
    _vmWriter.writeIf(labelEnd)

    process("{")
    compileStatements()
    process("}")

    _vmWriter.writeGoto(labelExpression)

    _vmWriter.writeLabel(labelEnd)
  }

  /*function compileDo(){
    _writer.println("<doStatement>")
    process("do")
    compileSubroutineCall()
    process(";")

    _writer.println("</doStatement>")
  }*/
  function compileDo(){
    process("do")
    compileSubroutineCall()
    process(";")

    _vmWriter.writePop("temp", 0)
  }

  /*function compileReturn(){
    _writer.println("<returnStatement>")
    process("return")
    if(currentToken().Value != ";")
      compileExpression()

    process(";")

    _writer.println("</returnStatement>")
  }*/
  function compileReturn(){
    process("return")

    if(currentToken().Value != ";") {
      compileExpression()
    } else {
      _vmWriter.writePush("constant", 0)
    }
    process(";")

    _vmWriter.writeReturn()
  }

  /*function compileExpression(){
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
  }*/
  function compileExpression(){
    compileTerm()

    while(currentToken().Value == "+" || currentToken().Value == "-" ||
        currentToken().Value == "*" || currentToken().Value == "/" ||
        currentToken().Value == "&" || currentToken().Value == "&amp;" ||
        currentToken().Value == "|" || currentToken().Value == "<" ||
        currentToken().Value == ">" || currentToken().Value == "=") {

      var op = currentToken().Value
      process(op)

      compileTerm()

      if (op == "+") {
        _vmWriter.writeArithmetic("add")
      } else if (op == "-") {
        _vmWriter.writeArithmetic("sub")
      } else if (op == "=") {
        _vmWriter.writeArithmetic("eq")
      } else if (op == ">") {
        _vmWriter.writeArithmetic("gt")
      } else if (op == "<") {
        _vmWriter.writeArithmetic("lt")
      } else if (op == "&" || op == "&amp;") {
        _vmWriter.writeArithmetic("and")
      } else if (op == "|") {
        _vmWriter.writeArithmetic("or")
      } else if (op == "*") {
        _vmWriter.writeCall("Math.multiply", 2)
      } else if (op == "/") {
        _vmWriter.writeCall("Math.divide", 2)
      }
    }
  }

  /*function compileTerm(){
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
  }*/
  function compileTerm(){
    var token = currentToken()

    if (token.Type == "integerConstant") {
      _vmWriter.writePush("constant", Integer.parseInt(token.Value))
      _pointer++
    }
    else if (token.Type == "stringConstant") {
      var str = token.Value

      _vmWriter.writePush("constant", str.length())
      _vmWriter.writeCall("String.new", 1)
      _vmWriter.writePop("temp", 1)

      for (i in 0 ..| str.length()) {
        _vmWriter.writePush("temp", 1)
        _vmWriter.writePush("constant", str.charAt(i) as Integer)
        _vmWriter.writeCall("String.appendChar", 2)
        _vmWriter.writePop("temp", 1)
      }

      _vmWriter.writePush("temp", 1)
      _pointer++
    }
    else if (token.Value == "true") {
      _vmWriter.writePush("constant", 0)
      _vmWriter.writeArithmetic("not")
      _pointer++
    }
    else if (token.Value == "false" || token.Value == "null") {
      _vmWriter.writePush("constant", 0)
      _pointer++
    }
    else if (token.Value == "this") {
      _vmWriter.writePush("pointer", 0)
      _pointer++
    }
    else if (token.Value == "(") {
      process("(")
      compileExpression()
      process(")")
    }
    else if (token.Value == "-" || token.Value == "~") {
      var unaryOp = token.Value
      _pointer++
      compileTerm()

      if (unaryOp == "-") {
        _vmWriter.writeArithmetic("neg")
      } else {
        _vmWriter.writeArithmetic("not")
      }
    }
    else if (token.Type == "identifier") {
      var nextToken = NextToken()

      if (nextToken.Value == "[") {
        process(token.Value)
        process("[")
        compileExpression()
        process("]")

        var seg = _symbolTable.catOf(token.Value)
        var idx = _symbolTable.indexOf(token.Value)
        if (seg == "var") seg = "local"
        if (seg == "field") seg = "this"

        _vmWriter.writePush(seg, idx)     // דוחף את כתובת הבסיס של המערך למחסנית
        _vmWriter.writeArithmetic("add")  // מחשב: כתובת בסיס + אינדקס
        _vmWriter.writePop("pointer", 1)  // שומר את הכתובת הסופית בתוך הפוינטר THAT
        _vmWriter.writePush("that", 0)    // דוחף למחסנית את הערך האמיתי שיושב בכתובת הזו!
      }
      else if (nextToken.Value == "(" || nextToken.Value == ".") {
        compileSubroutineCall()
      }
      else {
        var name = token.Value
        var segment = _symbolTable.catOf(name)
        var index = _symbolTable.indexOf(name)

        if (segment == "var") segment = "local"
        if (segment == "field") segment = "this"

        _vmWriter.writePush(segment, index)
        _pointer++
      }
    }
  }

  /*function compileSubroutineCall() {
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
      process(subroutineName.Value) // Process the actual function varName after the dot

      process("(")
      compileExpressionList()
      process(")")
    }
  }*/
  function compileSubroutineCall() {
    var firstName = currentToken().Value
    _pointer++

    var fullSubroutineName = ""
    var nArgs = 0

    if (currentToken().Value == "(") {
      process("(")

      _vmWriter.writePush("pointer", 0)
      nArgs = 1

      fullSubroutineName = _currentClassName + "." + firstName
      nArgs += compileExpressionList()
      process(")")
    }

    else if (currentToken().Value == ".") {
      process(".")
      var subroutineName = currentToken().Value
      process(subroutineName)

      process("(")

      var variableSegment = _symbolTable.catOf(firstName)

      if (variableSegment != "NONE") {
        var variableIndex = _symbolTable.indexOf(firstName)
        var variableType = _symbolTable.typeOf(firstName)

        if (variableSegment == "var") variableSegment = "local"
        if (variableSegment == "field") variableSegment = "this"

        _vmWriter.writePush(variableSegment, variableIndex)
        nArgs = 1

        fullSubroutineName = variableType + "." + subroutineName
      } else {
        fullSubroutineName = firstName + "." + subroutineName
        nArgs = 0
      }

      nArgs += compileExpressionList()
      process(")")
    }

    _vmWriter.writeCall(fullSubroutineName, nArgs)
  }

  /*function compileExpressionList() {
    _writer.println("<expressionList>")

    if (currentToken().Value != ")") {

      compileExpression()

      while (currentToken().Value == ",") {
        process(",")
        compileExpression()
      }
    }

    _writer.println("</expressionList>")
  }*/
  function compileExpressionList() : int {
    var count = 0

    if (currentToken().Value != ")") {
      compileExpression()
      count++

      while (currentToken().Value == ",") {
        process(",")
        compileExpression()
        count++
      }
    }
    return count
  }
}