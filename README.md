# Step to Calory Counter

A simple Expo React Native mobile app that:

- Counts your daily steps using the device pedometer.
- Lets you manually adjust step count when pedometer data is unavailable.
- Calculates estimated calories burned using a configurable factor.

## Run locally

```bash
npm install
npm run start
```

Open in Expo Go on your phone or run on an emulator.

## Formula

Calories burned is estimated as:

```text
calories = steps * 0.04
```

You can tweak `CALORIES_PER_STEP` in `App.js` if needed.
