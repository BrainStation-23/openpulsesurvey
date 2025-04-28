# Enhanced Supabase Schema Diff Script
# This script compares schemas between two Supabase databases and generates migration scripts

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-Command($CommandName) {
    return [bool](Get-Command -Name $CommandName -ErrorAction SilentlyContinue)
}

function Test-DatabaseConnection($ConnectionString, $DatabaseType) {
    Write-Host "Testing connection to $DatabaseType database..." -NoNewline
    try {
        $output = psql $ConnectionString -c "\conninfo" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green " Success!"
            return $true
        } else {
            Write-ColorOutput Red " Failed!"
            Write-ColorOutput Red "Error: $output"
            return $false
        }
    } catch {
        Write-ColorOutput Red " Failed!"
        Write-ColorOutput Red "Error: $_"
        return $false
    }
}

function Get-DatabaseObjects($ConnectionString, $SchemaName = "public") {
    $objects = @{
        "tables" = @();
        "functions" = @();
        "triggers" = @();
    }
    
    try {
        # Get tables
        $result = psql $ConnectionString -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = '$SchemaName' AND table_type = 'BASE TABLE' ORDER BY table_name;" 2>$null
        $objects.tables = $result -replace '\s+', '' | Where-Object { $_ }
        
        # Get functions
        $result = psql $ConnectionString -t -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = '$SchemaName' ORDER BY routine_name;" 2>$null
        $objects.functions = $result -replace '\s+', '' | Where-Object { $_ }
        
        # Get triggers
        $result = psql $ConnectionString -t -c "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = '$SchemaName' ORDER BY trigger_name;" 2>$null
        $objects.triggers = $result -replace '\s+', '' | Where-Object { $_ }
        
        return $objects
    } catch {
        Write-ColorOutput Red "Error fetching database objects: $_"
        return $objects
    }
}

function Compare-DatabaseObjects($prodObjects, $devObjects) {
    $comparison = @{
        "tables" = @{
            "added" = @();
            "removed" = @();
        };
        "functions" = @{
            "added" = @();
            "removed" = @();
        };
        "triggers" = @{
            "added" = @();
            "removed" = @();
        };
    }
    
    # Compare tables
    $comparison.tables.added = $devObjects.tables | Where-Object { $prodObjects.tables -notcontains $_ }
    $comparison.tables.removed = $prodObjects.tables | Where-Object { $devObjects.tables -notcontains $_ }
    
    # Compare functions
    $comparison.functions.added = $devObjects.functions | Where-Object { $prodObjects.functions -notcontains $_ }
    $comparison.functions.removed = $prodObjects.functions | Where-Object { $devObjects.functions -notcontains $_ }
    
    # Compare triggers
    $comparison.triggers.added = $devObjects.triggers | Where-Object { $prodObjects.triggers -notcontains $_ }
    $comparison.triggers.removed = $prodObjects.triggers | Where-Object { $devObjects.triggers -notcontains $_ }
    
    return $comparison
}

function Display-ObjectComparison($comparison) {
    Write-ColorOutput Cyan "=== DATABASE OBJECTS COMPARISON (public schema) ==="
    Write-Host ""
    
    # Tables
    Write-Host "TABLES:"
    if ($comparison.tables.added.Count -gt 0) {
        Write-ColorOutput Green "  Added ($($comparison.tables.added.Count)):"
        foreach ($item in $comparison.tables.added) {
            Write-ColorOutput Green "    + $item"
        }
    }
    if ($comparison.tables.removed.Count -gt 0) {
        Write-ColorOutput Red "  Removed ($($comparison.tables.removed.Count)):"
        foreach ($item in $comparison.tables.removed) {
            Write-ColorOutput Red "    - $item"
        }
    }
    if ($comparison.tables.added.Count -eq 0 -and $comparison.tables.removed.Count -eq 0) {
        Write-Host "  No changes"
    }
    Write-Host ""
    
    # Functions
    Write-Host "FUNCTIONS:"
    if ($comparison.functions.added.Count -gt 0) {
        Write-ColorOutput Green "  Added ($($comparison.functions.added.Count)):"
        foreach ($item in $comparison.functions.added) {
            Write-ColorOutput Green "    + $item"
        }
    }
    if ($comparison.functions.removed.Count -gt 0) {
        Write-ColorOutput Red "  Removed ($($comparison.functions.removed.Count)):"
        foreach ($item in $comparison.functions.removed) {
            Write-ColorOutput Red "    - $item"
        }
    }
    if ($comparison.functions.added.Count -eq 0 -and $comparison.functions.removed.Count -eq 0) {
        Write-Host "  No changes"
    }
    Write-Host ""
    
    # Triggers
    Write-Host "TRIGGERS:"
    if ($comparison.triggers.added.Count -gt 0) {
        Write-ColorOutput Green "  Added ($($comparison.triggers.added.Count)):"
        foreach ($item in $comparison.triggers.added) {
            Write-ColorOutput Green "    + $item"
        }
    }
    if ($comparison.triggers.removed.Count -gt 0) {
        Write-ColorOutput Red "  Removed ($($comparison.triggers.removed.Count)):"
        foreach ($item in $comparison.triggers.removed) {
            Write-ColorOutput Red "    - $item"
        }
    }
    if ($comparison.triggers.added.Count -eq 0 -and $comparison.triggers.removed.Count -eq 0) {
        Write-Host "  No changes"
    }

    Write-Host ""
}

