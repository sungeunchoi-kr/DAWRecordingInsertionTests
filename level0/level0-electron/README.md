# muse-app

## Packaging for Mac
We use `electron-builder` for distribution packaging.

The `build.mac` section in `package.json` and `entitlements.plist` file are the Mac-specific settings for the Mac build.
In order for the build artifact to be properly signed, we need what is called the "Developer ID Application" certificate. It is issued by Apple when you get the Developer account. To get it issued, go to Xcode -> Preferences -> Accounts tab -> Manage Certificates -> "+" sign -> "Developer ID Application".

When one is generated, right-click on the certificate and do "Export Certificate". This should export the certificate into a `*.p12` file. Double click the file, then add to the "login" keychain. Now, on the "Keychain Access" app, under the "login" keychain, there should be a line that says something like this:

"Developer ID Application: Luis Caballero (0000000000)" (where the 000... are some unique ID.)

That certificate must be there for the signing to complete properly!

Now, when we run `npm run pack` (or `electron-builder`), there should be a line in stdout saying:

`signing  ... identityName=Developer ID Application: Luis Caballero (P99CTB3BP8) ...`.
