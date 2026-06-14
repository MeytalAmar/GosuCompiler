package JackTranslator

class Symbol {

  public var Type : String
  public var Category : String
  public var Index : Integer

  construct(type : String, category : String, index : Integer){
    this.Type = type
    this.Category = category
    this.Index = index
  }
}