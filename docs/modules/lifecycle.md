---
title: Module Lifecycle
sidebar_position: 3
---

# Module Lifecycle

Thelia modules have a defined lifecycle with hooks at each stage, allowing you to run custom logic during installation, activation, updates, and deactivation.

## Lifecycle Methods

Override these methods in your main module class:

```php
<?php

declare(strict_types=1);

namespace MyProject;

use Propel\Runtime\Connection\ConnectionInterface;
use Thelia\Module\BaseModule;

final class MyProject extends BaseModule
{
    public const DOMAIN_NAME = 'myproject';

    /**
     * Called when the module is installed for the first time.
     */
    public function install(ConnectionInterface $con = null): void
    {
        // Create database tables
        // Set default configuration
        // Copy assets
    }

    /**
     * Called before activation. Return false to cancel.
     */
    public function preActivation(ConnectionInterface $con = null): bool
    {
        // Check requirements
        // Validate dependencies
        return true; // or false to prevent activation
    }

    /**
     * Called after successful activation.
     */
    public function postActivation(ConnectionInterface $con = null): void
    {
        // Initialize module state
        // Register hooks
        // Create initial data
    }

    /**
     * Called before deactivation. Return false to cancel.
     */
    public function preDeactivation(ConnectionInterface $con = null): bool
    {
        // Check if module can be safely deactivated
        // Warn about dependent modules
        return true; // or false to prevent deactivation
    }

    /**
     * Called after successful deactivation.
     */
    public function postDeactivation(ConnectionInterface $con = null): void
    {
        // Clean up temporary data
        // Unregister services
    }

    /**
     * Called when module version changes (module refresh).
     */
    public function update($currentVersion, $newVersion, ConnectionInterface $con = null): void
    {
        // Run migrations
        // Update configuration
        // Transform data
    }
}
```

## Installation

The `install()` method runs once when the module is first installed.

### Creating Database Tables

```php
public function install(ConnectionInterface $con = null): void
{
    // Method 1: Execute SQL file
    $this->executeSqlFile(
        __DIR__ . '/Config/TheliaMain.sql',
        $con
    );

    // Method 2: Use Propel migrations
    $database = new \Thelia\Install\Database($con);
    $database->insertSql(null, [
        __DIR__ . '/Config/schema.sql',
    ]);
}
```

### Setting Default Configuration

```php
use Thelia\Model\ConfigQuery;

public function install(ConnectionInterface $con = null): void
{
    // Set default configuration values
    if (null === ConfigQuery::read('myproject_api_key')) {
        ConfigQuery::write('myproject_api_key', '');
    }

    if (null === ConfigQuery::read('myproject_enabled')) {
        ConfigQuery::write('myproject_enabled', '1');
    }
}
```

### Creating Required Directories

```php
public function install(ConnectionInterface $con = null): void
{
    $uploadDir = THELIA_LOCAL_DIR . 'media/myproject';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }
}
```

## Activation

### Pre-Activation Checks

Use `preActivation()` to verify requirements before the module activates:

```php
public function preActivation(ConnectionInterface $con = null): bool
{
    // Check PHP extensions
    if (!extension_loaded('curl')) {
        throw new \RuntimeException('This module requires the cURL extension.');
    }

    // Check required modules
    if (!$this->isModuleActive('SomeRequiredModule')) {
        throw new \RuntimeException('Please activate SomeRequiredModule first.');
    }

    // Check configuration
    $apiKey = ConfigQuery::read('external_api_key');
    if (empty($apiKey)) {
        throw new \RuntimeException('Please configure the API key before activation.');
    }

    return true;
}

private function isModuleActive(string $moduleCode): bool
{
    $module = \Thelia\Model\ModuleQuery::create()
        ->filterByCode($moduleCode)
        ->filterByActivate(1)
        ->findOne();

    return $module !== null;
}
```

### Post-Activation Setup

Use `postActivation()` for initialization that requires the module to be active:

```php
public function postActivation(ConnectionInterface $con = null): void
{
    // Register default hook positions
    $this->registerHookPositions();

    // Create initial data
    $this->createDefaultCategories($con);

    // Dispatch activation event
    $this->getDispatcher()->dispatch(
        new ModuleActivatedEvent($this),
        'myproject.activated'
    );
}

private function registerHookPositions(): void
{
    // Register module hooks with specific positions
    $hook = \Thelia\Model\HookQuery::create()
        ->filterByCode('product.additional-info')
        ->findOne();

    if ($hook) {
        $moduleHook = new \Thelia\Model\ModuleHook();
        $moduleHook
            ->setModuleId($this->getModuleId())
            ->setHookId($hook->getId())
            ->setActive(true)
            ->setPosition(1)
            ->save();
    }
}
```

