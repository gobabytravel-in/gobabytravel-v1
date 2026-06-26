# Firebase Setup Instructions for GoBaby Travel

## ✅ Firebase Project Configured
- Project ID: `gobaby-travel-app-bf076`
- Region: Default
- Firestore Database: Ready

## 🔥 Firestore Security Rules

To allow the callback form to work, update your Firestore security rules:

1. Go to [Firebase Console](https://console.firebase.google.com/project/gobaby-travel-app-bf076/firestore/rules)
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to create callback requests
    match /callback_requests/{document} {
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'phone', 'status', 'createdAt', 'source'])
                    && request.resource.data.name is string
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('.*@.*')
                    && request.resource.data.phone is string
                    && request.resource.data.status == 'pending'
                    && request.resource.data.source == 'mobile_app';
      
      // Only authenticated admin users can read, update, or delete
      allow read, update, delete: if false; // Change to proper auth check when admin panel is ready
    }
  }
}
```

3. Click **Publish**

## 📧 Email Notifications (Optional)

To get notified when someone submits a callback request:

### Option 1: Cloud Function (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase init functions`
3. Create function in `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendCallbackNotification = functions.firestore
  .document('callback_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Configure your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
      }
    });

    const mailOptions = {
      from: 'GoBaby Travel <noreply@gobabytravel.com>',
      to: 'support@gobabytravel.com',
      subject: `New Callback Request from ${data.name}`,
      html: `
        <h2>New Callback Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        <p><strong>Time:</strong> ${data.createdAt.toDate()}</p>
      `
    };

    await transporter.sendMail(mailOptions);
  });
```

4. Deploy: `firebase deploy --only functions`

### Option 2: Zapier Integration
1. Go to [Zapier](https://zapier.com)
2. Create Zap: Firebase Firestore → Email/Slack/etc.
3. Connect your Firebase project
4. Set trigger: New Document in `callback_requests`
5. Set action: Send Email/Notification

## 📊 Analytics Setup

Firebase Analytics is already configured and will track:
- Screen views
- User engagement
- Conversion events

### Custom Events to Track (Future):
```javascript
import { logEvent } from 'firebase/analytics';
import { analytics } from './config/firebase';

// Track callback form submission
logEvent(analytics, 'callback_request_submitted', {
  source: 'contact_page'
});

// Track destination selection
logEvent(analytics, 'destination_selected', {
  destination: 'bali'
});

// Track booking initiated
logEvent(analytics, 'booking_initiated', {
  type: 'plan_a_trip'
});
```

## 🔐 Security Best Practices

1. **Never commit Firebase config to public repos** (already in .gitignore)
2. **Use environment variables for sensitive data**
3. **Enable App Check** (prevents API abuse)
4. **Set up Firebase Authentication** for admin panel
5. **Monitor usage in Firebase Console** to prevent quota exceeded

## 📱 Testing the Form

1. Open app: https://gobaby-shell.preview.emergentagent.com
2. Navigate to "Contact Us"
3. Fill and submit the callback form
4. Check Firebase Console → Firestore → callback_requests

You should see the new document with all form data!

## ✅ Current Status

- ✅ Firebase initialized
- ✅ Firestore connected
- ✅ Analytics enabled
- ⏳ Firestore rules (update manually)
- ⏳ Email notifications (optional setup)

## 🆘 Troubleshooting

**Form submission fails?**
- Check Firestore rules are published
- Check browser console for errors
- Verify Firebase config is correct

**No data in Firestore?**
- Check network tab in browser
- Verify Firestore is enabled in Firebase Console
- Check security rules allow `create`

**Analytics not working?**
- Wait 24 hours for data to appear
- Check Firebase Console → Analytics → Events
- Analytics only works in production (not localhost)
