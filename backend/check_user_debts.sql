-- Query to see all debts with user information
SELECT 
    d.id as debt_id,
    d.name as debt_name,
    d.balance,
    d.minimum_payment,
    d.is_active,
    d.user_id,
    u.email,
    u.first_name,
    u.last_name,
    CASE 
        WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL THEN 
            CONCAT(u.first_name, ' ', u.last_name)
        ELSE 
            SPLIT_PART(u.email, '@', 1)
    END as display_name,
    d.created_at
FROM debts d
JOIN users u ON d.user_id = u.id
ORDER BY u.email, d.created_at;

-- Summary by user
SELECT 
    u.id as user_id,
    u.email,
    CASE 
        WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL THEN 
            CONCAT(u.first_name, ' ', u.last_name)
        ELSE 
            SPLIT_PART(u.email, '@', 1)
    END as display_name,
    COUNT(d.id) as total_debts,
    COUNT(CASE WHEN d.is_active = true THEN 1 END) as active_debts,
    SUM(CASE WHEN d.is_active = true THEN d.balance ELSE 0 END) as total_balance,
    SUM(CASE WHEN d.is_active = true THEN d.minimum_payment ELSE 0 END) as total_min_payments
FROM users u
LEFT JOIN debts d ON u.id = d.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name
HAVING COUNT(d.id) > 0
ORDER BY total_balance DESC;
