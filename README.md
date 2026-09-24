# Thai POS System - Point of Sale Dashboard

A comprehensive, client-side Point of Sale (POS) system built with vanilla JavaScript. Designed specifically for Thai businesses with full support for Thai language, ฿ currency formatting, and consignment shop management.

## Features

### Core POS Functionality
- **Dashboard**: Real-time sales overview with daily revenue, transaction count, and profit/loss analysis
- **Product Management**: Add, edit, and manage inventory with category support
- **Stock Management**: Track current stock, new stock arrivals, and manage stock levels
- **Sales System**: Complete checkout system with customer selection, product selection, and payment processing
- **Receipt Printing**: Generate and print receipts with transaction details

### Business Features
- **Profit/Loss Dashboard**: Separate tracking of profit and loss transactions
- **Customer Database**: Maintain customer records with transaction history
- **Bill Management**: Track all sales bills with detailed information
- **User Management**: Multi-user support with role-based access
- **Settings**: Configurable password and business settings

### Consignment Management (6 tabs)
1. **Shops**: Manage consignment partner shops
2. **Products**: Track products sent to consignment shops
3. **Track**: Monitor consignment product status
4. **Summary**: View consignment sales summary
5. **Received**: Record payments received from consignment shops
6. **Returned**: Track returned items from consignment shops

### Additional Features
- **Thai Language Support**: Full Thai UI with proper number and currency formatting
- **Data Persistence**: All data stored locally using browser localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Print Support**: Optimized print styles for receipts and reports
- **Dark/Light Theme Ready**: CSS custom properties for easy theming

## System Requirements

- **Browser**: Modern web browser with JavaScript enabled and localStorage support
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Storage**: Minimal disk space (data stored in browser)
- **No Backend Required**: This is a client-side only application

## Installation

### Option 1: Local File (Easiest)
1. Download all three files: `index.html`, `styles.css`, and `app.js`
2. Place all three files in the same directory
3. Open `index.html` in your web browser
4. Done! The app will work immediately

### Option 2: Local Web Server
For better security and reliability, serve the files through a local web server:

**Using Python 3:**
```bash
cd /path/to/files
python -m http.server 8000
```
Then open: `http://localhost:8000`

**Using Node.js (with http-server):**
```bash
npm install -g http-server
cd /path/to/files
http-server
```

