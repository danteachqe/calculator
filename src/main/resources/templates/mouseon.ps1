Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    public static extern bool GetCursorPos(out POINT lpPoint);

    public struct POINT {
        public int X;
        public int Y;
    }
}
'@

while ($true) {
    $point = New-Object Mouse+POINT
    [Mouse]::GetCursorPos([ref]$point)

    $randomDirection = Get-Random -Count 1 -InputObject @(0, 1, 2, 3)
    switch ($randomDirection) {
        0 { $point.X += 1 }  # Move right
        1 { $point.X -= 1 }  # Move left
        2 { $point.Y += 1 }  # Move up
        3 { $point.Y -= 1 }  # Move down
    }

    [Mouse]::SetCursorPos($point.X, $point.Y)
    Start-Sleep -Milliseconds 500
}
