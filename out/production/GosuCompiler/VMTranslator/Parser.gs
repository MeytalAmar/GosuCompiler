package VMTranslator
uses java.util.List

// The class which will read the VM file and will extract from it a list of command
class Parser {
    var _commands : List<String> //the command list obtained
    var _currentIndex : int = -1 //the index indicating which line we are holding
    var _currentParts : String[] // the string which will contain the different parts of the command

  // The constructor: get rid off the comments and the empty lines of the file
  //construct(rawLines : List<String>) {
  //  _commands = rawLines.map( \ line : String -> line.split("//")[0].trim() )
  //      .where( \ line : String -> line != null and line.trim().length() > 0)
  //}

  construct(rawLines : List<String>) {
    _commands = rawLines.map( \ line : String -> {
      // מוצאים את המיקום של ה- // הראשון
      var commentIndex = line.indexOf("//")
      // אם נמצא הערה, לוקחים רק את מה שלפניה. אם לא, לוקחים את כל השורה
      var noComment = (commentIndex != -1) ? line.substring(0, commentIndex) : line
      return noComment.trim()
    })
        // מסננים שורות שהפכו לריקות אחרי הניקוי
        .where( \ line : String -> line.length() > 0 )
  }


// The property (special for Gosu) checks if we arrived or not at the end of the file
  property get HasMoreCommands() : boolean {
      return _currentIndex < _commands.Count - 1
    }
  //if it's not the end of the file, read the next line
    function advance() {
      if (this.HasMoreCommands) {
        _currentIndex++
        // cut the current line into parts to separate words and put the words in the list _currentParts
        _currentParts = _commands[_currentIndex].split(" ")
      }
    }

    // return the current command type
    property get CmdType() : VMTranslator.CommandType {
      var firstWord = _currentParts[0]

      // if the word is "push", it's C_PUSH
      if (firstWord == "push") return C_PUSH
      if (firstWord == "pop")  return C_POP
      if (firstWord == "label") return C_LABEL
      if (firstWord == "goto") return C_GOTO
      if (firstWord == "if-goto") return C_IF
      if (firstWord == "function") return C_FUNCTION
      if (firstWord == "call") return C_CALL
      if (firstWord == "return") return C_RETURN

      // if it's neither push or pop it's an arithmetic command (add, sub, eq...)
      return C_ARITHMETIC
    }

    // return the first argument(segment or operation depending on the command type)
    property get Arg1() : String {
      if (this.CmdType == C_ARITHMETIC) {
        return _currentParts[0] // ex: "add"
      } else {
        return _currentParts[1] // ex: "constant"
      }
    }

    // return the second argument (index), only for push, pop
    property get Arg2() : int {
      // convert the text (String) in nnumbers(int) thanks to the .toInt() extension of Gosu
      return _currentParts[2].toInt()
    }

}