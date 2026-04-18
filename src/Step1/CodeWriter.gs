package Step1

uses java.io.File
uses java.io.PrintWriter

class CodeWriter {
  var _writer : PrintWriter
  var _labelCounter : int = 0
  var _fileName : String

  construct(outputFile : File) {
    _writer = new PrintWriter(outputFile)
    _fileName = outputFile.Name.substring(0, outputFile.Name.lastIndexOf("."))
  }

  function writeArithmetic(command : String) {
    _writer.println("// " + command)

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
      writeCompare3() // הקריאה לפקודה החדשה
    }
  }

  // מימוש הפקודה compare3: בדיקה האם z < y < x
  private function writeCompare3() {
    var labelFalse = "COMP3_FALSE_" + _labelCounter
    var labelEnd = "COMP3_END_" + _labelCounter
    _labelCounter++

    // 1. שליפת x ל-D
    popStackToD() // D = x

    // 2. השוואה בין y ל-x (נמצא ב-SP-1)
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("D=M-D") // D = y - x
    _writer.println("@" + labelFalse)
    _writer.println("D;JGE") // אם y >= x קפוץ לשקר

    // 3. שליפת y ל-D (כדי לעבור לבדוק את z)
    popStackToD() // D = y

    // 4. השוואה בין z ל-y (נמצא ב-SP-1)
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("D=M-D") // D = z - y
    _writer.println("@" + labelFalse)
    _writer.println("D;JGE") // אם z >= y קפוץ לשקר

    // מקרה אמת: z < y < x
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=1") // דחיפת 1 לפי דף המשימה
    _writer.println("@" + labelEnd)
    _writer.println("0;JMP")

    // מקרה שקר
    _writer.println("(" + labelFalse + ")")
    _writer.println("@SP")
    _writer.println("A=M-1")
    _writer.println("M=0") // דחיפת 0

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
    _writer.println("A=M+D")
  }

  function close() {
    _writer.close()
  }
}