# Clear the screen for better visibility
Clear-Host

Write-ColorOutput Cyan "===== SUPABASE SCHEMA DIFF TOOL ====="
Write-Host ""

# Step 0: Check for required dependencies
Write-ColorOutput Cyan "Checking for required dependencies..."
Write-Host ""

$requiredTools = @(
    @{Name = "psql"; Description = "PostgreSQL CLI client"; InstallCmd = "Please install PostgreSQL from https://www.postgresql.org/download/"},
    @{Name = "pip"; Description = "Python package manager"; InstallCmd = "Please install Python from https://www.python.org/downloads/"},
    @{Name = "migra"; Description = "Schema diff tool"; InstallCmd = "pip install migra"}
)

$allDependenciesInstalled = $true
foreach ($tool in $requiredTools) {
    $installed = Test-Command $tool.Name
    if ($installed) {
        Write-Host "[$([char]0x2713)] $($tool.Name) - $($tool.Description)" -ForegroundColor Green
    } else {
        Write-Host "[X] $($tool.Name) - $($tool.Description)" -ForegroundColor Red
        Write-Host "    To install: $($tool.InstallCmd)" -ForegroundColor Yellow
        $allDependenciesInstalled = $false
    }
}

Write-Host ""
if (-not $allDependenciesInstalled) {
    Write-ColorOutput Yellow "One or more dependencies are missing."
    $installChoice = Read-Host "Would you like to attempt to install the missing tools? (y/n)"
    
    if ($installChoice -eq "y") {
        foreach ($tool in $requiredTools) {
            if (-not (Test-Command $tool.Name)) {
                if ($tool.Name -eq "migra") {
                    Write-Host "Installing migra..." -NoNewline
                    try {
                        $output = pip install migra 2>&1
                        if (Test-Command "migra") {
                            Write-ColorOutput Green " Success!"
                        } else {
                            Write-ColorOutput Red " Failed!"
                            Write-Host "Please install manually using: $($tool.InstallCmd)"
                        }
                    } catch {
                        Write-ColorOutput Red " Failed!"
                        Write-Host "Please install manually using: $($tool.InstallCmd)"
                    }
                } else {
                    Write-ColorOutput Yellow "Cannot automatically install $($tool.Name)."
                    Write-Host "Please install manually: $($tool.InstallCmd)"
                }
            }
        }
        
        # Recheck dependencies
        $allDependenciesInstalled = $true
        foreach ($tool in $requiredTools) {
            if (-not (Test-Command $tool.Name)) {
                $allDependenciesInstalled = $false
                break
            }
        }
    }
    
    if (-not $allDependenciesInstalled) {
        Write-ColorOutput Red "Missing dependencies. Please install the required tools before running this script."
        exit
    }
}

Write-ColorOutput Green "All dependencies are installed!"
Write-Host ""

# Step 1: Ask for Production DB URL
$ProductionDB = Read-Host "Enter PRODUCTION database URL"
if (-not (Test-DatabaseConnection $ProductionDB "Production")) {
    exit
}

# Step 2: Ask for Development DB URL
$DevelopmentDB = Read-Host "Enter DEVELOPMENT database URL"
if (-not (Test-DatabaseConnection $DevelopmentDB "Development")) {
    exit
}

Write-Host ""
Write-ColorOutput Green "Both databases connected successfully!"
Write-Host ""

# Step 3: Use public schema by default but ask for customization
$SchemaName = "public"
$SchemaOption = "--schema=$SchemaName"  # FIX: Changed from "--schema $SchemaName" to "--schema=$SchemaName"

