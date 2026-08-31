# Pickle Social Cebu Registration

This project is a static HTML/CSS/JavaScript form for a Pickle Social registration page. It is ready to deploy on Cloudflare Pages.

## Project structure

- `index.html` - main form page
- `assets/css/styles.css` - page styling
- `assets/js/script.js` - form logic and Supabase submission

## Cloudflare Pages deployment

1. Push this folder to a GitHub repository.
2. Log in to Cloudflare and open Pages.
3. Click Create project.
4. Select your GitHub repository.
5. Use the following settings:
   - Framework preset: None
   - Build command: leave empty
   - Output directory: `.`
6. Click Save and Deploy.

## Notes

- This is a static site, so no build step is required.
- Your Supabase credentials are already configured in `assets/js/script.js`.
- Make sure the `registrations` table exists in Supabase before testing the form.
