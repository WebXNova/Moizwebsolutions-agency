# Derives the web-ready brand assets from the supplied master logo file.
#
# The master is a phone screenshot (739x1600 JPEG, no alpha) with black
# letterbox bars above and below a light studio panel. This script:
#   1. finds the content band, discarding the letterbox bars
#   2. samples the flat panel background
#   3. tight-crops to the artwork
#   4. unpremultiplies the panel background out to an alpha channel, keeping
#      the original hues and the soft drop shadow intact
#   5. writes the full lockup and the monogram-only sub-lockup as PNGs
#
# The master file is never modified. Re-run this after replacing the master.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File client/scripts/prepare-brand-assets.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$src = Join-Path $root 'client\src\components\logo and animation\mws logo.jpeg.jpeg'
$outDir = Join-Path $root 'client\public\assets'

Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoPrep
{
    public static byte[] Pixels;
    public static int W, H, Stride;
    public static double BgR, BgG, BgB;

    public static void Load(string path)
    {
        using (Bitmap bmp = new Bitmap(path))
        {
            W = bmp.Width; H = bmp.Height;
            BitmapData d = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            Stride = d.Stride;
            Pixels = new byte[Stride * H];
            Marshal.Copy(d.Scan0, Pixels, 0, Pixels.Length);
            bmp.UnlockBits(d);
        }
    }

    static void Get(int x, int y, out double r, out double g, out double b)
    {
        int i = y * Stride + x * 4;
        b = Pixels[i]; g = Pixels[i + 1]; r = Pixels[i + 2];
    }

    public static int[] ContentRows()
    {
        int top = -1, bottom = -1;
        for (int y = 0; y < H; y++)
        {
            double sum = 0;
            for (int x = 0; x < W; x += 4)
            {
                double r, g, b; Get(x, y, out r, out g, out b);
                sum += (r + g + b) / 3.0;
            }
            if (sum / (W / 4) > 60) { if (top < 0) top = y; bottom = y; }
        }
        return new int[] { top, bottom };
    }

    public static void SampleBackground(int top, int bottom)
    {
        double r = 0, g = 0, b = 0; int n = 0;
        int[][] spots = new int[][] {
            new int[]{ 4, top + 4 }, new int[]{ W - 20, top + 4 },
            new int[]{ 4, bottom - 20 }, new int[]{ W - 20, bottom - 20 }
        };
        foreach (int[] s in spots)
            for (int dy = 0; dy < 14; dy++)
                for (int dx = 0; dx < 14; dx++)
                {
                    double pr, pg, pb; Get(s[0] + dx, s[1] + dy, out pr, out pg, out pb);
                    r += pr; g += pg; b += pb; n++;
                }
        BgR = r / n; BgG = g / n; BgB = b / n;
    }

    static bool IsInk(int x, int y, double tol)
    {
        double r, g, b; Get(x, y, out r, out g, out b);
        double d = Math.Max(Math.Abs(BgR - r), Math.Max(Math.Abs(BgG - g), Math.Abs(BgB - b)));
        return d > tol;
    }

    public static int[] InkBounds(int top, int bottom, double tol)
    {
        int x0 = W, x1 = -1, y0 = bottom, y1 = -1;
        for (int y = top; y <= bottom; y++)
            for (int x = 0; x < W; x++)
                if (IsInk(x, y, tol))
                {
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                }
        return new int[] { x0, y0, x1, y1 };
    }

    public static int[] ColumnInk(int x0, int y0, int x1, int y1, double tol)
    {
        int[] cols = new int[x1 - x0 + 1];
        for (int x = x0; x <= x1; x++)
        {
            int c = 0;
            for (int y = y0; y <= y1; y++) if (IsInk(x, y, tol)) c++;
            cols[x - x0] = c;
        }
        return cols;
    }

    public static void SaveTransparent(string path, int x0, int y0, int x1, int y1)
    {
        int w = x1 - x0 + 1, h = y1 - y0 + 1;
        using (Bitmap outBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
        {
            BitmapData d = outBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            byte[] buf = new byte[d.Stride * h];

            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    double r, g, b; Get(x0 + x, y0 + y, out r, out g, out b);
                    double a = Math.Max((BgR - r) / BgR, Math.Max((BgG - g) / BgG, (BgB - b) / BgB));
                    if (a < 0.014) a = 0;
                    if (a > 1) a = 1;

                    int i = y * d.Stride + x * 4;
                    if (a <= 0) { buf[i] = 0; buf[i + 1] = 0; buf[i + 2] = 0; buf[i + 3] = 0; continue; }

                    double cr = BgR + (r - BgR) / a;
                    double cg = BgG + (g - BgG) / a;
                    double cb = BgB + (b - BgB) / a;

                    buf[i] = (byte)Math.Max(0, Math.Min(255, cb));
                    buf[i + 1] = (byte)Math.Max(0, Math.Min(255, cg));
                    buf[i + 2] = (byte)Math.Max(0, Math.Min(255, cr));
                    buf[i + 3] = (byte)Math.Round(a * 255);
                }

            Marshal.Copy(buf, 0, d.Scan0, buf.Length);
            outBmp.UnlockBits(d);
            outBmp.Save(path, ImageFormat.Png);
        }
    }
}
'@ -ReferencedAssemblies System.Drawing

[LogoPrep]::Load($src)
"source            : $([LogoPrep]::W) x $([LogoPrep]::H)"

$rows = [LogoPrep]::ContentRows()
"content band rows : $($rows[0]) .. $($rows[1])"

[LogoPrep]::SampleBackground($rows[0], $rows[1])
"panel background  : rgb($([int][LogoPrep]::BgR), $([int][LogoPrep]::BgG), $([int][LogoPrep]::BgB))"

$b = [LogoPrep]::InkBounds($rows[0], $rows[1], 16)
"artwork bbox      : x $($b[0])..$($b[2])  y $($b[1])..$($b[3])  = $($b[2]-$b[0]+1) x $($b[3]-$b[1]+1)"

$cols = [LogoPrep]::ColumnInk($b[0], $b[1], $b[2], $b[3], 16)
$boxW = $cols.Length
$minRun = [Math]::Max(4, [int]($boxW * 0.012))
$gapStart = -1; $runStart = 0; $run = 0
for ($i = [int]($boxW * 0.18); $i -lt $boxW; $i++) {
  if ($cols[$i] -le 1) { if ($run -eq 0) { $runStart = $i }; $run++ }
  else {
    if ($run -ge $minRun) { $gapStart = $runStart; break }
    $run = 0
  }
}
"monogram gap col  : $gapStart (min run $minRun)"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

[LogoPrep]::SaveTransparent((Join-Path $outDir 'mws-logo.png'), $b[0], $b[1], $b[2], $b[3])
"wrote lockup      : $($b[2]-$b[0]+1) x $($b[3]-$b[1]+1)  -> mws-logo.png"

if ($gapStart -gt 0) {
  $mx1 = $b[0] + $gapStart - 1
  [LogoPrep]::SaveTransparent((Join-Path $outDir 'mws-monogram.png'), $b[0], $b[1], $mx1, $b[3])
  "wrote monogram    : $($mx1-$b[0]+1) x $($b[3]-$b[1]+1)  -> mws-monogram.png"
} else {
  "monogram gap not found - monogram not written"
}
