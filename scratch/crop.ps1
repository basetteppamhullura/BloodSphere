Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\BASETTEPPA M HULLURA\.gemini\antigravity-ide\brain\dd7281f9-5165-4d5f-ac8c-358b569dd1a7\.user_uploaded\media_1789920033328.png"
$destPathPng = "c:\Users\BASETTEPPA M HULLURA\OneDrive\Desktop\Blood donor network\public\bloodnet-hero-bg.png"
$destPathFull = "c:\Users\BASETTEPPA M HULLURA\OneDrive\Desktop\Blood donor network\public\bloodnet-user-upload.png"

# Copy original to public as well
Copy-Item -Path $srcPath -Destination $destPathFull -Force

$img = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Original Image Size: $($img.Width) x $($img.Height)"

# The header is roughly the top 11-12% of the image (or around 55-65 pixels if height is ~500px, or proportionate).
# Let's crop starting from where the hero banner starts.
# Looking at the screenshot, header height is around 68px out of ~375-400px height or similar.

$cropY = [int]($img.Height * 0.125)
$cropHeight = $img.Height - $cropY
$cropWidth = $img.Width

$rect = New-Object System.Drawing.Rectangle(0, $cropY, $cropWidth, $cropHeight)
$bmp = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropWidth, $cropHeight)), $rect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($destPathPng, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Cropped hero saved to $destPathPng ($cropWidth x $cropHeight)"
