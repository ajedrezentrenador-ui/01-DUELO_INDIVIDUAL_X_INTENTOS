@echo off
chcp 65001 > nul
title PGN-Extract AutoClean - Limpieza Automática
color 0E

echo ========================================
echo    LIMPIADOR AUTOMATICO PGN
echo ========================================
echo.
echo Este script limpiara archivos PGN con las
echo opciones: --nocomments --novars --nomovenumbers --noresults
echo.

REM Verificar que pgn-extract.exe existe
if not exist "pgn-extract.exe" (
    echo ERROR: pgn-extract.exe no encontrado.
    echo.
    echo Descarga pgn-extract de:
    echo https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract/
    echo.
    echo Colocalo en esta misma carpeta.
    echo.
    pause
    exit /b 1
)

echo Archivos PGN en esta carpeta:
echo ----------------------------
dir *.pgn /b 2>nul || echo No hay archivos .pgn
echo.

set /p inputFile="Nombre del archivo de ENTRADA (ej: original.pgn): "
if "%inputFile%"=="" (
    echo No se ingreso nombre de archivo.
    pause
    exit /b 1
)

if not exist "%inputFile%" (
    echo ERROR: El archivo "%inputFile%" no existe.
    echo.
    pause
    exit /b 1
)

set /p outputFile="Nombre del archivo de SALIDA (ej: limpio.pgn): "
if "%outputFile%"=="" (
    set "outputFile=%~n1_LIMPIO.pgn"
    echo Usando nombre por defecto: %outputFile%
)

echo.
echo ========================================
echo         PROCESANDO ARCHIVO
echo ========================================
echo Entrada:  %inputFile%
echo Salida:   %outputFile%
echo.
echo Ejecutando pgn-extract...

pgn-extract.exe --nocomments --novars --nomovenumbers --noresults "%inputFile%" -o "%outputFile%"

if errorlevel 1 (
    echo.
    echo ERROR en el proceso. Codigo: %errorlevel%
) else (
    echo.
    echo ========================================
    echo     LIMPIEZA COMPLETADA EXITOSAMENTE
    echo ========================================
    echo.
    
    REM Mostrar informacion de los archivos
    for %%F in ("%inputFile%") do set inputSize=%%~zF
    for %%F in ("%outputFile%") do set outputSize=%%~zF
    
    set /a inputKB=inputSize/1024
    set /a outputKB=outputSize/1024
    set /a reduction=inputSize-outputSize
    set /a percent=(reduction*100)/inputSize
    
    echo Tamanos:
    echo   Original:  %inputSize% bytes (%inputKB% KB)
    echo   Limpio:    %outputSize% bytes (%outputKB% KB)
    echo   Reduccion: %reduction% bytes (%percent%%%)
    echo.
    
    echo Archivo limpio creado: %outputFile%
)

echo.
pause