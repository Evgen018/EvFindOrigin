# Установка Menu Button для открытия Mini App
# Использование: .\scripts\set-menu-button.ps1 -Url "https://your-domain.vercel.app/mini"

param(
    [Parameter(Mandatory=$true)]
    [string]$Url
)

$token = $env:TELEGRAM_BOT_TOKEN
if (-not $token) {
    Write-Error "Задайте переменную окружения TELEGRAM_BOT_TOKEN"
    exit 1
}

$apiUrl = "https://api.telegram.org/bot$token/setChatMenuButton"
$body = @{
    menu_button = @{
        type = "web_app"
        text = "EvFindOrigin"
        web_app = @{ url = $Url }
    }
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json; charset=utf-8"
if ($response.ok) {
    Write-Host "Menu Button установлен: $Url"
} else {
    Write-Error "Ошибка: $($response.description)"
    exit 1
}
