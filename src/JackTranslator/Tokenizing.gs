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

  function writeTokens (jackFile : File , outputFile: File) {

    _writer.println("<tokens>")
    //creates a temp to keep all the characters read
    var temp = new StringBuilder()
    //read each character of the file
    var intValue = _reader.read()
    //loop until the end of the file
    while (intValue != -1) {
      //converts into a real character
      var c = intValue as char
      //if its a letter or a digit or a _
      if (Character.isLetterOrDigit(c) or c == '_') {
        temp.append(c)
      }
      //if it's a symbol or a space or an end of line: end of the word
      else {
        if (temp.length() > 0) {
          var word = temp.toString()
          //if temp is a keyword
          if (KEYWORDS.contains(word)) {
            _writer.println("<keyword>" + temp + "</keyword>")
          }

          //if it's a number (starts with a digit)
          else if (Character.isDigit(word.charAt(0))) {
            _writer.println("<integerConstant> " + word + " </integerConstant>")
          }
          //else,  it's an identifier
          else {
            _writer.println("<identifier>" + temp + "</identifier>")
          }
          // empty temp
          temp.setLength(0)
        }


        //if its a symbol
        if (SYMBOLS.contains(java.lang.String.valueOf(c))) {
          if (c == '<') {
            _writer.println("<symbol> &lt; </symbol>")
          } else if (c == '>') {
            _writer.println("<symbol> &gt; </symbol>")
          } else if (c == '&') {
            _writer.println("<symbol> &amp; </symbol>")
          }

          //checks if it's a comment
          else if (c == '/') {
            //checks the next character

            _reader.mark(1)
            var next = _reader.read()

            if (next != -1) {
              var nextChar = next as char

              //if the next character is also a / , jump until the end of the line
              if (nextChar == '/') {
                while (next != -1 and nextChar != '\n' and nextChar != '\r') {
                  next = _reader.read()
                  if (next != -1) {
                    nextChar = next as char
                  }
                }
              }
              //if it's a *, jump until the end of the comment
              else if (nextChar == '*') {
                var insideComment = true

                while (insideComment and next != -1) {
                  next = _reader.read()

                  if (next != -1) {
                    nextChar = next as char

                    if (nextChar == '*') {
                      _reader.mark(1)
                      var afterStar = _reader.read()

                      if (afterStar != -1 and (afterStar as char) == '/') {
                        insideComment = false
                      } else {
                        //go back to the mark
                        _reader.reset()
                      }
                    }
                  }
                }

              } else {
                _writer.println("<symbol> / </symbol>")
                _reader.reset()
              }
            }
            else {
              _writer.println("<symbol> / </symbol>")
            }
          }

          //if it's another symbol
          else{
            _writer.println("<symbol> " +c + " </symbol>")
          }
        }
        //if it's a string constant
        else if (c == '"') {
          //build a buffer to keep the next characters
          var str = new StringBuilder()
          var next_value = _reader.read()

          if (next_value != -1) {
            var ch = next_value as char
            //loop until the end of the string constant
            while (next_value != -1 and ch != '"') {
              //add each character to the buffer
              str.append(ch)
              next_value = _reader.read()
              ch = next_value as char
            }
            _writer.println("<stringConstant> " + str.toString() + " </stringConstant>")
          }
        }

      }


      //read the next character
      intValue = _reader.read()
    }


//end of file
    _writer.println("</tokens>")
    _reader.close()
    _writer.close()
  }




}