# GitHub + Netlify Update Instructions

Since you have your site connected to GitHub with Netlify auto-deployment, you have two options:

## Option 1: Update Source Files (Recommended)
If your GitHub repo contains the React source code:

1. **Update your React component** (`src/App.jsx` or similar) with the Netlify Forms integration
2. **Key changes needed:**
   - Add `data-netlify="true"` to your form element
   - Add `name="petition-signature"` and `method="POST"` to the form
   - Add hidden input: `<input type="hidden" name="form-name" value="petition-signature" />`
   - Update form field names to match Netlify requirements
   - Update form submission handler to post to Netlify

3. **Push to GitHub** - Netlify will automatically build and deploy

## Option 2: Update Built Files (If using static files)
If your GitHub repo contains the built/static files:

1. **Replace your index.html** with the one from the zip file
2. **Update your assets folder** with the new JavaScript and CSS files
3. **Push to GitHub** - Netlify will automatically deploy

## What Happens After Update
1. **Automatic deployment** - Netlify detects the GitHub changes and rebuilds
2. **Form detection** - Netlify automatically detects the `data-netlify="true"` form
3. **Form setup** - The "petition-signature" form appears in your Netlify dashboard
4. **Ready to use** - Form submissions will be captured immediately

## Netlify Dashboard Setup
After deployment:
1. Go to your Netlify dashboard
2. Click on your site
3. Go to "Forms" section
4. Click on "petition-signature" form
5. Set up email notifications under "Settings & Usage"
6. Add your email to receive notifications when people sign

## Important Notes
- **Form name must be "petition-signature"** for the integration to work
- **Keep the hidden input** `<input type="hidden" name="form-name" value="petition-signature" />`
- **Netlify Forms are free** up to 100 submissions per month
- **Existing functionality preserved** - signature counter and admin dashboard still work

Would you like me to provide the specific code changes you need to make to your source files?