## Deactivation

### Pre-Deactivation Checks

Prevent deactivation if the module is in use:

```php
public function preDeactivation(ConnectionInterface $con = null): bool
{
    // Check for pending orders using this payment module
    $pendingOrders = \Thelia\Model\OrderQuery::create()
        ->filterByPaymentModuleId($this->getModuleId())
        ->filterByStatusId([1, 2]) // Not paid, processing
        ->count();

    if ($pendingOrders > 0) {
        throw new \RuntimeException(
            "Cannot deactivate: {$pendingOrders} pending orders use this payment method."
        );
    }

    return true;
}
```

### Post-Deactivation Cleanup

```php
public function postDeactivation(ConnectionInterface $con = null): void
{
    // Clear module cache
    $cacheDir = THELIA_CACHE_DIR . 'myproject/';
    if (is_dir($cacheDir)) {
        $this->deleteDirectory($cacheDir);
    }

    // Dispatch deactivation event
    $this->getDispatcher()->dispatch(
        new ModuleDeactivatedEvent($this),
        'myproject.deactivated'
    );
}

private function deleteDirectory(string $dir): void
{
    $files = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($files as $file) {
        $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
    }

    rmdir($dir);
}
```

## Updates

The `update()` method handles version migrations:

```php
public function update($currentVersion, $newVersion, ConnectionInterface $con = null): void
{
    // Run migrations based on version
    if (version_compare($currentVersion, '1.1.0', '<')) {
        $this->migrateToV110($con);
    }

    if (version_compare($currentVersion, '1.2.0', '<')) {
        $this->migrateToV120($con);
    }

    if (version_compare($currentVersion, '2.0.0', '<')) {
        $this->migrateToV200($con);
    }
}

private function migrateToV110(ConnectionInterface $con): void
{
    // Add new column
    $con->exec('
        ALTER TABLE my_project_data
        ADD COLUMN new_field VARCHAR(255) DEFAULT NULL
    ');
}

private function migrateToV120(ConnectionInterface $con): void
{
    // Rename configuration key
    $oldValue = ConfigQuery::read('myproject_old_key');
    if ($oldValue !== null) {
        ConfigQuery::write('myproject_new_key', $oldValue);
        ConfigQuery::delete('myproject_old_key');
    }
}

private function migrateToV200(ConnectionInterface $con): void
{
    // Transform data structure
    $con->exec('
        UPDATE my_project_data
        SET new_field = CONCAT(old_field1, "-", old_field2)
        WHERE new_field IS NULL
    ');
}
```

### Version Detection

The current version comes from the database, and the new version from `module.xml`. Thelia compares these when you run:

```bash
php Thelia module:refresh
```

## Uninstallation

Modules don't have a built-in uninstall method. Handle cleanup manually:

```php
// Create a console command for clean uninstallation
class UninstallCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Remove database tables
        $this->dropTables();

        // Remove configuration
        ConfigQuery::delete('myproject_%');

        // Remove uploaded files
        $this->deleteUploadDirectory();

        $output->writeln('Module data cleaned up. You can now remove the module files.');

        return Command::SUCCESS;
    }
}
```

## CLI Commands

Manage modules via command line:

```bash
# List all modules
php Thelia module:list

# Refresh module list (detect new modules, version changes)
php Thelia module:refresh

# Activate a module
php Thelia module:activate MyProject

# Deactivate a module
php Thelia module:deactivate MyProject

# Generate module skeleton
php Thelia module:generate NewModule

# Generate Propel models for a module
php Thelia module:generate:model MyProject

# Generate SQL from schema
php Thelia module:generate:sql MyProject
```

## Best Practices

### Do

- **Keep install idempotent**: Running `install()` twice should not cause errors
- **Use version checks in updates**: Always compare versions before running migrations
- **Log important operations**: Use Thelia's logging for debugging
- **Test activation/deactivation cycles**: Ensure multiple cycles work correctly

### Don't

- **Don't delete user data on deactivation**: Only delete on explicit uninstall
- **Don't assume database state**: Always check before altering
- **Don't block with long operations**: Use background jobs for heavy tasks
- **Don't throw generic exceptions**: Provide helpful error messages