$customizeSchema = Read-Host "Use public schema for diff? (Default: y) [y/n]"
if ($customizeSchema -eq "n") {
    $SchemaName = Read-Host "Enter schema name to use (e.g., auth, storage)"
    $SchemaOption = "--schema=$SchemaName"  # FIX: Changed from "--schema $SchemaName" to "--schema=$SchemaName"
}

# Step 4: Fetch and compare database objects
Write-Host ""
Write-ColorOutput Cyan "Comparing database objects in $SchemaName schema..."
$prodObjects = Get-DatabaseObjects $ProductionDB $SchemaName
$devObjects = Get-DatabaseObjects $DevelopmentDB $SchemaName
$objectComparison = Compare-DatabaseObjects $prodObjects $devObjects

# Display the comparison
Write-Host ""
Display-ObjectComparison $objectComparison

# Step 5: Confirm Proceed
Write-Host ""
Write-ColorOutput Cyan "=== CONFIGURATION SUMMARY ==="
Write-Host "Production DB: $ProductionDB"
Write-Host "Development DB: $DevelopmentDB"
Write-Host "Schema to diff: $SchemaName"

Write-Host ""
$confirm = Read-Host "Proceed with schema diff? (y/n)"
if ($confirm -ne "y") {
    Write-ColorOutput Yellow "Operation aborted by user."
    exit
}

# Step 6: Generate the diff
Write-Host ""
Write-ColorOutput Cyan "Generating schema diff..."

# Show a simple progress animation
$spinner = @('|', '/', '-', '\')
$spinnerPos = 0

# FIX: Modified migra command execution to properly handle arguments and quotes
$migraCommand = "migra --unsafe $SchemaOption `"$ProductionDB`" `"$DevelopmentDB`""
Write-Host "Executing: $migraCommand" -ForegroundColor DarkGray

$job = Start-Job -ScriptBlock {
    param($command)
    Invoke-Expression $command
} -ArgumentList $migraCommand

# Display spinner while job is running
while ($job.State -eq "Running") {
    Write-Host "`rGenerating diff $($spinner[$spinnerPos])" -NoNewline
    $spinnerPos = ($spinnerPos + 1) % 4
    Start-Sleep -Milliseconds 100
}

$diffResult = Receive-Job -Job $job
Remove-Job -Job $job

Write-Host "`rGenerating diff... Done!     "

# Step 7: Save or Show Diff
$diffHasChanges = $diffResult -and $diffResult.Trim().Length -gt 0

if (-not $diffHasChanges) {
    Write-ColorOutput Green "No schema differences found in SQL between the databases."
    exit
}

Write-Host ""
$SaveDiff = Read-Host "Do you want to save the diff into a file? (y/n)"

if ($SaveDiff -eq "y") {
    $customFileName = Read-Host "Enter output file name (without extension, or press Enter for default)"
    if ($customFileName -eq "") {
        $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $OutputFile = "schema_diff_$Timestamp.sql"
    } else {
        $OutputFile = "$customFileName.sql"
    }
    
    $diffResult | Out-File -FilePath $OutputFile -Encoding utf8
    Write-ColorOutput Green "Diff saved to $OutputFile."
    
    # Step 8: Apply migration?
    Write-Host ""
    Write-Host "Where would you like to apply the migration?"
    Write-Host "[1] Production database"
    Write-Host "[2] Development database"
    Write-Host "[3] Don't apply now"
    
    $migrationTarget = Read-Host "Enter your choice (1-3)"
    
    switch ($migrationTarget) {
        "1" {
            Write-ColorOutput Yellow "Applying migration to PRODUCTION database..."
            psql "$ProductionDB" -f "$OutputFile"
            Write-ColorOutput Green "Migration applied to production database."
        }
        "2" {
            Write-ColorOutput Yellow "Applying migration to DEVELOPMENT database..."
            psql "$DevelopmentDB" -f "$OutputFile"
            Write-ColorOutput Green "Migration applied to development database."
        }
        default {
            Write-ColorOutput Yellow "No migration applied. You can manually apply later with:"
            Write-Host "  To apply to PRODUCTION:  psql `"$ProductionDB`" -f `"$OutputFile`""
            Write-Host "  To apply to DEVELOPMENT: psql `"$DevelopmentDB`" -f `"$OutputFile`""
        }
    }
} else {
    # Just display the diff to console
    Write-Host ""
    Write-ColorOutput Cyan "=== SCHEMA DIFFERENCES ==="
    Write-Host ""
    Write-Output $diffResult
}

Write-Host ""
Write-ColorOutput Green "Schema diff operation completed successfully."