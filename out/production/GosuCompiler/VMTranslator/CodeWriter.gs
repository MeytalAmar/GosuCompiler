package VMTranslator

uses java.io.File
uses java.io.PrintWriter

class CodeWriter {
  var _writer : PrintWriter
  var _labelCounter : int = 0 // Counter for creating unique labels for comparison commands
  var _fileName : String     // File name for static variables

  construct(outputFile : File) {
    _writer = new PrintWriter(outputFile)
    // Extracting the file name without the extension for static variables
    _fileName = outputFile.Name.substring(0, outputFile.Name.lastIndexOf("."))
  }

  function setFileName(fileName : String) {  //----
    _fileName = fileName
  }

  function writeInit() {                    //----
    _writer.println("// Bootstrap code")
    _writer.println("@256")
    _writer.println("D=A")
    _writer.println("@SP")
    _writer.println("M=D")
    writeCall("Sys.init", 0)
  }

  private function programFlow(operator: String, variable: String) {
    if (operator == "label") {
      _writer.println("("  + variable + ")")//+ _fileName + "."
    } else if (operator == "goto") {
      _writer.println("@"  + variable) //+ _fileName + "."
      _writer.println("0;JMP")
    } else if (operator == "if-goto") {
      popStackToD()
      _writer.println("@"  + variable) //+ _fileName + "."
      _writer.println("D;JNE")
    }
  }

  function writeLabel(label : String) { programFlow("label", label) }
  function writeGoto(label : String) { programFlow("goto", label) }
  function writeIf(label : String) { programFlow("if-goto", label) }

  function writeFunction(funcName : String, numLocals : int) {
    _writer.println("// function " + funcName + " " + numLocals)
    _writer.println("(" + funcName + ")")

    for (i in 0 |..| numLocals) {
      _writer.println("D=0")
      pushDToStack()
    }
  }

  function writeCall(funcName : String, numArgs : int) {
    _writer.println("// call " + funcName + " " + numArgs)

    var returnLabel = "RETURN_" + funcName + "_" + _labelCounter
    _labelCounter++

    _writer.println("@" + returnLabel)
    _writer.println("D=A")
    pushDToStack()

    var segments = {"LCL", "ARG", "THIS", "THAT"}
    for (seg in segments) {
      _writer.println("@" + seg)
      _writer.println("D=M")
      pushDToStack()
    }

    _writer.println("@SP")
    _writer.println("D=M")
    _writer.println("@" + (numArgs + 5))
    _writer.println("D=D-A")
    _writer.println("@ARG")
    _writer.println("M=D")

    _writer.println("@SP")
    _writer.println("D=M")
    _writer.println("@LCL")
    _writer.println("M=D")

    _writer.println("@" + funcName)
    _writer.println("0;JMP")

    _writer.println("(" + returnLabel + ")")
  }

  function writeReturn() {
    _writer.println("// return")

    _writer.println("@LCL")
    _writer.println("D=M")
    _writer.println("@R13")
    _writer.println("M=D")

    _writer.println("@5")
    _writer.println("A=D-A")
    _writer.println("D=M")
    _writer.println("@R14")
    _writer.println("M=D")

    popStackToD()
    _writer.println("@ARG")
    _writer.println("A=M")
    _writer.println("M=D")

    _writer.println("@ARG")
    _writer.println("D=M+1")
    _writer.println("@SP")
    _writer.println("M=D")

    var restoreOrder = {"THAT", "THIS", "ARG", "LCL"}
    var offset = 1
    for (seg in restoreOrder) {
      _writer.println("@R13")
      _writer.println("D=M")
      _writer.println("@" + offset)
      _writer.println("A=D-A")
      _writer.println("D=M")
      _writer.println("@" + seg)
      _writer.println("M=D")
      offset++
    }

    _writer.println("@R14")
    _writer.println("A=M")
    _writer.println("0;JMP")
  }



  function writeArithmetic(command : String) {
    _writer.println("// " + command) // Printing the original command as a comment

    if (command == "add") {
      binaryOp("M=D+M")
    } else if (command == "sub") {
      binaryOp("M=M-D")
    } else if (command == "and") {
      binaryOp("M=D&M")
    } else if (command == "or") {
      binaryOp("M=D|M")
    } else if (command == "neg") {
      unaryOp("M=-M")
    } else if (command == "not") {
      unaryOp("M=!M")
    } else if (command == "eq") {
      compareOp("JEQ")
    } else if (command == "gt") {
      compareOp("JGT")
    } else if (command == "lt") {
      compareOp("JLT")
    } else if (command == "compare3") {
      writeCompare3() // Calling the new command
    }
  }

