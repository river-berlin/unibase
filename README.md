# 🏡 Unibase

<img src="readme-files/flowerpots.jpg" alt="flowers in a flowerpot next to a window" width="200" height="200">

<br>

Unibase attempts to be an all inclusive template with a variety of features, so that people can directly use the template for building quite complex and feature rich cross-platform applications

## Supported features

Namely, I wish to implement the following features in it

- [ ] support for both web and mobile (ios + android)
- [ ] a start screen in both web and mobile
  - [-] 10% there, created a basic page for the web that only works on macbook screen sizes for now
- [ ] support for login and registration, and dedicated pages for so
- [ ] support for oauth
- [ ] support for login providers such as google, apple, etc...
- [ ] support for phone/sms based auth? maybe?
- [ ] 2fa support
- [ ] support for https://tamagui.dev/ based styling
- [ ] auto-shrinking and expanding menu options for different screen sizes
- [ ] support for a settings page
- [ ] support for modifyable user accounts
- [ ] support for a billing page, with invoices, and refund options
- [ ] support for subscriptions if needed
- [ ] usage of free, open source icons, which don't need attribution
- [ ] support for an Admin page and inspection
- [ ] deployment on vercel
- [ ] support for dark mode and light mode
- [ ] support for realtime interactions
- [ ] support for multiple profiles to be logged in?
- [ ] support for team accounts?
- [ ] support for push notifications
- [ ] ability to choose to not implement some stuff via east option toggling in a page
- [ ] support for plausable analytics?
- [ ] support for language changes, and other forms of localization
- [ ] offline-first support
- [ ] being able to search through files
- [ ] being able to search through the settings page
- [ ] all while having excellent documentation

## Tools used
- Expo
- Vercel
- Supabase
- Stripe
- [insert icon libraries here] (MIT Licensed hopefully)
- Tamagui

### How does this setup ?

a project explaination can be found on the [how-everything-works.md](./how-everything-works.md) file, and paths where other explainations can be found

### Simplified explaination

at this point, I am creating (for display, as a placeholder), 
- A notebook alternative to google colab that uses runpod
- Uses https://marimo.io/
- It's possible to search through notebooks
- It's possible to create/delete/update notebooks
- Option for subscriptions
- There is a subscription service that can give a person credits monthly (at a discounted rate), 
  - which also gives credit discounts in the future

The app is going to add more complex features to everything, essentially being able to cancel a subscription (that will cancel after a 30 day period), or to be able to refund a purchase if the user does not like it