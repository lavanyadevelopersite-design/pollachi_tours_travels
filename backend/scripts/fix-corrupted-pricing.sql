-- Clear corrupted pricing (character-key objects / double-encoded junk without line_items)
SELECT id, title, LEFT(pricing, 120) AS pricing_preview
FROM itineraries
WHERE pricing IS NOT NULL;

UPDATE itineraries
SET pricing = NULL
WHERE pricing IS NOT NULL
  AND pricing NOT LIKE '%line_items%';

SELECT id, title, pricing FROM itineraries WHERE title LIKE '%Ooty%';
SELECT ROW_COUNT() AS last_update_count;
