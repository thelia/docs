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
    public function install(?ConnectionInterface $con = null): void
    {
        // Create database tables
        // Set default configuration
        // Copy assets
    }

    /**
     * Called before activation. Return false to cancel.
     */
    public function preActivation(?ConnectionInterface $con = null): bool
    {
        // Check requirements
        // Validate dependencies
        return true; // or false to prevent activation
    }

    /**
     * Called after successful activation.
     */
    public function postActivation(?ConnectionInterface $con = null): void
    {
        // Initialize module state
        // Register hooks
        // Create initial data
    }

    /**
     * Called before deactivation. Return false to cancel.
     */
    public function preDeactivation(?ConnectionInterface $con = null): bool
    {
        // Check if module can be safely deactivated
        // Warn about dependent modules
        return true; // or false to prevent deactivation
    }

    /**
     * Called after successful deactivation.
     */
    public function postDeactivation(?ConnectionInterface $con = null): void
    {
        // Clean up temporary data
        // Unregister services
    }

    /**
     * Called when module version changes (module refresh).
     */
    public function update($currentVersion, $newVersion, ?ConnectionInterface $con = null): void
    {
        // Run migrations
        // Update configuration
        // Transform data
    }

    /**
     * Called when the module is deleted. This is the cleanup hook.
     */
    public function destroy(?ConnectionInterface $con = null, $deleteModuleData = false): void
    {
        // Drop tables, remove configuration, delete files
    }
}
```

:::note Every method has a default no-op implementation
`BaseModule` provides empty bodies for all lifecycle methods, so you only override the ones you need. `preActivation()` and `preDeactivation()` return `true` by default.
:::

## Installation

The `install()` method runs once when the module is first installed.

### Creating Database Tables

Thelia ships a `Thelia\Core\Install\Database` helper that runs a `.sql` file against the Propel connection. Generate the file from your `Config/schema.xml` with `php Thelia module:generate:sql MyProject`, then load it.

The recommended place to load the install SQL is `postActivation()`, guarded by a config flag so it runs only once. Activation runs inside a database transaction: if `postActivation()` throws, the transaction is rolled back and the module is left deactivated — so the next activation attempt re-runs the same code. The guard makes that re-run safe.

```php
// local/modules/MyProject/MyProject.php
use Propel\Runtime\Connection\ConnectionInterface;
use Thelia\Core\Install\Database;

public function postActivation(?ConnectionInterface $con = null): void
{
    if (!self::getConfigValue('is_initialized', false)) {
        (new Database($con))->insertSql(null, [
            __DIR__ . '/Config/TheliaMain.sql',
        ]);

        self::setConfigValue('is_initialized', true);
    }
}
```

:::caution Pass the connection, not the wrapped PDO
`Database::__construct()` accepts a `ConnectionInterface`, a `\PDO`, or `null` (it pulls the write connection from Propel). Pass `$con` directly — `new Database($con)`. Do not call `$con->getWrappedConnection()` yourself.
:::

:::caution Use the `Thelia\Core\Install` namespace
The legacy `Thelia\Install\Database` class was removed. The current class is `Thelia\Core\Install\Database`. There is no `executeSqlFile()` method on `BaseModule`; use `Database::insertSql()` instead.
:::

### Setting Default Configuration

```php
use Thelia\Model\ConfigQuery;

public function install(?ConnectionInterface $con = null): void
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
public function install(?ConnectionInterface $con = null): void
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
public function preActivation(?ConnectionInterface $con = null): bool
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

Use `postActivation()` for initialization that requires the module to be active. Wrap any one-time seeding (install SQL, default data) in the `is_initialized` guard shown in [Creating Database Tables](#creating-database-tables) so it does not re-run on every activation cycle:

```php
public function postActivation(?ConnectionInterface $con = null): void
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

:::note New in Thelia 3: deactivation tolerates missing source files
A module can stay registered in the database after its source files are removed from disk (for example, dropped from `composer.json` while still active). Thelia 3 stays operational in that situation:

- The deactivation handler (`Thelia\Action\Module`) detects that the module class is missing (`class_exists()` on its full namespace fails) and deactivates the row cleanly, without running the lifecycle hooks. It logs a warning saying the module was deactivated without running its lifecycle hooks. Activation, on the other hand, is refused with a `ModuleException` — you cannot activate code that is not on disk.
- At boot, the schema locator (`Thelia\Core\Propel\Schema\SchemaLocator`) skips the missing module's Propel schema instead of failing, and logs (via `error_log`, since Propel models are not generated yet) a message telling you to run `module:deactivate <Module>` to clean up. The application still boots, so you can run the cleanup.

This is operational robustness, not an API you call — you do not need to handle it in your module code.
:::

### Pre-Deactivation Checks

Prevent deactivation if the module is in use:

```php
public function preDeactivation(?ConnectionInterface $con = null): bool
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
public function postDeactivation(?ConnectionInterface $con = null): void
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
public function update($currentVersion, $newVersion, ?ConnectionInterface $con = null): void
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
        ConfigQuery::create()->filterByName('myproject_old_key')->delete();
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

## Uninstallation (destroy)

When a module is deleted, Thelia calls the `destroy()` method. This is the cleanup hook — use it to drop tables, remove configuration, and delete files the module created.

```php
// local/modules/MyProject/MyProject.php
use Propel\Runtime\ActiveQuery\Criteria;
use Propel\Runtime\Connection\ConnectionInterface;
use Thelia\Model\ConfigQuery;

public function destroy(?ConnectionInterface $con = null, $deleteModuleData = false): void
{
    if (!$deleteModuleData) {
        return;
    }

    // Drop the module's tables
    $con?->exec('DROP TABLE IF EXISTS my_project_data');

    // Remove configuration
    ConfigQuery::create()
        ->filterByName(['myproject_api_key', 'myproject_enabled'], Criteria::IN)
        ->delete();

    // Reset the install guard so a future re-install re-seeds the data
    self::setConfigValue('is_initialized', false);
}
```

The second argument, `$deleteModuleData`, tells you whether the operator asked to drop the module's data. When it is `false`, leave user data untouched and only remove what is safe to recreate.

:::caution `destroy()` runs inside a transaction
The module deletion handler wraps `destroy()` in a database transaction and removes the module files afterwards. If `destroy()` throws, the whole deletion is rolled back. Keep it idempotent (`DROP TABLE IF EXISTS`, guarded deletes) — a module can be deleted more than once if a previous attempt failed.
:::

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

# Run postActivation() for every active module (used after a fresh install)
php Thelia module:post-activate-all

# Apply a module's Propel schema to the database
php Thelia module:schema:apply MyProject
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
