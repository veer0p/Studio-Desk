# API End-to-End Test Script
$BASE = "http://127.0.0.1:3001/api/v1"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Test-Endpoint {
    param($Name, $Url, $Method="GET", $Body=$null, $ExpectedStatus=200)
    
    try {
        $params = @{
            Uri = "$BASE$Url"
            Method = $Method
            WebSession = $session
            UseBasicParsing = $true
        }
        if ($Body) { 
            $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        $status = "PASS"
        $httpCode = $ExpectedStatus
        return [PSCustomObject]@{
            Test = $Name
            Endpoint = "$Method $Url"
            HTTP = $httpCode
            Status = $status
            Result = ($response | ConvertTo-Json -Depth 3 -Compress).Substring(0, [Math]::Min(200, ($response | ConvertTo-Json -Depth 3 -Compress).Length))
        }
    } catch {
        $httpCode = $_.Exception.Response.StatusCode.value__
        $status = if ($httpCode -eq $ExpectedStatus) { "PASS (expected error)" } else { "FAIL" }
        return [PSCustomObject]@{
            Test = $Name
            Endpoint = "$Method $Url"
            HTTP = $httpCode
            Status = $status
            Result = $_.Exception.Message.Substring(0, [Math]::Min(200, $_.Exception.Message.Length))
        }
    }
}

Write-Host "`n===== AUTHENTICATION =====" -ForegroundColor Cyan

# Login
Write-Host "`n[1] POST /auth/login" -ForegroundColor Yellow
$loginResp = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body '{"email":"qatest2026@example.com","password":"QaTestPass123!"}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
Write-Host "  Status: $($loginResp.data.user.email) logged in, Studio: $($loginResp.data.studio.name)" -ForegroundColor Green

# /me
Write-Host "`n[2] GET /auth/me" -ForegroundColor Yellow
$me = Test-Endpoint "Auth Me" "/auth/me"
Write-Host "  $($me.Status) - User: $($me.Result)" -ForegroundColor Green

# PATCH /me
Write-Host "`n[3] PATCH /auth/me" -ForegroundColor Yellow
$patchMe = Test-Endpoint "Update Profile" "/auth/me" "PATCH" @{phone="9876543210"; whatsapp="9876543210"}
Write-Host "  $($patchMe.Status)" -ForegroundColor Green

# Forgot password
Write-Host "`n[4] POST /auth/forgot-password" -ForegroundColor Yellow
$forgot = Test-Endpoint "Forgot Password" "/auth/forgot-password" "POST" @{email="qatest2026@example.com"}
Write-Host "  $($forgot.Status)" -ForegroundColor Green

Write-Host "`n===== STUDIO =====" -ForegroundColor Cyan

# Studio profile
Write-Host "`n[5] GET /studio/profile" -ForegroundColor Yellow
$studio = Test-Endpoint "Studio Profile" "/studio/profile"
Write-Host "  $($studio.Status)" -ForegroundColor Green

# Studio storage
Write-Host "`n[6] GET /studio/storage" -ForegroundColor Yellow
$storage = Test-Endpoint "Studio Storage" "/studio/storage"
Write-Host "  $($storage.Status)" -ForegroundColor Green

# Studio onboarding
Write-Host "`n[7] GET /studio/onboarding" -ForegroundColor Yellow
$onboard = Test-Endpoint "Onboarding Status" "/studio/onboarding"
Write-Host "  $($onboard.Status)" -ForegroundColor Green

Write-Host "`n===== CLIENTS =====" -ForegroundColor Cyan

# List clients
Write-Host "`n[8] GET /clients" -ForegroundColor Yellow
$clients = Test-Endpoint "List Clients" "/clients"
Write-Host "  $($clients.Status)" -ForegroundColor Green

# Create client
Write-Host "`n[9] POST /clients" -ForegroundColor Yellow
$clientResp = Invoke-RestMethod -Uri "$BASE/clients" -Method POST -Body '{"full_name":"QA Test Client","email":"qaclient@test.com","phone":"9998887777"}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
$clientId = $clientResp.data.id
Write-Host "  PASS - Created client: $clientId" -ForegroundColor Green

# Get client
Write-Host "`n[10] GET /clients/$clientId" -ForegroundColor Yellow
$getClient = Test-Endpoint "Get Client" "/clients/$clientId"
Write-Host "  $($getClient.Status)" -ForegroundColor Green

# Update client
Write-Host "`n[11] PATCH /clients/$clientId" -ForegroundColor Yellow
$updClient = Test-Endpoint "Update Client" "/clients/$clientId" "PATCH" @{full_name="Updated QA Client"}
Write-Host "  $($updClient.Status)" -ForegroundColor Green

# Delete client
Write-Host "`n[12] DELETE /clients/$clientId" -ForegroundColor Yellow
$delClient = Test-Endpoint "Delete Client" "/clients/$clientId" "DELETE"
Write-Host "  $($delClient.Status)" -ForegroundColor Green

Write-Host "`n===== LEADS =====" -ForegroundColor Cyan

# List leads
Write-Host "`n[13] GET /leads" -ForegroundColor Yellow
$leads = Test-Endpoint "List Leads" "/leads"
Write-Host "  $($leads.Status)" -ForegroundColor Green

# Create lead
Write-Host "`n[14] POST /leads" -ForegroundColor Yellow
$leadResp = Invoke-RestMethod -Uri "$BASE/leads" -Method POST -Body '{"full_name":"QA Test Lead","email":"qalead@test.com","phone":"9998887776","status":"new_lead"}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
$leadId = $leadResp.data.id
Write-Host "  PASS - Created lead: $leadId" -ForegroundColor Green

# Update lead
Write-Host "`n[15] PATCH /leads/$leadId" -ForegroundColor Yellow
$updLead = Test-Endpoint "Update Lead" "/leads/$leadId" "PATCH" @{full_name="Updated QA Lead"; status="contacted"}
Write-Host "  $($updLead.Status)" -ForegroundColor Green

Write-Host "`n===== PACKAGES =====" -ForegroundColor Cyan

# List packages
Write-Host "`n[16] GET /packages" -ForegroundColor Yellow
$pkgs = Test-Endpoint "List Packages" "/packages"
Write-Host "  $($pkgs.Status)" -ForegroundColor Green

# Create package
Write-Host "`n[17] POST /packages" -ForegroundColor Yellow
$pkgResp = Invoke-RestMethod -Uri "$BASE/packages" -Method POST -Body '{"name":"QA Package","event_type":"wedding","description":"Test package","base_price":"10000.00","turnaround_days":30,"deliverables":["Edited Photos","Album"],"line_items":[{"name":"Photography","description":"Full day coverage","unit_price":"8000.00","quantity":"1"},{"name":"Editing","description":"Professional editing","unit_price":"2000.00","quantity":"1"}]}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
$pkgId = $pkgResp.data.id
Write-Host "  PASS - Created package: $pkgId" -ForegroundColor Green

# Update package
Write-Host "`n[18] PATCH /packages/$pkgId" -ForegroundColor Yellow
$updPkg = Test-Endpoint "Update Package" "/packages/$pkgId" "PATCH" @{base_price="12000.00"}
Write-Host "  $($updPkg.Status)" -ForegroundColor Green

# Delete package
Write-Host "`n[19] DELETE /packages/$pkgId" -ForegroundColor Yellow
$delPkg = Test-Endpoint "Delete Package" "/packages/$pkgId" "DELETE"
Write-Host "  $($delPkg.Status)" -ForegroundColor Green

Write-Host "`n===== ADDONS =====" -ForegroundColor Cyan

# List addons
Write-Host "`n[20] GET /addons" -ForegroundColor Yellow
$addons = Test-Endpoint "List Addons" "/addons"
Write-Host "  $($addons.Status)" -ForegroundColor Green

# Create addon
Write-Host "`n[21] POST /addons" -ForegroundColor Yellow
$addonResp = Invoke-RestMethod -Uri "$BASE/addons" -Method POST -Body '{"name":"QA Addon","description":"Test addon","price":"500.00","unit":"flat"}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
$addonId = $addonResp.data.id
Write-Host "  PASS - Created addon: $addonId" -ForegroundColor Green

# Update addon
Write-Host "`n[22] PATCH /addons/$addonId" -ForegroundColor Yellow
$updAddon = Test-Endpoint "Update Addon" "/addons/$addonId" "PATCH" @{price="600.00"}
Write-Host "  $($updAddon.Status)" -ForegroundColor Green

# Delete addon
Write-Host "`n[23] DELETE /addons/$addonId" -ForegroundColor Yellow
$delAddon = Test-Endpoint "Delete Addon" "/addons/$addonId" "DELETE"
Write-Host "  $($delAddon.Status)" -ForegroundColor Green

Write-Host "`n===== BOOKINGS =====" -ForegroundColor Cyan

# List bookings
Write-Host "`n[24] GET /bookings" -ForegroundColor Yellow
$bookings = Test-Endpoint "List Bookings" "/bookings"
Write-Host "  $($bookings.Status)" -ForegroundColor Green

# Create booking
Write-Host "`n[25] POST /bookings" -ForegroundColor Yellow
$bookingResp = Invoke-RestMethod -Uri "$BASE/bookings" -Method POST -Body '{"title":"QA Test Booking","client_id":"9f20e2d8-4622-4147-91f3-4b86948fb223","event_type":"wedding","event_date":"2026-08-15T10:00:00Z","total_amount":25000,"advance_amount":7500,"venue_name":"Test Venue","venue_city":"Vansda"}' -ContentType 'application/json' -WebSession $session -UseBasicParsing
$bookingId = $bookingResp.data.id
Write-Host "  PASS - Created booking: $bookingId" -ForegroundColor Green

# Get booking
Write-Host "`n[26] GET /bookings/$bookingId" -ForegroundColor Yellow
$getBooking = Test-Endpoint "Get Booking" "/bookings/$bookingId"
Write-Host "  $($getBooking.Status)" -ForegroundColor Green

# Update booking
Write-Host "`n[27] PATCH /bookings/$bookingId" -ForegroundColor Yellow
$updBooking = Test-Endpoint "Update Booking" "/bookings/$bookingId" "PATCH" @{title="Updated QA Booking"}
Write-Host "  $($updBooking.Status)" -ForegroundColor Green

# Update booking status
Write-Host "`n[28] PATCH /bookings/$bookingId/status" -ForegroundColor Yellow
$statusBooking = Test-Endpoint "Update Booking Status" "/bookings/$bookingId/status" "PATCH" @{status="booked"}
Write-Host "  $($statusBooking.Status)" -ForegroundColor Green

Write-Host "`n===== DASHBOARD =====" -ForegroundColor Cyan

# Dashboard overview
Write-Host "`n[29] GET /dashboard/overview" -ForegroundColor Yellow
$dashOverview = Test-Endpoint "Dashboard Overview" "/dashboard/overview"
Write-Host "  $($dashOverview.Status)" -ForegroundColor Green

# Dashboard today
Write-Host "`n[30] GET /dashboard/today" -ForegroundColor Yellow
$dashToday = Test-Endpoint "Dashboard Today" "/dashboard/today"
Write-Host "  $($dashToday.Status)" -ForegroundColor Green

Write-Host "`n===== ANALYTICS =====" -ForegroundColor Cyan

# Analytics bookings
Write-Host "`n[31] GET /analytics/bookings" -ForegroundColor Yellow
$analyticsBookings = Test-Endpoint "Analytics Bookings" "/analytics/bookings"
Write-Host "  $($analyticsBookings.Status)" -ForegroundColor Green

# Analytics revenue
Write-Host "`n[32] GET /analytics/revenue" -ForegroundColor Yellow
$analyticsRevenue = Test-Endpoint "Analytics Revenue" "/analytics/revenue"
Write-Host "  $($analyticsRevenue.Status)" -ForegroundColor Green

# Analytics performance
Write-Host "`n[33] GET /analytics/performance" -ForegroundColor Yellow
$analyticsPerformance = Test-Endpoint "Analytics Performance" "/analytics/performance"
Write-Host "  $($analyticsPerformance.Status)" -ForegroundColor Green

Write-Host "`n===== FINANCE =====" -ForegroundColor Cyan

# Finance summary
Write-Host "`n[34] GET /finance/summary" -ForegroundColor Yellow
$finSummary = Test-Endpoint "Finance Summary" "/finance/summary"
Write-Host "  $($finSummary.Status)" -ForegroundColor Green

# Finance outstanding
Write-Host "`n[35] GET /finance/outstanding" -ForegroundColor Yellow
$finOutstanding = Test-Endpoint "Finance Outstanding" "/finance/outstanding"
Write-Host "  $($finOutstanding.Status)" -ForegroundColor Green

Write-Host "`n===== INVOICES =====" -ForegroundColor Cyan

# List invoices
Write-Host "`n[36] GET /invoices" -ForegroundColor Yellow
$invoices = Test-Endpoint "List Invoices" "/invoices"
Write-Host "  $($invoices.Status)" -ForegroundColor Green

Write-Host "`n===== PAYMENTS =====" -ForegroundColor Cyan

# List payments
Write-Host "`n[37] GET /payments" -ForegroundColor Yellow
$payments = Test-Endpoint "List Payments" "/payments"
Write-Host "  $($payments.Status)" -ForegroundColor Green

Write-Host "`n===== GALLERIES =====" -ForegroundColor Cyan

# List galleries
Write-Host "`n[38] GET /galleries" -ForegroundColor Yellow
$galleries = Test-Endpoint "List Galleries" "/galleries"
Write-Host "  $($galleries.Status)" -ForegroundColor Green

Write-Host "`n===== TEAM =====" -ForegroundColor Cyan

# List team
Write-Host "`n[39] GET /team" -ForegroundColor Yellow
$team = Test-Endpoint "List Team" "/team"
Write-Host "  $($team.Status)" -ForegroundColor Green

# Team schedule
Write-Host "`n[40] GET /team/schedule" -ForegroundColor Yellow
$schedule = Test-Endpoint "Team Schedule" "/team/schedule"
Write-Host "  $($schedule.Status)" -ForegroundColor Green

Write-Host "`n===== SETTINGS =====" -ForegroundColor Cyan

# Notifications
Write-Host "`n[41] GET /settings/notifications" -ForegroundColor Yellow
$notifSettings = Test-Endpoint "Notification Settings" "/settings/notifications"
Write-Host "  $($notifSettings.Status)" -ForegroundColor Green

# Integrations
Write-Host "`n[42] GET /settings/integrations" -ForegroundColor Yellow
$integSettings = Test-Endpoint "Integration Settings" "/settings/integrations"
Write-Host "  $($integSettings.Status)" -ForegroundColor Green

# Billing
Write-Host "`n[43] GET /settings/billing" -ForegroundColor Yellow
$billingSettings = Test-Endpoint "Billing Settings" "/settings/billing"
Write-Host "  $($billingSettings.Status)" -ForegroundColor Green

Write-Host "`n===== CONTRACTS =====" -ForegroundColor Cyan

# List contracts
Write-Host "`n[44] GET /contracts" -ForegroundColor Yellow
$contracts = Test-Endpoint "List Contracts" "/contracts"
Write-Host "  $($contracts.Status)" -ForegroundColor Green

Write-Host "`n===== PROPOSALS =====" -ForegroundColor Cyan

# List proposals
Write-Host "`n[45] GET /proposals" -ForegroundColor Yellow
$proposals = Test-Endpoint "List Proposals" "/proposals"
Write-Host "  $($proposals.Status)" -ForegroundColor Green

Write-Host "`n===== CONTRACT TEMPLATES =====" -ForegroundColor Cyan

# List contract templates
Write-Host "`n[46] GET /contract-templates" -ForegroundColor Yellow
$contractTemplates = Test-Endpoint "Contract Templates" "/contract-templates"
Write-Host "  $($contractTemplates.Status)" -ForegroundColor Green

Write-Host "`n===== EDGE CASES =====" -ForegroundColor Cyan

# Unauthorized access
Write-Host "`n[47] GET /clients (no auth)" -ForegroundColor Yellow
$noAuthSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    Invoke-RestMethod -Uri "$BASE/clients" -WebSession $noAuthSession -UseBasicParsing -ErrorAction Stop
    Write-Host "  FAIL - Should have returned 401" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $status = if ($code -eq 401) { "PASS" } else { "FAIL (got $code)" }
    Write-Host "  $status - HTTP $code" -ForegroundColor Green
}

# Invalid login
Write-Host "`n[48] POST /auth/login (wrong password)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body '{"email":"qatest2026@example.com","password":"wrongpassword"}' -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
    Write-Host "  FAIL - Should have returned 401" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $status = if ($code -eq 401) { "PASS" } else { "FAIL (got $code)" }
    Write-Host "  $status - HTTP $code" -ForegroundColor Green
}

# Invalid email login
Write-Host "`n[49] POST /auth/login (wrong email)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body '{"email":"nonexistent@example.com","password":"password"}' -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
    Write-Host "  FAIL - Should have returned 401" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $status = if ($code -eq 401) { "PASS" } else { "FAIL (got $code)" }
    Write-Host "  $status - HTTP $code" -ForegroundColor Green
}

Write-Host "`n===== ALL TESTS COMPLETE =====" -ForegroundColor Cyan
