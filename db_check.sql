-- 檢查數據庫總大小
SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;

-- 檢查各表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 檢查pets表的記錄數量
SELECT COUNT(*) AS total_pets FROM pets;

-- 檢查pets表的索引
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pets';

-- 檢查數據庫連接數
SELECT 
    count(*) AS total_connections,
    state
FROM pg_stat_activity 
WHERE datname = current_database()
GROUP BY state;

-- 檢查最耗時的查詢（如果有pg_stat_statements擴展）
SELECT query, calls, mean_time, total_time 
FROM pg_stat_statements 
WHERE query LIKE '%pets%' 
ORDER BY mean_time DESC 
LIMIT 10; 