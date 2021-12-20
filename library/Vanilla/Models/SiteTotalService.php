<?php
/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2021 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

namespace Vanilla\Models;

use Garden\Web\Exception\NotFoundException;
use Vanilla\Contracts\ConfigurationInterface;
use Vanilla\Contracts\Models\SiteTotalProviderInterface;
use Vanilla\Scheduler\SchedulerInterface;

/**
 * Service for generating efficient cached total record counts on a site.
 */
class SiteTotalService {

    public const CONF_EXPENSIVE_COUNT_THRESHOLD = "siteTotals.expensiveCountThreshold";

    /** @var int Threshold where counts start getting very expensive and should be deferred. */
    private const DEFAULT_EXPENSIVE_COUNT_THRESHOLD = 100000;

    /** @var SchedulerInterface */
    private $scheduler;

    /** @var array{string, SiteTotalProviderInterface} */
    private $siteTotalProviders = [];

    /** @var ModelCache */
    private $modelCache;

    /** @var \Gdn_Database */
    private $database;

    /** @var ConfigurationInterface */
    private $config;

    /**
     * DI.
     *
     * @param SchedulerInterface $scheduler
     * @param \Gdn_Database $database
     * @param \Gdn_Cache $cache
     * @param ConfigurationInterface $config
     */
    public function __construct(SchedulerInterface $scheduler, \Gdn_Database $database, \Gdn_Cache $cache, ConfigurationInterface $config) {
        $this->scheduler = $scheduler;
        $this->database = $database;
        $this->modelCache = new ModelCache('siteTotals', $cache);
        $this->config = $config;
    }

    /**
     * Register a provider.
     *
     * @param SiteTotalProviderInterface $provider
     */
    public function registerProvider(SiteTotalProviderInterface $provider) {
        $this->siteTotalProviders[strtolower($provider->getSiteTotalRecordType())] = $provider;
    }

    /**
     * Get the total record count for a particular record type.
     *
     * @param string $recordType
     * @return int
     */
    public function getTotalForType(string $recordType): int {
        $provider = $this->siteTotalProviders[strtolower($recordType)] ?? null;
        if ($provider === null) {
            throw new NotFoundException('RecordType', ['recordType' => $recordType]);
        }

        $cacheOpts = [
            ModelCache::OPT_TTL => 60 * 60, // 1 hour.
        ];
        if ($this->isProviderExpensive($provider)) {
            // Defer the calculation of the cached value until after the request.
            // In the meantime we will have a -1.
            // User interfaces may intepret this to either not show the count or to display some indicator that it is
            // Calculating.
            $cacheOpts[ModelCache::OPT_SCHEDULER] = $this->scheduler;
            $cacheOpts[ModelCache::OPT_DEFAULT] = -1;
        }

        $result = $this->modelCache->getCachedOrHydrate([
            __FUNCTION__,
            'recordType' => $recordType,
        ], function () use ($provider) {
            return $provider->calculateSiteTotalCount();
        }, $cacheOpts);
        return $result;
    }

    /**
     * Determine if the tests have .
     *
     * @param SiteTotalProviderInterface $provider
     * @return bool
     */
    private function isProviderExpensive(SiteTotalProviderInterface $provider): bool {
        $table = $provider->getTableName();
        $estimatedRowCount = $this->modelCache->getCachedOrHydrate([
            __FUNCTION__,
            'table' => $table,
        ], function () use ($table) {
            return $this->database->getEstimatedRowCount($table);
        });

        $threshold = $this->config->get(self::CONF_EXPENSIVE_COUNT_THRESHOLD, self::DEFAULT_EXPENSIVE_COUNT_THRESHOLD);
        return $estimatedRowCount >= $threshold;
    }
}
