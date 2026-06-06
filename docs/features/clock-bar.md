---
title: EspControl Clock Bar
description:
  How to configure the clock bar shown at the top of your EspControl panel.
---

# Clock Bar

The clock bar is the narrow status area at the top of the panel. It can show the current time, one or more temperature sensors, a small weather icon, and a small network status icon.

You will find these controls in **Settings > Display > Clock Bar** on the panel web page.

## Settings

- **Show Clock Bar** - turns the whole top bar on or off.
- **Show Time** - shows or hides the time in the clock bar.
- **Temperature** - shows one Home Assistant temperature sensor as a small clock-bar item. Add another Temperature item if you want to show another sensor.
- **Show Degree Symbol** - controls whether temperature values include the degree/unit suffix.
- **Weather** - shows the icon for a Home Assistant `weather.*` entity as a small clock-bar item.
- **Show Network Status Icon** - shows WiFi strength or Ethernet status at the right edge of the clock bar.

Tap the network status icon on the panel to see device details, including the device name, IP address, WiFi strength, uptime, and firmware version.

The time format and timezone are configured separately in [Time Settings](/features/clock). The temperature unit is configured in [Temperature Settings](/features/temperature).
