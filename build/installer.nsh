!macro customInit
    ; Attempt to uninstall older, squirrel-based app.
    DetailPrint "Uninstall Squirrel-based version of application"
    IfFileExists "$INSTDIR\..\..\electrontest\Update.exe" 0 SquirrelNotFound
    nsExec::Exec '"$INSTDIR\..\..\electrontest\Update.exe" --uninstall -s'
    SquirrelNotFound:
!macroend

!macro customInstall
    DetailPrint "Register electron-test URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\electron-test"
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test" "" "URL:Electron Test"
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test" "URL Protocol" ""
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell\open" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend

!macro customUninstall
    DetailPrint "Unregister electron-test URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\electron-test"
!macroend
