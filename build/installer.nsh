!macro customInstall
  DetailPrint "Register botemulator URI Handler"
  DeleteRegKey HKCU "SOFTWARE\Classes\electron-test"
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test" "" "URL:Electron Test"
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell\open" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\electron-test\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend