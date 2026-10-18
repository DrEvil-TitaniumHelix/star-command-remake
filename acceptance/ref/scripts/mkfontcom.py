#!/usr/bin/env python3
"""mkfontcom.py OUT.COM : tiny DOS program that sets SCREEN 1 (BIOS mode 4) and writes all 256
character codes with INT 10h AH=09h (attribute 3, no control-code interpretation), 32 per text row
starting at row 0, then waits for a key. A capture of it gives the 8x8 graphics-mode font the
BIOS (here: DOSBox-X machine=ega, INT 43h) supplies to QuickBASIC's PRINT in SCREEN 1."""
import sys

code = bytes([
    0xB8, 0x04, 0x00,        # mov ax,0004h
    0xCD, 0x10,              # int 10h
    0x31, 0xF6,              # xor si,si
    # L:
    0x89, 0xF0,              # mov ax,si
    0x88, 0xC2,              # mov dl,al
    0x80, 0xE2, 0x1F,        # and dl,1Fh        col = c % 32
    0x89, 0xF0,              # mov ax,si
    0xB1, 0x05,              # mov cl,5
    0xD3, 0xE8,              # shr ax,cl
    0x88, 0xC6,              # mov dh,al          row = c / 32
    0xB7, 0x00,              # mov bh,0
    0xB4, 0x02,              # mov ah,2
    0xCD, 0x10,              # int 10h            set cursor
    0x89, 0xF0,              # mov ax,si
    0xB4, 0x09,              # mov ah,9
    0xBB, 0x03, 0x00,        # mov bx,0003h
    0xB9, 0x01, 0x00,        # mov cx,1
    0xCD, 0x10,              # int 10h            write char
    0x46,                    # inc si
    0x81, 0xFE, 0x00, 0x01,  # cmp si,0100h
])
loop_start = 7
jb = bytes([0x72, (loop_start - (len(code) + 2)) & 0xFF])  # jb L
tail = bytes([
    0x31, 0xC0, 0xCD, 0x16,  # xor ax,ax ; int 16h (wait key)
    0xB8, 0x03, 0x00, 0xCD, 0x10,  # mode 3
    0xCD, 0x20,              # int 20h
])
open(sys.argv[1], 'wb').write(code + jb + tail)
