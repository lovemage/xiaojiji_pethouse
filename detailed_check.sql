-- 檢查pets表結構
\d pets;

-- 檢查pets表中images字段的大小分布
SELECT 
    LENGTH(images) as image_data_length,
    COUNT(*) as count_pets
FROM pets 
WHERE images IS NOT NULL
GROUP BY LENGTH(images)
ORDER BY LENGTH(images) DESC;

-- 檢查最大的images字段
SELECT 
    id, 
    breed,
    LENGTH(images) as image_size,
    LEFT(images, 100) as image_preview
FROM pets 
WHERE images IS NOT NULL
ORDER BY LENGTH(images) DESC
LIMIT 10;

-- 檢查重複的寵物（可能導致數據冗餘）
SELECT 
    breed, 
    color, 
    COUNT(*) as duplicate_count
FROM pets 
GROUP BY breed, color
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 檢查gallery_images表大小
SELECT COUNT(*) as total_gallery_images FROM gallery_images;

-- 檢查最近的查詢活動
SELECT 
    query,
    state,
    query_start,
    state_change
FROM pg_stat_activity 
WHERE datname = current_database()
ORDER BY query_start DESC; 