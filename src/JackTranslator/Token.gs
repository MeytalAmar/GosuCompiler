package JackTranslator

class Token {
  var _type : String as Type     // "keyword", "symbol", "identifier", etc.
  var _value : String as Value   // "class", "let", "x", "+", etc.

  construct(t : String, v : String) {
    this._type = t
    this._value = v
  }
}