Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\BASETTEPPA M HULLURA\.gemini\antigravity-ide\brain\dd7281f9-5165-4d5f-ac8c-358b569dd1a7\.user_uploaded\media_1789920033328.png"
$destPath = "c:\Users\BASETTEPPA M HULLURA\OneDrive\Desktop\Blood donor network\public\bloodnet-hero-bg.png"
$destJpgPath = "c:\Users\BASETTEPPA M HULLURA\OneDrive\Desktop\Blood donor network\public\bloodnet-hero-bg.jpg"

$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Original Image Width:" $srcImg.Width "Height:" $srcImg.Height

# Calculate header offset: The top header in the screenshot takes about 11.5% to 12.5% of the total height
$headerHeight = [int]($srcImg.Height * 0.12)
$heroHeight = $srcImg.Height - $headerHeight

Write-Host "Cropping Hero Section from Y =" $headerHeight "Height =" $heroHeight

$rect = New-Object System.Drawing.Rectangle(0, $headerHeight, $srcImg.Width, $heroHeight)
$croppedImg = $srcImg.Clone($rect, $srcImg.PixelFormat)

# Save as PNG & JPG
$croppedImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedImg.Save($destJpgPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$srcImg.Dispose()
$croppedImg.Dispose()

Write-Host "Hero image successfully cropped and saved to public/bloodnet-hero-bg.png & public/bloodnet-hero-bg.jpg!"
