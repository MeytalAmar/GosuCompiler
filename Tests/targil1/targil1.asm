@256
D=A
@SP
M=D
@280
D=A
@ARG
M=D
@290
D=A
@LCL
M=D

// C_PUSH constant 2
@2
D=A
@SP
A=M
M=D
@SP
M=M+1
// C_POP argument 2
@2
D=A
@ARG
D=M+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
// C_PUSH constant 8
@8
D=A
@SP
A=M
M=D
@SP
M=M+1
// neg
@SP
A=M-1
M=-M
// C_POP local 4
@4
D=A
@LCL
D=M+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
// C_PUSH constant 7
@7
D=A
@SP
A=M
M=D
@SP
M=M+1
// C_POP temp 0
@SP
AM=M-1
D=M
@5
M=D
// C_PUSH constant 10
@10
D=A
@SP
A=M
M=D
@SP
M=M+1
// C_PUSH local 4
@4
D=A
@LCL
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
// C_PUSH temp 0
@5
D=M
@SP
A=M
M=D
@SP
M=M+1
// compare3
@SP
AM=M-1
D=M
@SP
A=M-1
D=M-D
@COMP3_FALSE_0
D;JGE
@SP
AM=M-1
D=M
@SP
A=M-1
D=M-D
@COMP3_FALSE_0
D;JGE
@SP
A=M-1
M=1
@COMP3_END_0
0;JMP
(COMP3_FALSE_0)
@SP
A=M-1
M=0
(COMP3_END_0)
// C_POP argument 3
@3
D=A
@ARG
D=M+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
// C_PUSH constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1
// C_PUSH static 3
@targil1.3
D=M
@SP
A=M
M=D
@SP
M=M+1
// add
@SP
AM=M-1
D=M
A=A-1
M=D+M
// C_POP static 3
@SP
AM=M-1
D=M
@targil1.3
M=D
