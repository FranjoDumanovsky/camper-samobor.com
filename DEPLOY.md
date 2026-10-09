# Deploy — Camper Samobor

Static HTML/CSS/JS rebuild of the old WordPress site. No PHP, no database.

Same flow as HostelSamobor and KombiRent: push to `main` → GitHub Actions →
cPanel API (port 2083, the host firewalls FTP/SSH) → cPanel Git pulls the repo
into `~/repositories/camper-samobor.com` → `.cpanel.yml` copies the site into the
document root.

**Difference from the other two:** `camper-samobor.com` is the **primary domain**
of the cPanel account (user `camper`). Its document root is `public_html`, which
currently holds the WordPress site. Going live replaces WordPress.

## Site layout

| URL | File |
|-----|------|
| `/` (Croatian home) | `index.html` |
| `/pilote.html` … (Croatian motorhomes) | `pilote.html`, `rimor.html`, `ahorn.html`, `ahorn-as.html`, `ahorn-ad.html`, `benimar-tessoro.html` |
| `/en/` (English home) | `en/index.html` |
| `/en/pilote.html` … | `en/*.html` |

Old WordPress URLs (`/home/`, `/pilote/`, `/pilote-en/`, `/kontakt/`, demo posts …)
301-redirect to the new pages — see `.htaccess`.

## One-time setup

### 1. Back up WordPress (do not skip)

cPanel → **Backup** → download a **Home Directory** backup and the **MySQL
database** backup for the WordPress database. Also download
`public_html/.htaccess` on its own (File Manager → right-click → Download).

### 2. Check the current `public_html/.htaccess`

Open it in File Manager before replacing it. The deploy overwrites it.
- If it has a `# php -- BEGIN cPanel-generated handler` block **and** another
  site on the account has its document root *inside* `public_html`, copy that
  block into this repo's `.htaccess` first. `AddHandler` is inherited by
  subfolders, so removing it could change that site's PHP version.
- Anything else in there besides the standard `# BEGIN WordPress … # END
  WordPress` block: check before losing it.

### 3. GitHub secrets

The repo needs the same three secrets as HostelSamobor (secrets are per repo, so they must be added again here):
`CPANEL_HOST`, `CPANEL_USER`, `CPANEL_TOKEN`. Run each and paste the value
when prompted:

```
gh secret set CPANEL_HOST  -R FranjoDumanovsky/camper-samobor.com
gh secret set CPANEL_USER  -R FranjoDumanovsky/camper-samobor.com
gh secret set CPANEL_TOKEN -R FranjoDumanovsky/camper-samobor.com
```

### 4. Create the cPanel clone

The repo is public (like HostelSamobor/KombiRent), so cPanel clones it over
HTTPS with no key. It holds no secrets: the cPanel token lives only in GitHub
Actions secrets.

cPanel → **Git™ Version Control** → **Create**:
- Clone URL: `https://github.com/FranjoDumanovsky/camper-samobor.com.git`
- Repository Path: `repositories/camper-samobor.com`
- Repository Name: `camper-samobor.com`

Creating the clone does **not** deploy anything; only the workflow (or the
"Deploy HEAD Commit" button) runs `.cpanel.yml`.

### 5. Go live

GitHub → Actions → **Deploy to cPanel** → **Run workflow** (or push to `main`).
The new `.htaccess` + `DirectoryIndex index.html` take over immediately, even
with the WordPress files still in `public_html`.

### 6. Verify

- `https://camper-samobor.com/` shows the Croatian homepage, HR/ENG switch works.
- Old links redirect: `/home/` → `/en/`, `/pilote/` → `/pilote.html`,
  `/pilote-en/` → `/en/pilote.html`, `http://www.camper-samobor.com/` → `https://camper-samobor.com/`.
- **hostel-samobor.hr** and **kombi-samobor.com** still load normally.

### 7. Move WordPress out of the web root

Once the new site is confirmed working, in File Manager create
`/home/camper/wordpress-old/` (outside `public_html`, so not reachable from the
web) and move into it the WordPress files from `public_html`: `wp-admin/`,
`wp-content/`, `wp-includes/`, `wp-*.php`, `index.php`, `xmlrpc.php`,
`license.txt`, `readme.html`.

**Do not move** `.well-known/`, `cgi-bin/`, or any folder that is another
domain's document root (check cPanel → Domains), nor the files the deploy
copied (`*.html`, `css/`, `js/`, `images/`, `en/`, `.htaccess`).

Leaving WordPress files reachable (`/wp-login.php`, old plugins) is a security
risk for every site on the account, so do not skip this step. Keep
`wordpress-old/` and the database until you're sure nothing is needed, then
delete both.

## Day-to-day

Edit the HTML/CSS, commit, push to `main` → live in about a minute.
A file deleted from the repo is not deleted from the server; remove it in File
Manager too.

## Known gaps (not blockers)

- No favicon, canonical, Open Graph or `hreflang` tags.
- No 404 page.
- Old `wp-content/uploads/...` image URLs 404 after step 7.
- Content quirks copied as-is from the live site: price dates say 2022, the
  English Benimar page has a Croatian heading, English detail pages end with a
  Croatian "Napomena" note, the footer is English on Croatian pages.
