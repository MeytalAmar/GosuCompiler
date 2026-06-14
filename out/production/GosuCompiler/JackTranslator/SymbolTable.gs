package JackTranslator


class SymbolTable {

  // dict to keep the symbols : one for the current class and one for the current function
  var _classScope : Map<String, Symbol>
  var _methodScope : Map<String, Symbol>

  // counter for indexes
  var _varCount : Integer
  var _argCount : Integer
  var _staticCount : Integer
  var _fieldCount : Integer

  construct() {
    _classScope = {}
    _methodScope = {}
    _staticCount = 0
    _fieldCount = 0
    _varCount = 0
    _argCount = 0
  }

  function startSubroutine(keyword : String, className : String) {
    // empty the previous table and put counter to 0
    _methodScope.clear()
    _varCount = 0
    _argCount = 0

    if (keyword == "method") {
      // add argument 'this' at index 0
      var thisSymbol = new Symbol(className, "argument", _argCount)
      _methodScope["this"] = thisSymbol
      _argCount++
    }
  }
  //add values to the symbol table
  function define(varName : String, varType : String, varCategory : String){
    if (varCategory== "static"){
      var s = new Symbol(varType, varCategory, _staticCount)
      _classScope[varName] = s
      _staticCount++
    }
    if (varCategory== "field"){
      var s = new Symbol(varType, varCategory, _fieldCount)
      _classScope[varName] = s
      _fieldCount++
    }
    if (varCategory== "argument"){
      var s = new Symbol(varType, varCategory, _argCount)
      _methodScope[varName] = s
      _argCount++
    }
    if (varCategory== "var"){
      var s = new Symbol(varType, varCategory, _varCount)
      _methodScope[varName] = s
      _varCount++
    }
  }
  // to know what the category of the variable is
  function catOf (varName : String) : String {

    //first look in the method symbol table
    if (_methodScope.containsKey(varName)) {
      return _methodScope[varName].Category
    }
    //if not found look in the class symbol table
    if (_classScope.containsKey(varName)) {
      return _classScope[varName].Category
    }
    return "NONE"
  }
  // to know what the index of the variable is
  function indexOf (varName : String) : int {
    if (_methodScope.containsKey(varName)) {
      return _methodScope[varName].Index
    }
    if (_classScope.containsKey(varName)) {
      return _classScope[varName].Index
    }
    return -1
  }
  // to know what the type of the variable is
  function typeOf(varName : String) : String {
    if (_methodScope.containsKey(varName)) {
      return _methodScope[varName].Type
    }
    if (_classScope.containsKey(varName)) {
      return _classScope[varName].Type
    }
    return null
  }
  function varCount (category : String) : int{
    if (category == "static"){
      return _staticCount
    }
    if (category == "field"){
      return _fieldCount
    }
    if (category == "argument"){
      return _argCount
    }
    if (category == "var"){
      return _varCount
    }
    else {
      return 0
    }
  }
}



