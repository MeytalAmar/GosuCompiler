package JackTranslator

uses java.io.File
uses java.io.PrintWriter

class VMWriter {
  var _VMFile : File
  var _writer : PrintWriter

  construct(outputFile : File) {
    _writer = new PrintWriter(outputFile)
  }

  function writePush(segment : String, index : int)
  {
    _writer.println("push " + segment + " " + index)
  }
  function writePop(segment : String, index : int)
  {
    _writer.println("pop " + segment + " " + index)
  }
  function writeArithmetic(command : String)
  {
    _writer.println(command.toLowerCase())
  }
  function writeLabel(label : String)
  {
    _writer.println("label " + label)
  }
  function writeGoto(label : String)
  {
    _writer.println("goto " + label)
  }
  function writeIf(label : String)
  {
    _writer.println("if-goto " + label)
  }
  function writeFunction(name : String, nLocals : int)
  {
    _writer.println("function " + name + " " + nLocals)
  }
  function writeCall(name : String, nArgs : int)
  {
    _writer.println("call " + name + " " + nArgs)
  }
  function writeReturn()
  {
    _writer.println("return")
  }
  
  function close() {
    _writer.close()
  }
}