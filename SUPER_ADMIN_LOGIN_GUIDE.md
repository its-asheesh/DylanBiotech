# How to Login as Super Admin

## Step 1: Create a Super Admin Account

### Option A: Using npm script (Recommended)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Run the create admin script:
   ```bash
   npm run create:admin
   ```

3. Follow the prompts:
   - **Enter admin name**: Type the admin's full name (e.g., "John Doe")
   - **Enter admin email**: Type a valid email address (e.g., "admin@dylanbiotech.com")
   - **Enter admin password**: 
     - Must be at least 8 characters
     - Must contain at least one uppercase letter
     - Must contain at least one lowercase letter
     - Must contain at least one number
   - **Confirm password**: Re-enter the same password

4. The script will create a super admin account and display the details.

### Option B: Using ts-node directly

```bash
cd server
npx ts-node src/utils/createAdmin.ts
```

## Step 2: Login to Admin Panel

1. **Start the admin frontend** (if not already running):
   ```bash
   cd admin
   npm run dev
   ```

2. **Navigate to the login page**:
   - Open your browser and go to: `http://localhost:5173/admin/login`
   - (Or whatever port your admin frontend is running on)

3. **Enter your credentials**:
   - **Email**: The email you used when creating the admin account
   - **Password**: The password you set

4. **Click "Sign In"**

5. You will be redirected to the admin dashboard as a super admin.

## Step 3: Verify Super Admin Access

Once logged in, you should see:
- **"Admin Management"** menu item in the sidebar (only visible to super admins)
- Full access to all admin features
- Ability to manage other admins' permissions

## Example Credentials

If you created an admin with:
- **Email**: `admin@dylanbiotech.com`
- **Password**: `Admin123!`

You would login with these exact credentials.

## Troubleshooting

### "Access denied. Admin privileges required."
- Make sure the user has `role: 'admin'` in the database
- Check that `adminLevel` is set to `3` (Super Admin)

### "Invalid email or password"
- Double-check your email and password
- Make sure the account was created successfully
- Check the server logs for any errors

### Can't see "Admin Management" in sidebar
- Verify your `adminLevel` is `3` (Super Admin)
- Check the browser console for any errors
- Try logging out and logging back in

## Creating Additional Super Admins

You can create multiple super admin accounts by running the script again with different email addresses.

## Changing Admin Level

If you need to change an existing admin's level:
1. Login as super admin
2. Go to "Admin Management" in the sidebar
3. Click the edit icon next to the admin
4. Change the admin level and save

