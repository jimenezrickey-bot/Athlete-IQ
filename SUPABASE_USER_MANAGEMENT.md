# Supabase User Management Guide

## Viewing All Users and Their Roles

In the **Supabase Dashboard → SQL Editor**, run this query to see all registered users:

```sql
SELECT 
  au.id,
  au.email,
  p.name,
  p.role,
  au.created_at,
  au.last_sign_in_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
```

## Viewing a Specific User

To find a user by email:

```sql
SELECT 
  au.id,
  au.email,
  p.name,
  p.role,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'your-email@example.com'
```

## Changing a User's Role

If a user is showing the wrong role, update it with:

```sql
UPDATE profiles
SET role = 'parent'  -- Change to: parent, coach, or player
WHERE user_id = 'USER_ID_HERE'
```

To find the correct user ID, use one of the queries above first.

## Changing a User's Name

```sql
UPDATE profiles
SET name = 'New Name'
WHERE user_id = 'USER_ID_HERE'
```

## Deleting a User (Use with Caution)

**WARNING: This cannot be undone!**

To delete a user completely (deletes auth account and all data):

```sql
DELETE FROM auth.users WHERE id = 'USER_ID_HERE'
```

Note: Deleting from auth.users will cascade delete the profile and all related data.

## Available User Roles

The system supports three roles:

| Role   | Description |
|--------|-------------|
| player | The athlete (Max) - can log hitting and pitching sessions |
| parent | Parent/guardian - can view Max's data and manage family access |
| coach  | Coach - can view and analyze Max's training data |

## Troubleshooting Signup Issues

If a user reports signup errors:

1. **Email Already Registered**: The email is already in the system. User should click "Login" instead.
2. **Email Confirmation Required**: Supabase might send a confirmation email. User needs to click the link.
3. **Profile Not Created**: If the profile table shows NULL values, the role didn't get saved properly. You can:
   - Delete the user and have them sign up again
   - Or manually update the profile with the UPDATE query above

## Setting Up Email Confirmations (Advanced)

If you want to enable email confirmation for new signups:

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Find **Email**
3. Enable **Confirm email** toggle

Users will then receive a confirmation email and must click the link before they can use the app.

## Common Issues and Solutions

### Issue: User is showing as "athlete" instead of their selected role

**Solution**: This was a bug in the signup form. It's been fixed with better error handling and retry logic. Have the user sign up again.

To fix existing users:
```sql
UPDATE profiles
SET role = 'parent'  -- Change to correct role
WHERE name = 'Wife Name'
```

### Issue: User can't sign up

**Possible causes**:
1. Email confirmation is enabled and they haven't confirmed their email
2. Network error during profile creation (fixed with new retry logic)
3. They need to create a stronger password (minimum 6 characters)

**Solution**: Have them check their email for confirmation link, or try signing up again.

### Issue: User gets errors during signup

The new signup form provides much better error messages now. It will show:
- "Password must be at least 6 characters"
- "This email is already registered. Please log in instead."
- "Failed to save profile" - if there's a database issue

## Notes

- All user data is isolated by RLS (Row-Level Security) policies
- Users can only see their own data
- Parents/coaches can see Max's data if you set up family relationships (future feature)
- Email is case-insensitive in Supabase Auth
