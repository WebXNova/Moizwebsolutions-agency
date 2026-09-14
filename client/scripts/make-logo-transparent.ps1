# Knock the white JPEG background out of main-logo.jpeg and write a PNG.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$here = Split-Path -Parent $PSScriptRoot
$src = Join-Path $here 'src\assets\images\main-logo.jpeg'
$dest = Join-Path $here 'src\assets\images\main-logo.png'

Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class KnockWhite
{
    public static void Run(string srcPath, string destPath)
    {
        byte[] pixels;
        int w, h, stride;
        using (Bitmap bmp = new Bitmap(srcPath))
        {
            w = bmp.Width; h = bmp.Height;
            BitmapData d = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            stride = d.Stride;
            pixels = new byte[stride * h];
            Marshal.Copy(d.Scan0, pixels, 0, pixels.Length);
            bmp.UnlockBits(d);
        }

        double bgR = 0, bgG = 0, bgB = 0; int n = 0;
        int[][] spots = new int[][] {
            new int[]{ 2, 2 }, new int[]{ w - 8, 2 },
            new int[]{ 2, h - 8 }, new int[]{ w - 8, h - 8 }
        };
        foreach (int[] s in spots)
            for (int dy = 0; dy < 6; dy++)
                for (int dx = 0; dx < 6; dx++)
                {
                    int i = (s[1] + dy) * stride + (s[0] + dx) * 4;
                    bgB += pixels[i]; bgG += pixels[i + 1]; bgR += pixels[i + 2]; n++;
                }
        bgR /= n; bgG /= n; bgB /= n;

        int x0 = w, x1 = -1, y0 = h, y1 = -1;
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            {
                int i = y * stride + x * 4;
                double r = pixels[i + 2], g = pixels[i + 1], b = pixels[i];
                double a = Math.Max((bgR - r) / Math.Max(bgR, 1), Math.Max((bgG - g) / Math.Max(bgG, 1), (bgB - b) / Math.Max(bgB, 1)));
                if (a > 0.04)
                {
                    if (x < x0) x0 = x; if (x > x1) x1 = x;
                    if (y < y0) y0 = y; if (y > y1) y1 = y;
                }
            }

        int pad = 8;
        x0 = Math.Max(0, x0 - pad); y0 = Math.Max(0, y0 - pad);
        x1 = Math.Min(w - 1, x1 + pad); y1 = Math.Min(h - 1, y1 + pad);

        int ow = x1 - x0 + 1, oh = y1 - y0 + 1;
        using (Bitmap outBmp = new Bitmap(ow, oh, PixelFormat.Format32bppArgb))
        {
            BitmapData d = outBmp.LockBits(new Rectangle(0, 0, ow, oh), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            byte[] buf = new byte[d.Stride * oh];
            for (int y = 0; y < oh; y++)
                for (int x = 0; x < ow; x++)
                {
                    int si = (y0 + y) * stride + (x0 + x) * 4;
                    double r = pixels[si + 2], g = pixels[si + 1], b = pixels[si];
                    double a = Math.Max((bgR - r) / Math.Max(bgR, 1), Math.Max((bgG - g) / Math.Max(bgG, 1), (bgB - b) / Math.Max(bgB, 1)));
                    if (a < 0.02) a = 0;
                    if (a > 1) a = 1;
                    int i = y * d.Stride + x * 4;
                    if (a <= 0) { buf[i] = 0; buf[i + 1] = 0; buf[i + 2] = 0; buf[i + 3] = 0; continue; }
                    double cr = bgR + (r - bgR) / a;
                    double cg = bgG + (g - bgG) / a;
                    double cb = bgB + (b - bgB) / a;
                    buf[i] = (byte)Math.Max(0, Math.Min(255, cb));
                    buf[i + 1] = (byte)Math.Max(0, Math.Min(255, cg));
                    buf[i + 2] = (byte)Math.Max(0, Math.Min(255, cr));
                    buf[i + 3] = (byte)Math.Round(a * 255);
                }
            Marshal.Copy(buf, 0, d.Scan0, buf.Length);
            outBmp.UnlockBits(d);
            outBmp.Save(destPath, ImageFormat.Png);
        }
        Console.WriteLine("wrote " + destPath + " (" + ow + "x" + oh + ")");
    }
}
'@ -ReferencedAssemblies System.Drawing

[KnockWhite]::Run($src, $dest)
