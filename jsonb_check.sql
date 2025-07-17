-- 檢查JSONB images字段的大小
SELECT 
    id,
    breed,
    octet_length(images::text) as image_json_size,
    jsonb_array_length(images) as image_count,
    images
FROM pets 
WHERE images IS NOT NULL AND images != '[]'::jsonb
ORDER BY octet_length(images::text) DESC
LIMIT 10;

-- 檢查平均圖片數據大小
SELECT 
    AVG(octet_length(images::text)) as avg_image_size,
    MAX(octet_length(images::text)) as max_image_size,
    MIN(octet_length(images::text)) as min_image_size,
    COUNT(*) as total_with_images
FROM pets 
WHERE images IS NOT NULL AND images != '[]'::jsonb; 