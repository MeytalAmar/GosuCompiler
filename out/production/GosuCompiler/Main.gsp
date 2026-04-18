uses java.nio.file.Files
uses java.nio.charset.StandardCharsets
uses java.io.File
uses Step1.Parser
uses Step1.CodeWriter
uses Step1.CommandType

// 1. עדכני כאן את הנתיב לתיקייה targil1 שיצרת
var inputPath = "C:\\Users\\MeytalAmar\\GosuCompiler\\Tests\\targil1"

var inputEntry = new File(inputPath)
var filesToProcess : List<File>
var outputFile : File

// 2. בדיקה האם הנתיב הוא תיקייה או קובץ בודד
if (inputEntry.isDirectory()) {
  // אם זו תיקייה, ניקח את כל קבצי ה-vm שבתוכה
  filesToProcess = inputEntry.listFiles().toList().where( \ f -> f.Name.endsWith(".vm") )
  // שם קובץ הפלט יהיה כשם התיקייה
  outputFile = new File(inputEntry.Path + "\\" + inputEntry.Name + ".asm")
} else {
  // אם זה קובץ בודד
  filesToProcess = {inputEntry}
  var outputFileName = inputPath.contains(".")
      ? inputPath.substring(0, inputPath.lastIndexOf(".")) + ".asm"
      : inputPath + ".asm"
  outputFile = new File(outputFileName)
}

// 3. יצירת CodeWriter אחד עבור קובץ הפלט המאוחד
var writer = new CodeWriter(outputFile)

// 4. מעבר על כל הקבצים ותרגומם לאותו קובץ
for (file in filesToProcess) {
  print("Processing file: " + file.Name)
  var lines = Files.readAllLines(file.toPath(), StandardCharsets.UTF_8)
  var parser = new Parser(lines)

  while (parser.HasMoreCommands) {
    parser.advance()

    if (parser.CmdType == CommandType.C_ARITHMETIC) {
      writer.writeArithmetic(parser.Arg1)
    } else if (parser.CmdType == CommandType.C_PUSH || parser.CmdType == CommandType.C_POP) {
      writer.writePushPop(parser.CmdType, parser.Arg1, parser.Arg2)
    }
  }
}

writer.close()
print("Done! Combined output created at: " + outputFile.Path)