  // Implementation of the compare3 command: checks if z < y < x
  private function writeCompare3() {
    var labelFalse = "COMP3_FALSE_" + _labelCounter
    var labelEnd = "COMP3_END_" + _labelCounter
    _labelCounter++

    // 1. Popping x into D
    popStackToD() // D = x

    // 2. Comparing y and x (found at SP-1)
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("D=M-D") // D = y - x
    _writer.println("@" + labelFalse)
    _writer.println("D;JGE") // If y >= x jump to false

    // 3. Popping y into D (to check z)
    popStackToD() // D = y

    // 4. Comparing z and y (found at SP-1)
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("D=M-D") // D = z - y
    _writer.println("@" + labelFalse)
    _writer.println("D;JGE") // If z >= y jump to false

    // True case: z < y < x
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=1") // Pushing 1 according to the task sheet
    _writer.println("@" + labelEnd)
    _writer.println("0;JMP")

    // False case
    _writer.println("(" + labelFalse + ")")
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=0") // Pushing 0

    _writer.println("(" + labelEnd + ")")
  }

  function writePushPop(command : CommandType, segment : String, index : int) {
    _writer.println("// " + command + " " + segment + " " + index)
    if (command == CommandType.C_PUSH) {
      if (segment == "constant") {
        _writer.println("@" + index)
        _writer.println("D=A")
        pushDToStack()
      } else if (segment == "local" || segment == "argument" || segment == "this" || segment == "that") {
        loadSegmentAddress(segment, index)
        _writer.println("D=M")
        pushDToStack()
      } else if (segment == "temp") {
        _writer.println("@" + (5 + index))
        _writer.println("D=M")
        pushDToStack()
      } else if (segment == "pointer") {
        var symbol = (index == 0) ? "THIS" : "THAT"
        _writer.println("@" + symbol)
        _writer.println("D=M")
        pushDToStack()
      } else if (segment == "static") {
        _writer.println("@" + _fileName + "." + index)
        _writer.println("D=M")
        pushDToStack()
      }
    } else if (command == CommandType.C_POP) {
      if (segment == "local" || segment == "argument" || segment == "this" || segment == "that") {
        _writer.println("@" + index)
        _writer.println("D=A")
        _writer.println("@" + getSegmentSymbol(segment))
        _writer.println("D=M+D")
        _writer.println("@R13")
        _writer.println("M=D")
        popStackToD()
        _writer.println("@R13")
        _writer.println("A=M")
        _writer.println("M=D")
      } else if (segment == "temp") {
        popStackToD()
        _writer.println("@" + (5 + index))
        _writer.println("M=D")
      } else if (segment == "pointer") {
        var symbol = (index == 0) ? "THIS" : "THAT"
        popStackToD()
        _writer.println("@" + symbol)
        _writer.println("M=D")
      } else if (segment == "static") {
        popStackToD()
        _writer.println("@" + _fileName + "." + index)
        _writer.println("M=D")
      }
    }
  }

  private function binaryOp(operation : String) {
    _writer.println("@SP")
    _writer.println("AM=M-1")
    _writer.println("D=M")
    _writer.println("A=A-1")
    _writer.println(operation)
  }

  private function unaryOp(operation : String) {
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println(operation)
  }

  private function compareOp(jumpType : String) {
    var labelTrue = "LABEL_TRUE_" + _labelCounter
    var labelEnd = "LABEL_END_" + _labelCounter
    _labelCounter++
    _writer.println("@SP")
    _writer.println("AM=M-1")
    _writer.println("D=M")
    _writer.println("A=A-1")
    _writer.println("D=M-D")
    _writer.println("@" + labelTrue)
    _writer.println("D;" + jumpType)
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=0")
    _writer.println("@" + labelEnd)
    _writer.println("0;JMP")
    _writer.println("(" + labelTrue + ")")
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=-1")
    _writer.println("(" + labelEnd + ")")
  }

  private function pushDToStack() {
    _writer.println("@SP")
    _writer.println("A=M")
    _writer.println("M=D")
    _writer.println("@SP")
    _writer.println("M=M+1")
  }

  private function popStackToD() {
    _writer.println("@SP")
    _writer.println("AM=M-1")
    _writer.println("D=M")
  }

  private function getSegmentSymbol(segment : String) : String {
    if (segment == "local") return "LCL"
    if (segment == "argument") return "ARG"
    if (segment == "this") return "THIS"
    if (segment == "that") return "THAT"
    return ""
  }

  private function loadSegmentAddress(segment : String, index : int) {
    _writer.println("@" + index)
    _writer.println("D=A")
    _writer.println("@" + getSegmentSymbol(segment))
    _writer.println("D=M+D")
    _writer.println("A=D")
  }

  function close() {
    _writer.close()
  }
}