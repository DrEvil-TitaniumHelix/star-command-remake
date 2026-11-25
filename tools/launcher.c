#define UNICODE
#define _UNICODE
#include <windows.h>
#include <wchar.h>
int WINAPI wWinMain(HINSTANCE instance, HINSTANCE prev, LPWSTR args, int show) {
    wchar_t root[32768], shell[32768], command[32768];
    STARTUPINFOW startup = {sizeof(startup)};
    PROCESS_INFORMATION process;
    if (!GetModuleFileNameW(NULL,root,32768)) return 1;
    wchar_t *slash=wcsrchr(root,L'\\'); if (!slash) return 1; *slash=0;
    if (!GetSystemDirectoryW(shell,32000) || wcscat_s(shell,32768,L"\\WindowsPowerShell\\v1.0\\powershell.exe")) return 1;
    if (swprintf_s(command,32768,L"\"%s\" -NoProfile -ExecutionPolicy Bypass -File \"%s\\tools\\serve.ps1\" %s",shell,root,*args?args:L"--launch")<0) return 1;
    if (!CreateProcessW(shell,command,NULL,NULL,FALSE,CREATE_NO_WINDOW,NULL,root,&startup,&process)) return 9009;
    DWORD code=1;
    CloseHandle(process.hThread);
    WaitForSingleObject(process.hProcess,INFINITE);
    GetExitCodeProcess(process.hProcess,&code);CloseHandle(process.hProcess);
    return code;
}
