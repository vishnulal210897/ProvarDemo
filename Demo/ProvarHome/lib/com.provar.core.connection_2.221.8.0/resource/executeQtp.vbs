Option Explicit
Dim qtApp, Test_Path

WScript.StdOut.Write "Creating QuickTest.Application ..."
WScript.StdOut.WriteBlankLines(1)
Set qtApp = CreateObject("QuickTest.Application")

WScript.StdOut.Write "Launching ..."
WScript.StdOut.WriteBlankLines(1)
qtApp.Launch
qtApp.Visible = False

Test_Path = WScript.Arguments(0)
WScript.StdOut.Write "Opening test " & Test_Path & "..."
WScript.StdOut.WriteBlankLines(1)
qtApp.Open Test_Path,True

Dim qtTest
WScript.StdOut.Write "Running test ..."
WScript.StdOut.WriteBlankLines(1)
Set qtTest = qtApp.Test
qtTest.Run
WScript.StdOut.Write "Done ..."
WScript.StdOut.WriteBlankLines(1)
qtTest.Close
qtApp.Quit
Set qtTest = Nothing
Set qtApp = Nothing