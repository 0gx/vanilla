<?php
/**
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

namespace Vanilla\EmbeddedContent\Embeds;

use Garden\Schema\Schema;
use Vanilla\EmbeddedContent\AbstractEmbed;
use Vanilla\EmbeddedContent\EmbedUtils;

/**
 * Embed data object for the giphy.
 */
class IFrameEmbed extends AbstractEmbed
{
    const TYPE = "iframe";

    /**
     * This embed considered extended content and only allowed in certain contexts.
     *
     * @return bool
     */
    public static function isExtendedContent(): bool
    {
        return true;
    }

    /**
     * @inheritdoc
     */
    protected function getAllowedTypes(): array
    {
        return [self::TYPE];
    }

    /**
     * @inheritdoc
     */
    public function normalizeData(array $data): array
    {
        $data = EmbedUtils::ensureDimensions($data);
        return $data;
    }

    /**
     * @inheritdoc
     */
    protected function schema(): Schema
    {
        return Schema::parse(["height:s", "width:s"]);
    }

    /**
     * @inheritdoc
     */
    public function renderHtml(): string
    {
        // Ensure the iframe domain is trusted or in knowledge, or skip it
        $url = $this->data["url"] ?? null;
        if (($url && isTrustedDomain($url)) || $this->data["isKnowledge"]) {
            return parent::renderHtml();
        }
        return "";
    }
}
