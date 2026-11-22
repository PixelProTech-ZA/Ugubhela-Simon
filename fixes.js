/* Ugubhela Simon — FIX LANE library. 34 guided fixes, all offline.
   Fields: id, cat, t=title, s=symptom line, k=search words, m=minutes, l=level (1 easy, 2 careful, 3 advanced),
   w=warning (data-risk), st=steps, e=when to stop and hand over. Written by hand for PixelProTech Solutions. */
(function (root) {
  var cats = [
    { id: "pc", name: "PC", ico: "pc" },
    { id: "net", name: "Network", ico: "wifi" },
    { id: "phone", name: "Phone", ico: "phone" },
    { id: "dev", name: "Devices", ico: "plug" },
    { id: "files", name: "Files", ico: "folder" },
    { id: "sec", name: "Security", ico: "shield" }
  ];

  var list = [
    /* ---------------- PC ---------------- */
    { id: "pc-slow", cat: "pc", t: "PC running slow", s: "Everything takes ages to open or respond.",
      k: "pc computer laptop windows slow sluggish lag laggy takes long hanging performance speed crawl", m: 8, l: 1,
      st: [
        "Click Start, then Power, then Restart. Use Restart, not Shut down. Windows 'Fast startup' can keep a problem alive after a shut down.",
        "Open Task Manager (Ctrl + Shift + Esc), go to Processes, and click the CPU, Memory and Disk headings to sort. Anything stuck near 80-100% for minutes is the culprit. Right-click it and choose End task (leave Windows system items alone).",
        "In Task Manager open Startup apps. Right-click apps you don't need at boot (updaters, chat apps, games) and choose Disable. This deletes nothing and is the biggest boot-speed win.",
        "Open File Explorer, then This PC. If drive C: has under 15% free, it will crawl. Use the 'C: drive full' fix.",
        "Settings, then Windows Update. Install anything pending, then Restart again.",
        "Settings, Apps, Installed apps. Remove trial antivirus, toolbars and programs you don't recognise. Check the name first if unsure.",
        "Windows Security, Virus & threat protection, Quick scan."
      ],
      e: "Disk at 100% on a hard drive (not an SSD), or a PC older than about 6 years, usually means the drive is the bottleneck. An SSD upgrade is the real fix." },

    { id: "pc-freeze", cat: "pc", t: "PC or program freezes", s: "Screen stops responding, 'Not responding' in the title bar.",
      k: "pc computer laptop windows freeze freezes freezing frozen stuck hang hangs not responding unresponsive crash crashes", m: 8, l: 1,
      st: [
        "Wait 60 seconds. A busy program often recovers by itself, and force-closing too early loses work.",
        "Press Ctrl + Shift + Esc. In Task Manager find the program marked Not responding, select it, then End task.",
        "If the whole screen is frozen, try Ctrl + Alt + Del. If that works, Sign out or Restart from the power icon.",
        "Only if nothing responds: hold the power button for 10 seconds until it switches off. Unsaved work will be lost, so use this last.",
        "After it restarts, type 'reliability history' in the Start search and open it. It shows which app or driver crashed, with dates. Write down the name.",
        "Update Windows (Settings, Windows Update) and update the program that crashes. Also check the PC isn't hot (see 'PC overheating').",
        "Start search: 'Windows Memory Diagnostic', choose 'Restart now and check'. It takes 10-20 minutes and tests the RAM."
      ],
      e: "Freezes that keep coming back with no pattern can be failing RAM, a dying drive or overheating. Hand it over with the app name from reliability history." },

    { id: "pc-noboot", cat: "pc", t: "PC won't switch on", s: "Press the power button and nothing happens.",
      k: "pc computer laptop windows wont won't turn start boot power dead on switch no lights nothing happens", m: 10, l: 1,
      st: [
        "Check the wall socket works: plug in a lamp or phone charger. Try a different socket and a different plug lead (a kettle lead often fits a desktop).",
        "Laptop: look for the charger light. Reseat the charger at both ends. Try a different charger of the same voltage if you have one.",
        "Desktop: check the small switch on the back of the power supply is on (I side), and the cable is pushed in firmly.",
        "Unplug everything except power: USB sticks, printers, extra screens. A faulty device can block start-up.",
        "Laptop: unplug the charger, hold the power button for 30 seconds, plug the charger back in, then press power.",
        "Listen and look: fans spinning? Any LED? Is the screen simply black while the PC runs? If the PC is running, see 'Screen black but PC is on'.",
        "Try an external monitor or TV over HDMI to rule out a dead screen."
      ],
      e: "No light, no fan and no sound with a good socket and charger usually means a power supply or motherboard fault. Don't open it. Hand it over." },

    { id: "pc-nodisplay", cat: "pc", t: "Screen black but PC is on", s: "Fans and lights are on, but the screen shows nothing.",
      k: "pc computer laptop screen display monitor black blank no signal nothing picture projector second screen external hdmi", m: 6, l: 1,
      st: [
        "Press Win + Ctrl + Shift + B together. Windows restarts the graphics driver. The screen flickers and you may hear a beep.",
        "Press Win + P and choose 'PC screen only', or try each option. The display mode is sometimes set to a screen that isn't connected.",
        "Check the cable is firmly in at both ends. Monitors: use the monitor's menu button to check the Input source (HDMI 1, HDMI 2, DisplayPort).",
        "Laptop: press the brightness-up key. Try the Fn key combination that shows a screen icon (often Fn + F4 or F5).",
        "Plug in a second screen or TV. If that shows a picture, your laptop screen or its cable is the problem.",
        "Hold the power button 10 seconds to switch off, wait 10 seconds, then start again.",
        "Desktop: if the monitor cable is plugged into the motherboard while a graphics card is fitted, move it to the graphics card ports."
      ],
      e: "A picture on an external screen but not the laptop panel, or lines and colour blocks, points to a screen or cable fault." },

    { id: "pc-bsod", cat: "pc", t: "Blue screen of death", s: "Blue screen with a sad face and a stop code, then restarts.",
      k: "pc computer laptop windows blue screen bsod stop code crash restarts restarting loop critical error", m: 20, l: 2,
      w: "Don't pick 'Reset this PC' to fix this unless your files are backed up. Reset can wipe them.",
      st: [
        "Take a photo of the blue screen. Write down the stop code, for example CRITICAL_PROCESS_DIED or INACCESSIBLE_BOOT_DEVICE. It tells us most of what we need.",
        "Unplug new hardware: USB devices, new drives, new RAM. Restart.",
        "If it keeps restarting: switch the PC off during the Windows logo three times in a row. Windows then opens Recovery. Choose Troubleshoot, Advanced options, Startup Settings, Restart, then press 4 for Safe Mode.",
        "In Safe Mode, open Settings, Windows Update, Update history, Uninstall updates. Remove the most recent one if the trouble started right after it.",
        "Right-click Start and open Terminal (Admin). Type: sfc /scannow and press Enter. Wait for it to finish.",
        "Then type: DISM /Online /Cleanup-Image /RestoreHealth and press Enter. Restart when it completes.",
        "Update the graphics driver from the maker's site (Intel, AMD, NVIDIA) or your laptop brand's support page."
      ],
      e: "Repeated blue screens with different codes suggest failing RAM or drive. Stop using the PC if it happens daily and hand it over with the stop codes." },

    { id: "pc-update", cat: "pc", t: "Windows update stuck or failing", s: "Stuck at 'Working on updates' or an update error keeps returning.",
      k: "pc computer laptop windows update updates stuck failing failed error install installing working on updates percent", m: 25, l: 2,
      w: "Don't switch off during an update unless it has shown no progress and no disk activity for over 2 hours.",
      st: [
        "Be patient first. Big updates can take 1-2 hours on slower PCs. If the disk light is blinking, it is still working.",
        "If it truly is frozen, restart from the Settings page once the PC is responsive.",
        "Settings, System, Troubleshoot, Other troubleshooters. Run the Windows Update one.",
        "Free up space. Windows needs about 20 GB free on C: for big updates. See 'C: drive full'.",
        "Unplug external drives and USB devices, then try the update again.",
        "Terminal (Admin): sfc /scannow, then DISM /Online /Cleanup-Image /RestoreHealth. Restart and try again.",
        "Note the error code (like 0x80070005). Search that code on Microsoft's support site, or hand it over with the code."
      ],
      e: "An update that fails with the same code three times needs a hands-on repair. Hand it over with the code." },

    { id: "pc-password", cat: "pc", t: "Forgot Windows password", s: "Locked out of the PC at the sign-in screen.",
      k: "pc computer laptop windows password forgot forgotten locked out login sign in pin cant log in microsoft account", m: 15, l: 2,
      w: "Do NOT reinstall Windows or reset the PC just to get in. That wipes your files. Never use 'password cracker' downloads. They are usually malware.",
      st: [
        "Check the sign-in screen: does it show an email address? That is a Microsoft account. If it shows just a name, it is a local account.",
        "Microsoft account: on your phone or another PC open account.live.com/password/reset, enter that email, and follow the steps. Then sign in on the PC with the new password. The PC needs internet at the sign-in screen (use the Wi-Fi icon bottom right).",
        "Try 'I forgot my PIN' if the PIN is what fails. It uses your Microsoft account.",
        "Local account: click Reset password under the box. It asks the security questions you set up.",
        "If you have a password reset disk or USB, insert it now and use it from the same Reset password link.",
        "Don't guess repeatedly. Too many wrong tries can lock you out for a while."
      ],
      e: "No Microsoft account access and no security questions? Hand it over. We can talk through safe options before anything touches your files." },

    { id: "pc-battery", cat: "pc", t: "Laptop battery drains or won't charge", s: "Dies fast, or 'plugged in, not charging'.",
      k: "laptop pc battery drain drains fast charge charging plugged in not charging dies power life", m: 12, l: 1,
      st: [
        "Check the charger first: light on, cable not frayed, firmly into the laptop. Try another wall socket.",
        "Restart the laptop with the charger plugged in. Check if the battery icon shows a lightning bolt.",
        "Unplug the charger, hold the power button 30 seconds, plug back in, and switch on.",
        "Right-click Start and open Terminal (Admin). Type: powercfg /batteryreport and press Enter. It prints where it saved battery-report.html. Open that file in your browser.",
        "Compare 'Design capacity' with 'Full charge capacity'. If full charge is under about 60% of design, the battery is worn out. Replacement is the fix.",
        "To stretch what is left: Settings, System, Power & battery. Turn on Battery saver, lower brightness, and check 'Battery usage' for apps that eat power.",
        "Remove or disable big background apps in Task Manager, Startup apps."
      ],
      e: "If the battery looks swollen, the trackpad is lifting, or the case bulges, stop using it and don't charge it. Hand it over, this is a safety issue." },

    { id: "pc-hot", cat: "pc", t: "PC overheating or loud fan", s: "Hot to touch, fan screaming, or random shut-downs.",
      k: "pc computer laptop hot heat overheating fan loud noisy noise shuts down shutdown random temperature", m: 15, l: 2,
      w: "Switch the PC off and unplug it before blowing out dust. Never use a vacuum cleaner on the inside, it can create static.",
      st: [
        "Move it onto a hard, flat surface. Beds, couches and laps block the air vents.",
        "Check the vents on the sides and underneath are not covered by dust, paper or cloth.",
        "Open Task Manager (Ctrl + Shift + Esc) and look for a program using high CPU for no reason. End it.",
        "Settings, System, Power & battery, Power mode: set Balanced instead of Best performance.",
        "Switch off and unplug. Use short bursts of compressed air at the vents. Hold the fan still with a toothpick while blowing, so it doesn't overspin.",
        "Desktop: check every case fan spins when switched on.",
        "Run it again and feel the vent air. If it still gets very hot, or shuts down within minutes, stop."
      ],
      e: "A PC that still overheats after cleaning needs fresh thermal paste or a fan replacement. Hand it over." },

    /* ---------------- NETWORK ---------------- */
    { id: "net-down", cat: "net", t: "Wi-Fi connected but no internet", s: "Wi-Fi icon says connected, pages won't load.",
      k: "wifi wi-fi internet no internet connected not working down offline router connection network", m: 10, l: 1,
      st: [
        "Test a second device (your phone on the same Wi-Fi). If every device fails, the problem is the router or the line. If only one device fails, it's that device.",
        "Look at the fibre box (ONT). A red or blinking LOS or Fibre light usually means no signal from the line. That is your fibre provider's fault. Call them with that light described.",
        "Restart the router: unplug it for 30 seconds, plug it in, then wait 3 full minutes before testing.",
        "On the failing device: turn Wi-Fi off and on, or toggle Airplane mode for 10 seconds.",
        "Forget the network and join it again. Phone: Wi-Fi settings, tap the network, Forget. Windows: Settings, Network & internet, Wi-Fi, Manage known networks, Forget.",
        "Windows only: Terminal (Admin). Run these one at a time: ipconfig /release, then ipconfig /renew, then ipconfig /flushdns.",
        "Last resort on Windows: Settings, Network & internet, Advanced network settings, Network reset. It forgets all saved Wi-Fi passwords, so have them ready."
      ],
      e: "If all devices fail and the router lights look normal, phone your ISP. If only one device fails after all of the above, hand it over." },

    { id: "net-slow", cat: "net", t: "Wi-Fi is slow", s: "Pages crawl, video buffers, calls break up.",
      k: "wifi wi-fi internet slow speed buffering buffer lag video calls dropping weak signal network", m: 12, l: 1,
      st: [
        "Run the Pocket Scan in this app next to the router, then in the slow room. A big drop between the two is a signal problem, not an ISP problem.",
        "Move closer to the router, or move the router higher and out of cupboards. Walls and microwaves block Wi-Fi.",
        "Restart the router: unplug 30 seconds, plug in, wait 3 minutes.",
        "Check who is hogging it: a phone updating apps, a PC downloading a Windows update, or someone streaming 4K. Pause the big download.",
        "Join the 5 GHz network (name often ends in 5G) when you are in the same room as the router. It is faster, 2.4 GHz reaches further.",
        "Plug a laptop in with a network cable. If the cable is fast and Wi-Fi is slow, the problem is Wi-Fi only.",
        "Optional: set DNS to 1.1.1.1 and 1.0.0.1 (or 8.8.8.8 and 8.8.4.4) in your network adapter settings. Sometimes it helps page loading."
      ],
      e: "If the cable is slow too, compare with your package speed and call your ISP. If the house is large, a mesh or access point is the real fix." },

    { id: "net-wifi", cat: "net", t: "Can't join Wi-Fi or it keeps dropping", s: "Wrong password message, or Wi-Fi disconnects every few minutes.",
      k: "wifi wi-fi cant connect join password wrong drops dropping disconnects disconnecting keeps disconnecting unstable", m: 10, l: 1,
      st: [
        "Check the password carefully: capital letters, zero vs the letter O, 1 vs l. Read it off the router sticker if it's still the original.",
        "Forget the network on your device and join it fresh.",
        "Turn the device's Wi-Fi off and on, then restart the device.",
        "Restart the router (unplug 30 seconds, wait 3 minutes).",
        "Router settings (check the sticker for its address): look for a device limit or a MAC filter blocking new devices.",
        "Windows drops: right-click Start, Device Manager, Network adapters, double-click your Wi-Fi adapter, Power Management, untick 'Allow the computer to turn off this device to save power'.",
        "Update the Wi-Fi driver from your laptop maker's support page."
      ],
      e: "If every device drops at the same time, it is the router or the line. Hand it over, or call your ISP." },

    { id: "net-router", cat: "net", t: "Router reset or locked out", s: "Can't open the router page, or someone changed the password.",
      k: "router reset locked out admin password factory default modem fibre settings login", m: 15, l: 3,
      w: "A factory reset deletes your ISP login. Many fibre providers need that login to connect. Get it from your ISP BEFORE you reset.",
      st: [
        "Check the sticker under the router. It lists the default address, user name and password. Try those first.",
        "Open the address in a browser while connected to the router (for example 192.168.0.1 or 192.168.1.1, as written on the sticker).",
        "If the default doesn't work, someone changed it. Ask whoever set up your router, or your ISP.",
        "Phone your ISP and ask for your connection (PPP) username and password, and any VLAN number, before you reset anything.",
        "Only then: with the router on, hold the small Reset hole with a paperclip for about 10 seconds until the lights flash.",
        "Wait 3 minutes, sign in with the sticker details, and enter your ISP details if asked.",
        "Set a new Wi-Fi name and a strong password, then write it down somewhere safe."
      ],
      e: "Not sure about the ISP details, or the line won't connect after reset? Hand it over before you try again." },

    { id: "net-loadshed", cat: "net", t: "Internet won't return after load shedding", s: "Power is back, but router and fibre box are not connecting.",
      k: "load shedding loadshedding power cut outage electricity eskom internet router fibre ont wont come back surge", m: 10, l: 1,
      st: [
        "Switch both the fibre box (ONT) and the router off at the wall for 30 seconds.",
        "Switch on the fibre box (ONT) first. Wait until its fibre light is steady, about 2-3 minutes.",
        "Only then switch on the router and wait another 3 minutes.",
        "Check the lights. A steady fibre light with a red or off internet light means the router can't log in. Restart the router once more.",
        "A red or blinking LOS or Fibre light means no signal from the line. Report it to your fibre provider.",
        "Check the plugs for a burnt smell or a dead plug-pack. Surges kill power adapters first. Try the adapter on another device of the same voltage.",
        "Long-term fix: a small UPS or a mini battery backup on the router and ONT keeps you online through Stage 2-4."
      ],
      e: "Dead lights on a good socket after a surge means a burnt adapter or router. Hand it over." },

    { id: "net-dns", cat: "net", t: "Some sites won't open", s: "'This site can't be reached' or DNS error, but other sites work.",
      k: "website site sites page wont open load dns error cant be reached browser chrome edge err_name_not_resolved err", m: 8, l: 1,
      st: [
        "Try the same site on your phone with mobile data. If it opens there, the problem is your network or device.",
        "Try a private window or a different browser. If it loads there, clear the cache and cookies in your main browser.",
        "Turn off any VPN or proxy and try again.",
        "Windows: Terminal (Admin), type: ipconfig /flushdns and press Enter.",
        "Change DNS to 1.1.1.1 and 1.0.0.1 (or 8.8.8.8 and 8.8.4.4) in your network adapter settings.",
        "Check the device date and time are correct. A wrong clock breaks secure sites. Run the Pocket Scan to see.",
        "Restart the router (unplug 30 seconds)."
      ],
      e: "If the site is down for everyone, there is nothing to fix on your side. Try again later." },

    { id: "net-cert", cat: "net", t: "'Your connection is not private' warning", s: "Browser shows a certificate or privacy warning on websites.",
      k: "certificate cert privacy not private warning security ssl https error date time clock chrome edge safari", m: 8, l: 1,
      w: "Never click 'Proceed anyway' on a banking, email or shopping site.",
      st: [
        "Check your device's date and time first. A clock that's off by days or even minutes breaks secure sites. Turn on automatic date and time. Run the Pocket Scan, it checks your clock against a server.",
        "On public Wi-Fi (hotel, mall, school), a login page may be blocking you. Open http://neverssl.com in a browser to trigger the sign-in page.",
        "Try another network, such as mobile data. If the warning disappears, the first network is the problem.",
        "Update your browser to the latest version.",
        "Some antivirus programs scan secure traffic and cause errors. Update it or check its web-protection settings.",
        "If it only happens on one site, the site itself may have an expired certificate. Don't enter passwords there."
      ],
      e: "Warnings on every site on every network usually mean a wrong clock or malware. Hand it over." },

    /* ---------------- PHONE ---------------- */
    { id: "ph-slow", cat: "phone", t: "Phone is slow or hanging", s: "Apps lag, screen is slow to react, phone gets hot.",
      k: "phone android mobile samsung huawei slow lag laggy hanging freezing apps sluggish hot performance", m: 10, l: 1,
      st: [
        "Restart the phone. Hold the power button and tap Restart. Do this weekly.",
        "Settings, Storage. If under about 10% is free, a phone crawls. See 'Phone storage full'.",
        "Clear cache of the heaviest apps: Settings, Apps, the app, Storage, Clear cache. Do not tap Clear data, it deletes the app's information.",
        "Update apps in the Play Store and install any system update (Settings, Software update).",
        "Uninstall apps you haven't used in months. Check Settings, Apps, sort by size.",
        "Test Safe mode: hold the power button, long-press Power off, tap OK. If the phone is fast in Safe mode, a downloaded app is the cause. Remove recent apps one by one.",
        "Back up your photos and chats, then consider a factory reset as the last option."
      ],
      e: "A hot phone with a fast-draining battery that's also slow can be a worn battery. Hand it over for a battery check." },

    { id: "ph-storage", cat: "phone", t: "Phone storage full", s: "'Storage almost full', can't take photos or install apps.",
      k: "phone android storage full space memory photos videos whatsapp cant install delete clean", m: 15, l: 1,
      w: "Confirm your photos are backed up BEFORE you delete any. Check in Google Photos on another device.",
      st: [
        "Settings, Storage. See what is taking the room: usually photos, videos, WhatsApp or apps.",
        "WhatsApp: Settings, Storage and data, Manage storage. Review large files and items forwarded many times, and delete what you don't need.",
        "Open Downloads in Files. Delete old APKs, PDFs and installers.",
        "Check Google Photos has finished backing up. Then use 'Free up space' to remove backed-up photos from the phone.",
        "Clear cache for the biggest apps: Settings, Apps, the app, Storage, Clear cache.",
        "Uninstall apps you don't use. Games are often 1-3 GB each.",
        "If your phone takes a memory card, move photos and videos onto it."
      ],
      e: "If storage stays full after all this, a lot may be hidden in 'System' or 'Other'. Hand it over." },

    { id: "ph-battery", cat: "phone", t: "Phone battery drains fast", s: "Battery is empty by lunch, or loses 10% in minutes.",
      k: "phone android battery drain drains fast dies power life charging hot swollen", m: 10, l: 1,
      w: "If the phone's back is lifting, the screen is bulging, or the battery looks swollen, stop using it and stop charging it. Don't poke or press it.",
      st: [
        "Settings, Battery, Battery usage. See which app uses the most power. Anything high that you hardly use should be removed or restricted.",
        "Turn on Adaptive battery or Battery saver.",
        "Lower brightness or turn on Adaptive brightness. Shorten the screen timeout.",
        "Settings, Location. Set apps to 'only while using', and turn off Bluetooth and Wi-Fi scanning when not needed.",
        "Update the apps and the phone software.",
        "Poor signal makes the phone work harder and drain faster. Notice if the drain is worse in certain rooms.",
        "A phone that is 2-3 years old with heavy use may simply have a worn battery."
      ],
      e: "Fast drain on a recent update, plus heat, usually means a battery replacement. Hand it over." },

    { id: "ph-charge", cat: "phone", t: "Phone won't charge", s: "Plugged in but no charging icon, or it charges only at certain angles.",
      k: "phone android not charging charge charger cable port wont charge slow charging usb dead", m: 10, l: 1,
      w: "If the phone has a water or moisture warning, unplug it and let it dry for several hours before trying again.",
      st: [
        "Try a different cable and a different wall adapter. Cheap cables are the most common fault.",
        "Try a different wall socket.",
        "Restart the phone while it is plugged in.",
        "Switch the phone off. With a wooden or plastic toothpick, gently clear lint from the charging port. Never use metal.",
        "Try charging while it's off. Hold the power and volume-down buttons for about 10-20 seconds to force a restart (the key combination depends on the brand).",
        "If it charges only at an angle, the port is worn. Charging wirelessly, if supported, confirms that it is the port.",
        "Leave it on a charger for 30 minutes if the battery was fully flat. Deep discharge can take a while to show a charging icon."
      ],
      e: "A loose or worn charging port needs replacing. Hand it over." },

    { id: "ph-backup", cat: "phone", t: "Back up WhatsApp and photos before a phone change", s: "New phone coming, or the old one is dying. Don't lose chats.",
      k: "whatsapp backup back up chats new phone transfer move switch photos contacts upgrade restore", m: 15, l: 1,
      st: [
        "Open WhatsApp, then Settings, Chats, Chat backup.",
        "Check the Google account shown is the one you'll use on the new phone. Tap Back up. Wait for it to finish, then check the 'Last backup' time.",
        "Open Google Photos, and check that Backup is on and says Backup complete.",
        "Contacts: Settings, Google, Set up and restore, check Contacts sync is on.",
        "On the new phone, sign in to the same Google account. Install WhatsApp and verify with the same phone number.",
        "When WhatsApp offers to restore the backup, tap Restore. Wait for it to finish before doing anything else.",
        "Keep the old phone untouched for a few days until everything is confirmed on the new phone."
      ],
      e: "Never share the 6-digit WhatsApp code with anyone, including 'friends' asking for it. If WhatsApp refuses to restore, don't wipe the old phone. Hand it over." },

    { id: "ph-lost", cat: "phone", t: "Lost or stolen phone", s: "Phone is gone. Protect your accounts and money.",
      k: "phone lost stolen missing find gone theft steal sim imei block", m: 20, l: 1,
      st: [
        "Use another device to open Google's Find Hub (formerly Find My Device) at google.com/android/find. Sign in, locate the phone, then choose Lock or Erase.",
        "Phone your network provider straight away. Ask them to block the SIM and the phone (they may ask for the IMEI, dial *#06# on another phone of yours or look on the box).",
        "Open a case at the nearest police station. Keep the case number for insurance and your provider.",
        "Change the password of your Google account first, then banking, email and social media. Sign out the lost phone from each.",
        "Tell your bank. Many banking apps let you remove the device from your profile.",
        "WhatsApp: register your number on a new SIM and phone. This logs the old phone out. Warn contacts not to send money to messages from your number.",
        "Watch for sudden loss of signal on your new SIM. That can mean a SIM swap. Phone your provider immediately."
      ],
      e: "If money was taken, phone your bank's fraud line first, then the police." },

    /* ---------------- DEVICES ---------------- */
    { id: "dev-printer", cat: "dev", t: "Printer offline or won't print", s: "Jobs stay stuck, or Windows says Printer offline.",
      k: "printer offline print wont print stuck queue spooler jobs hp canon epson brother paper", m: 12, l: 1,
      st: [
        "Check the printer is on, has paper and ink or toner, and shows no error light. Clear any paper jam.",
        "USB printer: replug the cable, try another port. Wi-Fi printer: check it's on the same network as your PC.",
        "Settings, Bluetooth & devices, Printers & scanners. Click your printer, Open print queue. In the Printer menu, make sure 'Use Printer Offline' is not ticked.",
        "Cancel all stuck jobs: in the print queue, Printer menu, Cancel All Documents.",
        "Restart the Print Spooler: press Win + R, type services.msc, find Print Spooler, right-click, Restart.",
        "Wi-Fi printers can change IP address after a router restart. Remove the printer, then re-add it with Add device, or set it to a fixed IP address in the printer settings.",
        "Reinstall the driver from the printer maker's website (not a random driver site)."
      ],
      e: "If the printer shows a hardware error code, hand it over with the code." },

    { id: "dev-quality", cat: "dev", t: "Printouts have streaks or fade", s: "Lines, blank bands, ghosting or faint prints.",
      k: "printer print quality streaks lines faded faint blank bands ghosting smudge ink toner cartridge", m: 10, l: 1,
      st: [
        "Check ink levels or toner status. Faint prints often mean a low or empty cartridge.",
        "Inkjet: run 'Head cleaning' (or 'Nozzle check', then clean) from the printer's maintenance menu. Repeat once, not more.",
        "Run 'Align print heads' from the same menu.",
        "Check the paper type setting matches the paper you loaded (Plain, Photo, Glossy).",
        "Laser: remove the toner cartridge and gently rock it side to side a few times. This spreads toner evenly.",
        "Laser, repeating marks down the page: the drum or fuser may be worn. Replace only with proper parts.",
        "Print one test page at the end to confirm."
      ],
      e: "If streaks stay after cleaning and a fresh cartridge, hand it over." },

    { id: "dev-sound", cat: "dev", t: "No sound", s: "Speakers or headphones are silent, or sound comes from the wrong device.",
      k: "sound audio speakers speaker headphones headset volume mute no sound silent bluetooth microphone mic", m: 8, l: 1,
      st: [
        "Check volume isn't at zero or muted, on the keyboard and in Windows.",
        "Click the speaker icon bottom right, then the arrow next to the volume slider. Pick the right output: speakers or headphones.",
        "Bluetooth speaker, headset or TV connected? Windows may be sending sound there. Turn Bluetooth off to test.",
        "Unplug and replug headphones or speakers. Try another port.",
        "Settings, System, Sound, Troubleshoot common sound problems.",
        "Press Win + R, type services.msc, find Windows Audio, right-click, Restart.",
        "Update the audio driver from the laptop maker's support page (or Device Manager, Sound controllers, Update driver)."
      ],
      e: "No sound on a different set of speakers or headphones too may point to the sound chip. Hand it over." },

    { id: "dev-usb", cat: "dev", t: "USB drive not showing up", s: "Flash drive or external disk doesn't appear.",
      k: "usb drive flash disk stick external hard drive not showing recognised detected format raw asks to format pc computer", m: 12, l: 2,
      w: "If Windows asks to 'Format the disk', click Cancel. Formatting wipes the files. Stop and hand over if the files matter.",
      st: [
        "Try a different USB port. On desktops use the back ports. Avoid unpowered USB hubs.",
        "Try the drive on another PC. If it works there, the first PC has the problem.",
        "Right-click Start and open Disk Management. Is the drive listed at the bottom? If it shows with no drive letter, right-click it and choose Change Drive Letter and Paths, then Add, and pick a letter.",
        "If it says RAW, or asks to format, stop. Don't format. Your files may still be recoverable.",
        "Right-click Start, Device Manager, find the drive under Disk drives or Universal Serial Bus. Right-click it, Uninstall device, then unplug and replug.",
        "External hard drive with a separate power adapter: check the adapter is plugged in and the light is on.",
        "Always use Safely Remove Hardware before unplugging to avoid damaging the drive's file system."
      ],
      e: "RAW, clicking sounds or 'Format' prompts with important files means stop and hand it over for recovery." },

    { id: "dev-input", cat: "dev", t: "Keyboard, mouse or touchpad not working", s: "Keys, pointer or trackpad do nothing, or types the wrong symbols.",
      k: "keyboard mouse touchpad trackpad pointer keys typing wrong symbols not working cursor wireless bluetooth", m: 8, l: 1,
      st: [
        "Wireless: replace the batteries and check the switch on the underside is on.",
        "USB receiver: unplug it and plug it into a different port. Try a different USB port for a wired device.",
        "Bluetooth: remove the device in Settings, Bluetooth & devices, then pair it again.",
        "Laptop touchpad dead: look for a touchpad key on the F-row, or press Fn plus that key. Also Settings, Bluetooth & devices, Touchpad, make sure it's On.",
        "Typing wrong symbols (for example @ and \" swapped): press Win + Space to switch the keyboard layout. Choose English (South Africa) or the layout you use.",
        "Keys repeating or special behaviour: tap Shift five times quickly to see if Sticky Keys is on. Turn it off.",
        "Restart the PC. Try the keyboard or mouse on another computer to find out if it is the device or the PC."
      ],
      e: "A laptop keyboard or trackpad that fails on every test is a hardware fault. Hand it over." },

    /* ---------------- FILES ---------------- */
    { id: "fs-deleted", cat: "files", t: "Deleted a file by mistake", s: "Gone from where it was, and you need it back.",
      k: "deleted delete file files lost missing recover recovery restore recycle bin accidentally photo document folder gone", m: 10, l: 2,
      w: "Stop saving or downloading anything to that drive. New files can overwrite the deleted ones for good.",
      st: [
        "Open the Recycle Bin on the desktop. Search it, right-click the file and choose Restore.",
        "Check OneDrive and Google Drive on the web. Open the Recycle bin or Trash. Files are usually kept for 30 days.",
        "Right-click the folder the file was in, Properties, Previous Versions. If restore points exist, pick one from before the deletion and open it to copy the file back.",
        "Check where Windows searches: type the file name in File Explorer's search box on This PC.",
        "Email attachments or WhatsApp: the file may still be in the original message. Search your sent or received items.",
        "Free Microsoft app 'Windows File Recovery' (Microsoft Store) can recover from a drive, but works best on hard drives, and only if nothing has overwritten the files. SSDs often can't be recovered.",
        "For anything important, stop now and hand it over before trying further tools."
      ],
      e: "Photos, business documents or a whole folder? Stop using the drive and hand it over. Recovery chances fall with every minute of use." },

    { id: "fs-full", cat: "files", t: "C: drive full", s: "Red storage bar, 'low disk space', updates failing.",
      k: "c drive disk full space storage low windows pc computer laptop red bar gigabytes gb clean cleanup", m: 15, l: 1,
      st: [
        "Settings, System, Storage. See what takes the space: Apps, Temporary files, Documents, Pictures.",
        "Click Cleanup recommendations (or Temporary files). Tick Temporary files, Recycle Bin and Windows Update cleanup, and Remove. Don't remove Downloads if you aren't sure.",
        "Turn on Storage Sense on the same page so Windows tidies itself.",
        "Open your Downloads folder. Delete installers and old videos you no longer need.",
        "Settings, Apps, Installed apps. Sort by size and uninstall programs you don't use.",
        "Move photos, videos and large folders to an external drive or cloud storage, after you've checked the copies open.",
        "Optional: Terminal (Admin), powercfg /h off. It removes the hibernation file and frees several GB. It also turns off hibernate and Fast startup."
      ],
      e: "If C: is still full and you can't find what's using it, hand it over. The drive may also be too small." },

    { id: "fs-backup", cat: "files", t: "Set up a simple backup (3-2-1)", s: "Do this today so you never need the recovery fixes.",
      k: "backup back up protect copy documents photos safe external drive cloud onedrive google drive prevent", m: 20, l: 1,
      st: [
        "The rule: keep 3 copies of what matters, on 2 different kinds of storage, with 1 copy somewhere else (cloud or another building).",
        "Decide what matters: Documents, Desktop, Pictures, business files, WhatsApp backup. Ignore Windows and programs, they can be reinstalled.",
        "Copy 1 is the original on your PC.",
        "Copy 2: plug in an external drive and copy those folders onto it. Set a reminder to repeat every Friday.",
        "Copy 3: turn on OneDrive or Google Drive backup for Desktop, Documents and Pictures, or upload the important folders yourself.",
        "Test it. Open one file from the external drive and one from the cloud. A backup you've never opened is just a hope.",
        "Keep the external drive unplugged when you're not backing up, so a power surge or virus can't reach it."
      ],
      e: "Business with customer data? Hand it over and we will set up a proper, automatic backup." },

    { id: "fs-clicking", cat: "files", t: "Drive clicking, grinding or failing", s: "Clicking, beeping, SMART warning, or files vanish and the drive disappears.",
      k: "hard drive disk clicking click grinding beeping noise failing failure smart warning dying dead bad sectors external", m: 5, l: 1,
      w: "Do NOT run chkdsk, defrag or 'repair' tools. Do NOT put the drive in a freezer. Both can destroy what is left.",
      st: [
        "Stop using the drive now. Every minute running lowers the chance of getting the files back.",
        "Switch the PC off normally and unplug the drive if it's external.",
        "Don't shake it, open it or knock it. Handle it gently.",
        "Write down what happened: the noise, the first sign, and what you were doing.",
        "If a recent backup exists, you may be fine. Check where it is before doing anything else.",
        "Take only the drive (or the whole device) to someone who does recovery. Put it in an anti-static bag or a soft cloth."
      ],
      e: "This one is always a hand-over. The sooner you stop, the more we can save." },

    /* ---------------- SECURITY ---------------- */
    { id: "sec-hacked", cat: "sec", t: "Account hacked or taken over", s: "Can't sign in, strange messages sent, or alerts you didn't cause.",
      k: "hacked hack account email facebook instagram whatsapp gmail password stolen taken over compromised strange messages login alert", m: 20, l: 2,
      w: "Use a device you trust, not the one you think is infected, for the password changes.",
      st: [
        "Use a clean device (a friend's phone or a different computer) to open the service's official site.",
        "Reset the password using 'Forgot password'. Make it long and unique, and not used anywhere else.",
        "Turn on two-step verification, ideally with an authenticator app rather than SMS.",
        "Sign out of all devices: look for 'Sign out everywhere' or 'Manage devices' in the account's security settings.",
        "Email: check the recovery email and phone number are yours. Check Forwarding and Filters for rules you didn't create. Attackers hide there.",
        "Change the passwords of other accounts that use the same password. Start with email, banking and social media.",
        "Tell your contacts. Check your bank statements and card for charges.",
        "Run a full Windows Security scan on the PC and remove unknown apps and browser extensions."
      ],
      e: "Money lost, work email or customer data involved? Phone your bank, then hand it over." },

    { id: "sec-scam", cat: "sec", t: "Suspicious call, SMS or WhatsApp", s: "Someone asks for a PIN, code, money, or a link to 'verify' something.",
      k: "scam fraud suspicious sms call whatsapp link phishing otp pin code bank verify prize win sim swap fake money", m: 6, l: 1,
      st: [
        "Stop. Don't click links, don't call the number in the message, and don't share any code.",
        "Banks never ask for your PIN, password or OTP. If someone claims to be your bank, hang up and call the number on the back of your card.",
        "Never read out the 6-digit WhatsApp or SMS code. It lets someone take over your account.",
        "Don't send money to someone 'urgent' on WhatsApp until you've phoned them on their real number and heard their voice.",
        "Block and report the number. In WhatsApp, open the chat, tap the name, Block and report.",
        "If you already shared a code or clicked, change that account's password straight away, and tell your bank if money is involved.",
        "Sudden loss of signal on your phone can mean a SIM swap. Phone your network provider immediately."
      ],
      e: "Money already sent? Phone your bank's fraud line now, then the police." },

    { id: "sec-malware", cat: "sec", t: "Pop-ups, redirects or suspected virus", s: "Fake virus warnings, browser keeps redirecting, strange programs.",
      k: "virus malware popup pop-up popups redirect redirects ads adware browser hijacked infected warning scan antivirus", m: 20, l: 2,
      w: "Never call a phone number shown in a pop-up. It's a scam.",
      st: [
        "Don't click anything in the pop-up. Close the browser from Task Manager (Ctrl + Shift + Esc, select it, End task).",
        "Disconnect from the internet while you clean up, if the pop-ups keep coming.",
        "Settings, Apps, Installed apps. Remove programs you didn't install, sorted by Install date.",
        "In your browser, open Extensions (chrome://extensions or edge://extensions) and remove ones you don't recognise.",
        "Reset the browser: Settings, Reset settings. It clears hijacked search engines and start pages.",
        "Windows Security, Virus & threat protection, Scan options, choose Microsoft Defender Antivirus (offline scan), Scan now. The PC will restart.",
        "From a different device, change passwords for email and banking. Do it after the scan, not before."
      ],
      e: "Banking or business accounts used on that PC? Hand it over before using it again." }
  ];

  var byId = {};
  list.forEach(function (f) { byId[f.id] = f; });

  var api = { cats: cats, list: list, byId: byId };
  root.SimonFixes = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