### Option 3: Deploy to Netlify (Recommended for Live Use)
1. Create a free account at [netlify.com](https://netlify.com)
2. Create a new site by uploading the three files
3. Or connect to a GitHub repository containing the files
4. Netlify will automatically deploy your site
5. Your site will be live at a URL like: `yoursite.netlify.app`

### Option 4: Deploy to Vercel
1. Create a free account at [vercel.com](https://vercel.com)
2. Create a new project and select "Other" when asked about framework
3. Upload the three files or connect a GitHub repository
4. Deploy - your site will be live immediately

### Option 5: Traditional Web Hosting
1. Upload the three files to your hosting provider's FTP
2. Ensure all three files are in the same directory
3. Access via your domain

## File Structure

```
pos-system/
├── index.html      # HTML structure (main entry point)
├── styles.css      # All CSS styling and layouts
├── app.js         # Complete application logic
├── README.md      # This file
└── .gitignore     # Git ignore rules (if using version control)
```

### File Descriptions

**index.html** (~500 lines)
- Contains only HTML structure
- Imports external CSS: `<link rel="stylesheet" href="styles.css">`
- Imports external JS: `<script src="app.js"></script>`
- Defines all UI elements: login form, navigation, content sections, modals

**styles.css** (~114 lines, minified)
- All CSS rules for styling and layout
- CSS custom properties for easy theming
- Responsive grid and flexbox layouts
- Print media queries for receipts
- No dependencies on external libraries

**app.js** (~750 lines)
- Complete application logic in vanilla JavaScript
- No external dependencies required
- All data operations using localStorage
- Event handling and UI rendering
- Business logic for POS, inventory, and consignment

## Usage Guide

### First Login
1. Default credentials:
   - Username: `admin`
   - Password: `1234`
2. Click the logout button to change password in settings
3. First login loads the default configuration

### Main Features

#### Dashboard
- View today's total revenue
- See number of transactions
- Track profit and loss
- View revenue trends

#### Products
- Click "+ เพิ่มสินค้า" to add new products
- Enter product name, price, and category
- Edit existing products by clicking the edit button
- View all products in grid format

#### Stock Management
- Track current stock levels
- Add new stock arrivals
- Adjust stock quantities
- Monitor low stock warnings

#### Checkout Process
1. Select customer (or create new)
2. Add products to cart by clicking product cards
3. Adjust quantities in cart
4. Click "ยืนยันการขาย" to complete sale
5. View and print receipt

#### Customer Management
- Add new customers with phone and address
- Edit customer information
- View customer transaction history
- Search customers by name or phone

#### Reports
- View detailed sales reports by period
- Filter by date range
- Export data for analysis

#### Consignment Shops
- Add and manage consignment partner shops
- Send products to shops
- Track product status
- Record received payments
- Monitor returned items

### Data Export
- All data is stored in browser localStorage
- Use browser developer tools to backup:
  1. Open Developer Tools (F12)
  2. Go to Application tab
  3. Find localStorage
  4. Find key `pos_data`
  5. Copy the entire JSON object
  6. Save to a text file as backup

## Data Persistence

All data is stored locally in your browser using **localStorage**:
- **Storage Key**: `pos_data`
- **Storage Limit**: 5-10 MB per site (depending on browser)
- **Data Type**: JSON format
- **Persistence**: Data persists between browser sessions until cleared

### Backup Your Data
1. Periodically export your data using browser developer tools
2. Keep backup files on your computer
3. Consider using cloud storage or version control

### Clear Data
- Clearing browser cache/history may delete data
- Use Settings → Clear Data option in the app instead
- If data is accidentally cleared, restore from backup

## Configuration

### Change Default Password
1. Login with default credentials (admin / 1234)
2. Go to Settings section
3. Change the password to your preferred password
4. Click Save

### Customize Business Settings
1. Go to Settings section
2. Update business name and other preferences
3. Settings are saved automatically

## Troubleshooting

### Data Not Saving
- Check if localStorage is enabled in browser settings
- Clear browser cache and reload
- Try a different browser

### Files Not Loading
- Ensure all three files (index.html, styles.css, app.js) are in the same directory
- Check browser console (F12) for error messages
- Verify file names are exactly: `index.html`, `styles.css`, `app.js`

### Performance Issues
- Clear old data: Go to Settings → Clear Data
- Close other browser tabs
- Restart the browser

### Can't Login
- Default password is `1234`
- Check Caps Lock is off
- Clear browser cache and try again

## Development

### Making Changes
1. Edit the files as needed
2. Refresh your browser (Ctrl+R or Cmd+R)
3. Changes take effect immediately

### Adding Features
- All business logic is in `app.js`
- All styling is in `styles.css`
- All HTML structure is in `index.html`
- Modify the central `app` object to add new features

### Browser Console
- Open Developer Tools (F12) to see any errors
- Check console for debugging information
- Use `localStorage.getItem('pos_data')` to view all data

## Deployment Checklist

- [ ] All three files downloaded and placed in same directory
- [ ] Tested locally in browser
- [ ] Verified all features work (products, checkout, reports)
- [ ] Customized password in Settings
- [ ] Created data backup
- [ ] Deployed to web server or hosting platform
- [ ] Tested on target server
- [ ] Set up regular data backups

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |
| IE 11   | -       | ❌ Not Supported |

## Performance Notes

- Application loads in < 1 second
- Fully responsive on all devices
- No network requests required after initial load
- Works offline after first load
- Optimized for Thai language display

## Security Notes

- **Client-Side Only**: No data sent to external servers
- **Local Storage**: Data stored only in browser
- **Password Protection**: Simple password authentication
- **No SSL Required**: Can run on HTTP (though HTTPS recommended for production)
- **Data Privacy**: Your data never leaves your device

⚠️ **Important**: This is a local application suitable for small to medium businesses. For enterprise use with sensitive data, consider additional security measures such as:
- Running on HTTPS only
- Regular data backups
- User access control at network level
- Data encryption at rest

## Support & Feedback

- Check the Troubleshooting section above
- Review browser console for error messages
- Test in a different browser
- Verify all files are in the same directory

## License

This POS system is provided as-is for business use. Modify and distribute as needed for your business needs.

## Credits

Built with vanilla JavaScript, CSS3, and HTML5. Optimized for Thai businesses with full Thai language support.

---

**Version**: 1.0  
**Last Updated**: September 2024  
**Status**: Production Ready
