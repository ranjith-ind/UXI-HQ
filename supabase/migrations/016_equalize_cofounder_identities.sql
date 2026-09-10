-- ==============================================================================
-- UXI HQ - Migration 016: Equalize All Four Co-Founders & Preserve Roles
--
-- The Four Co-Founders (Equal Representation):
--   1. Ranjith   -> name: 'Ranjith',  title: 'Co-Founder', designation: 'Co-Founder', is_founder: true, role: 'Admin'
--   2. Hafi      -> name: 'Hafi',     title: 'Co-Founder', designation: 'Co-Founder', is_founder: true
--   3. Vedesh    -> name: 'Vedesh',   title: 'Co-Founder', designation: 'Co-Founder', is_founder: true
--   4. Praneeth  -> name: 'Praneeth', title: 'Co-Founder', designation: 'Co-Founder', is_founder: true
--
-- System Administrator:
--   - Pavan      -> name: 'Pavan Manepalli', title: 'System Administrator', designation: 'System Administrator', is_founder: false, role: 'Admin'
--
-- No changes to:
--   - Any user auth UUIDs or passwords
--   - Any email addresses
--   - Any RLS policies or permissions
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Ranjith (Co-Founder & Admin)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = 'Ranjith',
    updated_at = NOW()
WHERE id = '60abe450-2447-4e91-962d-c86abcb723fd'
   OR LOWER(email) IN ('ranjithkumartirumalasetti@gmail.com', 'ranjith@uxitech.in');

UPDATE public.team_members
SET name = 'Ranjith',
    full_name = 'Ranjith',
    title = 'Co-Founder',
    designation = 'Co-Founder',
    is_founder = true,
    updated_at = NOW()
WHERE user_id = '60abe450-2447-4e91-962d-c86abcb723fd'
   OR LOWER(email) IN ('ranjithkumartirumalasetti@gmail.com', 'ranjith@uxitech.in');

-- ------------------------------------------------------------------------------
-- 2. Hafi (Co-Founder)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = 'Hafi',
    updated_at = NOW()
WHERE LOWER(email) = 'hafi@uxitech.in';

UPDATE public.team_members
SET name = 'Hafi',
    full_name = 'Hafi',
    title = 'Co-Founder',
    designation = 'Co-Founder',
    is_founder = true,
    updated_at = NOW()
WHERE LOWER(email) = 'hafi@uxitech.in';

-- ------------------------------------------------------------------------------
-- 3. Vedesh (Co-Founder)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = 'Vedesh',
    updated_at = NOW()
WHERE LOWER(email) = 'vedesh@uxitech.in';

UPDATE public.team_members
SET name = 'Vedesh',
    full_name = 'Vedesh',
    title = 'Co-Founder',
    designation = 'Co-Founder',
    is_founder = true,
    updated_at = NOW()
WHERE LOWER(email) = 'vedesh@uxitech.in';

-- ------------------------------------------------------------------------------
-- 4. Praneeth (Co-Founder)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = 'Praneeth',
    updated_at = NOW()
WHERE LOWER(email) = 'praneeth@uxitech.in';

UPDATE public.team_members
SET name = 'Praneeth',
    full_name = 'Praneeth',
    title = 'Co-Founder',
    designation = 'Co-Founder',
    is_founder = true,
    updated_at = NOW()
WHERE LOWER(email) = 'praneeth@uxitech.in';

-- ------------------------------------------------------------------------------
-- 5. Ensure Pavan's Administrator Status & Attributes
-- ------------------------------------------------------------------------------
UPDATE public.team_members
SET title = 'System Administrator',
    designation = 'System Administrator',
    is_founder = false,
    role = 'Admin'::public.user_role,
    updated_at = NOW()
WHERE user_id = '416a0aba-290e-486e-80ab-c555d2b32392'
   OR LOWER(email) = 'pavanmanepalli521@gmail.com';

COMMIT;

-- ------------------------------------------------------------------------------
-- 6. Verification Query: Inspect All 4 Co-Founders and Admin Accounts
-- ------------------------------------------------------------------------------
SELECT 
    tm.employee_code,
    tm.name,
    tm.full_name AS tm_full_name,
    p.full_name AS profile_full_name,
    tm.title,
    tm.designation,
    tm.role AS team_role,
    p.role AS profile_role,
    tm.email,
    tm.is_founder,
    tm.member_status
FROM public.team_members tm
LEFT JOIN public.profiles p ON p.id = tm.user_id
WHERE tm.is_founder = true 
   OR LOWER(tm.email) IN ('pavanmanepalli521@gmail.com', 'ranjithkumartirumalasetti@gmail.com')
ORDER BY tm.employee_code ASC NULLS LAST;
